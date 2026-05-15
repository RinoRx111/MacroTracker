"""Weight tracking endpoints."""

from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.weight import (
    WeightLogCreate,
    WeightLogResponse,
    GoalCreate,
    GoalResponse,
    WeightStats,
    WeeklyProgress,
)
from app.services.weight_service import WeightService, GoalService
from app.models.user import User

router = APIRouter(prefix="/weight", tags=["weight"])


def get_current_user(user_id: int = 1, db: Session = Depends(get_db)) -> User:
    """Get current user (simplified for demo)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


@router.post("/logs", response_model=WeightLogResponse)
async def create_weight_log(
    weight_log_data: WeightLogCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WeightLogResponse:
    """Create a new weight log entry."""
    weight_log = WeightService.create_weight_log(
        db,
        user.id,
        weight_log_data.weight_kg,
        weight_log_data.weight_date,
        weight_log_data.notes,
    )
    return weight_log


@router.get("/logs/{weight_log_id}", response_model=WeightLogResponse)
async def get_weight_log(
    weight_log_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WeightLogResponse:
    """Get a specific weight log."""
    weight_log = WeightService.get_weight_log(db, weight_log_id, user.id)
    if not weight_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Weight log not found",
        )
    return weight_log


@router.get("/latest", response_model=WeightLogResponse)
async def get_latest_weight(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WeightLogResponse:
    """Get the latest weight entry."""
    weight_log = WeightService.get_latest_weight(db, user.id)
    if not weight_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No weight logs found",
        )
    return weight_log


@router.get("/range", response_model=List[WeightLogResponse])
async def get_weight_range(
    start_date: date = Query(...),
    end_date: date = Query(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[WeightLogResponse]:
    """Get weight logs within a date range."""
    weight_logs = WeightService.get_weight_logs_range(
        db, user.id, start_date, end_date
    )
    return weight_logs


@router.get("/stats", response_model=WeightStats)
async def get_weight_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WeightStats:
    """Get weight statistics."""
    stats = WeightService.get_weight_stats(db, user.id)
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No weight logs found",
        )
    return stats


@router.get("/weekly-progress", response_model=WeeklyProgress)
async def get_weekly_progress(
    target_date: date = Query(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WeeklyProgress:
    """Get weekly progress."""
    if not target_date:
        target_date = date.today()
    
    progress = WeightService.get_weekly_progress(db, user.id, target_date)
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insufficient data for weekly progress",
        )
    return progress


@router.delete("/logs/{weight_log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_weight_log(
    weight_log_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a weight log entry."""
    success = WeightService.delete_weight_log(db, weight_log_id, user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Weight log not found",
        )


@router.post("/goals", response_model=GoalResponse)
async def create_goal(
    goal_data: GoalCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GoalResponse:
    """Create a new goal."""
    goal = GoalService.create_goal(
        db,
        user.id,
        goal_data.goal_type,
        goal_data.target_weight_kg,
        goal_data.target_date,
    )
    return goal


@router.get("/goals/active", response_model=GoalResponse)
async def get_active_goal(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GoalResponse:
    """Get active goal."""
    goal = GoalService.get_active_goal(db, user.id)
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active goal found",
        )
    return goal


@router.get("/goals/history", response_model=List[GoalResponse])
async def get_goal_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[GoalResponse]:
    """Get goal history."""
    goals = GoalService.get_goal_history(db, user.id)
    return goals
