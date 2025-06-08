# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import engine, Base
from app.api.routers import auth, users, avatars, location, rewards

# Cria todas as tabelas (para dev; no prod, pode usar Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Unicamp GO Backend")

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    # demais domínios de front-end em produção
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Composição de routers
app.include_router(auth.router)       # /auth
app.include_router(users.router)      # /users
app.include_router(avatars.router)    # /avatars
app.include_router(location.router)   # /location
app.include_router(rewards.router)    # /rewards

@app.get("/")
def read_root():
    return {"message": "Backend rodando!"}