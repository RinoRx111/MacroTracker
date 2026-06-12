"""Water log database model."""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, Date, UniqueConstraint
from datetime import datetime, date

from app.models import Base


class WaterLog(Base):
    """Daily water log model representing total ml consumed."""

    __tablename__ = "water_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Hydration
    amount_ml = Column(Integer, default=0)
    
    # Date and Timestamps
    logged_date = Column(Date, default=date.today, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "logged_date", name="uq_user_water_date"),
    )

    def __repr__(self) -> str:
        return f"WaterLog(id={self.id}, user_id={self.user_id}, amount={self.amount_ml}ml, date={self.logged_date})"
