"""Room management service."""

from app.core.exceptions import AuthorizationError, NotFoundError, ValidationError
from app.db.repositories.rooms import room_repo


class RoomService:
    async def create_room(self, user_id: str, name: str) -> dict:
        name = name.strip()
        if len(name) < 2 or len(name) > 64:
            raise ValidationError("Room name must be 2–64 characters", code="invalid_room_name")

        room = await room_repo.create(name, user_id)
        return self._serialize_room(room)

    async def join_room(self, user_id: str, invite_code: str) -> dict:
        invite_code = invite_code.strip().upper()
        room = await room_repo.find_by_invite_code(invite_code)
        if not room:
            raise NotFoundError("Invalid invite code", code="invalid_invite")

        await room_repo.add_member(str(room["_id"]), user_id)
        updated = await room_repo.find_by_id(str(room["_id"]))
        return self._serialize_room(updated or room)

    async def list_user_rooms(self, user_id: str) -> list[dict]:
        rooms = await room_repo.list_for_user(user_id)
        return [self._serialize_room(r) for r in rooms]

    async def get_room(self, user_id: str, room_id: str) -> dict:
        if not await room_repo.is_member(room_id, user_id):
            raise AuthorizationError("Not a member of this room", code="not_member")

        room = await room_repo.find_by_id(room_id)
        if not room:
            raise NotFoundError("Room not found", code="room_not_found")

        return self._serialize_room(room)

    async def register_public_key(
        self,
        user_id: str,
        room_id: str,
        username: str,
        public_key_jwk: dict,
        fingerprint: str,
    ) -> dict:
        if not await room_repo.is_member(room_id, user_id):
            raise AuthorizationError("Not a member of this room", code="not_member")

        entry = await room_repo.register_key(
            room_id, user_id, username, public_key_jwk, fingerprint
        )
        return {
            "username": entry["username"],
            "public_key_jwk": entry["public_key_jwk"],
            "fingerprint": entry["fingerprint"],
        }

    async def list_public_keys(self, user_id: str, room_id: str) -> list[dict]:
        if not await room_repo.is_member(room_id, user_id):
            raise AuthorizationError("Not a member of this room", code="not_member")

        keys = await room_repo.list_keys(room_id)
        return [
            {
                "username": k["username"],
                "public_key_jwk": k["public_key_jwk"],
                "fingerprint": k["fingerprint"],
            }
            for k in keys
        ]

    def _serialize_room(self, room: dict) -> dict:
        return {
            "id": str(room["_id"]),
            "name": room["name"],
            "invite_code": room["invite_code"],
            "member_count": len(room.get("member_ids", [])),
            "created_at": room["created_at"].isoformat(),
        }


room_service = RoomService()
