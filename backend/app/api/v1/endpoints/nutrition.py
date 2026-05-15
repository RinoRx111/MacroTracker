# backend/App/api/v1/endpoints/nutrition.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
import os 
from dotenv import load_dotenv

load_dotenv()

from App.db.session import get_db
from App.db.models.nutrition_log import FoodItem, NutritionLog
from App.db.models.weight_log import WaterLog
from App.db.models.user import DailyGoal
from App.schemas.nutrition import FoodItemResponse, NutritionLogCreate, NutritionLogResponse, DailySummary
from App.services.food_provider import USDAProvider

router = APIRouter()

# ─────────────────────────────────────────────────────────────
#  REPLACE "YOUR_API_KEY" WITH YOUR REAL USDA KEY FROM:
#  https://fdc.nal.usda.gov/api-key-signup.html  (free, instant)
# ─────────────────────────────────────────────────────────────
food_service = USDAProvider(api_key=os.getenv("api_key"))


# ──────────────────────────────────────────────────────────────────────────────
#  FOOD SEARCH
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/search", response_model=List[FoodItemResponse])
async def search_food(query: str):
    """Search for food via USDA API (or mock if no key set)."""
    results = await food_service.search_food(query)
    return results


# ──────────────────────────────────────────────────────────────────────────────
#  LOG A FOOD ITEM  (FIXED: now saves real nutrient data, not fake numbers)
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/log", response_model=NutritionLogResponse)
async def log_food(entry: NutritionLogCreate, db: AsyncSession = Depends(get_db)):
    """
    Log a food item for a given date.
    - If the food already exists in the local DB (previously cached), use it.
    - If it's a new food from the API, create it using the real data
      sent from the frontend (food_name, food_calories, etc.).
    """

    # 1. Try to find the food in the local cache
    result = await db.execute(select(FoodItem).where(FoodItem.id == entry.food_id))
    food = result.scalar_one_or_none()

    # 2. Not cached yet — create it from the real data the frontend sent
    if not food:
        # Guard: frontend MUST send real nutrient data when logging an API food
        if entry.food_calories is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Food not in local DB and no nutrient data was sent. "
                    "Pass food_name, food_calories, food_protein, food_carbs, "
                    "food_fats in the request body."
                )
            )

        food = FoodItem(
            id=entry.food_id,
            name=entry.food_name or f"Food #{entry.food_id}",
            calories=entry.food_calories,
            protein=entry.food_protein or 0.0,
            carbs=entry.food_carbs or 0.0,
            fats=entry.food_fats or 0.0,
            serving_size=100.0,
            serving_unit="g",
            is_api_cached=True,
            api_id=str(entry.food_id),
        )
        db.add(food)
        await db.flush()  # write to DB so we get the id back

    # 3. Calculate nutrition scaled to the actual amount logged (per 100g base)
    ratio = entry.amount / 100.0

    new_log = NutritionLog(
        food_id=food.id,
        amount=entry.amount,
        logged_calories=food.calories * ratio,
        logged_protein=food.protein * ratio,
        logged_carbs=food.carbs * ratio,
        logged_fats=food.fats * ratio,
        meal_type=entry.meal_type,
        log_date=entry.log_date,
    )

    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)
    return new_log


# ──────────────────────────────────────────────────────────────────────────────
#  GET ALL LOGS FOR A DATE  (NEW — powers the Food Log page)
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/logs/{date}")
async def get_daily_logs(date: str, db: AsyncSession = Depends(get_db)):
    """Return every food log entry for a date, including the food name."""
    result = await db.execute(
        select(NutritionLog, FoodItem.name.label("food_name"))
        .join(FoodItem, NutritionLog.food_id == FoodItem.id, isouter=True)
        .where(NutritionLog.log_date == date)
        .order_by(NutritionLog.created_at)
    )
    rows = result.all()

    return [
        {
            "id": log.id,
            "food_id": log.food_id,
            "food_name": food_name or "Unknown Food",
            "amount": log.amount,
            "logged_calories": round(log.logged_calories, 1),
            "logged_protein": round(log.logged_protein, 1),
            "logged_carbs": round(log.logged_carbs, 1),
            "logged_fats": round(log.logged_fats, 1),
            "meal_type": log.meal_type,
            "log_date": log.log_date,
        }
        for log, food_name in rows
    ]


