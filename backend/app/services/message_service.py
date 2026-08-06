"""Message persistence service — stores ciphertext payloads only."""

import json

from app.core.exceptions import AuthorizationError, ValidationError
from app.db.repositories.messages import message_repo
from app.db.repositories.replay import replay_repo
from app.db.repositories.rooms import room_repo


class MessageService:
    async def store_ciphertext(
        self,
        user_id: str,
        room_id: str,
        from_username: str,
        ciphertext_payload: str,
    ) -> None:
        if not await room_repo.is_member(room_id, user_id):
            raise AuthorizationError("Not a member of this room", code="not_member")

        if len(ciphertext_payload) > 65536:
            raise AuthorizationError("Payload too large", code="payload_too_large")

        msg_id = self._extract_msg_id(ciphertext_payload)
        if msg_id:
            if await replay_repo.is_seen(room_id, msg_id):
                raise ValidationError("Duplicate message rejected", code="replay_detected")
            await replay_repo.remember(room_id, msg_id)

        await message_repo.store(room_id, user_id, from_username, ciphertext_payload)

    @staticmethod
    def _extract_msg_id(ciphertext_payload: str) -> str | None:
        try:
            parsed = json.loads(ciphertext_payload)
        except json.JSONDecodeError:
            return None
        if not isinstance(parsed, dict):
            return None
        msg_id = parsed.get("msg_id")
        return str(msg_id) if msg_id else None

    async def get_history(self, user_id: str, room_id: str, limit: int = 50) -> list[dict]:
        if not await room_repo.is_member(room_id, user_id):
            raise AuthorizationError("Not a member of this room", code="not_member")

        messages = await message_repo.list_for_room(room_id, limit=limit)
        return [
            {
                "id": str(m["_id"]),
                "from_username": m["from_username"],
                "ciphertext_payload": m["ciphertext_payload"],
                "created_at": m["created_at"].isoformat(),
            }
            for m in messages
        ]


message_service = MessageService()
