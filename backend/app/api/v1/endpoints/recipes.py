# backend/App/api/v1/endpoints/recipes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from App.db.session import get_db
from App.db.models.recipe import Recipe, RecipeIngredient
from App.db.models.nutrition_log import FoodItem

router = APIRouter()

@router.get("/", response_model=list)
async def get_recipes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Recipe))
    return result.scalars().all()

@router.post("/create")
async def create_recipe(data: dict, db: AsyncSession = Depends(get_db)):
    """
    Expects: { "name": "Smoothie", "ingredients": [{ "food_id": 1, "amount": 100 }, ...] }
    """
    try:
        # 1. Create the Recipe base
        new_recipe = Recipe(name=data['name'], description=data.get('description', ''))
        db.add(new_recipe)
        await db.flush() # Push to DB to get the recipe ID

        total_cal, total_prot, total_carb, total_fat = 0, 0, 0, 0

        # 2. Add ingredients and calculate totals
        for ing in data['ingredients']:
            res = await db.execute(select(FoodItem).where(FoodItem.id == ing['food_id']))
            food = res.scalar_one_or_none()
            
            if food:
                ratio = ing['amount'] / 100.0
                ingredient = RecipeIngredient(
                    recipe_id=new_recipe.id, 
                    food_id=food.id, 
                    amount=ing['amount']
                )
                db.add(ingredient)
                
                total_cal += food.calories * ratio
                total_prot += food.protein * ratio
                total_carb += food.carbs * ratio
                total_fat += food.fats * ratio

        new_recipe.total_calories = total_cal
        new_recipe.total_protein = total_prot
        new_recipe.total_carbs = total_carb
        new_recipe.total_fats = total_fat
        
        await db.commit()
        return {"status": "success", "recipe_id": new_recipe.id}
    except Exception as e:
        print(f"❌ Recipe Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
