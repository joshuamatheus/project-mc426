from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str = Field(..., example="João Silva")
    email: EmailStr
    password: str = Field(..., min_length=6)
    team: str = Field(..., regex="^(exatas|humanas|biologicas)$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    team: str
    avatar_filename: Optional[str] = None
    trainer_name: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True

class AvatarChoice(BaseModel):
    avatar_key: str
    trainer_name: str
