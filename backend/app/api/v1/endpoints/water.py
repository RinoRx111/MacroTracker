"""Daily hydration (water) tracking endpoints."""

from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.water import WaterLogCreate, WaterLogResponse
from app.services.water_service import WaterService
from app.models.user import User

router = APIRouter(prefix="/water", tags=["water"])

from app.core.auth import get_current_user


@router.post("/logs", response_model=WaterLogResponse)
async def update_or_create_water_log(
    water_data: WaterLogCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WaterLogResponse:
    """Create or update daily water intake."""
    return WaterService.update_or_create_daily_water(db, user.id, water_data)


@router.get("/daily", response_model=WaterLogResponse)
async def get_daily_water(
    target_date: date = Query(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WaterLogResponse:
    """Get daily water log intake total."""
    if not target_date:
        target_date = date.today()
    
    water = WaterService.get_daily_water(db, user.id, target_date)
    if not water:
        # Return an empty/default response structure to avoid crashes on frontend
        return WaterLogResponse(
            id=0,
            user_id=user.id,
            amount_ml=0,
            logged_date=target_date,
            created_at=target_date,
            updated_at=target_date,
        )
    return water
