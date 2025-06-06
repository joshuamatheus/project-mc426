from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.location import LocationUpdate, LocationOut, LocationHistory
from app.crud.location import add_player_location, get_latest_location, get_location_history
from app.api.deps import get_current_user
from app.db.session import get_db
from app.db.models.user import User

router = APIRouter(prefix="/location", tags=["location"])

@router.post("/update", response_model=LocationOut)
def update_location(
    loc: LocationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_loc = add_player_location(db, current_user, loc)
    return new_loc

@router.get("/latest", response_model=LocationOut)
def read_latest_location(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    last = get_latest_location(db, current_user)
    if not last:
        raise HTTPException(status_code=404, detail="Nenhuma localização encontrada.")
    return last

@router.get("/history", response_model=LocationHistory)
def read_location_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history = get_location_history(db, current_user, limit=100)
    return {"locations": history}
