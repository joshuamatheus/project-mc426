from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

from app.db.models.collected_reward import CollectedReward

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    team = Column(String, nullable=False)
    avatar_filename = Column(String, nullable=True)
    trainer_name = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    locations = relationship("PlayerLocation", back_populates="user")
    rewards = relationship(
        "app.db.models.collected_reward.CollectedReward",
        back_populates="user",
        cascade="all, delete"
    )
    creatures = relationship("CapturedCreature", 
    back_populates="user", 
    cascade="all, delete"
    )