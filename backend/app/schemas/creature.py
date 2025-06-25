from pydantic import BaseModel
from typing import Optional

class Creature(BaseModel):
    name: str
    image_url: str
    grayscale_image_url: str
    poi_type: Optional[str] = None

class NearbyCreature(BaseModel):
    creature: Optional[Creature]
    poi_name: str
    poi_latitude: float
    poi_longitude: float

    class Config:
        orm_mode = True