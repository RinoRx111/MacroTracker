# backend/App/db/models/weight_log.py
from sqlalchemy import Column, Integer, Float, String, DateTime
from sqlalchemy.sql import func
from App.db.session import Base

class WeightLog(Base):
    __tablename__ = "weight_logs"

    id = Column(Integer, primary_key=True, index=True)
    weight = Column(Float)
    log_date = Column(String, index=True) # YYYY-MM-DD
    created_at = Column(DateTime, server_default=func.now())

class WaterLog(Base):
    __tablename__ = "water_logs"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float) # ml
    log_date = Column(String, index=True) # YYYY-MM-DD
    created_at = Column(DateTime, server_default=func.now())
