from pydantic import BaseModel
from typing import List
from datetime import datetime

class LocationUpdate(BaseModel):
    latitude: float
    longitude: float

class LocationOut(BaseModel):
    latitude: float
    longitude: float
    timestamp: datetime
    distance_traveled: float

    class Config:
        orm_mode = True

class LocationHistory(BaseModel):
    locations: List[LocationOut]
