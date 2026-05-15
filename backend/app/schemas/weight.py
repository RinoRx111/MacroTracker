"""Pydantic schemas for weight and goals."""

from typing import Optional
from pydantic import BaseModel, Field
from datetime import date, datetime


class WeightLogCreate(BaseModel):
    """Schema for creating weight log."""
    weight_kg: float = Field(..., gt=0, le=250)
    weight_date: Optional[date] = None
    notes: Optional[str] = None


class WeightLogResponse(BaseModel):
    """Schema for weight log response."""
    id: int
    user_id: int
    weight_kg: float
    weight_date: date
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GoalCreate(BaseModel):
    """Schema for creating goal."""
    goal_type: str = Field(..., pattern="^(weight_loss|muscle_gain|maintenance)$")
    target_weight_kg: Optional[float] = Field(None, gt=0, le=250)
    target_date: Optional[date] = None


class GoalResponse(BaseModel):
    """Schema for goal response."""
    id: int
    user_id: int
    goal_type: str
    target_weight_kg: Optional[float]
    target_date: Optional[date]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WeightTrend(BaseModel):
    """Schema for weight trend data."""
    date: date
    weight_kg: float
    moving_average_kg: Optional[float]
    change_from_previous: Optional[float]


class WeightStats(BaseModel):
    """Schema for weight statistics."""
    current_weight_kg: float
    lowest_weight_kg: float
    highest_weight_kg: float
    average_weight_kg: float
    total_weight_change_kg: float
    total_entries: int
    last_update: date


class WeeklyProgress(BaseModel):
    """Schema for weekly progress."""
    week_start: date
    week_end: date
    average_weight_kg: float
    weight_change_kg: float
    average_calories: float
    average_protein_g: float
    average_carbs_g: float
    average_fat_g: float
