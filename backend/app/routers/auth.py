"""Authentication routes — email OTP + JWT."""

from typing import Annotated

from fastapi import APIRouter, Depends, Request

from app.auth.dependencies import get_current_user
from app.core.exceptions import StudySafeError, http_error
from app.models.schemas import OtpRequest, OtpVerify, TokenResponse, UserResponse
from app.security.rate_limit import limiter
from app.services.auth_service import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/otp/request", status_code=204)
@limiter.limit("5/minute")
async def request_otp(request: Request, payload: OtpRequest) -> None:
    try:
        await auth_service.request_otp(payload.email)
    except StudySafeError as exc:
        raise http_error(exc) from exc


@router.post("/otp/verify", response_model=TokenResponse)
@limiter.limit("10/minute")
async def verify_otp(request: Request, payload: OtpVerify) -> TokenResponse:
    try:
        result = await auth_service.verify_otp(payload.email, payload.code, payload.display_name)
        return TokenResponse(**result)
    except StudySafeError as exc:
        raise http_error(exc) from exc


@router.get("/me", response_model=UserResponse)
async def get_me(user: Annotated[dict, Depends(get_current_user)]) -> UserResponse:
    return UserResponse(**user)
