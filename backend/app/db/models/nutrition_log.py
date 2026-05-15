# backend/App/db/models/nutrition_log.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean # Added Boolean here
from sqlalchemy.sql import func
from App.db.session import Base

class FoodItem(Base):
    """Master library of foods (User created + Cached from API)"""
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    brand = Column(String, nullable=True)
    
    # Nutrition per 100g or per unit
    calories = Column(Float)
    protein = Column(Float)
    carbs = Column(Float)
    fats = Column(Float)
    
    # Micronutrients (JSON string for flexibility)
    micronutrients = Column(String, nullable=True) 
    
    is_api_cached = Column(Boolean, default=False)
    api_id = Column(String, nullable=True) # ID from USDA/Nutritionix
    serving_size = Column(Float) # default serving size
    serving_unit = Column(String) # 'g', 'ml', 'piece'

class NutritionLog(Base):
    """Actual entries of what the user ate"""
    __tablename__ = "nutrition_logs"

    id = Column(Integer, primary_key=True, index=True)
    food_id = Column(Integer, ForeignKey("food_items.id"))
    amount = Column(Float) # Amount eaten (e.g., 150g)
    
    # The calculated nutrition at the time of logging
    logged_calories = Column(Float)
    logged_protein = Column(Float)
    logged_carbs = Column(Float)
    logged_fats = Column(Float)
    
    meal_type = Column(String) # 'breakfast', 'lunch', 'dinner', 'snack'
    log_date = Column(String, index=True) # YYYY-MM-DD for fast querying
    created_at = Column(DateTime, server_default=func.now())
