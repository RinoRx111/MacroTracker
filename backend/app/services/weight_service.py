"""Weight service for managing weight logs and tracking."""

from typing import List, Optional
from datetime import date, timedelta
from sqlalchemy.orm import Session

from app.models.weight import WeightLog, Goal
from app.models.user import User
from app.schemas.weight import (
    WeightTrend,
    WeightStats,
    WeeklyProgress,
)
from app.utils.helpers import get_date_range


class WeightService:
    """Service for weight-related operations."""

    @staticmethod
    def create_weight_log(
        db: Session,
        user_id: int,
        weight_kg: float,
        weight_date: Optional[date] = None,
        notes: Optional[str] = None,
    ) -> WeightLog:
        """Create a new weight log entry."""
        db_weight_log = WeightLog(
            user_id=user_id,
            weight_kg=weight_kg,
            weight_date=weight_date or date.today(),
            notes=notes,
        )
        db.add(db_weight_log)
        db.commit()
        db.refresh(db_weight_log)
        return db_weight_log

    @staticmethod
    def get_weight_log(db: Session, weight_log_id: int, user_id: int) -> Optional[WeightLog]:
        """Get a specific weight log by ID."""
        return db.query(WeightLog).filter(
            WeightLog.id == weight_log_id,
            WeightLog.user_id == user_id,
        ).first()

    @staticmethod
    def get_weight_logs_range(
        db: Session,
        user_id: int,
        start_date: date,
        end_date: date,
    ) -> List[WeightLog]:
        """Get weight logs within a date range."""
        return db.query(WeightLog).filter(
            WeightLog.user_id == user_id,
            WeightLog.weight_date >= start_date,
            WeightLog.weight_date <= end_date,
        ).order_by(WeightLog.weight_date.asc()).all()

    @staticmethod
    def get_latest_weight(db: Session, user_id: int) -> Optional[WeightLog]:
        """Get the latest weight log entry."""
        return db.query(WeightLog).filter(
            WeightLog.user_id == user_id,
        ).order_by(WeightLog.weight_date.desc()).first()

    @staticmethod
    def delete_weight_log(db: Session, weight_log_id: int, user_id: int) -> bool:
        """Delete a weight log entry."""
        weight_log = db.query(WeightLog).filter(
            WeightLog.id == weight_log_id,
            WeightLog.user_id == user_id,
        ).first()

        if not weight_log:
            return False

        db.delete(weight_log)
        db.commit()
        return True

    @staticmethod
    def calculate_weight_trends(logs: List[WeightLog]) -> List[WeightTrend]:
        """Calculate weight trends with moving average."""
        trends = []
        sorted_logs = sorted(logs, key=lambda x: x.weight_date)

        for i, log in enumerate(sorted_logs):
            # Calculate 7-day moving average
            window_start = max(0, i - 3)
            window_end = min(len(sorted_logs), i + 4)
            window_logs = sorted_logs[window_start:window_end]
            moving_avg = sum(l.weight_kg for l in window_logs) / len(window_logs)

            # Calculate change from previous
            change_from_previous = None
            if i > 0:
                change_from_previous = log.weight_kg - sorted_logs[i - 1].weight_kg

            trends.append(
                WeightTrend(
                    date=log.weight_date,
                    weight_kg=log.weight_kg,
                    moving_average_kg=round(moving_avg, 2),
                    change_from_previous=round(change_from_previous, 2) if change_from_previous else None,
                )
            )

        return trends

    @staticmethod
    def get_weight_stats(db: Session, user_id: int) -> Optional[WeightStats]:
        """Get weight statistics."""
        logs = db.query(WeightLog).filter(
            WeightLog.user_id == user_id,
        ).order_by(WeightLog.weight_date.asc()).all()

        if not logs:
            return None

        weights = [log.weight_kg for log in logs]
        total_change = weights[-1] - weights[0]

        return WeightStats(
            current_weight_kg=weights[-1],
            lowest_weight_kg=min(weights),
            highest_weight_kg=max(weights),
            average_weight_kg=round(sum(weights) / len(weights), 2),
            total_weight_change_kg=round(total_change, 2),
            total_entries=len(logs),
            last_update=logs[-1].weight_date,
        )

    @staticmethod
    def get_weekly_progress(
        db: Session,
        user_id: int,
        target_date: date,
    ) -> Optional[WeeklyProgress]:
        """Get weekly progress ending on target date."""
        from app.models.food import FoodLog

        # Get weight logs for the week
        week_start = target_date - timedelta(days=target_date.weekday())
        week_end = week_start + timedelta(days=6)

        weight_logs = db.query(WeightLog).filter(
            WeightLog.user_id == user_id,
            WeightLog.weight_date >= week_start,
            WeightLog.weight_date <= week_end,
        ).all()

        # Get food logs for the week
        food_logs = db.query(FoodLog).filter(
            FoodLog.user_id == user_id,
            FoodLog.logged_date >= week_start,
            FoodLog.logged_date <= week_end,
        ).all()

        if not weight_logs or not food_logs:
            return None

        weights = [log.weight_kg for log in weight_logs]
        avg_weight = sum(weights) / len(weights)
        weight_change = weights[-1] - weights[0]

        avg_calories = sum(log.calories_kcal for log in food_logs) / len(food_logs) if food_logs else 0
        avg_protein = sum(log.protein_g for log in food_logs) / len(food_logs) if food_logs else 0
        avg_carbs = sum(log.carbs_g for log in food_logs) / len(food_logs) if food_logs else 0
        avg_fat = sum(log.fat_g for log in food_logs) / len(food_logs) if food_logs else 0

        return WeeklyProgress(
            week_start=week_start,
            week_end=week_end,
            average_weight_kg=round(avg_weight, 2),
            weight_change_kg=round(weight_change, 2),
            average_calories=round(avg_calories, 0),
            average_protein_g=round(avg_protein, 1),
            average_carbs_g=round(avg_carbs, 1),
            average_fat_g=round(avg_fat, 1),
        )


class GoalService:
    """Service for goal management."""

    @staticmethod
    def create_goal(
        db: Session,
        user_id: int,
        goal_type: str,
        target_weight_kg: Optional[float] = None,
        target_date: Optional[date] = None,
    ) -> Goal:
        """Create a new goal."""
        # Deactivate any existing active goals
        db.query(Goal).filter(
            Goal.user_id == user_id,
            Goal.is_active == True,
        ).update({Goal.is_active: False})

        db_goal = Goal(
            user_id=user_id,
            goal_type=goal_type,
            target_weight_kg=target_weight_kg,
            target_date=target_date,
            is_active=True,
        )
        db.add(db_goal)
        db.commit()
        db.refresh(db_goal)
        return db_goal

    @staticmethod
    def get_active_goal(db: Session, user_id: int) -> Optional[Goal]:
        """Get the user's active goal."""
        return db.query(Goal).filter(
            Goal.user_id == user_id,
            Goal.is_active == True,
        ).first()

    @staticmethod
    def get_goal_history(db: Session, user_id: int) -> List[Goal]:
        """Get all goals for a user."""
        return db.query(Goal).filter(Goal.user_id == user_id).all()
