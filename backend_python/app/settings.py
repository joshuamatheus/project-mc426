from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    app_name: str = "Unicamp GO"
    example_config: str = Field(
        "configuração",
        description="A example config to be imported from the .env file or defined here",
    )

    class Config:
        env_file = ".env"


settings = Settings()