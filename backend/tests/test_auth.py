import pytest


@pytest.mark.asyncio
async def test_otp_request_validation(client):
    res = await client.post("/api/auth/otp/request", json={"email": "not-an-email"})
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_otp_verify_invalid(client):
    res = await client.post(
        "/api/auth/otp/verify",
        json={"email": "alice@test.ie", "code": "000000", "display_name": "Alice"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_protected_route_requires_auth(client):
    res = await client.get("/api/rooms/mine")
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_otp_request_and_verify_success(client):
    """Full OTP flow — catches timezone mismatch on MongoDB expires_at."""
    from datetime import datetime, timedelta

    from app.db.client import get_database
    from app.db.repositories.otp import otp_repo

    email = "integration-flow@test.ie"
    code = otp_repo.generate_code()
    await otp_repo.store(email, code)

    # MongoDB may return naive UTC datetimes depending on driver/version.
    naive_expiry = datetime.utcnow() + timedelta(minutes=5)
    await get_database()["otp_codes"].update_one(
        {"email": email.lower()},
        {"$set": {"expires_at": naive_expiry}},
    )

    res = await client.post(
        "/api/auth/otp/verify",
        json={"email": email, "code": code, "display_name": "Integration"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
