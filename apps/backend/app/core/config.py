import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Digital Ecosystem 2026 API"
    VERSION: str = "0.2.0"
    API_V1_STR: str = ""
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://digital-ecosystem-2026.vercel.app",
        # Production domains
        "https://td-rss.ru",
        "http://td-rss.ru",
        "https://api.td-rss.ru",
        "https://admin.td-rss.ru",
    ]

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_THIS_IN_PROD_TO_SOMETHING_STRONG")

    @property
    def is_production(self) -> bool:
        return os.getenv("ENVIRONMENT", "development") == "production"

    def __init__(self, **values):
        super().__init__(**values)
        if self.is_production and self.SECRET_KEY == "CHANGE_THIS_IN_PROD_TO_SOMETHING_STRONG":
             # In production, we should probably warn or raise error. 
             # For now, let's print a warning to logs to avoid crashing if env isn't fully set yet.
             print("WARNING: Unsafe SECRET_KEY in production environment!")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 1 day
    
    # Telegram
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")

    # Directus
    DIRECTUS_URL: str = os.getenv("DIRECTUS_URL", "https://admin.td-rss.ru")
    DIRECTUS_TOKEN: str = os.getenv("DIRECTUS_TOKEN") or os.getenv("DIRECTUS_KEY", "")

    class Config:
        case_sensitive = True

settings = Settings()
