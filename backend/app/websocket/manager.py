"""WebSocket connection manager — realtime presence, typing, ciphertext relay."""

from __future__ import annotations

import json
from dataclasses import dataclass, field

from fastapi import WebSocket

from app.websocket import events


@dataclass
class _Connection:
    websocket: WebSocket
    display_name: str


@dataclass
class ConnectionManager:
    """Track active WebSocket connections per room (one socket per user_id)."""

    rooms: dict[str, dict[str, _Connection]] = field(default_factory=dict)

    def online_users(self, room_id: str) -> list[str]:
        room = self.rooms.get(room_id, {})
        return sorted(conn.display_name for conn in room.values())

    async def _broadcast_presence(self, room_id: str) -> None:
        await self.broadcast(
            room_id,
            {"type": events.PRESENCE, "online": self.online_users(room_id)},
        )

    async def connect(
        self,
        room_id: str,
        user_id: str,
        display_name: str,
        websocket: WebSocket,
    ) -> None:
        await websocket.accept()
        room = self.rooms.setdefault(room_id, {})

        existing = room.get(user_id)
        if existing is not None:
            try:
                await existing.websocket.close(code=4000, reason="Replaced by new session")
            except Exception:
                pass

        room[user_id] = _Connection(websocket=websocket, display_name=display_name)
        await self._broadcast_presence(room_id)
        await self.broadcast(
            room_id,
            {
                "type": events.SYSTEM,
                "event": "join",
                "username": display_name,
                "message": f"{display_name} joined the room",
            },
            exclude_user_id=user_id,
        )

    def disconnect(self, room_id: str, user_id: str) -> None:
        room = self.rooms.get(room_id, {})
        room.pop(user_id, None)
        if not room:
            self.rooms.pop(room_id, None)

    async def disconnect_and_notify(self, room_id: str, user_id: str, display_name: str) -> None:
        self.disconnect(room_id, user_id)
        if room_id in self.rooms:
            await self._broadcast_presence(room_id)
        await self.broadcast(
            room_id,
            {
                "type": events.SYSTEM,
                "event": "leave",
                "username": display_name,
                "message": f"{display_name} left the room",
            },
        )

    async def broadcast(
        self,
        room_id: str,
        payload: dict,
        exclude: str | None = None,
        exclude_user_id: str | None = None,
    ) -> None:
        room = self.rooms.get(room_id, {})
        data = json.dumps(payload)
        dead: list[str] = []
        for uid, conn in room.items():
            if exclude_user_id and uid == exclude_user_id:
                continue
            if exclude and conn.display_name == exclude:
                continue
            try:
                await conn.websocket.send_text(data)
            except Exception:
                dead.append(uid)
        for uid in dead:
            room.pop(uid, None)

    async def send_personal(self, websocket: WebSocket, payload: dict) -> None:
        await websocket.send_text(json.dumps(payload))

    async def relay_typing(self, room_id: str, username: str, is_typing: bool) -> None:
        await self.broadcast(
            room_id,
            {"type": events.TYPING, "username": username, "is_typing": is_typing},
            exclude=username,
        )


manager = ConnectionManager()
