"""Room management and public-key registry routes."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.core.exceptions import StudySafeError, http_error
from app.models.schemas import (
    PublicKeyEntry,
    PublicKeyListResponse,
    PublicKeyRegister,
    PublicKeyRegisterResponse,
    RoomCreate,
    RoomJoin,
    RoomResponse,
)
from app.services.room_service import room_service
from app.websocket import events
from app.websocket.manager import manager

router = APIRouter(prefix="/api/rooms", tags=["rooms"])


async def _broadcast_keys_rotated(room_id: str, epoch: int, reason: str, username: str = "") -> None:
    await manager.broadcast(
        room_id,
        {
            "type": events.KEYS_ROTATED,
            "crypto_epoch": epoch,
            "reason": reason,
            "username": username,
            "message": f"Encryption keys rotated (epoch {epoch}) — verify teammates again",
        },
    )


@router.post("", response_model=RoomResponse, status_code=201)
async def create_room(
    payload: RoomCreate,
    user: Annotated[dict, Depends(get_current_user)],
) -> RoomResponse:
    try:
        room = await room_service.create_room(user["id"], payload.name)
        return RoomResponse(**room)
    except StudySafeError as exc:
        raise http_error(exc) from exc


@router.post("/join")
async def join_room(
    payload: RoomJoin,
    user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    try:
        room = await room_service.join_room(
            user["id"], payload.invite_code, payload.share_history
        )
        if room.get("keys_rotated"):
            await _broadcast_keys_rotated(
                room["id"],
                room["crypto_epoch"],
                room.get("rotation_reason") or "member_joined",
                user["display_name"],
            )
        return room
    except StudySafeError as exc:
        raise http_error(exc) from exc


@router.post("/{room_id}/leave")
async def leave_room(
    room_id: str,
    user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    try:
        room = await room_service.leave_room(user["id"], room_id)
        await _broadcast_keys_rotated(
            room_id,
            room["crypto_epoch"],
            room.get("rotation_reason") or "member_left",
            user["display_name"],
        )
        return room
    except StudySafeError as exc:
        raise http_error(exc) from exc


@router.get("/mine", response_model=list[RoomResponse])
async def list_my_rooms(
    user: Annotated[dict, Depends(get_current_user)],
) -> list[RoomResponse]:
    rooms = await room_service.list_user_rooms(user["id"])
    return [RoomResponse(**r) for r in rooms]


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(
    room_id: str,
    user: Annotated[dict, Depends(get_current_user)],
) -> RoomResponse:
    try:
        room = await room_service.get_room(user["id"], room_id)
        return RoomResponse(**room)
    except StudySafeError as exc:
        raise http_error(exc) from exc


@router.post("/{room_id}/keys", response_model=PublicKeyRegisterResponse, status_code=201)
async def register_public_key(
    room_id: str,
    payload: PublicKeyRegister,
    user: Annotated[dict, Depends(get_current_user)],
) -> PublicKeyRegisterResponse:
    try:
        entry = await room_service.register_public_key(
            user["id"],
            room_id,
            payload.username,
            payload.public_key_jwk,
            payload.fingerprint,
            payload.crypto_epoch,
        )
        return PublicKeyRegisterResponse(**entry)
    except StudySafeError as exc:
        raise http_error(exc) from exc


@router.get("/{room_id}/keys", response_model=PublicKeyListResponse)
async def list_public_keys(
    room_id: str,
    user: Annotated[dict, Depends(get_current_user)],
) -> PublicKeyListResponse:
    try:
        keys = await room_service.list_public_keys(user["id"], room_id)
        return PublicKeyListResponse(
            room_id=room_id,
            keys=[PublicKeyEntry(**k) for k in keys],
        )
    except StudySafeError as exc:
        raise http_error(exc) from exc


@router.get("/{room_id}/online")
async def get_online_users(
    room_id: str,
    user: Annotated[dict, Depends(get_current_user)],
) -> dict:
    try:
        await room_service.get_room(user["id"], room_id)
        online = manager.online_users(room_id)
        return {"room_id": room_id, "online": online, "count": len(online)}
    except StudySafeError as exc:
        raise http_error(exc) from exc
