from fastapi import APIRouter

router = APIRouter()

@router.get("/creatures")
def get_creatures():
    return [
        {"name": "Dragon", "type": "Fire"},
        {"name": "Unicorn", "type": "Magic"},
        {"name": "Goblin", "type": "Earth"},
    ]