"""Email delivery — AWS SES in production, console log in development."""

from app.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


async def send_otp_email(email: str, code: str) -> None:
    subject = "StudySafe — your verification code"
    body = (
        f"Your StudySafe verification code is: {code}\n\n"
        f"This code expires in {settings.otp_expire_minutes} minutes.\n"
        "If you did not request this, ignore this email."
    )

    if settings.is_development or not settings.ses_configured:
        logger.info("[DEV OTP] email=%s code=%s", email, code)
        return

    try:
        import boto3

        client = boto3.client(
            "ses",
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )
        client.send_email(
            Source=settings.email_from,
            Destination={"ToAddresses": [email]},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {"Text": {"Data": body, "Charset": "UTF-8"}},
            },
        )
        logger.info("OTP email sent to %s via SES", email)
    except Exception as exc:
        logger.error("Failed to send OTP email: %s", exc)
        raise
