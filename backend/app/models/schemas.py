"""Pydantic schemas for StudySafe API."""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "StudySafe API"


class PublicKeyRegister(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    public_key_jwk: dict
    fingerprint: str = Field(min_length=8, max_length=128)


class PublicKeyEntry(BaseModel):
    username: str
    public_key_jwk: dict
    fingerprint: str


class PublicKeyListResponse(BaseModel):
    room_id: str
    keys: list[PublicKeyEntry]


class WebSocketEnvelope(BaseModel):
    """Ciphertext relay — server never sees plaintext."""

    type: str = "message"
    from_user: str
    ciphertext: str
    iv: str
    timestamp: str
