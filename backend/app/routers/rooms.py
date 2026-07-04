"""Room public-key registry — in-memory for Phase 1 demo; MongoDB in Phase 2."""

from fastapi import APIRouter, HTTPException

from app.models.schemas import PublicKeyListResponse, PublicKeyRegister, PublicKeyEntry

router = APIRouter(prefix="/api/rooms", tags=["rooms"])

# room_id -> username -> key entry (demo only — replace with MongoDB)
_room_keys: dict[str, dict[str, PublicKeyEntry]] = {}


@router.post("/{room_id}/keys", status_code=201)
async def register_public_key(room_id: str, payload: PublicKeyRegister) -> PublicKeyEntry:
    room = _room_keys.setdefault(room_id, {})
    entry = PublicKeyEntry(
        username=payload.username,
        public_key_jwk=payload.public_key_jwk,
        fingerprint=payload.fingerprint,
    )
    room[payload.username] = entry
    return entry


@router.get("/{room_id}/keys", response_model=PublicKeyListResponse)
async def list_public_keys(room_id: str) -> PublicKeyListResponse:
    room = _room_keys.get(room_id, {})
    return PublicKeyListResponse(room_id=room_id, keys=list(room.values()))


@router.get("/{room_id}/keys/{username}", response_model=PublicKeyEntry)
async def get_public_key(room_id: str, username: str) -> PublicKeyEntry:
    room = _room_keys.get(room_id, {})
    if username not in room:
        raise HTTPException(status_code=404, detail="User key not found in room")
    return room[username]
