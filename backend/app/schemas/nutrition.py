from pydantic import BaseModel
from typing import Optional, List


class FoodItemBase(BaseModel):
    name: str
    calories: float
    protein: float
    carbs: float
    fats: float
    serving_size: float = 100.0
    serving_unit: str = "g"
    brand: Optional[str] = None
    micronutrients: Optional[str] = None


class FoodItemCreate(FoodItemBase):
    pass


class FoodItemResponse(FoodItemBase):
    id: int
    is_api_cached: bool
    api_id: Optional[str] = None
    provider: Optional[str] = None

    class Config:
        from_attributes = True


class NutritionLogCreate(BaseModel):
    food_id: int
    amount: float
    meal_type: str   # 'breakfast' | 'lunch' | 'dinner' | 'snack'
    log_date: str    # YYYY-MM-DD

    # ── Real food data sent from the frontend when logging an API food ──
    # Required when the food is not yet cached in the local DB.
    food_name: Optional[str] = None
    food_calories: Optional[float] = None
    food_protein: Optional[float] = None
    food_carbs: Optional[float] = None
    food_fats: Optional[float] = None


class NutritionLogResponse(BaseModel):
    id: int
    food_id: int
    amount: float
    logged_calories: float
    logged_protein: float
    logged_carbs: float
    logged_fats: float
    meal_type: str
    log_date: str

    class Config:
        from_attributes = True


class DailySummary(BaseModel):
    date: str
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fats: float
    # Real goals read from DailyGoal table (not hardcoded)
    goal_calories: float
    goal_protein: float
    goal_carbs: float
    goal_fats: float
    remaining_calories: float
