"""Pydantic schemas for StudySafe API."""

from pydantic import BaseModel, EmailStr, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "StudySafe API"
    environment: str = "development"
    database: str = "connected"


class OtpRequest(BaseModel):
    email: EmailStr


class OtpVerify(BaseModel):
    email: EmailStr
    code: str = Field(min_length=4, max_length=8)
    display_name: str = Field(default="", max_length=64)


class UserResponse(BaseModel):
    id: str
    email: str
    display_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RoomCreate(BaseModel):
    name: str = Field(min_length=2, max_length=64)


class RoomJoin(BaseModel):
    invite_code: str = Field(min_length=4, max_length=8)


class RoomResponse(BaseModel):
    id: str
    name: str
    invite_code: str
    member_count: int
    created_at: str


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


class MessageHistoryItem(BaseModel):
    id: str
    from_username: str
    ciphertext_payload: str
    created_at: str


class MessageHistoryResponse(BaseModel):
    room_id: str
    messages: list[MessageHistoryItem]


class ErrorResponse(BaseModel):
    code: str
    message: str
