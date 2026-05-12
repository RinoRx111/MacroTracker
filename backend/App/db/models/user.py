# backend/App/db/models/user.py
from sqlalchemy import Column, Integer, String, Float, Boolean
from App.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True)
    
    # Physical Metrics
    current_weight = Column(Float) # kg
    target_weight = Column(Float)   # kg
    height = Column(Float)          # cm
    age = Column(Integer)
    gender = Column(String)         # 'male', 'female', 'other'
    
    # Activity Level
    activity_multiplier = Column(Float, default=1.2)

class DailyGoal(Base):
    __tablename__ = "daily_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer) 
    calories = Column(Float)
    protein = Column(Float)    # grams
    carbs = Column(Float)      # grams
    fats = Column(Float)       # grams
    water_target = Column(Float) # ml
    updated_at = Column(String)  # ISO date string (YYYY-MM-DD)
