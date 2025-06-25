import os
import json
from fastapi import APIRouter

from app.schemas.user import AvatarChoice  # se for usar no frontend
from app.schemas.user import UserOut
from typing import List
from pydantic import BaseModel

class Avatar(BaseModel):
    key: str
    display_name: str
    image_url: str

router = APIRouter(prefix="/avatars", tags=["avatars"])

@router.get("/", response_model=List[Avatar])
def get_avatar_list():
    path = os.path.join(os.path.dirname(__file__), "../../static/avatars.json")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data
