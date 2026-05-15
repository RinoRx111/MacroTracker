"""Food log database model."""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from datetime import datetime, date

from app.models import Base


class FoodLog(Base):
    """Food log model for tracking daily food consumption."""

    __tablename__ = "food_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Food information
    food_name = Column(String(255), nullable=False)
    food_code = Column(String(100), nullable=True, index=True)  # Open Food Facts code
    brand = Column(String(255), nullable=True)
    
    # Portions and weights
    portion_size = Column(Float, nullable=False)  # Amount consumed
    portion_unit = Column(String(50), default="g")  # g, ml, piece, serving, etc.
    serving_size = Column(Float, nullable=True)  # Reference serving size
    serving_unit = Column(String(50), nullable=True)
    
    # Nutrition values (per portion consumed)
    calories_kcal = Column(Float, nullable=False)
    protein_g = Column(Float, nullable=False)
    carbs_g = Column(Float, nullable=False)
    fat_g = Column(Float, nullable=False)
    
    # Additional nutrients
    fiber_g = Column(Float, nullable=True)
    sugar_g = Column(Float, nullable=True)
    sodium_mg = Column(Float, nullable=True)
    
    # Meal type
    meal_type = Column(String(50), default="snack")  # breakfast, lunch, dinner, snack
    
    # Timestamps
    logged_date = Column(Date, default=date.today, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"FoodLog(id={self.id}, user_id={self.user_id}, food={self.food_name})"


class CustomFood(Base):
    """Custom food model for user-defined foods."""

    __tablename__ = "custom_foods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Food information
    name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    
    # Nutrition per 100g
    calories_per_100g = Column(Float, nullable=False)
    protein_per_100g = Column(Float, nullable=False)
    carbs_per_100g = Column(Float, nullable=False)
    fat_per_100g = Column(Float, nullable=False)
    
    # Additional nutrients
    fiber_per_100g = Column(Float, nullable=True)
    sugar_per_100g = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"CustomFood(id={self.id}, user_id={self.user_id}, name={self.name})"
