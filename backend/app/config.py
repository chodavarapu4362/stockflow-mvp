import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "StockFlow MVP"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api"
    
    # Secret Key for JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "stockflow-super-secret-production-key-2026-wexa")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./stockflow.db")
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["*"]
    
    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
