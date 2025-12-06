"""
Interview Agent using Google STT and TTS plugins.

This agent conducts structured technical interviews using pre-generated questions
from the backend. It uses:
- Google STT for speech-to-text transcription (via chirp_2)
- Google TTS for text-to-speech output (Studio voice)
- Silero VAD for voice activity detection

NOTE: We do NOT use LLM for automatic responses. The orchestrator
controls ALL speech output via session.say() to ensure questions
are asked exactly as written from the backend.
"""

import asyncio
import logging
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import google, silero, noise_cancellation

from src.config import config
from src.api_client import NestJSClient
from src.interview_orchestrator import InterviewOrchestrator


logging.basicConfig(level=config.log_level)
logger = logging.getLogger(__name__)

server = agents.AgentServer()


class InterviewAgent(Agent):
    """Minimal Agent for interview - we control all speech via orchestrator.
    
    The agent does NOT auto-respond to user input. All speech is controlled
    by the orchestrator using session.say() for exact text output.
    """
    
    def __init__(self, orchestrator: InterviewOrchestrator):
        # Minimal instructions - agent should NOT auto-respond
        instructions = """You are an interview assistant.
DO NOT speak unless explicitly told to via system commands.
DO NOT respond to user speech automatically.
Wait for explicit instructions before speaking."""

        super().__init__(instructions=instructions)
        self.orchestrator = orchestrator
        self._tasks = set()


@server.rtc_session()
async def entrypoint(ctx: agents.JobContext):
    """Main agent entry point - called when agent joins a room."""
    logger.info(f"Agent joining room {ctx.room.name}")
    
    nestjs_client = NestJSClient(config.nestjs_api_url)
    
    try:
        await ctx.connect()
        logger.info(f"Connected to room {ctx.room.name}")
        
        # Create a temporary orchestrator to fetch interview data first
        temp_orchestrator = InterviewOrchestrator(
            nestjs_client=nestjs_client,
            session=None,  # Will be set later
            room_name=ctx.room.name,
            room=ctx.room,
        )
        
        # Initialize to get interview questions
        success = await temp_orchestrator.initialize()
        if not success:
            logger.error("Failed to initialize interview orchestrator")
            await asyncio.sleep(2)
            return
        
        questions = temp_orchestrator.questions
        interview_data = temp_orchestrator.interview_data
        
        logger.info(f"Loaded {len(questions)} questions for interview")
        
        # Create AgentSession with STT, TTS, and VAD ONLY
        # We intentionally DO NOT include LLM to prevent automatic responses
        # All speech output is controlled via session.say() by the orchestrator
        session = AgentSession(
            # STT for transcribing user speech (Google Cloud Speech-to-Text)
            stt=google.STT(
                model=config.stt_model,
                languages=[config.stt_language],
                spoken_punctuation=True,
            ),
            # TTS for speaking responses (Google Cloud Text-to-Speech)
            tts=google.TTS(
                voice_name=config.tts_voice,
                language=config.tts_language,
            ),
            # VAD for turn detection - longer silence for interviews
            vad=silero.VAD.load(
                min_speech_duration=0.5,
                min_silence_duration=3.0,  # Wait 3 seconds before considering turn complete
                prefix_padding_duration=0.5,
            ),
        )
        
        # Update orchestrator with session
        orchestrator = InterviewOrchestrator(
            nestjs_client=nestjs_client,
            session=session,
            room_name=ctx.room.name,
            room=ctx.room,
        )
        orchestrator.interview_data = interview_data
        orchestrator.questions = questions
        orchestrator.interview_id = temp_orchestrator.interview_id
        
        # Create the agent
        agent = InterviewAgent(orchestrator)
        
        # Event handlers
        @session.on("agent_state_changed")
        def on_agent_state_changed(ev):
            logger.debug(f"Agent state changed: {ev}")
        
        @session.on("user_state_changed")
        def on_user_state_changed(ev):
            logger.debug(f"User state changed: {ev}")
        
        @session.on("user_input_transcribed")
        def on_user_input_transcribed(ev):
            """Handle transcribed user speech - pass to orchestrator for debouncing."""
            if hasattr(ev, 'transcript') and ev.transcript:
                logger.info(f"User said: {ev.transcript[:100]}...")
                task = asyncio.create_task(
                    orchestrator.on_user_speech_committed(ev.transcript)
                )
                agent._tasks.add(task)
                task.add_done_callback(agent._tasks.discard)
        
        # Start the session - no agent needed since we don't use LLM
        # We pass agent=None to prevent automatic LLM responses
        await session.start(
            room=ctx.room,
            agent=agent,
            room_input_options=RoomInputOptions(
                noise_cancellation=noise_cancellation.BVC(),
            ),
        )
        
        logger.info("Session started, beginning interview...")
        await asyncio.sleep(1)
        await orchestrator.start_interview(session)
        
        # Wait until disconnected
        disconnect_event = asyncio.Event()
        
        @ctx.room.on("disconnected")
        def on_disconnected(reason):
            logger.info(f"Room disconnected: {reason}")
            disconnect_event.set()
        
        await disconnect_event.wait()
        
    except Exception as e:
        logger.error(f"Agent runtime error: {e}", exc_info=True)
    finally:
        logger.info("Cleaning up agent resources")
        await nestjs_client.close()
        logger.info("Interview agent session ended")


if __name__ == "__main__":
    agents.cli.run_app(server)
