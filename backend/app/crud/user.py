from sqlalchemy.orm import Session
from app.db.models.user import User
from app.schemas.user import UserCreate, AvatarChoice
from app.core.security import get_password_hash
from app.core.security import verify_password
from app.core.security import authenticate_user as auth_user
from app.core.security import create_access_token

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_in: UserCreate):
    hashed_pw = get_password_hash(user_in.password)
    db_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hashed_pw,
        team=user_in.team,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_avatar_and_trainer(db: Session, user: User, choice: AvatarChoice):
    user.avatar_filename = choice.avatar
    user.trainer_name = choice.trainer_type
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email=email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
