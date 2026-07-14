"""FastAPI auth dependencies."""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.jwt import decode_access_token
from app.core.exceptions import AuthenticationError, http_error
from app.db.repositories.users import user_repo

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> dict:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "missing_token", "message": "Authentication required"},
        )

    try:
        payload = decode_access_token(credentials.credentials)
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
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> dict | None:
    if not credentials or not credentials.credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
