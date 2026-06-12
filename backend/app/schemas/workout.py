"""Workout schemas for validation."""

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class WorkoutLogBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: str = Field("cardio", pattern="^(cardio|strength)$")
    duration_minutes: int = Field(..., gt=0)
    calories_burned: float = Field(..., ge=0)
    intensity: str = Field("medium", pattern="^(low|medium|high)$")
    notes: Optional[str] = Field(None, max_length=500)
    logged_date: Optional[date] = None


class WorkoutLogCreate(WorkoutLogBase):
    pass


class WorkoutLogResponse(WorkoutLogBase):
    id: int
    user_id: int
    logged_date: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
