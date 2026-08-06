"""HttpOnly session cookie helpers."""

from fastapi import Request, Response

from app.config import settings

AUTH_COOKIE_NAME = "studysafe_session"


def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=not settings.is_development,
        samesite="lax",
        max_age=settings.jwt_expire_minutes * 60,
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(key=AUTH_COOKIE_NAME, path="/")


def read_auth_token(request: Request) -> str | None:
    return request.cookies.get(AUTH_COOKIE_NAME)
