"""Authentication service — OTP request/verify and JWT issuance."""

from app.auth.jwt import create_access_token
from app.core.exceptions import AuthenticationError, ValidationError
from app.db.repositories.otp import otp_repo
from app.db.repositories.users import user_repo
from app.services.email_service import send_otp_email


class AuthService:
    async def request_otp(self, email: str) -> None:
        email = email.strip().lower()
        if "@" not in email or len(email) > 254:
            raise ValidationError("Invalid email address", code="invalid_email")

        code = otp_repo.generate_code()
        await otp_repo.store(email, code)
        await send_otp_email(email, code)

    async def verify_otp(self, email: str, code: str, display_name: str) -> dict:
        email = email.strip().lower()
        code = code.strip()

        if not await otp_repo.verify(email, code):
            raise AuthenticationError("Invalid or expired OTP code", code="invalid_otp")

        user = await user_repo.find_by_email(email)
        if not user:
            user = await user_repo.create(email, display_name.strip() or email.split("@")[0])
        elif display_name.strip():
            await user_repo.update_display_name(str(user["_id"]), display_name.strip())
            user["display_name"] = display_name.strip()

        user_id = str(user["_id"])
        token = create_access_token(
            user_id,
            claims={"email": user["email"], "display_name": user["display_name"]},
        )

        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "email": user["email"],
                "display_name": user["display_name"],
            },
        }


auth_service = AuthService()
