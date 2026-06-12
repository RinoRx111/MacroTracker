"""Daily activity log database model."""

from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Date, UniqueConstraint
from datetime import datetime, date

from app.models import Base


class ActivityLog(Base):
    """Daily activity log model for tracking steps, active minutes, and distance."""

    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Activity metrics
    steps = Column(Integer, default=0)
    distance_km = Column(Float, default=0.0)
    active_minutes = Column(Integer, default=0)
    calories_burned = Column(Float, default=0.0)
    
    # Date and Timestamps
    logged_date = Column(Date, default=date.today, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "logged_date", name="uq_user_activity_date"),
    )

    def __repr__(self) -> str:
        return f"ActivityLog(id={self.id}, user_id={self.user_id}, steps={self.steps}, date={self.logged_date})"
