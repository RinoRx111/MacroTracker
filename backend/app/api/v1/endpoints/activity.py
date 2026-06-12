"""Daily activity tracking endpoints."""

from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.activity import ActivityLogCreate, ActivityLogResponse
from app.services.activity_service import ActivityService
from app.models.user import User

router = APIRouter(prefix="/activity", tags=["activity"])


def get_current_user(user_id: int = 1, db: Session = Depends(get_db)) -> User:
    """Get current user (simplified for demo)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


@router.post("/logs", response_model=ActivityLogResponse)
async def create_or_update_activity_log(
    activity_data: ActivityLogCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ActivityLogResponse:
    """Create or update the daily steps/activity summary."""
    return ActivityService.update_or_create_daily_activity(db, user.id, activity_data)


@router.get("/daily", response_model=ActivityLogResponse)
async def get_daily_activity(
    target_date: date = Query(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ActivityLogResponse:
    """Get daily steps/activity summary."""
    if not target_date:
        target_date = date.today()
    
    activity = ActivityService.get_daily_activity(db, user.id, target_date)
    if not activity:
        # Return an empty/default response structure rather than 404 to make frontend integrations easy
        return ActivityLogResponse(
            id=0,
            user_id=user.id,
            steps=0,
            distance_km=0.0,
            active_minutes=0,
            calories_burned=0.0,
            logged_date=target_date,
            created_at=target_date,
            updated_at=target_date,
        )
    return activity
