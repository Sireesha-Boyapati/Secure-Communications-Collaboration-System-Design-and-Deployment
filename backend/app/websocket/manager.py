"""WebSocket connection manager — relays ciphertext JSON only."""

from __future__ import annotations

import json
from dataclasses import dataclass, field

from fastapi import WebSocket


@dataclass
class ConnectionManager:
    """Track active WebSocket connections per room."""

    rooms: dict[str, dict[str, WebSocket]] = field(default_factory=dict)

    async def connect(self, room_id: str, username: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.rooms.setdefault(room_id, {})[username] = websocket
        await self.broadcast(
            room_id,
            {
                "type": "system",
                "event": "join",
                "username": username,
                "message": f"{username} joined the room",
            },
            exclude=username,
        )

    def disconnect(self, room_id: str, username: str) -> None:
        room = self.rooms.get(room_id, {})
        room.pop(username, None)
        if not room:
            self.rooms.pop(room_id, None)

    async def broadcast(self, room_id: str, payload: dict, exclude: str | None = None) -> None:
        room = self.rooms.get(room_id, {})
        data = json.dumps(payload)
        dead: list[str] = []
        for user, ws in room.items():
            if exclude and user == exclude:
                continue
            try:
                await ws.send_text(data)
            except Exception:
                dead.append(user)
        for user in dead:
            room.pop(user, None)

    async def send_personal(self, websocket: WebSocket, payload: dict) -> None:
        await websocket.send_text(json.dumps(payload))


manager = ConnectionManager()
