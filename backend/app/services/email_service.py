"""Email delivery — AWS SES, SMTP (Gmail), or console log in development."""

import asyncio
import smtplib
from email.message import EmailMessage

from app.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def _send_via_smtp(email: str, subject: str, body: str) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.email_from or settings.smtp_user
    msg["To"] = email
    msg.set_content(body)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=30) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)


def _send_via_ses(email: str, subject: str, body: str) -> None:
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


async def send_otp_email(email: str, code: str) -> None:
    subject = "StudySafe — your verification code"
    body = (
        f"Your StudySafe verification code is: {code}\n\n"
        f"This code expires in {settings.otp_expire_minutes} minutes.\n"
        "If you did not request this, ignore this email."
    )

    if settings.is_development and not settings.email_delivery_configured:
        logger.info("[DEV OTP] email=%s code=%s", email, code)
        return

    try:
        if settings.smtp_configured:
            await asyncio.to_thread(_send_via_smtp, email, subject, body)
            logger.info("OTP email sent to %s via SMTP (%s)", email, settings.smtp_host)
        elif settings.ses_configured:
            await asyncio.to_thread(_send_via_ses, email, subject, body)
            logger.info("OTP email sent to %s via SES", email)
        else:
            logger.info("[DEV OTP] email=%s code=%s", email, code)
    except Exception as exc:
        logger.error("Failed to send OTP email: %s", exc)
        raise
