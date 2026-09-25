from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://itorganizer:itorganizer@localhost:5432/itorganizer"
    frontend_url: str = "http://localhost:3000"
    notifications_url: str = "http://localhost:8081"
    uploads_url: str = "http://localhost:8082"


settings = Settings()
