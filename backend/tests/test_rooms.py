"""Integration tests for rooms and security endpoints."""

import pytest


@pytest.mark.asyncio
async def test_create_room_requires_auth(client):
    res = await client.post("/api/rooms", json={"name": "Test Room"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_join_room_requires_auth(client):
    res = await client.post("/api/rooms/join", json={"invite_code": "ABC123"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_message_history_requires_auth(client):
    res = await client.get("/api/rooms/fake-room-id/messages")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_honeypot_admin_users(client):
    res = await client.get("/api/admin/users")
    assert res.status_code == 200
    data = res.json()
    assert "users" in data
    assert "honeypot" in data.get("note", "").lower()


@pytest.mark.asyncio
async def test_online_users_requires_auth(client):
    res = await client.get("/api/rooms/fake-room-id/online")
    assert res.status_code == 401

@pytest.mark.asyncio
async def test_online_users_returns_404_for_non_member(client):
    from unittest.mock import AsyncMock, patch

    from app.auth.dependencies import get_current_user
    from app.core.exceptions import NotFoundError
    from app.main import app

    async def fake_user():
        return {"id": "user-1", "email": "alice@test.ie", "display_name": "Alice"}

    app.dependency_overrides[get_current_user] = fake_user
    try:
        with patch(
            "app.routers.rooms.room_service.get_room",
            new_callable=AsyncMock,
        ) as mock_get_room:
            mock_get_room.side_effect = NotFoundError("Room not found", code="room_not_found")
            res = await client.get("/api/rooms/unknown-room/online")
        assert res.status_code == 404
        assert res.json()["detail"]["code"] == "room_not_found"
    finally:
        app.dependency_overrides.clear()
