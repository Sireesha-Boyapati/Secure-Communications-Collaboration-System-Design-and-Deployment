"""
StudySafe API — encrypted message relay.

The server NEVER decrypts messages. It:
  - authenticates users via email OTP + JWT
  - stores public keys and ciphertext in MongoDB
  - relays ciphertext over WebSocket
"""

import json
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.auth.jwt import decode_access_token
from app.config import settings
from app.core.exceptions import AuthenticationError
from app.core.logging import get_logger, setup_logging
from app.db.client import close_db, connect_db
from app.db.repositories.messages import message_repo
from app.db.repositories.otp import otp_repo
from app.db.repositories.rooms import room_repo
from app.db.repositories.users import user_repo
from app.routers import auth, health, messages, rooms
from app.security.honeypot import router as honeypot_router
from app.security.middleware import SecurityHeadersMiddleware
from app.security.rate_limit import limiter
from app.services.message_service import message_service
from app.websocket import events
from app.websocket.manager import manager

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    await connect_db()
    await user_repo.ensure_indexes()
    await otp_repo.ensure_indexes()
    await room_repo.ensure_indexes()
    await message_repo.ensure_indexes()
    logger.info("StudySafe API started (env=%s)", settings.environment)
    yield
    await close_db()
    logger.info("StudySafe API shutdown complete")


app = FastAPI(
    title=settings.app_name,
    description="E2E encrypted student team chat — ciphertext relay only",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(messages.router)
app.include_router(honeypot_router)


@app.get("/")
async def root() -> dict:
    return {
        "service": settings.app_name,
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "note": "Server relays ciphertext only — no plaintext stored",
    }


async def _authenticate_ws(token: str | None) -> dict:
    if not token:
        raise AuthenticationError("WebSocket requires token", code="missing_token")
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise AuthenticationError("Invalid token", code="invalid_token")
    user = await user_repo.find_by_id(user_id)
    if not user:
        raise AuthenticationError("User not found", code="user_not_found")
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "display_name": user["display_name"],
    }


@app.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    token: str | None = None,
) -> None:
    try:
        user = await _authenticate_ws(token)
    except AuthenticationError:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    if not await room_repo.is_member(room_id, user["id"]):
        await websocket.close(code=4003, reason="Not a room member")
        return

    username = user["display_name"]
    await manager.connect(room_id, username, websocket)

    try:
        while True:
            raw = await websocket.receive_text()

            if len(raw) > 65536:
                await manager.send_personal(
                    websocket, {"type": events.ERROR, "message": "Payload too large"}
                )
                continue

            # Realtime control events (typing) — not stored
            try:
                control = json.loads(raw)
                if isinstance(control, dict) and control.get("type") == events.TYPING:
                    await manager.relay_typing(
                        room_id, username, bool(control.get("is_typing", False))
                    )
                    continue
            except json.JSONDecodeError:
                pass

            await message_service.store_ciphertext(
                user["id"], room_id, username, raw
            )

            await manager.broadcast(
                room_id,
                {
                    "type": events.MESSAGE,
                    "room_id": room_id,
                    "from_user": username,
                    "payload": raw,
                    "relay_timestamp": datetime.now(timezone.utc).isoformat(),
                },
                exclude=username,
            )
    except WebSocketDisconnect:
        await manager.disconnect_and_notify(room_id, username)
