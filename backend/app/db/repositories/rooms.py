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

    async def add_member(self, room_id: str, user_id: str) -> dict[str, Any] | None:
        result = await self.rooms.find_one_and_update(
            {"_id": ObjectId(room_id)},
            {
                "$addToSet": {"member_ids": ObjectId(user_id)},
                "$set": {"updated_at": datetime.now(timezone.utc)},
            },
            return_document=True,
        )
        return result

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
    ) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        doc = {
            "room_id": ObjectId(room_id),
            "user_id": ObjectId(user_id),
            "username": username,
            "public_key_jwk": public_key_jwk,
            "fingerprint": fingerprint,
            "updated_at": now,
        }
        await self.keys.update_one(
            {"room_id": ObjectId(room_id), "user_id": ObjectId(user_id)},
            {"$set": doc, "$setOnInsert": {"created_at": now}},
            upsert=True,
        )
        return doc

    async def list_keys(self, room_id: str) -> list[dict[str, Any]]:
        cursor = self.keys.find({"room_id": ObjectId(room_id)})
        return await cursor.to_list(length=200)

    async def ensure_indexes(self) -> None:
        await self.rooms.create_index("invite_code", unique=True)
        await self.rooms.create_index("member_ids")
        await self.keys.create_index([("room_id", 1), ("user_id", 1)], unique=True)


room_repo = RoomRepository()
