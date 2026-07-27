"""Room and public-key repository."""

import secrets
import string
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId

from app.db.client import get_database


def _invite_code() -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(6))


class RoomRepository:
    @property
    def rooms(self):
        return get_database()["rooms"]

    @property
    def keys(self):
        return get_database()["room_keys"]

    async def create(self, name: str, created_by: str) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        doc = {
            "name": name,
            "invite_code": _invite_code(),
            "created_by": ObjectId(created_by),
            "member_ids": [ObjectId(created_by)],
            "crypto_epoch": 1,
            "created_at": now,
            "updated_at": now,
        }
        result = await self.rooms.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc

    async def find_by_id(self, room_id: str) -> dict[str, Any] | None:
        return await self.rooms.find_one({"_id": ObjectId(room_id)})

    async def find_by_invite_code(self, invite_code: str) -> dict[str, Any] | None:
        return await self.rooms.find_one({"invite_code": invite_code.upper()})

    async def list_for_user(self, user_id: str) -> list[dict[str, Any]]:
        cursor = self.rooms.find({"member_ids": ObjectId(user_id)}).sort("updated_at", -1)
        return await cursor.to_list(length=100)

    async def add_member(self, room_id: str, user_id: str) -> tuple[dict[str, Any] | None, bool]:
        """Returns (room, was_new_member)."""
        room = await self.find_by_id(room_id)
        if not room:
            return None, False
        oid = ObjectId(user_id)
        if oid in room.get("member_ids", []):
            return room, False

        result = await self.rooms.find_one_and_update(
            {"_id": ObjectId(room_id)},
            {
                "$addToSet": {"member_ids": oid},
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
            return_document=True,
        )
        return result, True

    async def remove_member(self, room_id: str, user_id: str) -> dict[str, Any] | None:
        result = await self.rooms.find_one_and_update(
            {"_id": ObjectId(room_id)},
            {
                "$pull": {"member_ids": ObjectId(user_id)},
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
            return_document=True,
        )
        return result

    async def increment_crypto_epoch(self, room_id: str) -> int:
        result = await self.rooms.find_one_and_update(
            {"_id": ObjectId(room_id)},
            {
                "$inc": {"crypto_epoch": 1},
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
            return_document=True,
        )
        return int(result["crypto_epoch"]) if result else 1

    async def get_crypto_epoch(self, room_id: str) -> int:
        room = await self.find_by_id(room_id)
        return int(room.get("crypto_epoch", 1)) if room else 1

    async def delete_all_keys(self, room_id: str) -> None:
        await self.keys.delete_many({"room_id": ObjectId(room_id)})

    async def is_member(self, room_id: str, user_id: str) -> bool:
        room = await self.find_by_id(room_id)
        if not room:
            return False
        return ObjectId(user_id) in room.get("member_ids", [])

    async def register_key(
        self,
        room_id: str,
        user_id: str,
        username: str,
        public_key_jwk: dict,
        fingerprint: str,
        crypto_epoch: int,
    ) -> tuple[dict[str, Any], bool]:
        now = datetime.now(timezone.utc)
        existing = await self.keys.find_one(
            {"room_id": ObjectId(room_id), "user_id": ObjectId(user_id)}
        )
        key_changed = bool(
            existing
            and existing.get("fingerprint") != fingerprint
            and existing.get("crypto_epoch") == crypto_epoch
        )

        doc = {
            "room_id": ObjectId(room_id),
            "user_id": ObjectId(user_id),
            "username": username,
            "public_key_jwk": public_key_jwk,
            "fingerprint": fingerprint,
            "crypto_epoch": crypto_epoch,
            "updated_at": now,
        }
        await self.keys.update_one(
            {"room_id": ObjectId(room_id), "user_id": ObjectId(user_id)},
            {"$set": doc, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )
        return doc, key_changed

    async def list_keys(self, room_id: str, crypto_epoch: int | None = None) -> list[dict[str, Any]]:
        query: dict[str, Any] = {"room_id": ObjectId(room_id)}
        if crypto_epoch is not None:
            query["crypto_epoch"] = crypto_epoch
        cursor = self.keys.find(query)
        return await cursor.to_list(length=200)

    async def ensure_indexes(self) -> None:
        await self.rooms.create_index("invite_code", unique=True)
        await self.rooms.create_index("member_ids")
        await self.keys.create_index([("room_id", 1), ("user_id", 1)], unique=True)
        await self.keys.create_index([("room_id", 1), ("crypto_epoch", 1)])


room_repo = RoomRepository()
