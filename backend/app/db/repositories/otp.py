"""OTP repository."""

import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from app.config import settings
from app.db.client import get_database


class OtpRepository:
    @property
    def collection(self):
        return get_database()["otp_codes"]

    def generate_code(self) -> str:
        return "".join(str(secrets.randbelow(10)) for _ in range(settings.otp_length))

    async def store(self, email: str, code: str) -> None:
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.otp_expire_minutes)
        await self.collection.update_one(
            {"email": email.lower()},
            {
                "$set": {
                    "code": code,
                    "expires_at": expires_at,
                    "attempts": 0,
                    "created_at": datetime.now(timezone.utc),
                }
            },
            upsert=True,
        )

    async def verify(self, email: str, code: str) -> bool:
        doc: dict[str, Any] | None = await self.collection.find_one({"email": email.lower()})
        if not doc:
            return False

        if doc.get("attempts", 0) >= 5:
            return False

        if datetime.now(timezone.utc) > doc["expires_at"]:
            return False

        if doc["code"] != code:
            await self.collection.update_one(
                {"email": email.lower()},
                {"$inc": {"attempts": 1}},
            )
            return False

        await self.collection.delete_one({"email": email.lower()})
        return True

    async def ensure_indexes(self) -> None:
        await self.collection.create_index("email", unique=True)
        await self.collection.create_index("expires_at", expireAfterSeconds=0)


otp_repo = OtpRepository()
