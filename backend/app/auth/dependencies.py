"""FastAPI auth dependencies."""

from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.cookies import read_auth_token
from app.auth.jwt import decode_access_token
from app.core.exceptions import AuthenticationError, http_error
from app.db.repositories.users import user_repo

security = HTTPBearer(auto_error=False)


async def _resolve_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None,
) -> str | None:
    if credentials and credentials.credentials:
        return credentials.credentials
    return read_auth_token(request)


async def get_current_user(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> dict:
    token = await _resolve_token(request, credentials)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "missing_token", "message": "Authentication required"},
        )

    try:
        payload = decode_access_token(token)
    except AuthenticationError as exc:
        raise http_error(exc) from exc

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject")

    user = await user_repo.find_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "display_name": user["display_name"],
    }


async def get_optional_user(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> dict | None:
    token = await _resolve_token(request, credentials)
    if not token:
        return None
    try:
        return await get_current_user(request, credentials)
    except HTTPException:
        return None
