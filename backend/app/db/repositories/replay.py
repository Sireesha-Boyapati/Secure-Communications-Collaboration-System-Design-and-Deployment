"""Message replay detection — persisted in MongoDB with TTL."""

from datetime import datetime, timedelta, timezone

from app.db.client import get_database

REPLAY_TTL_SECONDS = 600


class ReplayRepository:
    @property
    def collection(self):
        return get_database()["message_replays"]

    async def is_seen(self, room_id: str, msg_id: str) -> bool:
        doc = await self.collection.find_one({"room_id": room_id, "msg_id": msg_id})
        return doc is not None

    async def remember(self, room_id: str, msg_id: str) -> None:
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=REPLAY_TTL_SECONDS)
        await self.collection.update_one(
            {"room_id": room_id, "msg_id": msg_id},
            {"$set": {"expires_at": expires_at, "created_at": datetime.now(timezone.utc)}},
            upsert=True,
        )

    async def ensure_indexes(self) -> None:
        await self.collection.create_index("expires_at", expireAfterSeconds=0)
        await self.collection.create_index([("room_id", 1), ("msg_id", 1)], unique=True)


replay_repo = ReplayRepository()
