"""Honeypot decoy endpoints — log suspicious access attempts."""

from datetime import datetime, timezone

from fastapi import APIRouter, Request

from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["honeypot"])


@router.get("/api/admin/users")
async def honeypot_admin_users(request: Request) -> dict:
    client_ip = request.client.host if request.client else "unknown"
    logger.warning(
        "HONEYPOT triggered: GET /api/admin/users from ip=%s user_agent=%s",
        client_ip,
        request.headers.get("user-agent", "unknown"),
    )
    return {
        "users": [
            {"id": "admin", "email": "admin@studysafe.local", "role": "superadmin"},
            {"id": "backup", "email": "backup@studysafe.local", "role": "admin"},
        ],
        "exported_at": datetime.now(timezone.utc).isoformat(),
        "note": "This endpoint is a honeypot decoy.",
    }
