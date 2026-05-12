# backend/app/schemas/weight.py
from pydantic import BaseModel
from typing import Optional

class WeightLogCreate(BaseModel):
    weight: float
    log_date: str # YYYY-MM-DD

class WeightLogResponse(BaseModel):
    id: int
    weight: float
    log_date: str

    class Config:
        from_attributes = True

class UserProfileBase(BaseModel):
    username: str
    email: Optional[str] = None
    current_weight: float
    target_weight: float
    height: float
    age: int
    gender: str
    activity_multiplier: float = 1.2

class UserProfileResponse(UserProfileBase):
    id: int

    class Config:
        from_attributes = True
