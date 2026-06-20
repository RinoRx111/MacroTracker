"""User database model."""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime

from app.models import Base


class User(Base):
    """User model for nutrition tracking."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(200), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    clerk_id = Column(String(255), unique=True, index=True, nullable=True)

    
    # Profile information
    age = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)  # Current weight in kg
    height_cm = Column(Integer, nullable=True)  # Height in cm
    gender = Column(String(20), nullable=True)  # "male", "female", "other"
    activity_level = Column(String(50), nullable=True)  # "sedentary", "light", "moderate", "active"
    
    # Nutrition goals
    daily_calorie_goal = Column(Integer, default=2000)
    protein_goal_g = Column(Float, default=150)  # Grams per day
    carbs_goal_g = Column(Float, default=200)    # Grams per day
    fat_goal_g = Column(Float, default=65)       # Grams per day

    # Fitness goals
    daily_step_goal = Column(Integer, default=10000)
    daily_water_goal_ml = Column(Integer, default=2000)
    daily_calories_burned_goal = Column(Integer, default=500)
    
    # Settings
    is_active = Column(Boolean, default=True)
    dark_mode = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"User(id={self.id}, username={self.username}, email={self.email})"
