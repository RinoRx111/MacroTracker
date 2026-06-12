"""Pydantic schemas for users."""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UserBase(BaseModel):
    """Base user schema with common fields."""
    username: str = Field(..., min_length=3, max_length=100)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    age: Optional[int] = Field(None, ge=13, le=120)
    weight_kg: Optional[float] = Field(None, gt=0, le=250)
    height_cm: Optional[int] = Field(None, gt=0, le=250)
    gender: Optional[str] = None
    activity_level: Optional[str] = None


class UserCreate(UserBase):
    """Schema for user registration."""
    pass
class User(BaseModel):
    """User schema for reading profile info"""
    id: int
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    age: Optional[int] = Field(None, ge=13, le=120)
    weight_kg: Optional[float] = Field(None, gt=0, le=250)
    height_cm: Optional[int] = Field(None, gt=0, le=250)
    gender: Optional[str] = None
    activity_level: Optional[str] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    full_name: Optional[str] = None
    age: Optional[int] = Field(None, ge=13, le=120)
    weight_kg: Optional[float] = Field(None, gt=0, le=250)
    height_cm: Optional[int] = Field(None, gt=0, le=250)
    gender: Optional[str] = None
    activity_level: Optional[str] = None
    daily_calorie_goal: Optional[int] = Field(None, gt=0)
    protein_goal_g: Optional[float] = Field(None, gt=0)
    carbs_goal_g: Optional[float] = Field(None, gt=0)
    fat_goal_g: Optional[float] = Field(None, gt=0)
    daily_step_goal: Optional[int] = Field(None, gt=0)
    daily_water_goal_ml: Optional[int] = Field(None, gt=0)
    daily_calories_burned_goal: Optional[int] = Field(None, gt=0)
    dark_mode: Optional[bool] = None


class UserResponse(BaseModel):
    """Schema for user response."""
    id: int
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[int] = None
    gender: Optional[str] = None
    activity_level: Optional[str] = None
    daily_calorie_goal: int
    protein_goal_g: float
    carbs_goal_g: float
    fat_goal_g: float
    daily_step_goal: int
    daily_water_goal_ml: int
    daily_calories_burned_goal: int
    is_active: bool
    dark_mode: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserStatsResponse(BaseModel):
    """Schema for user stats."""
    user_id: int
    username: str
    bmi: Optional[float]
    bmi_category: Optional[str]
    tdee: Optional[float]
    daily_calorie_goal: int
    protein_goal_g: float
    carbs_goal_g: float
    fat_goal_g: float
    daily_step_goal: int
    daily_water_goal_ml: int
    daily_calories_burned_goal: int


class SettingsUpdate(BaseModel):
    """Schema for updating settings."""
    dark_mode: Optional[bool] = None
    daily_calorie_goal: Optional[int] = Field(None, gt=0)
    protein_goal_g: Optional[float] = Field(None, gt=0)
    carbs_goal_g: Optional[float] = Field(None, gt=0)
    fat_goal_g: Optional[float] = Field(None, gt=0)
    daily_step_goal: Optional[int] = Field(None, gt=0)
    daily_water_goal_ml: Optional[int] = Field(None, gt=0)
    daily_calories_burned_goal: Optional[int] = Field(None, gt=0)

