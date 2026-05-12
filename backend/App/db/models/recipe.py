# backend/App/db/models/recipe.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from App.db.session import Base

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    total_calories = Column(Float, default=0.0)
    total_protein = Column(Float, default=0.0)
    total_carbs = Column(Float, default=0.0)
    total_fats = Column(Float, default=0.0)

class RecipeIngredient(Base):
    """Links foods to a recipe with a specific amount"""
    __tablename__ = "recipe_ingredients"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id"))
    food_id = Column(Integer, ForeignKey("food_items.id"))
    amount = Column(Float) # weight in grams
