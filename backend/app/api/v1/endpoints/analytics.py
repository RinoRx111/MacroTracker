"""Analytics and reporting endpoints."""

from typing import Dict, List, Any
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.analytics_service import AnalyticsService
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])


def get_current_user(user_id: int = 1, db: Session = Depends(get_db)) -> User:
    """Get current user (simplified for demo)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


@router.get("/nutrition-data")
async def get_nutrition_data(
    start_date: date = Query(...),
    end_date: date = Query(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    """Get daily nutrition data for a date range."""
    return AnalyticsService.get_daily_nutrition_data(db, user.id, start_date, end_date)


@router.get("/macro-distribution")
async def get_macro_distribution(
    target_date: date = Query(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, float]:
    """Get macro distribution for a specific date."""
    if not target_date:
        target_date = date.today()
    
    return AnalyticsService.get_macro_distribution(db, user.id, target_date)


@router.get("/weight-progress")
async def get_weight_progress(
    start_date: date = Query(...),
    end_date: date = Query(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    """Get weight progress data."""
    return AnalyticsService.get_weight_progress(db, user.id, start_date, end_date)


@router.get("/insights")
async def get_nutrition_insights(
    days: int = Query(7, ge=1, le=365),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Get nutrition insights for the past N days."""
    try:
        return AnalyticsService.get_nutrition_insights(db, user, days)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating insights: {str(e)}",
        )


@router.get("/meal-breakdown")
async def get_meal_breakdown(
    target_date: date = Query(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Dict[str, float]]:
    """Get nutrition breakdown by meal type."""
    if not target_date:
        target_date = date.today()
    
    return AnalyticsService.get_meal_type_breakdown(db, user.id, target_date)


@router.get("/summary")
async def get_summary(
    target_date: date = Query(default=None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Get comprehensive summary."""
    if not target_date:
        target_date = date.today()
    
    try:
        # Get nutrition data
        from app.services.food_service import FoodService
        nutrition_summary = FoodService.get_daily_nutrition_summary(db, user, target_date)
        
        # Get meal breakdown
        meal_breakdown = AnalyticsService.get_meal_type_breakdown(db, user.id, target_date)
        
        return {
            "date": target_date.isoformat(),
            "nutrition": {
                "calories": nutrition_summary.total_calories,
                "protein_g": nutrition_summary.total_protein_g,
                "carbs_g": nutrition_summary.total_carbs_g,
                "fat_g": nutrition_summary.total_fat_g,
                "fiber_g": nutrition_summary.total_fiber_g,
            },
            "goals": {
                "calories": user.daily_calorie_goal,
                "protein_g": user.protein_goal_g,
                "carbs_g": user.carbs_goal_g,
                "fat_g": user.fat_goal_g,
            },
            "remaining": {
                "calories": nutrition_summary.calorie_remaining,
                "protein_g": max(0, user.protein_goal_g - nutrition_summary.total_protein_g),
                "carbs_g": max(0, user.carbs_goal_g - nutrition_summary.total_carbs_g),
                "fat_g": max(0, user.fat_goal_g - nutrition_summary.total_fat_g),
            },
            "macro_percentages": nutrition_summary.macro_percentages,
            "meal_breakdown": meal_breakdown,
            "meal_count": nutrition_summary.meal_count,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating summary: {str(e)}",
        )
