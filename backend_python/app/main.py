from fastapi import FastAPI
from app.routers.creatures import router as creatures_router

from app import settings

app = FastAPI()
app.include_router(creatures_router)

# Include the router from the creatures module

@app.get("/")
def hello_world_root():
    return {
        "Hello": "World", 
        "message": "Welcome to the Unicamp GO API!", 
        "config": settings.settings.example_config
    }