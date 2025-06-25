# app/db/models/collected_reward.py
from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class CollectedReward(Base):
    __tablename__ = "collected_rewards"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    poi_name = Column(String, nullable=False)
    collected_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="rewards")