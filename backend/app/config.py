import os
import yaml
from pathlib import Path
from pydantic_settings import BaseSettings

# Absolute path to workspace root
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DB_PATH = BASE_DIR / "bhumisetu.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "BHUMISETU"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("JWT_SECRET", os.getenv("SECRET_KEY", "bhumisetu_super_secret_jwt_key_2026_sih_hackathon_demo"))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Absolute path sqlite URL to avoid CWD mismatch
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH.as_posix()}")
    
    @property
    def cors_origins_list(self) -> list[str]:
        raw = os.getenv("ALLOWED_ORIGINS", os.getenv("CORS_ORIGINS"))
        if raw:
            return [o.strip() for o in raw.split(",") if o.strip()]
        return [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "*"
        ]
    
    REGION_CONFIG_PATH: str = str(BASE_DIR / "config" / "region.yaml")
    COMPENSATION_CONFIG_PATH: str = str(BASE_DIR / "config" / "compensation.yaml")
    RATES_CONFIG_PATH: str = str(BASE_DIR / "config" / "rates.yaml")
    FOREST_FACTORS_CONFIG_PATH: str = str(BASE_DIR / "config" / "forest_factors.yaml")

    def load_region_config(self) -> dict:
        path = Path(self.REGION_CONFIG_PATH)
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        return {}

    def load_compensation_config(self) -> dict:
        path = Path(self.COMPENSATION_CONFIG_PATH)
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        return {}

    def load_rates_config(self) -> dict:
        path = Path(self.RATES_CONFIG_PATH)
        if not path.exists():
            path = Path(self.COMPENSATION_CONFIG_PATH)
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        return {}

    def load_forest_factors_config(self) -> dict:
        path = Path(self.FOREST_FACTORS_CONFIG_PATH)
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        return {}

settings = Settings()
