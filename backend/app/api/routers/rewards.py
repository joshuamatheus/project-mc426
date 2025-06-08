# app/api/routers/rewards.py
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.db.models.user import User
from app.db.models.collected_reward import CollectedReward
from datetime import datetime
from math import radians, cos, sin, asin, sqrt
import json
from pathlib import Path
from pydantic import BaseModel

router = APIRouter(prefix="/rewards", tags=["rewards"])

# Fixed model for collect request - consistent naming
class CollectRequest(BaseModel):
    latitude: float
    longitude: float  # Changed from 'lon' to 'longitude' for consistency
    name: str

# Carrega lista de POIs do arquivo do frontend
BASE_DIR = Path(__file__).resolve().parents[4]  # até raiz project-mc426
POI_FILE = BASE_DIR / "frontend" / "src" / "assets" / "pointsOfInterest.json"
try:
    POIS = json.loads(POI_FILE.read_text(encoding="utf-8"))
except Exception:
    POIS = []  # fallback caso não encontre

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calcula a distância entre duas coordenadas em metros"""
    # Converte graus para radianos
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Fórmula de Haversine
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    
    # Raio da Terra em metros
    r = 6371000
    return c * r

@router.post("/collect")
async def collect_reward(
    request: CollectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Coleta reward em um POI específico"""
    
    # Find POI by name
    poi = None
    for p in POIS:
        if p["name"] == request.name:
            poi = p
            break
    
    if not poi:
        raise HTTPException(
            status_code=404,
            detail=f"POI '{request.name}' não encontrado"
        )
    
    # Calcula a distância entre a posição do jogador e o POI
    # Fixed: now using request.longitude instead of request.lon
    distance = haversine_distance(
        request.latitude, request.longitude,
        poi["latitude"], poi["longitude"]
    )
    
    # Verifica se está dentro do raio de 30 metros
    if distance > 30:
        raise HTTPException(
            status_code=400,
            detail=f"Você está muito longe do POI. Distância: {distance:.1f}m"
        )
    
    # Check if already collected
    existing = db.query(CollectedReward).filter(
        CollectedReward.user_id == current_user.id,
        CollectedReward.poi_name == request.name
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Já coletado!")
    
    # Save to database
    reward = CollectedReward(user_id=current_user.id, poi_name=request.name)
    db.add(reward)
    db.commit()
    
    return {
        "message": f"Reward coletado em {request.name}!",
        "reward": "🥚",  # Simple reward
        "distance": round(distance, 1)
    }

@router.get("/")
async def list_rewards():
    """Lista todos os POIs disponíveis"""
    return {
        "pois": [
            {
                "name": poi["name"],
                "lat": poi["latitude"],
                "lon": poi["longitude"],
                "reward": "🥚"
            }
            for poi in POIS
        ]
    }