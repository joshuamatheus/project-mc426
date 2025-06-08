import pytest
import uuid
from httpx import AsyncClient
from httpx import ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_valid_user_registration():
    transport = ASGITransport(app=app) 
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/auth/register", json={
            "name": "João",
            "email": f"joao{uuid.uuid4()}@example.com",
            "password": "123456",
            "team": "exatas"
        })
        assert response.status_code == 201

@pytest.mark.asyncio
async def test_invalid_email_format():
    transport = ASGITransport(app=app) 
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/auth/register", json={
            "name": "Ana",
            "email": "ana_sem_arroba.com", # email inválido
            "password": "123456",
            "team": "humanas"
        })
        assert response.status_code == 422

@pytest.mark.asyncio
async def test_password_minimum_length():
    transport = ASGITransport(app=app) 
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/auth/register", json={
            "name": "Lucas",
            "email": "lucas@example.com",
            "password": "123",  # valor abaixo do limite
            "team": "biologicas"
        })
        assert response.status_code == 422
