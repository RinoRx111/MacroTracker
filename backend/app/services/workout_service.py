"""Workout service for database queries and updates."""

from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session

from app.models.workout import WorkoutLog
from app.schemas.workout import WorkoutLogCreate


class WorkoutService:
    """Service for workout-related operations."""

    @staticmethod
    def create_workout_log(
        db: Session,
        user_id: int,
        workout_data: WorkoutLogCreate,
    ) -> WorkoutLog:
        """Create a new workout log entry."""
        db_workout_log = WorkoutLog(
            user_id=user_id,
            name=workout_data.name,
            category=workout_data.category,
            duration_minutes=workout_data.duration_minutes,
            calories_burned=workout_data.calories_burned,
            intensity=workout_data.intensity,
            notes=workout_data.notes,
            logged_date=workout_data.logged_date or date.today(),
        )
        db.add(db_workout_log)
        db.commit()
        db.refresh(db_workout_log)
        return db_workout_log

    @staticmethod
    def get_workout_log(db: Session, workout_log_id: int, user_id: int) -> Optional[WorkoutLog]:
        """Get a specific workout log by ID."""
        return db.query(WorkoutLog).filter(
            WorkoutLog.id == workout_log_id,
            WorkoutLog.user_id == user_id,
        ).first()

    @staticmethod
    def get_daily_workout_logs(db: Session, user_id: int, target_date: date) -> List[WorkoutLog]:
        """Get daily workout logs."""
        return db.query(WorkoutLog).filter(
            WorkoutLog.user_id == user_id,
            WorkoutLog.logged_date == target_date,
        ).order_by(WorkoutLog.created_at.asc()).all()

    @staticmethod
    def get_workout_logs_range(
        db: Session,
        user_id: int,
        start_date: date,
        end_date: date,
    ) -> List[WorkoutLog]:
        """Get workout logs within a date range."""
        return db.query(WorkoutLog).filter(
            WorkoutLog.user_id == user_id,
            WorkoutLog.logged_date >= start_date,
            WorkoutLog.logged_date <= end_date,
        ).order_by(WorkoutLog.logged_date.asc()).all()

    @staticmethod
    def delete_workout_log(db: Session, workout_log_id: int, user_id: int) -> bool:
        """Delete a workout log entry."""
        workout_log = db.query(WorkoutLog).filter(
            WorkoutLog.id == workout_log_id,
            WorkoutLog.user_id == user_id,
        ).first()

        if not workout_log:
            return False

        db.delete(workout_log)
        db.commit()
        return True
