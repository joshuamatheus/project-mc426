import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from pathlib import Path
import json
import os

def test_poi_file_exists():
    """Test that the POI file exists and can be loaded"""
    
    # Test various possible paths
    possible_paths = [
        # From test file: up 2 levels (tests -> backend -> project-mc426)
        Path(__file__).resolve().parents[2] / "frontend" / "src" / "assets" / "pointsOfInterest.json",
        # From current working directory
        Path.cwd() / "frontend" / "src" / "assets" / "pointsOfInterest.json",
    ]
    
    found_file = None
    for poi_file in possible_paths:
        print(f"Checking path: {poi_file}")
        print(f"Path exists: {poi_file.exists()}")
        if poi_file.exists():
            found_file = poi_file
            break
    
    assert found_file is not None, f"POI file not found in any of these paths: {possible_paths}"
    
    # Test that the file can be loaded and parsed
    content = found_file.read_text(encoding="utf-8")
    pois = json.loads(content)
    
    assert isinstance(pois, list), "POIs should be a list"
    assert len(pois) > 0, "POIs list should not be empty"
    
    # Check that "Praça do Ciclo Básico" exists
    praca_poi = None
    for poi in pois:
        if poi["name"] == "Praça do Ciclo Básico":
            praca_poi = poi
            break
    
    assert praca_poi is not None, "Praça do Ciclo Básico should exist in POIs"
    assert praca_poi["latitude"] == -22.8171
    assert praca_poi["longitude"] == -47.06974
    
    print(f"Successfully loaded {len(pois)} POIs from {found_file}")

def test_project_structure():
    """Debug test to understand the project structure"""
    current_file = Path(__file__).resolve()
    print(f"Current test file: {current_file}")
    print(f"Parent directories:")
    
    for i, parent in enumerate(current_file.parents):
        print(f"  {i}: {parent}")
        if parent.name == "project-mc426" or i > 5:  # Stop at project root or after 5 levels
            break
           
@pytest.mark.asyncio
async def test_debug_pois():
    """Debug test to see what POIs are loaded"""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/rewards/")
        print(f"POIs available: {response.json()}")
        assert response.status_code == 200

@pytest.mark.asyncio
async def test_collect_egg_near_poi(auth_token):
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {auth_token}"}

    # Use exact coordinates from JSON for "Praça do Ciclo Básico"
    player_lat = -22.8171
    player_lon = -47.06974

    async with AsyncClient(transport=transport, base_url="http://test", headers=headers) as ac:
        # First, let's see what POIs are available
        response = await ac.get("/rewards/")
        print(f"POIs available: {response.json()}")
        assert response.status_code == 200
        
        # Atualiza localização do jogador
        update = await ac.post("/location/update", json={
            "latitude": player_lat,
            "longitude": player_lon
        })
        print(f"Location update status: {update.status_code}")
        print(f"Location update response: {update.text}")
        assert update.status_code == 200

        # Tenta coletar ovo no POI "Praça do Ciclo Básico"
        # Use 'latitude' and 'longitude' to match the backend model
        collect = await ac.post("/rewards/collect", json={
            "latitude": player_lat,
            "longitude": player_lon,
            "name": "Praça do Ciclo Básico"
        })

        print(f"Collection status: {collect.status_code}")
        print(f"Collection response: {collect.text}")
        
        if collect.status_code != 200:
            print(f"Error details: {collect.json()}")
        
        assert collect.status_code == 200
        response_data = collect.json()
        assert response_data.get("reward") == "🥚"

@pytest.mark.asyncio
async def test_collect_too_far(auth_token):
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {auth_token}"}

    # Localização muito distante (fora do raio de 30m)
    # Let's use coordinates that are definitely far from "Praça do Ciclo Básico"
    far_lat = -22.810000  # About 800m away from the POI
    far_lon = -47.060000

    async with AsyncClient(transport=transport, base_url="http://test", headers=headers) as ac:
        # Update player location
        location_update = await ac.post("/location/update", json={
            "latitude": far_lat,
            "longitude": far_lon
        })
        print(f"Location update status: {location_update.status_code}")
        assert location_update.status_code == 200

        # Tenta coletar onde está longe demais
        # Use 'latitude' and 'longitude' to match the backend model
        collect = await ac.post("/rewards/collect", json={
            "latitude": far_lat,
            "longitude": far_lon,
            "name": "Praça do Ciclo Básico"
        })

        print(f"Collection status: {collect.status_code}")
        print(f"Collection response: {collect.text}")
        
        if collect.status_code == 422:
            print(f"Validation error details: {collect.json()}")

        # Should return 400 because too far, not 422 (validation error)
        assert collect.status_code == 400
        assert "muito longe" in collect.text.lower()

@pytest.mark.asyncio 
async def test_collect_invalid_poi(auth_token):
    """Test collecting from a non-existent POI"""
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {auth_token}"}

    async with AsyncClient(transport=transport, base_url="http://test", headers=headers) as ac:
        collect = await ac.post("/rewards/collect", json={
            "latitude": -22.8171,
            "longitude": -47.06974,
            "name": "Non-existent POI"
        })

        print(f"Invalid POI status: {collect.status_code}")
        print(f"Invalid POI response: {collect.text}")
        
        assert collect.status_code == 404
        assert "não encontrado" in collect.text.lower()

@pytest.mark.asyncio
async def test_collect_twice_same_poi(auth_token):
    """Test that collecting from the same POI twice fails"""
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {auth_token}"}

    player_lat = -22.8171
    player_lon = -47.06974

    async with AsyncClient(transport=transport, base_url="http://test", headers=headers) as ac:
        # Update location
        await ac.post("/location/update", json={
            "latitude": player_lat,
            "longitude": player_lon
        })

        # First collection - should succeed
        collect1 = await ac.post("/rewards/collect", json={
            "latitude": player_lat,
            "longitude": player_lon,
            "name": "Praça do Ciclo Básico"
        })
        
        print(f"First collection status: {collect1.status_code}")
        
        # Second collection - should fail
        collect2 = await ac.post("/rewards/collect", json={
            "latitude": player_lat,
            "longitude": player_lon,
            "name": "Praça do Ciclo Básico"
        })

        print(f"Second collection status: {collect2.status_code}")
        print(f"Second collection response: {collect2.text}")
        
        assert collect2.status_code == 400
        assert "já coletado" in collect2.text.lower()