from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./snake_royale.db"
    SECRET_KEY: str = "secret"
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
