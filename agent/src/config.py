from pydantic_settings import BaseSettings
from typing import Optional

class Config(BaseSettings):
    # LiveKit configuration
    livekit_url: str
    livekit_api_key: str
    livekit_api_secret: str
    
    # Gemini configuration
    google_api_key: str
    gemini_model: str = "gemini-2.5-flash-preview-tts"
    gemini_voice: str = "Puck"
    gemini_temperature: float = 0.7
    
    # NestJS API
    nestjs_api_url: str
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore" # Allow extra fields in .env

# Global config instance
config = Config()
