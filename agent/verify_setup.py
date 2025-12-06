import logging
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def verify():
    logger.info("Verifying imports...")
    
    try:
        from livekit import agents
        from livekit.agents import AgentSession, Agent
        logger.info("✓ Imported AgentSession and Agent from livekit.agents")
    except ImportError as e:
        logger.error(f"✗ Import failed: {e}")
        return
    
    try:
        from livekit.plugins import google, silero
        logger.info("✓ Imported google and silero plugins")
    except ImportError as e:
        logger.error(f"✗ Plugin import failed: {e}")
        return
    
    try:
        from livekit.agents.voice import room_io
        logger.info("✓ Imported room_io from livekit.agents.voice")
    except ImportError as e:
        logger.warning(f"⚠ room_io import failed (may be optional): {e}")
    
    try:
        from agent.agent import entrypoint
        from src.config import config
        from src.api_client import NestJSClient
        from src.interview_orchestrator import InterviewOrchestrator
        logger.info("✓ All application imports successful")
    except ImportError as e:
        logger.error(f"✗ Application import failed: {e}")
        return
    
    logger.info("Verifying Silero VAD model download...")
    try:
        vad = silero.VAD.load()
        logger.info("✓ Silero VAD model loaded successfully")
    except Exception as e:
        logger.error(f"✗ Failed to load Silero VAD: {e}")
    
    logger.info("\n✅ All verifications passed!")


if __name__ == "__main__":
    asyncio.run(verify())
