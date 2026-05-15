from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from App.db.session import get_db
from App.db.models.user import User, DailyGoal
from datetime import date

router = APIRouter()

@router.get("/profile")
async def get_profile(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == 1))
    user = result.scalar_one_or_none()
    if not user:
        user = User(id=1, username="User", email="user@local.app",
                    current_weight=75.0, target_weight=70.0,
                    height=175.0, age=30, gender="male", activity_multiplier=1.55)
        db.add(user)
        await db.commit()
        await db.refresh(user)
    return user

@router.post("/profile")
async def save_profile(data: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == 1))
    user = result.scalar_one_or_none()
    if not user: user = User(id=1)
    for key, value in data.items():
        if hasattr(user, key): setattr(user, key, value)
    await db.commit()
    return {"status": "saved"}

@router.get("/goals")
async def get_goals(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DailyGoal).where(DailyGoal.user_id == 1).order_by(DailyGoal.id.desc()))
    goal = result.scalar_one_or_none()
    return goal if goal else {"calories": 2000.0, "protein": 150.0, "carbs": 200.0, "fats": 65.0, "water_target": 3000.0}

@router.post("/goals")
async def save_goals(data: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DailyGoal).where(DailyGoal.user_id == 1))
    old = result.scalar_one_or_none()
    if old: await db.delete(old)
    new_goal = DailyGoal(
        user_id=1,
        calories=float(data.get("calories", 2000)),
        protein=float(data.get("protein", 150)),
        carbs=float(data.get("carbs", 200)),
        fats=float(data.get("fats", 65)),
        water_target=float(data.get("water_target", 3000)),
        updated_at=str(date.today())
    )
    db.add(new_goal)
    await db.commit()
    return {"status": "goals saved"}
