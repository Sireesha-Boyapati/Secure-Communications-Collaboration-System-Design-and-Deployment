"""Message persistence service — stores ciphertext payloads only."""

from app.core.exceptions import AuthorizationError
from app.db.repositories.messages import message_repo
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

        await message_repo.store(room_id, user_id, from_username, ciphertext_payload)

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
