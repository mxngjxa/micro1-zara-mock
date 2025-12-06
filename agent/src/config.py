import logging
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
        
        # Google API Key (used by all Google plugins)
        self.google_api_key: str = self._get_required("GOOGLE_API_KEY")
        
        # LLM configuration (Gemini)
        self.llm_model: str = os.getenv("GEMINI_LLM_MODEL", "gemini-2.5-flash-preview-05-20")
        
        try:
            self.gemini_temperature: float = float(os.getenv("GEMINI_TEMPERATURE", "0.7"))
        except (ValueError, TypeError) as e:
            invalid_val = os.getenv("GEMINI_TEMPERATURE")
            logging.warning(
                f"Invalid GEMINI_TEMPERATURE value '{invalid_val}': {e}. "
                f"Using default 0.7"
            )
            self.gemini_temperature = 0.7
        
        # TTS configuration (Google Cloud TTS)
        self.tts_voice: str = os.getenv("GOOGLE_TTS_VOICE", "en-US-Studio-O")
        self.tts_language: str = os.getenv("GOOGLE_TTS_LANGUAGE", "en-US")
        
        # STT configuration (Google Cloud STT)
        self.stt_model: str = os.getenv("GOOGLE_STT_MODEL", "chirp_2")
        self.stt_language: str = os.getenv("GOOGLE_STT_LANGUAGE", "en-US")
        
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
