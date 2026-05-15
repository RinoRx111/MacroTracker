"""Analytics service for nutrition and health insights."""

from typing import Dict, List, Any, Optional
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.food import FoodLog
from app.models.weight import WeightLog
from app.models.user import User
from app.utils.calculations import calculate_macro_percentages
from app.utils.helpers import get_date_range


class AnalyticsService:
    """Service for analytics and reporting."""

    @staticmethod
    def get_daily_nutrition_data(
        db: Session,
        user_id: int,
        start_date: date,
        end_date: date,
    ) -> List[Dict[str, Any]]:
        """Get daily nutrition data for analytics."""
        logs = db.query(FoodLog).filter(
            FoodLog.user_id == user_id,
            FoodLog.logged_date >= start_date,
            FoodLog.logged_date <= end_date,
        ).all()

        # Group by date
        daily_data: Dict[date, Dict] = {}

        for log in logs:
            if log.logged_date not in daily_data:
                daily_data[log.logged_date] = {
                    "date": log.logged_date,
                    "calories": 0,
                    "protein": 0,
                    "carbs": 0,
                    "fat": 0,
                    "fiber": 0,
                }

            daily_data[log.logged_date]["calories"] += log.calories_kcal
            daily_data[log.logged_date]["protein"] += log.protein_g
            daily_data[log.logged_date]["carbs"] += log.carbs_g
            daily_data[log.logged_date]["fat"] += log.fat_g
            daily_data[log.logged_date]["fiber"] += log.fiber_g or 0

        # Fill in missing dates
        for d in get_date_range(start_date, end_date):
            if d not in daily_data:
                daily_data[d] = {
                    "date": d,
                    "calories": 0,
                    "protein": 0,
                    "carbs": 0,
                    "fat": 0,
                    "fiber": 0,
                }

        return sorted(daily_data.values(), key=lambda x: x["date"])

    @staticmethod
    def get_macro_distribution(
        db: Session,
        user_id: int,
        target_date: date,
    ) -> Dict[str, float]:
        """Get macro distribution for a specific date."""
        logs = db.query(FoodLog).filter(
            FoodLog.user_id == user_id,
            FoodLog.logged_date == target_date,
        ).all()

        total_protein = sum(log.protein_g for log in logs)
        total_carbs = sum(log.carbs_g for log in logs)
        total_fat = sum(log.fat_g for log in logs)

        return calculate_macro_percentages(total_protein, total_carbs, total_fat)

    @staticmethod
    def get_weight_progress(
        db: Session,
        user_id: int,
        start_date: date,
        end_date: date,
    ) -> List[Dict[str, Any]]:
        """Get weight progress data for charts."""
        logs = db.query(WeightLog).filter(
            WeightLog.user_id == user_id,
            WeightLog.weight_date >= start_date,
            WeightLog.weight_date <= end_date,
        ).order_by(WeightLog.weight_date.asc()).all()

        return [
            {
                "date": log.weight_date.isoformat(),
                "weight": log.weight_kg,
            }
            for log in logs
        ]

    @staticmethod
    def get_nutrition_insights(
        db: Session,
        user: User,
        days: int = 7,
    ) -> Dict[str, Any]:
        """Get nutrition insights for the past N days."""
        end_date = date.today()
        start_date = end_date - timedelta(days=days - 1)

        # Get all nutrition data for the period
        daily_data = AnalyticsService.get_daily_nutrition_data(
            db, user.id, start_date, end_date
        )

        if not daily_data:
            return {
                "average_calories": 0,
                "average_protein": 0,
                "average_carbs": 0,
                "average_fat": 0,
                "calorie_goal_compliance": 0,
                "total_days_logged": 0,
                "most_common_meal_type": None,
            }

        # Calculate averages
        calories_data = [d["calories"] for d in daily_data if d["calories"] > 0]
        days_logged = len(calories_data)

        avg_calories = sum(calories_data) / days_logged if calories_data else 0
        avg_protein = sum(d["protein"] for d in daily_data) / days if daily_data else 0
        avg_carbs = sum(d["carbs"] for d in daily_data) / days if daily_data else 0
        avg_fat = sum(d["fat"] for d in daily_data) / days if daily_data else 0

        # Calorie goal compliance
        compliance = (avg_calories / user.daily_calorie_goal * 100) if user.daily_calorie_goal > 0 else 0

        # Most common meal type
        meal_types = db.query(FoodLog.meal_type, func.count(FoodLog.id)).filter(
            FoodLog.user_id == user.id,
            FoodLog.logged_date >= start_date,
            FoodLog.logged_date <= end_date,
        ).group_by(FoodLog.meal_type).order_by(func.count(FoodLog.id).desc()).first()

        most_common_meal = meal_types[0] if meal_types else None

        return {
            "average_calories": round(avg_calories, 0),
            "average_protein": round(avg_protein, 1),
            "average_carbs": round(avg_carbs, 1),
            "average_fat": round(avg_fat, 1),
            "calorie_goal_compliance": round(compliance, 1),
            "total_days_logged": days_logged,
            "most_common_meal_type": most_common_meal,
            "period": f"Last {days} days",
        }

    @staticmethod
    def get_meal_type_breakdown(
        db: Session,
        user_id: int,
        target_date: date,
    ) -> Dict[str, Dict[str, float]]:
        """Get nutrition breakdown by meal type for a date."""
        logs = db.query(FoodLog).filter(
            FoodLog.user_id == user_id,
            FoodLog.logged_date == target_date,
        ).all()

        breakdown = {}
        for log in logs:
            if log.meal_type not in breakdown:
                breakdown[log.meal_type] = {
                    "calories": 0,
                    "protein": 0,
                    "carbs": 0,
                    "fat": 0,
                }

            breakdown[log.meal_type]["calories"] += log.calories_kcal
            breakdown[log.meal_type]["protein"] += log.protein_g
            breakdown[log.meal_type]["carbs"] += log.carbs_g
            breakdown[log.meal_type]["fat"] += log.fat_g

        # Round values
        for meal_type in breakdown:
            for key in breakdown[meal_type]:
                breakdown[meal_type][key] = round(breakdown[meal_type][key], 1)

        return breakdown
