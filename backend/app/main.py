"""
StudySafe API — encrypted message relay.

The server NEVER decrypts messages. It only:
  - stores public keys
  - relays ciphertext over WebSocket
"""

from datetime import datetime, timezone

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health, rooms
from app.websocket.manager import manager

app = FastAPI(
    title=settings.app_name,
    description="E2E encrypted student team chat — ciphertext relay only",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(rooms.router)


@app.get("/")
async def root() -> dict:
    return {
        "service": settings.app_name,
        "docs": "/docs",
        "health": "/health",
        "note": "Server relays ciphertext only — no plaintext stored",
    }


@app.websocket("/ws/{room_id}/{username}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, username: str) -> None:
    await manager.connect(room_id, username, websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            # Relay client-encrypted payload as-is
            await manager.broadcast(
                room_id,
                {
                    "type": "message",
                    "room_id": room_id,
                    "from_user": username,
                    "payload": raw,
                    "relay_timestamp": datetime.now(timezone.utc).isoformat(),
                },
                exclude=username,
            )
    except WebSocketDisconnect:
        manager.disconnect(room_id, username)
        await manager.broadcast(
            room_id,
            {
                "type": "system",
                "event": "leave",
                "username": username,
                "message": f"{username} left the room",
            },
        )
