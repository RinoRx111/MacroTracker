"""Weight tracking database model."""

from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Date, String, Boolean
from datetime import datetime, date

from app.models import Base


class WeightLog(Base):
    """Weight log model for tracking weight progression."""

    __tablename__ = "weight_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Weight information
    weight_kg = Column(Float, nullable=False)
    weight_date = Column(Date, default=date.today, index=True)
    
    # Optional notes
    notes = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"WeightLog(id={self.id}, user_id={self.user_id}, weight={self.weight_kg}kg)"


class Goal(Base):
    """Goal model for tracking fitness goals."""

    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Goal information
    goal_type = Column(String(50), nullable=False)  # "weight_loss", "muscle_gain", "maintenance"
    target_weight_kg = Column(Float, nullable=True)
    target_date = Column(Date, nullable=True)
    
    # Current progress
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"Goal(id={self.id}, user_id={self.user_id}, type={self.goal_type})"
