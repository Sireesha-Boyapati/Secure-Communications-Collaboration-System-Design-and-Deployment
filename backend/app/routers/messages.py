"""Encrypted message history routes — ciphertext only."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.auth.dependencies import get_current_user
from app.core.exceptions import StudySafeError, http_error
from app.models.schemas import MessageHistoryItem, MessageHistoryResponse
from app.services.message_service import message_service

router = APIRouter(prefix="/api/rooms", tags=["messages"])


@router.get("/{room_id}/messages", response_model=MessageHistoryResponse)
async def get_message_history(
    room_id: str,
    user: Annotated[dict, Depends(get_current_user)],
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
) -> MessageHistoryResponse:
    try:
        messages = await message_service.get_history(user["id"], room_id, limit=limit)
        return MessageHistoryResponse(
            room_id=room_id,
            messages=[MessageHistoryItem(**m) for m in messages],
        )
    except StudySafeError as exc:
        raise http_error(exc) from exc
