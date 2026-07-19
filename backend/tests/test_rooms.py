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
async def test_otp_request_valid_email(client):
    res = await client.post("/api/auth/otp/request", json={"email": "integration@test.ie"})
    assert res.status_code == 204
