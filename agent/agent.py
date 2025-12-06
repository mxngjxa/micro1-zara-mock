import asyncio
import logging
from livekit import agents
from livekit.agents import AgentSession, Agent
from livekit.agents.voice import room_io
from livekit.plugins import google, silero, noise_cancellation
# Change relative imports to absolute
from src.config import config
from src.api_client import NestJSClient
from src.interview_orchestrator import InterviewOrchestrator


logging.basicConfig(level=config.log_level)
logger = logging.getLogger(__name__)

server = agents.AgentServer()


class InterviewAgent(Agent):
    """Custom Agent for conducting interviews"""
    
    def __init__(self, orchestrator: InterviewOrchestrator):
        super().__init__(
            instructions=(
                "You are a professional technical interviewer. "
                "Ask questions clearly and wait for complete answers. "
                "Be encouraging and professional. Do not interrupt the candidate. "
                "Acknowledge answers briefly before moving on."
            )
        )
        self.orchestrator = orchestrator
        self._tasks = set()


@server.rtc_session()
async def entrypoint(ctx: agents.JobContext):
    """Main agent entry point - called when agent joins a room"""
    logger.info(f"Agent joining room {ctx.room.name}")
    
    nestjs_client = NestJSClient(config.nestjs_api_url)
    
    try:
        await ctx.connect()
        logger.info(f"Connected to room {ctx.room.name}")
        
        # Create AgentSession with Google components
        session = AgentSession(
            stt=google.STT(api_key=config.google_api_key),
            llm=google.LLM(
                model=config.gemini_model,
                api_key=config.google_api_key,
                temperature=config.gemini_temperature,
            ),
            tts=google.TTS(
                api_key=config.google_api_key,
                voice_name=config.gemini_voice,
            ),
            vad=silero.VAD.load(
                min_speech_duration=0.5,
                min_silence_duration=1.0,
                padding_duration=0.3,
            ),
        )
        
        # Create Interview Orchestrator
        orchestrator = InterviewOrchestrator(
            nestjs_client=nestjs_client,
            session=session,
            room_name=ctx.room.name,
        )
        
        success = await orchestrator.initialize()
        if not success:
            logger.error("Failed to initialize interview orchestrator")
            await asyncio.sleep(2)
            return
        
        agent = InterviewAgent(orchestrator)
        
        # Event handlers - use decorator on session object
        @session.on("agent_state_changed")
        def on_agent_state_changed(ev):
            logger.debug(f"Agent state changed: {ev}")
        
        @session.on("user_state_changed") 
        def on_user_state_changed(ev):
            logger.debug(f"User state changed: {ev}")
        
        @session.on("user_input_transcribed")
        def on_user_input_transcribed(ev):
            # Called when user speech is transcribed
            if hasattr(ev, 'transcript') and ev.transcript:
                task = asyncio.create_task(
                    orchestrator.on_user_speech_committed(ev.transcript)
                )
                agent._tasks.add(task)
                task.add_done_callback(agent._tasks.discard)
        
        # Start the session
        await session.start(
            room=ctx.room,
            agent=agent,
            room_options=room_io.RoomOptions(
                audio_input=room_io.AudioInputOptions(
                    noise_cancellation=noise_cancellation.BVC(),
                ),
            ),
        )
        
        await asyncio.sleep(1)
        await orchestrator.start_interview()
        
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
