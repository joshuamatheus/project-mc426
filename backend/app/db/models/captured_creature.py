from sqlalchemy import Column, Integer, ForeignKey, DateTime, String
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.session import Base

class CapturedCreature(Base):
    __tablename__ = "captured_creatures"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    creature_name = Column(String, nullable=False)
    captured_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="creatures")