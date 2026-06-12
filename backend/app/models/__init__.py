"""Database models."""

from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import models to register them with Base
from app.models.user import User
from app.models.food import FoodLog, CustomFood
from app.models.weight import WeightLog, Goal
from app.models.workout import WorkoutLog
from app.models.activity import ActivityLog
from app.models.water import WaterLog

__all__ = ["Base", "User", "FoodLog", "CustomFood", "WeightLog", "Goal", "WorkoutLog", "ActivityLog", "WaterLog"]
