from sqlalchemy.orm import Session
from app.db.models.player_location import PlayerLocation
from app.schemas.location import LocationUpdate
from app.db.models.user import User
from app.core.utils import haversine_distance

def add_player_location(db: Session, user: User, loc: LocationUpdate):
    last_loc = (
        db.query(PlayerLocation)
        .filter(PlayerLocation.user_id == user.id)
        .order_by(PlayerLocation.timestamp.desc())
        .first()
    )
    distance = 0.0
    if last_loc:
        distance = haversine_distance(
            last_loc.latitude, last_loc.longitude, loc.latitude, loc.longitude
        )
    new_loc = PlayerLocation(
        user_id=user.id,
        latitude=loc.latitude,
        longitude=loc.longitude,
        distance_traveled=distance,
    )
    db.add(new_loc)
    db.commit()
    db.refresh(new_loc)
    return new_loc

def get_latest_location(db: Session, user: User):
    return (
        db.query(PlayerLocation)
        .filter(PlayerLocation.user_id == user.id)
        .order_by(PlayerLocation.timestamp.desc())
        .first()
    )

def get_location_history(db: Session, user: User, limit: int = 100):
    return (
        db.query(PlayerLocation)
        .filter(PlayerLocation.user_id == user.id)
        .order_by(PlayerLocation.timestamp.desc())
        .limit(limit)
        .all()
    )
