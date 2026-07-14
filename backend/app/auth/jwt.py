"""JWT token utilities."""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from app.config import settings
from app.core.exceptions import AuthenticationError


def create_access_token(subject: str, claims: dict[str, Any] | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {
        "sub": subject,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        **(claims or {}),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise AuthenticationError("Invalid or expired token", code="invalid_token") from exc
