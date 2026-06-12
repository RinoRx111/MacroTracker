"""Activity service for database queries and updates."""

from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session

from app.models.activity import ActivityLog
from app.schemas.activity import ActivityLogCreate


class ActivityService:
    """Service for activity-related operations."""

    @staticmethod
    def get_daily_activity(db: Session, user_id: int, target_date: date) -> Optional[ActivityLog]:
        """Get daily activity log for a specific date."""
        return db.query(ActivityLog).filter(
            ActivityLog.user_id == user_id,
            ActivityLog.logged_date == target_date,
        ).first()

    @staticmethod
    def update_or_create_daily_activity(
        db: Session,
        user_id: int,
        activity_data: ActivityLogCreate,
    ) -> ActivityLog:
        """Create or update daily steps, active time, and distance."""
        target_date = activity_data.logged_date or date.today()
        
        db_activity = db.query(ActivityLog).filter(
            ActivityLog.user_id == user_id,
            ActivityLog.logged_date == target_date,
        ).first()

        if db_activity:
            db_activity.steps = activity_data.steps
            db_activity.distance_km = activity_data.distance_km
            db_activity.active_minutes = activity_data.active_minutes
            db_activity.calories_burned = activity_data.calories_burned
        else:
            db_activity = ActivityLog(
                user_id=user_id,
                steps=activity_data.steps,
                distance_km=activity_data.distance_km,
                active_minutes=activity_data.active_minutes,
                calories_burned=activity_data.calories_burned,
                logged_date=target_date,
            )
            db.add(db_activity)

        db.commit()
        db.refresh(db_activity)
        return db_activity

    @staticmethod
    def get_activity_logs_range(
        db: Session,
        user_id: int,
        start_date: date,
        end_date: date,
    ) -> List[ActivityLog]:
        """Get daily activity logs within a date range."""
        return db.query(ActivityLog).filter(
            ActivityLog.user_id == user_id,
            ActivityLog.logged_date >= start_date,
            ActivityLog.logged_date <= end_date,
        ).order_by(ActivityLog.logged_date.asc()).all()
