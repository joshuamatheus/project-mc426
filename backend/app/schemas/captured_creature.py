from pydantic import BaseModel
from datetime import datetime

class CapturedCreatureOut(BaseModel):
    id: int
    creature_name: str
    captured_at: datetime

    class Config:
        orm_mode = True