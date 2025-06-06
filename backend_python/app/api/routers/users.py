from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.user import UserOut, AvatarChoice
from app.crud.user import update_avatar_and_trainer
from app.api.deps import get_current_user
from app.db.session import get_db
from app.db.models.user import User

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/me/avatar", response_model=UserOut)
def set_avatar_and_trainer(
    choice: AvatarChoice,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated = update_avatar_and_trainer(db, current_user, choice)
    return updated
