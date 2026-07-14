"""StudySafe application configuration."""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "StudySafe"
    environment: str = "development"
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "studysafe"

    jwt_secret: str = Field(default="change-me-use-openssl-rand-hex-32", min_length=16)
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    otp_expire_minutes: int = 10
    otp_length: int = 6

    email_from: str = "noreply@studysafe.local"
    aws_region: str = "eu-west-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""

    rate_limit_per_minute: int = 60

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_development(self) -> bool:
        return self.environment.lower() == "development"

    @property
    def ses_configured(self) -> bool:
        return bool(self.aws_access_key_id and self.aws_secret_access_key)


settings = Settings()
