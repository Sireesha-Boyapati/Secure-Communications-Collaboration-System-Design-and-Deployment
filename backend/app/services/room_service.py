"""Room management service."""

from app.core.exceptions import AuthorizationError, NotFoundError, ValidationError
from app.core.logging import get_logger
from app.db.repositories.rooms import room_repo
from app.db.repositories.users import user_repo

logger = get_logger(__name__)


class RoomService:
    async def create_room(self, user_id: str, name: str) -> dict:
        name = name.strip()
        if len(name) < 2 or len(name) > 64:
            raise ValidationError("Room name must be 2–64 characters", code="invalid_room_name")

        room = await room_repo.create(name, user_id)
        return self._serialize_room(room)

    async def join_room(self, user_id: str, invite_code: str, share_history: bool = False) -> dict:
        invite_code = invite_code.strip().upper()
        room = await room_repo.find_by_invite_code(invite_code)
        if not room:
            raise NotFoundError("Invalid invite code", code="invalid_invite")

        room_id = str(room["_id"])
        updated, was_new = await room_repo.add_member(room_id, user_id)
        if not updated:
            raise NotFoundError("Room not found", code="room_not_found")

        keys_rotated = False
        if was_new and not share_history:
            new_epoch = await room_repo.increment_crypto_epoch(room_id)
            await room_repo.delete_all_keys(room_id)
            keys_rotated = True
            logger.warning(
                "KEYS_ROTATED room=%s epoch=%s reason=member_joined share_history=false",
                room_id,
                new_epoch,
            )
            updated = await room_repo.find_by_id(room_id) or updated

        result = self._serialize_room(updated)
        result["keys_rotated"] = keys_rotated
        result["rotation_reason"] = "member_joined" if keys_rotated else None
        return result

    async def leave_room(self, user_id: str, room_id: str) -> dict:
        if not await room_repo.is_member(room_id, user_id):
            raise AuthorizationError("Not a member of this room", code="not_member")

        updated = await room_repo.remove_member(room_id, user_id)
        if not updated:
            raise NotFoundError("Room not found", code="room_not_found")

        new_epoch = await room_repo.increment_crypto_epoch(room_id)
        await room_repo.delete_all_keys(room_id)
        logger.warning(
            "KEYS_ROTATED room=%s epoch=%s reason=member_left user=%s",
            room_id,
            new_epoch,
            user_id,
        )

        result = self._serialize_room(updated)
        result["keys_rotated"] = True
        result["rotation_reason"] = "member_left"
        return result

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
        crypto_epoch: int,
    ) -> dict:
        if not await room_repo.is_member(room_id, user_id):
            raise AuthorizationError("Not a member of this room", code="not_member")

        user = await user_repo.find_by_id(user_id)
        if not user:
            raise AuthorizationError("User not found", code="user_not_found")
        if username.strip() != user["display_name"]:
            raise ValidationError(
                "Public key username must match your display name",
                code="username_mismatch",
            )

        current_epoch = await room_repo.get_crypto_epoch(room_id)
        if crypto_epoch != current_epoch:
            raise ValidationError(
                f"Room keys rotated — current epoch is {current_epoch}",
                code="epoch_mismatch",
            )

        entry, key_changed = await room_repo.register_key(
            room_id, user_id, username, public_key_jwk, fingerprint, crypto_epoch
        )
        if key_changed:
            logger.warning(
                "KEY_CHANGE room=%s user=%s username=%s new_fp=%s",
                room_id,
                user_id,
                username,
                fingerprint,
            )

        return {
            "username": entry["username"],
            "public_key_jwk": entry["public_key_jwk"],
            "fingerprint": entry["fingerprint"],
            "crypto_epoch": entry["crypto_epoch"],
            "key_changed": key_changed,
        }

    async def list_public_keys(self, user_id: str, room_id: str) -> list[dict]:
        if not await room_repo.is_member(room_id, user_id):
            raise AuthorizationError("Not a member of this room", code="not_member")

        epoch = await room_repo.get_crypto_epoch(room_id)
        keys = await room_repo.list_keys(room_id, crypto_epoch=epoch)
        return [
            {
                "username": k["username"],
                "public_key_jwk": k["public_key_jwk"],
                "fingerprint": k["fingerprint"],
                "crypto_epoch": k.get("crypto_epoch", epoch),
            }
            for k in keys
        ]

    def _serialize_room(self, room: dict) -> dict:
        return {
            "id": str(room["_id"]),
            "name": room["name"],
            "invite_code": room["invite_code"],
            "member_count": len(room.get("member_ids", [])),
            "crypto_epoch": int(room.get("crypto_epoch", 1)),
            "created_at": room["created_at"].isoformat(),
        }


room_service = RoomService()
