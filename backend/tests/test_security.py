"""Security hardening tests."""

import json
from unittest.mock import AsyncMock, patch

import pytest

from app.auth.dependencies import get_current_user
from app.core.exceptions import ValidationError
from app.main import app


@pytest.mark.asyncio
async def test_security_headers_include_csp(client):
    res = await client.get("/health")
    assert res.status_code == 200
    assert "Content-Security-Policy" in res.headers
    assert res.headers["X-Frame-Options"] == "DENY"


@pytest.mark.asyncio
async def test_otp_lockout_after_five_failures(client):
    from app.db.client import get_database
    from app.db.repositories.otp import otp_repo

    email = "lockout@test.ie"
    code = otp_repo.generate_code()
    await otp_repo.store(email, code)

    await get_database()["otp_codes"].update_one(
        {"email": email.lower()},
        {"$set": {"attempts": 5}},
    )

    res = await client.post(
        "/api/auth/otp/verify",
        json={"email": email, "code": code, "display_name": "Lockout"},
    )
    assert res.status_code == 401
    assert res.json()["detail"]["code"] == "otp_locked"


@pytest.mark.asyncio
async def test_replay_message_rejected(client):
    from app.services.message_service import message_service

    room_id = "room-replay-test"
    user_id = "user-replay"
    msg_id = "msg-replay-unique-test"
    payload = json.dumps(
        {
            "type": "encrypted_message",
            "msg_id": msg_id,
            "from": "Alice",
            "timestamp": "2026-08-01T12:00:00Z",
            "crypto_epoch": 1,
            "recipients": [],
        }
    )
    seen: set[str] = set()

    async def fake_is_seen(rid: str, mid: str) -> bool:
        return mid in seen

    async def fake_remember(rid: str, mid: str) -> None:
        seen.add(mid)

    with patch(
        "app.services.message_service.room_repo.is_member",
        new_callable=AsyncMock,
        return_value=True,
    ), patch(
        "app.services.message_service.message_repo.store",
        new_callable=AsyncMock,
    ) as mock_store, patch(
        "app.services.message_service.replay_repo.is_seen",
        side_effect=fake_is_seen,
    ), patch(
        "app.services.message_service.replay_repo.remember",
        side_effect=fake_remember,
    ):
        await message_service.store_ciphertext(user_id, room_id, "Alice", payload)
        assert mock_store.await_count == 1

        with pytest.raises(ValidationError) as exc:
            await message_service.store_ciphertext(user_id, room_id, "Alice", payload)
        assert exc.value.code == "replay_detected"


@pytest.mark.asyncio
async def test_public_key_username_must_match_display_name(client):
    async def fake_user():
        return {"id": "user-1", "email": "alice@test.ie", "display_name": "Alice"}

    app.dependency_overrides[get_current_user] = fake_user
    try:
        with patch(
            "app.services.room_service.room_repo.is_member",
            new_callable=AsyncMock,
            return_value=True,
        ), patch(
            "app.services.room_service.user_repo.find_by_id",
            new_callable=AsyncMock,
            return_value={"_id": "user-1", "display_name": "Alice"},
        ):
            res = await client.post(
                "/api/rooms/room-1/keys",
                json={
                    "username": "EvilName",
                    "public_key_jwk": {"kty": "EC"},
                    "fingerprint": "ABCD1234",
                    "crypto_epoch": 1,
                },
            )
        assert res.status_code == 422
        assert res.json()["detail"]["code"] == "username_mismatch"
    finally:
        app.dependency_overrides.clear()
