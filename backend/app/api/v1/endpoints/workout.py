"""Workout endpoints."""

from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.workout import WorkoutLogCreate, WorkoutLogResponse
from app.services.workout_service import WorkoutService
from app.models.user import User

router = APIRouter(prefix="/workout", tags=["workout"])


def get_current_user(user_id: int = 1, db: Session = Depends(get_db)) -> User:
    """Get current user (simplified for demo)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


@router.post("/logs", response_model=WorkoutLogResponse, status_code=status.HTTP_201_CREATED)
async def create_workout_log(
    workout_data: WorkoutLogCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkoutLogResponse:
    """Create a new workout log entry."""
    return WorkoutService.create_workout_log(db, user.id, workout_data)


@router.get("/daily", response_model=List[WorkoutLogResponse])
async def get_daily_workout_logs(
    target_date: date = Query(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[WorkoutLogResponse]:
    """Get workouts for a specific day."""
    if not target_date:
        target_date = date.today()
    return WorkoutService.get_daily_workout_logs(db, user.id, target_date)


@router.delete("/logs/{workout_log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workout_log(
    workout_log_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a workout log entry."""
    success = WorkoutService.delete_workout_log(db, workout_log_id, user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout log not found",
        )
