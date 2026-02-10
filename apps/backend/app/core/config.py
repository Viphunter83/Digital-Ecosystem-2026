import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

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
    TELEGRAM_ADMIN_CHAT_ID: str = os.getenv("TELEGRAM_ADMIN_CHAT_ID", "318035498")

    # SMTP (Email)
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "465"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM: str = os.getenv("SMTP_FROM", "zakaz@tdrusstankosbyt.ru")

    # Directus
    DIRECTUS_URL: str = os.getenv("DIRECTUS_URL", "https://admin.td-rss.ru")
    DIRECTUS_TOKEN: str = os.getenv("DIRECTUS_TOKEN") or os.getenv("DIRECTUS_KEY", "")

    # AmoCRM
    AMOCRM_SUBDOMAIN: str = os.getenv("AMOCRM_SUBDOMAIN", "")
    AMOCRM_CLIENT_ID: str = os.getenv("AMOCRM_CLIENT_ID", "")
    AMOCRM_CLIENT_SECRET: str = os.getenv("AMOCRM_CLIENT_SECRET", "")
    AMOCRM_REDIRECT_URI: str = os.getenv("AMOCRM_REDIRECT_URI", "")
    AMOCRM_ACCESS_TOKEN: str = os.getenv("AMOCRM_ACCESS_TOKEN", "")
    AMOCRM_REFRESH_TOKEN: str = os.getenv("AMOCRM_REFRESH_TOKEN", "")
    AMOCRM_PIPELINE_ID: Optional[str] = os.getenv("AMOCRM_PIPELINE_ID")
    AMOCRM_STATUS_ID: Optional[str] = os.getenv("AMOCRM_STATUS_ID")
    AMOCRM_RESPONSIBLE_USER_ID: Optional[str] = os.getenv("AMOCRM_RESPONSIBLE_USER_ID")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
