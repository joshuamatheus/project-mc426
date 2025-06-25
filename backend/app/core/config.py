import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "MUDAR_EM_PROD")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

POIS_FILE = Path(os.getenv("POIS_FILE", "app/assets/pointsOfInterest.json"))
CREATURES_FILE = Path(os.getenv("CREATURES_FILE", "app/assets/creatures.json"))