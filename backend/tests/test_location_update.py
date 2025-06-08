import pytest
from httpx import AsyncClient
from httpx import ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_valid_location_update(auth_token):    
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {auth_token}"}
    async with AsyncClient(transport=transport, base_url="http://test", headers=headers) as ac:
        response = await ac.post("/location/update", json={
            "latitude": -23.5617,
            "longitude": -46.6558
        })
        assert response.status_code == 200

@pytest.mark.asyncio
async def test_latitude_boundary_value(auth_token):
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {auth_token}"}
    async with AsyncClient(transport=transport, base_url="http://test", headers=headers) as ac:
        for lat in [-90, 90]:
            response = await ac.post("/location/update", json={
                "latitude": lat,
                "longitude": 0
            })
            assert response.status_code == 200