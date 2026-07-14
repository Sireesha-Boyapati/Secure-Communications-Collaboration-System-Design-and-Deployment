"""User repository."""

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId

from app.db.client import get_database


class UserRepository:
    @property
    def collection(self):
        return get_database()["users"]

    async def find_by_email(self, email: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"email": email.lower()})

    async def find_by_id(self, user_id: str) -> dict[str, Any] | None:
        return await self.collection.find_one({"_id": ObjectId(user_id)})

    async def create(self, email: str, display_name: str) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        doc = {
            "email": email.lower(),
            "display_name": display_name,
            "verified": True,
            "created_at": now,
            "updated_at": now,
        }
        result = await self.collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return doc

    async def update_display_name(self, user_id: str, display_name: str) -> None:
        await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"display_name": display_name, "updated_at": datetime.now(timezone.utc)}},
        )

    async def ensure_indexes(self) -> None:
        await self.collection.create_index("email", unique=True)


user_repo = UserRepository()
