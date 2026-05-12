# backend/App/api/v1/endpoints/weight.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from App.db.session import get_db
from App.db.models.weight_log import WeightLog
from App.schemas.weight import WeightLogCreate, WeightLogResponse
from App.services.trend_engine import TrendEngine

router = APIRouter()

@router.post("/log", response_model=WeightLogResponse)
async def log_weight(entry: WeightLogCreate, db: AsyncSession = Depends(get_db)):
    print(f"📥 Received weight log request: {entry.weight}kg for {entry.log_date}")
    
    new_log = WeightLog(weight=entry.weight, log_date=entry.log_date)
    db.add(new_log)
    await db.commit()
    await db.refresh(new_log)
    
    print(f"✅ Successfully saved weight: {new_log.id}")
    return new_log

@router.get("/trends")
async def get_weight_trends(db: AsyncSession = Depends(get_db)):
    print("📈 Fetching weight trends from database...")
    result = await db.execute(select(WeightLog).order_by(WeightLog.log_date))
    logs = result.scalars().all()
    
    print(f"📦 Found {len(logs)} weight entries in database")
    
    weights = [log.weight for log in logs]
    trend_weights = TrendEngine.calculate_weight_trend(weights)
    
    return {
        "raw_weights": weights,
        "trend_weights": trend_weights,
        "dates": [log.log_date for log in logs]
    }
