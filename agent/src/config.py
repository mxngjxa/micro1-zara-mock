import os
from dotenv import load_dotenv

# Load .env file from project root (will not override existing env vars)
load_dotenv()


class Config:
    """Application configuration loaded from environment variables."""
    
    def __init__(self):
        # LiveKit configuration
        self.livekit_url: str = self._get_required("LIVEKIT_URL")
        self.livekit_api_key: str = self._get_required("LIVEKIT_API_KEY")
        self.livekit_api_secret: str = self._get_required("LIVEKIT_API_SECRET")
        
        # Gemini configuration
        self.google_api_key: str = self._get_required("GOOGLE_API_KEY")
        self.gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-preview-tts")
        self.gemini_voice: str = os.getenv("GEMINI_VOICE", "Puck")
        self.gemini_temperature: float = float(os.getenv("GEMINI_TEMPERATURE", "0.7"))
        
        # NestJS API
        self.nestjs_api_url: str = self._get_required("NESTJS_API_URL")
        
        # Logging
        self.log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    @staticmethod
    def _get_required(key: str) -> str:
        """Get a required environment variable or raise an error."""
        value = os.getenv(key)
        if value is None:
            raise ValueError(f"Missing required environment variable: {key}")
        return value


# Global config instance
config = Config()
