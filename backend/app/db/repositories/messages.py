"""Encrypted message repository — ciphertext only."""

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId

from app.db.client import get_database


class MessageRepository:
    @property
    def collection(self):
        return get_database()["messages"]

    async def store(
        self,
        room_id: str,
        from_user_id: str,
        from_username: str,
        ciphertext_payload: str,
    ) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        doc = {
            "room_id": ObjectId(room_id),
            "from_user_id": ObjectId(from_user_id),
            "from_username": from_username,
            "ciphertext_payload": ciphertext_payload,
            "created_at": now,
        }
        result = await self.collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc

    async def list_for_room(self, room_id: str, limit: int = 50) -> list[dict[str, Any]]:
        cursor = (
            self.collection.find({"room_id": ObjectId(room_id)})
            .sort("created_at", -1)
            .limit(limit)
        )
        messages = await cursor.to_list(length=limit)
        return list(reversed(messages))

    async def ensure_indexes(self) -> None:
        await self.collection.create_index([("room_id", 1), ("created_at", -1)])


message_repo = MessageRepository()
