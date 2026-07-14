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
