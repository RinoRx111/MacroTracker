"""Schemas module."""

from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    UserStatsResponse,
    SettingsUpdate,
)
from app.schemas.food import (
    FoodLogBase,
    FoodLogCreate,
    FoodLogResponse,
    CustomFoodCreate,
    CustomFoodResponse,
    FoodSearchResult,
    DailyNutritionSummary,
)
from app.schemas.weight import (
    WeightLogCreate,
    WeightLogResponse,
    GoalCreate,
    GoalResponse,
    WeightTrend,
    WeightStats,
    WeeklyProgress,
)
from app.schemas.workout import (
    WorkoutLogCreate,
    WorkoutLogResponse,
)
from app.schemas.activity import (
    ActivityLogCreate,
    ActivityLogResponse,
)
from app.schemas.water import (
    WaterLogCreate,
    WaterLogResponse,
    WaterLogUpdate,
)

__all__ = [
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserStatsResponse",
    "SettingsUpdate",
    "FoodLogBase",
    "FoodLogCreate",
    "FoodLogResponse",
    "CustomFoodCreate",
    "CustomFoodResponse",
    "FoodSearchResult",
    "DailyNutritionSummary",
    "WeightLogCreate",
    "WeightLogResponse",
    "GoalCreate",
    "GoalResponse",
    "WeightTrend",
    "WeightStats",
    "WeeklyProgress",
    "WorkoutLogCreate",
    "WorkoutLogResponse",
    "ActivityLogCreate",
    "ActivityLogResponse",
    "WaterLogCreate",
    "WaterLogResponse",
    "WaterLogUpdate",
]
