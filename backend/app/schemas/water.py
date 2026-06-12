"""Water log schemas for validation."""

from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class WaterLogBase(BaseModel):
    amount_ml: int = Field(..., ge=0)
    logged_date: Optional[date] = None


class WaterLogCreate(WaterLogBase):
    pass


class WaterLogUpdate(BaseModel):
    amount_ml: int = Field(..., ge=0)


class WaterLogResponse(WaterLogBase):
    id: int
    user_id: int
    logged_date: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
