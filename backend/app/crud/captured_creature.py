import random
import json
from pathlib import Path
from sqlalchemy.orm import Session
from app.db.models.captured_creature import CapturedCreature
from app.db.models.user import User
from app.core.config import POIS_FILE, CREATURES_FILE
from geopy.distance import geodesic
from app.schemas.creature import Creature  # Importe o schema Creature

def get_nearby_creature(db: Session, user: User, latitude: float, longitude: float):
    """Verifica se há uma criatura por perto e retorna as informações dela (se houver)."""
    # 1. Carregar pontos de interesse
    try:
        with open(POIS_FILE, "r", encoding="utf-8") as f:
            pois = json.load(f)
    except FileNotFoundError:
        raise ValueError("Arquivo pointsOfInterest.json não encontrado")

    # 2. Encontrar o POI mais próximo
    player_location = (latitude, longitude)
    closest_poi = min(
        pois, key=lambda poi: geodesic(player_location, (poi["latitude"], poi["longitude"])).meters
    )
    distance_to_poi = geodesic(player_location, (closest_poi["latitude"], closest_poi["longitude"])).meters

    # 3. Verificar se o jogador está perto o suficiente do POI
    CAPTURE_RADIUS = 50
    if distance_to_poi > CAPTURE_RADIUS:
        return None  # Jogador muito longe

    # 4. Carregar criaturas
    try:
        with open(CREATURES_FILE, "r", encoding="utf-8") as f:
            all_creatures = json.load(f)
    except FileNotFoundError:
        raise ValueError("Arquivo creatures.json não encontrado")

    # 5. Filtrar criaturas com base no tipo de POI
    available_creatures = [
        c for c in all_creatures if c.get("poi_type") == closest_poi["type"] or c.get("poi_type") is None
    ]

    if not available_creatures:
        return None  # Nenhuma criatura disponível neste POI

    # 6. Selecionar uma criatura aleatoriamente
    creature_data = random.choice(available_creatures)
    creature = Creature(**creature_data)  # Usar o schema Creature para criar o objeto

    return creature

def capture_creature(db: Session, user: User, creature_name: str):
    """Captura uma criatura (após o frontend ter verificado que ela está por perto)."""
    captured_creature = CapturedCreature(user_id=user.id, creature_name=creature_name)
    db.add(captured_creature)
    db.commit()
    db.refresh(captured_creature)
    return captured_creature

def get_captured_creatures(db: Session, user: User):
    captured = (
        db.query(CapturedCreature)
        .filter(CapturedCreature.user_id == user.id)
        .all()
    )
    return captured