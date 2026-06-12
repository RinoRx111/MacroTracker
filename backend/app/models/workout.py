"""Workout log database model."""

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from datetime import datetime, date

from app.models import Base


class WorkoutLog(Base):
    """Workout log model for tracking daily exercises."""

    __tablename__ = "workout_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Workout info
    name = Column(String(255), nullable=False)  # e.g., Running, Weightlifting
    category = Column(String(50), default="cardio")  # cardio, strength
    duration_minutes = Column(Integer, nullable=False)
    calories_burned = Column(Float, nullable=False)
    intensity = Column(String(50), default="medium")  # low, medium, high
    notes = Column(String(500), nullable=True)
    
    # Timestamps
    logged_date = Column(Date, default=date.today, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"WorkoutLog(id={self.id}, user_id={self.user_id}, name={self.name}, calories={self.calories_burned})"
