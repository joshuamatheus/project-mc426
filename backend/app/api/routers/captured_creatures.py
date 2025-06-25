from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.db.models.user import User
from app.schemas.captured_creature import CapturedCreatureOut
from app.schemas.creature import Creature, NearbyCreature
from app.crud.captured_creature import get_captured_creatures, capture_creature, get_nearby_creature  # Importe get_nearby_creature
import random
import json
from app.core.config import POIS_FILE, CREATURES_FILE  # Importe as variáveis diretamente
from geopy.distance import geodesic

router = APIRouter(prefix="/creatures", tags=["creatures"])

@router.get("/", response_model=List[CapturedCreatureOut])
def list_captured_creatures(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return get_captured_creatures(db, current_user)

@router.get("/nearby", response_model=Optional[NearbyCreature])
def get_nearby_creature_endpoint(
    latitude: float = Query(..., description="Latitude do jogador"),
    longitude: float = Query(..., description="Longitude do jogador"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Verifica se há uma criatura por perto com base na localização do jogador e retorna informações sobre a criatura e o POI mais próximo."""
    try:
        # 1. Carregar pontos de interesse
        with open(POIS_FILE, "r", encoding="utf-8") as f:  # Use POIS_FILE
            pois = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Arquivo pointsOfInterest.json não encontrado")

    # 2. Encontrar o POI mais próximo
    player_location = (latitude, longitude)
    closest_poi = min(
        pois, key=lambda poi: geodesic(player_location, (poi["latitude"], poi["longitude"])).meters
    )

    # 3. Carregar criaturas
    try:
        with open(CREATURES_FILE, "r", encoding="utf-8") as f:  # Use CREATURES_FILE
            all_creatures = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Arquivo creatures.json não encontrado")

    # 4. Filtrar criaturas com base no tipo de POI
    available_creatures = [
        c for c in all_creatures if c.get("poi_type") == closest_poi["type"] or c.get("poi_type") is None
    ]

    if not available_creatures:
        return None  # Nenhuma criatura disponível neste POI

    # 5. Selecionar uma criatura aleatoriamente
    creature_data = random.choice(available_creatures)
    creature = Creature(**creature_data)

    # 6. Retornar informações sobre a criatura e o POI
    nearby_creature = NearbyCreature(
        creature=creature,
        poi_name=closest_poi["name"],
        poi_latitude=closest_poi["latitude"],
        poi_longitude=closest_poi["longitude"],
    )
    return nearby_creature

@router.post("/capture/{creature_name}", response_model=CapturedCreatureOut)
def capture_creature_endpoint(
    creature_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Captura uma criatura (após o frontend ter verificado que ela está por perto)."""
    try:
        creature = capture_creature(db, current_user, creature_name)
        return creature
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))