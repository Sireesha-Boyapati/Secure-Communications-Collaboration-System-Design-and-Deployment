"""WebSocket connection manager — realtime presence, typing, ciphertext relay."""

from __future__ import annotations

import json
from dataclasses import dataclass, field

from fastapi import WebSocket

from app.websocket import events


@dataclass
class ConnectionManager:
    """Track active WebSocket connections per room."""

    rooms: dict[str, dict[str, WebSocket]] = field(default_factory=dict)

    def online_users(self, room_id: str) -> list[str]:
        return sorted(self.rooms.get(room_id, {}).keys())

    async def _broadcast_presence(self, room_id: str) -> None:
        await self.broadcast(
            room_id,
            {"type": events.PRESENCE, "online": self.online_users(room_id)},
        )

    async def connect(self, room_id: str, username: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.rooms.setdefault(room_id, {})[username] = websocket
        await self._broadcast_presence(room_id)
        await self.broadcast(
            room_id,
            {
                "type": events.SYSTEM,
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

    async def disconnect_and_notify(self, room_id: str, username: str) -> None:
        self.disconnect(room_id, username)
        if room_id in self.rooms:
            await self._broadcast_presence(room_id)
        await self.broadcast(
            room_id,
            {
                "type": events.SYSTEM,
                "event": "leave",
                "username": username,
                "message": f"{username} left the room",
            },
        )

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

    async def relay_typing(self, room_id: str, username: str, is_typing: bool) -> None:
        await self.broadcast(
            room_id,
            {"type": events.TYPING, "username": username, "is_typing": is_typing},
            exclude=username,
        )


manager = ConnectionManager()
