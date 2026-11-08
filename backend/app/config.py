from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    litera_password: str = "litera"
    session_secret: str = "change-me-litera-session-secret"
    database_url: str = f"sqlite:///{DATA_DIR / 'litera.db'}"
    google_books_api_key: str | None = None
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    cookie_name: str = "litera_session"
    cookie_secure: bool = False
    cookie_max_age: int = 60 * 60 * 24 * 30

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