# ──────────────────────────────────────────────────────────────────────────────
#  DELETE A LOG ENTRY  (NEW — so you can remove mistakes)
# ──────────────────────────────────────────────────────────────────────────────

@router.delete("/log/{log_id}")
async def delete_log(log_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a single food log entry by its ID."""
    result = await db.execute(select(NutritionLog).where(NutritionLog.id == log_id))
    log = result.scalar_one_or_none()

    if not log:
        raise HTTPException(status_code=404, detail="Log entry not found")

    await db.delete(log)
    await db.commit()
    return {"status": "deleted", "id": log_id}


# ──────────────────────────────────────────────────────────────────────────────
#  DAILY SUMMARY  (FIXED: reads real calorie goal from DB, not hardcoded 2000)
# ──────────────────────────────────────────────────────────────────────────────

@router.get("/summary/{date}")
async def get_daily_summary(date: str, db: AsyncSession = Depends(get_db)):
    """
    Returns totals for the day plus the user's real calorie goal.
    Falls back to 2000 only if the user has never saved a goal.
    """

    # Fetch the user's actual calorie goal
    goal_result = await db.execute(
        select(DailyGoal).where(DailyGoal.user_id == 1).order_by(DailyGoal.id.desc())
    )
    goal = goal_result.scalar_one_or_none()
    goal_calories = goal.calories if goal else 2000.0
    goal_protein  = goal.protein  if goal else 150.0
    goal_carbs    = goal.carbs    if goal else 200.0
    goal_fats     = goal.fats     if goal else 65.0

    # Sum today's logs
    result = await db.execute(
        select(
            func.sum(NutritionLog.logged_calories),
            func.sum(NutritionLog.logged_protein),
            func.sum(NutritionLog.logged_carbs),
            func.sum(NutritionLog.logged_fats),
        ).where(NutritionLog.log_date == date)
    )
    row = result.fetchone()

    total_cal  = row[0] or 0.0
    total_prot = row[1] or 0.0
    total_carb = row[2] or 0.0
    total_fat  = row[3] or 0.0

    return {
        "date": date,
        "total_calories": round(total_cal, 1),
        "total_protein":  round(total_prot, 1),
        "total_carbs":    round(total_carb, 1),
        "total_fats":     round(total_fat, 1),
        # Real goals (used by Dashboard rings & remaining counter)
        "goal_calories": goal_calories,
        "goal_protein":  goal_protein,
        "goal_carbs":    goal_carbs,
        "goal_fats":     goal_fats,
        "remaining_calories": round(goal_calories - total_cal, 1),
    }


# ──────────────────────────────────────────────────────────────────────────────
#  WATER TRACKING
# ──────────────────────────────────────────────────────────────────────────────

@router.post("/water")
async def log_water(payload: dict, db: AsyncSession = Depends(get_db)):
    """Log water intake in milliliters."""
    amount = payload.get("amount")
    date   = payload.get("date")

    if amount is None or date is None:
        raise HTTPException(status_code=400, detail="Missing 'amount' or 'date'")

    new_water = WaterLog(amount=float(amount), log_date=date)
    db.add(new_water)
    await db.commit()
    return {"status": "success", "amount": amount, "date": date}


@router.get("/water/{date}")
async def get_water_summary(date: str, db: AsyncSession = Depends(get_db)):
    """Get total water intake (ml) for a day."""
    result = await db.execute(
        select(func.sum(WaterLog.amount)).where(WaterLog.log_date == date)
    )
    total = result.scalar_one() or 0.0

    # Also get the user's water target so the ring knows what 100% is
    goal_result = await db.execute(
        select(DailyGoal).where(DailyGoal.user_id == 1).order_by(DailyGoal.id.desc())
    )
    goal = goal_result.scalar_one_or_none()
    water_target = goal.water_target if goal else 3000.0

    return {
        "date": date,
        "total_water": round(total, 0),
        "water_target": water_target,
    }
