"""Water service for database queries and updates."""

from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session

from app.models.water import WaterLog
from app.schemas.water import WaterLogCreate


class WaterService:
    """Service for hydration-related operations."""

    @staticmethod
    def get_daily_water(db: Session, user_id: int, target_date: date) -> Optional[WaterLog]:
        """Get daily water log for a specific date."""
        return db.query(WaterLog).filter(
            WaterLog.user_id == user_id,
            WaterLog.logged_date == target_date,
        ).first()

    @staticmethod
    def update_or_create_daily_water(
        db: Session,
        user_id: int,
        water_data: WaterLogCreate,
    ) -> WaterLog:
        """Create or update daily water intake amount in ml."""
        target_date = water_data.logged_date or date.today()
        
        db_water = db.query(WaterLog).filter(
            WaterLog.user_id == user_id,
            WaterLog.logged_date == target_date,
        ).first()

        if db_water:
            db_water.amount_ml = water_data.amount_ml
        else:
            db_water = WaterLog(
                user_id=user_id,
                amount_ml=water_data.amount_ml,
                logged_date=target_date,
            )
            db.add(db_water)

        db.commit()
        db.refresh(db_water)
        return db_water

    @staticmethod
    def get_water_logs_range(
        db: Session,
        user_id: int,
        start_date: date,
        end_date: date,
    ) -> List[WaterLog]:
        """Get daily water logs within a date range."""
        return db.query(WaterLog).filter(
            WaterLog.user_id == user_id,
            WaterLog.logged_date >= start_date,
            WaterLog.logged_date <= end_date,
        ).order_by(WaterLog.logged_date.asc()).all()
