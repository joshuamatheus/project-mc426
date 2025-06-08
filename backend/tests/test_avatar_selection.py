import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_valid_avatar_selection(auth_token):
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {auth_token}"}
    async with AsyncClient(transport=transport, base_url="http://test", headers=headers) as ac:
        response = await ac.post("/users/me/avatar", json={
            "avatar": "🎓",
            "trainer_type": "🎓"
        })
        assert response.status_code == 200

@pytest.mark.asyncio
async def test_invalid_avatar_key(auth_token):
    transport = ASGITransport(app=app)
    headers = {"Authorization": f"Bearer {auth_token}"}
    async with AsyncClient(transport=transport, base_url="http://test", headers=headers) as ac:
        response = await ac.post("/users/me/avatar", json={
            "avatar_key": "não existe",
            "trainer_name": "X"
        })
        assert response.status_code in (400, 422)