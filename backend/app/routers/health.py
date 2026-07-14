"""Health check endpoint."""

from fastapi import APIRouter

from app.config import settings
from app.db.client import ping_db
from app.models.schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    db_status = "connected"
    try:
        await ping_db()
    except Exception:
        db_status = "disconnected"

    return HealthResponse(
        status="ok" if db_status == "connected" else "degraded",
        environment=settings.environment,
        database=db_status,
    )
