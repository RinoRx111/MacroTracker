"""Database models."""

from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import models to register them with Base
from app.models.user import User
from app.models.food import FoodLog, CustomFood
from app.models.weight import WeightLog, Goal

__all__ = ["Base", "User", "FoodLog", "CustomFood", "WeightLog", "Goal"]
