"""Daily activity schemas for validation."""

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class ActivityLogBase(BaseModel):
    steps: int = Field(0, ge=0)
    distance_km: float = Field(0.0, ge=0)
    active_minutes: int = Field(0, ge=0)
    calories_burned: float = Field(0.0, ge=0)
    logged_date: Optional[date] = None


class ActivityLogCreate(ActivityLogBase):
    pass


class ActivityLogResponse(ActivityLogBase):
    id: int
    user_id: int
    logged_date: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
