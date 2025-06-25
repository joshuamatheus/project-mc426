import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture
async def auth_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        await ac.post("/auth/register", json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "123456",
            "team": "exatas"
        })
        login = await ac.post("/auth/login", json={
            "email": "test@example.com",
            "password": "123456"
        })
        return login.json()["access_token"]
