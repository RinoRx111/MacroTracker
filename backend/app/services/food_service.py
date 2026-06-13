"""Food service for managing food logs and nutrition data."""

from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.food import FoodLog, CustomFood
from app.models.user import User
from app.schemas.food import (
    FoodLogCreate,
    DailyNutritionSummary,
)
from app.utils.calculations import calculate_macro_percentages


class FoodService:
    """Service for food-related operations."""

    @staticmethod
    def create_food_log(
        db: Session,
        user_id: int,
        food_log_data: FoodLogCreate,
    ) -> FoodLog:
        """Create a new food log entry."""
        db_food_log = FoodLog(
            user_id=user_id,
            food_name=food_log_data.food_name,
            food_code=food_log_data.food_code,
            brand=food_log_data.brand,
            portion_size=food_log_data.portion_size,
            portion_unit=food_log_data.portion_unit,
            serving_size=food_log_data.serving_size,
            serving_unit=food_log_data.serving_unit,
            calories_kcal=food_log_data.calories_kcal,
            protein_g=food_log_data.protein_g,
            carbs_g=food_log_data.carbs_g,
            fat_g=food_log_data.fat_g,
            fiber_g=food_log_data.fiber_g,
            sugar_g=food_log_data.sugar_g,
            sodium_mg=food_log_data.sodium_mg,
            meal_type=food_log_data.meal_type,
            logged_date=food_log_data.logged_date or date.today(),
        )
        db.add(db_food_log)
        db.commit()
        db.refresh(db_food_log)
        return db_food_log

    @staticmethod
    def get_food_log(db: Session, food_log_id: int, user_id: int) -> Optional[FoodLog]:
        """Get a specific food log by ID."""
        return db.query(FoodLog).filter(
            FoodLog.id == food_log_id,
            FoodLog.user_id == user_id,
        ).first()

    @staticmethod
    def get_daily_food_logs(
        db: Session,
        user_id: int,
        target_date: date,
    ) -> List[FoodLog]:
        """Get all food logs for a specific date."""
        return db.query(FoodLog).filter(
            FoodLog.user_id == user_id,
            FoodLog.logged_date == target_date,
        ).all()

    @staticmethod
    def get_food_logs_range(
        db: Session,
        user_id: int,
        start_date: date,
        end_date: date,
    ) -> List[FoodLog]:
        """Get food logs within a date range."""
        return db.query(FoodLog).filter(
            FoodLog.user_id == user_id,
            FoodLog.logged_date >= start_date,
            FoodLog.logged_date <= end_date,
        ).order_by(FoodLog.logged_date.desc()).all()

    @staticmethod
    def delete_food_log(db: Session, food_log_id: int, user_id: int) -> bool:
        """Delete a food log entry."""
        food_log = db.query(FoodLog).filter(
            FoodLog.id == food_log_id,
            FoodLog.user_id == user_id,
        ).first()

        if not food_log:
            return False

        db.delete(food_log)
        db.commit()
        return True

    @staticmethod
    def get_daily_nutrition_summary(
        db: Session,
        user: User,
        target_date: date,
    ) -> DailyNutritionSummary:
        """Get daily nutrition summary for a specific date."""
        food_logs = FoodService.get_daily_food_logs(db, user.id, target_date)

        total_calories = sum(log.calories_kcal for log in food_logs)
        total_protein = sum(log.protein_g for log in food_logs)
        total_carbs = sum(log.carbs_g for log in food_logs)
        total_fat = sum(log.fat_g for log in food_logs)
        total_fiber = sum(log.fiber_g or 0 for log in food_logs)

        macro_percentages = calculate_macro_percentages(
            total_protein,
            total_carbs,
            total_fat,
        )

        return DailyNutritionSummary(
            date=target_date,
            total_calories=total_calories,
            total_protein_g=total_protein,
            total_carbs_g=total_carbs,
            total_fat_g=total_fat,
            total_fiber_g=total_fiber,
            calorie_goal=user.daily_calorie_goal,
            calorie_remaining=user.daily_calorie_goal - total_calories,
            protein_goal_g=user.protein_goal_g,
            carbs_goal_g=user.carbs_goal_g,
            fat_goal_g=user.fat_goal_g,
            macro_percentages=macro_percentages,
            meal_count=len(food_logs),
        )

    @staticmethod
    def create_custom_food(
        db: Session,
        user_id: int,
        name: str,
        calories_per_100g: float,
        protein_per_100g: float,
        carbs_per_100g: float,
        fat_per_100g: float,
        description: Optional[str] = None,
        fiber_per_100g: Optional[float] = None,
        sugar_per_100g: Optional[float] = None,
    ) -> CustomFood:
        """Create a custom food entry."""
        db_custom_food = CustomFood(
            user_id=user_id,
            name=name,
            description=description,
            calories_per_100g=calories_per_100g,
            protein_per_100g=protein_per_100g,
            carbs_per_100g=carbs_per_100g,
            fat_per_100g=fat_per_100g,
            fiber_per_100g=fiber_per_100g,
            sugar_per_100g=sugar_per_100g,
        )
        db.add(db_custom_food)
        db.commit()
        db.refresh(db_custom_food)
        return db_custom_food

    @staticmethod
    def get_custom_foods(db: Session, user_id: int) -> List[CustomFood]:
        """Get all custom foods for a user."""
        return db.query(CustomFood).filter(CustomFood.user_id == user_id).all()

    @staticmethod
    def get_custom_food(db: Session, custom_food_id: int, user_id: int) -> Optional[CustomFood]:
        """Get a specific custom food."""
        return db.query(CustomFood).filter(
            CustomFood.id == custom_food_id,
            CustomFood.user_id == user_id,
        ).first()

    @staticmethod
    def delete_custom_food(db: Session, custom_food_id: int, user_id: int) -> bool:
        """Delete a custom food."""
        custom_food = db.query(CustomFood).filter(
            CustomFood.id == custom_food_id,
            CustomFood.user_id == user_id,
        ).first()

        if not custom_food:
            return False

        db.delete(custom_food)
        db.commit()
        return True

    @staticmethod
    def create_food_logs_batch(
        db: Session,
        user_id: int,
        food_logs_data: List[FoodLogCreate],
    ) -> List[FoodLog]:
        """Create a batch of food log entries in a single transaction."""
        db_logs = []
        for item in food_logs_data:
            db_food_log = FoodLog(
                user_id=user_id,
                food_name=item.food_name,
                food_code=item.food_code,
                brand=item.brand,
                portion_size=item.portion_size,
                portion_unit=item.portion_unit,
                serving_size=item.serving_size,
                serving_unit=item.serving_unit,
                calories_kcal=item.calories_kcal,
                protein_g=item.protein_g,
                carbs_g=item.carbs_g,
                fat_g=item.fat_g,
                fiber_g=item.fiber_g,
                sugar_g=item.sugar_g,
                sodium_mg=item.sodium_mg,
                meal_type=item.meal_type,
                logged_date=item.logged_date or date.today(),
            )
            db.add(db_food_log)
            db_logs.append(db_food_log)
        db.commit()
        for log in db_logs:
            db.refresh(log)
        return db_logs
