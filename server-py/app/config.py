from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Database (SQLite for development)
    database_url: str = "sqlite:///./newarch.db"
    
    # Server
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    
    # CORS
    cors_origins: List[str] = ["http://localhost:5173", "http://localhost:3000"]
    
    model_config = {"env_file": ".env", "case_sensitive": False}


settings = Settings()

