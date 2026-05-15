"""Pydantic schemas for food and nutrition."""

from typing import Optional
from pydantic import BaseModel, Field
from datetime import date, datetime


class FoodLogBase(BaseModel):
    """Base food log schema."""
    food_name: str = Field(..., min_length=1, max_length=255)
    portion_size: float = Field(..., gt=0)
    portion_unit: str = "g"
    calories_kcal: float = Field(..., ge=0)
    protein_g: float = Field(..., ge=0)
    carbs_g: float = Field(..., ge=0)
    fat_g: float = Field(..., ge=0)


class FoodLogCreate(FoodLogBase):
    """Schema for creating food log."""
    food_code: Optional[str] = None
    brand: Optional[str] = None
    serving_size: Optional[float] = None
    serving_unit: Optional[str] = None
    fiber_g: Optional[float] = None
    sugar_g: Optional[float] = None
    sodium_mg: Optional[float] = None
    meal_type: str = "snack"
    logged_date: Optional[date] = None


class FoodLogResponse(FoodLogBase):
    """Schema for food log response."""
    id: int
    user_id: int
    food_code: Optional[str]
    brand: Optional[str]
    serving_size: Optional[float]
    serving_unit: Optional[str]
    fiber_g: Optional[float]
    sugar_g: Optional[float]
    sodium_mg: Optional[float]
    meal_type: str
    logged_date: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CustomFoodCreate(BaseModel):
    """Schema for creating custom food."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    calories_per_100g: float = Field(..., ge=0)
    protein_per_100g: float = Field(..., ge=0)
    carbs_per_100g: float = Field(..., ge=0)
    fat_per_100g: float = Field(..., ge=0)
    fiber_per_100g: Optional[float] = None
    sugar_per_100g: Optional[float] = None


class CustomFoodResponse(CustomFoodCreate):
    """Schema for custom food response."""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OpenFoodFactsItem(BaseModel):
    """Schema for Open Food Facts API response."""
    code: Optional[str] = None
    name: Optional[str] = None
    brand: Optional[str] = None
    categories: Optional[str] = None
    nutriments: Optional[dict] = None
    image_url: Optional[str] = None


class FoodSearchResult(BaseModel):
    """Schema for food search result."""
    id: str  # Food code
    name: str
    brand: Optional[str]
    calories_per_100g: Optional[float]
    protein_per_100g: Optional[float]
    carbs_per_100g: Optional[float]
    fat_per_100g: Optional[float]
    fiber_per_100g: Optional[float]
    source: str = "openfoodfacts"


class DailyNutritionSummary(BaseModel):
    """Schema for daily nutrition summary."""
    date: date
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    total_fiber_g: float
    calorie_goal: int
    calorie_remaining: float
    protein_goal_g: float
    carbs_goal_g: float
    fat_goal_g: float
    macro_percentages: dict
    meal_count: int
