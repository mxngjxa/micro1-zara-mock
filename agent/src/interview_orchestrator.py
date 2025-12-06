"""
Interview Orchestrator - Controls the flow of structured interviews.

This orchestrator:
- Manages the sequence of pre-generated questions
- Handles user speech with debouncing (waits for user to finish speaking)
- Submits answers to the backend for evaluation
- Sends progress updates to the frontend via data channel
- Prevents processing speech while agent is speaking
"""

import asyncio
import json
import logging
import re
from datetime import datetime
from typing import Optional, Any

from src.api_client import NestJSClient

logger = logging.getLogger(__name__)

# Minimum transcript length required by backend validation
MIN_TRANSCRIPT_LENGTH = 10

# Time to wait after last speech before processing answer (debounce)
SPEECH_DEBOUNCE_SECONDS = 4.0


class InterviewOrchestrator:
    """Orchestrates the interview flow with pre-generated questions."""
    
    def __init__(
        self,
        nestjs_client: NestJSClient,
        session: Any,  # AgentSession
        room_name: str,
        room: Any = None,  # LiveKit Room for data messages
    ):
        self.nestjs_client = nestjs_client
        self.session = session
        self.room_name = room_name
        self.room = room
        
        # Interview state
        self.interview_data: Optional[dict[str, Any]] = None
        self.current_question_index = 0
        self.questions: list[dict[str, Any]] = []
        self.interview_id: Optional[str] = None
        self.answer_start_time: Optional[datetime] = None
        
        # Speech handling state
        self.current_transcript = ""
        self._accumulated_transcript = ""
        self._background_tasks = set()
        self._processing_speech = False
        self._waiting_for_answer = False
        self._debounce_task: Optional[asyncio.Task] = None
        self._agent_speaking = False  # Track if agent is currently speaking
    
    async def initialize(self) -> bool:
        """Fetch interview details from NestJS backend."""
        try:
            # Extract interview_id from room_name (format: interview-{uuid})
            match = re.search(r"interview-([0-9a-fA-F-]+)", self.room_name)
            if not match:
                logger.error(f"Invalid room name format: {self.room_name}")
                return False
            
            self.interview_id = match.group(1)
            logger.info(f"Initializing interview {self.interview_id} for room {self.room_name}")
            
            self.interview_data = await self.nestjs_client.get_interview_details(
                self.interview_id, self.room_name
            )
            
            if not self.interview_data:
                logger.error("Failed to fetch interview data - got None")
                return False
            
            self.questions = self.interview_data.get("questions", [])
            if not self.questions:
                logger.error(f"No questions found in interview data")
                return False
            
            # Sort questions by order
            self.questions.sort(key=lambda x: x.get("order", 0))
            
            # Resume from last completed question if any
            completed_count = self.interview_data.get("completed_questions", 0)
            if completed_count > 0 and completed_count < len(self.questions):
                self.current_question_index = completed_count
            
            logger.info(
                f"Interview initialized: {self.interview_data.get('job_role')} "
                f"({self.interview_data.get('difficulty')}) "
                f"with {len(self.questions)} questions"
            )
            return True
            
        except Exception as e:
            logger.error(f"Error initializing interview: {e}", exc_info=True)
            return False
    
    async def send_data_message(self, data: dict):
        """Send a data message to the frontend via LiveKit data channel."""
        if not self.room:
            logger.debug("No room available for data message")
            return
        
        try:
            message = json.dumps(data).encode('utf-8')
            await self.room.local_participant.publish_data(message)
            logger.debug(f"Sent data message: {data.get('type')}")
        except Exception as e:
            logger.error(f"Failed to send data message: {e}")
    
    async def send_progress_update(self):
        """Send current progress to frontend."""
        await self.send_data_message({
            "type": "progress",
            "current_question": self.current_question_index + 1,
            "total_questions": len(self.questions),
            "completed": self.current_question_index,
        })
    
    async def start_interview(self, session: Any):
        """Begin the interview with a greeting and first question."""
        if not self.interview_data:
            logger.error("Cannot start interview: Not initialized")
            return
        
        job_role = self.interview_data.get("job_role", "the position")
        difficulty = self.interview_data.get("difficulty", "standard")
        question_count = len(self.questions)
        
        # Greeting - use say() for exact text, not LLM-generated
        greeting = (
            f"Hello! Welcome to your {difficulty} level technical interview "
            f"for the {job_role} position. "
            f"I have {question_count} questions prepared for you today. "
            f"Please take your time to think before answering each question. "
            f"Let's begin with the first question."
        )
        
        logger.info("Starting interview with greeting...")
        
        # Mark agent as speaking to ignore any user speech during this time
        self._agent_speaking = True
        try:
            # Use say() to speak the exact greeting text
            await session.say(greeting, allow_interruptions=False)
        finally:
            self._agent_speaking = False
        
        # Small pause before first question
        await asyncio.sleep(1.5)
        
        # Ask the first question
        await self.ask_current_question(session)
    
    async def ask_current_question(self, session: Any):
        """Ask the current question using exact text."""
        if self.current_question_index >= len(self.questions):
            await self.conclude_interview(session)
            return
        
        question = self.questions[self.current_question_index]
        question_number = self.current_question_index + 1
        question_content = question.get("content", "")
        
        # Reset state for new question - BEFORE speaking
        self.current_transcript = ""
        self._accumulated_transcript = ""
        self._processing_speech = False
        self._waiting_for_answer = False  # Will enable after speaking
        
        logger.info(f"Asking question {question_number}/{len(self.questions)}: {question_content[:50]}...")
        
        # Send question data to frontend
        await self.send_data_message({
            "type": "question",
            "question": {
                "id": question.get("id"),
                "content": question_content,
                "order": question_number,
            }
        })
        
        # Send progress update
        await self.send_progress_update()
        
        # Mark agent as speaking - ignore user speech during question
        self._agent_speaking = True
        try:
            # Speak the question using say() for exact text
            question_text = f"Question {question_number}: {question_content}"
            await session.say(question_text, allow_interruptions=False)
        finally:
            self._agent_speaking = False
        
        # NOW start waiting for answer (after question is fully spoken)
        self.answer_start_time = datetime.now()
        self._waiting_for_answer = True
        
        logger.info(f"Question {question_number} asked, now waiting for answer...")
    
    async def on_user_speech_committed(self, transcript: str):
        """Handle transcribed user speech with debouncing."""
        # Ignore speech while agent is speaking (prevents weird comments)
        if self._agent_speaking:
            logger.debug("Ignoring speech - agent is speaking")
            return
        
        if not self._waiting_for_answer:
            logger.debug("Ignoring speech - not waiting for answer")
            return
        
        if self._processing_speech:
            logger.debug("Ignoring speech - already processing")
            return
        
        # Accumulate transcript
        if transcript:
            if self._accumulated_transcript:
                self._accumulated_transcript += " " + transcript
            else:
                self._accumulated_transcript = transcript
            self._accumulated_transcript = self._accumulated_transcript.strip()
        
        self.current_transcript = self._accumulated_transcript
        logger.info(f"Speech accumulated: {len(self._accumulated_transcript)} chars total")
        
        # Send live transcript to frontend
        await self.send_data_message({
            "type": "transcript",
            "text": self._accumulated_transcript
        })
        
        # Cancel existing debounce timer - user is still speaking
        if self._debounce_task and not self._debounce_task.done():
            self._debounce_task.cancel()
            logger.debug("Reset debounce timer - user still speaking")
        
        # Start new debounce timer
        self._debounce_task = asyncio.create_task(self._process_answer_after_silence())
    
    async def _process_answer_after_silence(self):
        """Wait for silence then process the answer."""
        try:
            logger.info(f"Waiting {SPEECH_DEBOUNCE_SECONDS}s for user to finish...")
            await asyncio.sleep(SPEECH_DEBOUNCE_SECONDS)
            
            # Validate state
            if not self._waiting_for_answer or self._processing_speech:
                logger.debug("State changed during debounce, skipping")
                return
            
            if self.current_question_index >= len(self.questions):
                logger.warning("All questions already answered")
                return
            
            # Validate transcript length
            if len(self._accumulated_transcript) < MIN_TRANSCRIPT_LENGTH:
                logger.warning(
                    f"Transcript too short ({len(self._accumulated_transcript)} chars), "
                    f"waiting for more speech..."
                )
                return
            
            # Calculate answer duration
            duration = 0.0
            if self.answer_start_time:
                duration = (datetime.now() - self.answer_start_time).total_seconds()
            
            question = self.questions[self.current_question_index]
            question_id = question.get("id")
            
            logger.info(f"Processing answer for question {self.current_question_index + 1}")
            
            # Lock processing
            self._processing_speech = True
            self._waiting_for_answer = False
            
            # Submit answer to backend for evaluation
            await self.submit_answer(question_id, self._accumulated_transcript, duration)
            
            # Brief acknowledgment - natural transition
            self._agent_speaking = True
            try:
                await self.session.say("Thank you.", allow_interruptions=False)
            finally:
                self._agent_speaking = False
            
            # Brief pause before next question
            await asyncio.sleep(0.5)
            
            # Move to next question
            self.current_question_index += 1
            self._processing_speech = False
            
            # Send progress update after completing a question
            await self.send_progress_update()
            
            # Ask next question or conclude
            await self.ask_current_question(self.session)
            
        except asyncio.CancelledError:
            logger.debug("Answer processing cancelled - user continued speaking")
        except Exception as e:
            logger.error(f"Error processing answer: {e}", exc_info=True)
            self._processing_speech = False
    
    async def submit_answer(self, question_id: str, transcript: str, duration: float):
        """Submit answer to backend for evaluation."""
        if len(transcript) < MIN_TRANSCRIPT_LENGTH:
            logger.warning(f"Skipping submission - transcript too short")
            return
        
        logger.info(f"Submitting answer: {len(transcript)} chars, {duration:.1f}s")
        
        try:
            result = await self.nestjs_client.submit_answer(
                question_id=question_id,
                transcript=transcript,
                duration=duration,
            )
            if result:
                score = result.get('score', 'N/A')
                logger.info(f"Answer submitted, score: {score}")
        except Exception as e:
            logger.error(f"Failed to submit answer: {e}", exc_info=True)
    
    async def conclude_interview(self, session: Any):
        """Finish the interview with closing remarks and trigger evaluation."""
        logger.info("Concluding interview...")
        
        # Stop accepting speech
        self._waiting_for_answer = False
        
        closing = (
            f"Thank you for completing the interview! "
            f"That concludes all {len(self.questions)} questions. "
            f"Your responses are being evaluated and you'll receive "
            f"a detailed report shortly. "
            f"Thank you for your time and have a great day!"
        )
        
        # Mark agent as speaking
        self._agent_speaking = True
        try:
            # Speak closing using say()
            await session.say(closing, allow_interruptions=False)
        finally:
            self._agent_speaking = False
        
        # Send final progress update
        await self.send_data_message({
            "type": "progress",
            "current_question": len(self.questions),
            "total_questions": len(self.questions),
            "completed": len(self.questions),
        })
        
        # Notify frontend that interview is complete
        await self.send_data_message({
            "type": "interview_complete",
            "interview_id": self.interview_id,
        })
        
        # Wait for speech to complete
        await asyncio.sleep(2.0)
        
        # Notify backend that interview is complete - this triggers evaluation!
        if self.interview_id:
            logger.info("Notifying backend to complete interview and run evaluation...")
            await self.nestjs_client.complete_interview(self.interview_id, self.room_name)
            logger.info("Interview completion notified to backend - evaluation triggered")
    
    async def handle_error(self, error: Exception):
        """Handle errors gracefully during interview."""
        logger.error(f"Interview error: {error}", exc_info=True)
        
        message = (
            "I apologize, but we've encountered a technical issue. "
            "Please try refreshing the page or contact support if the problem persists."
        )
        
        try:
            if self.session:
                await self.session.say(message, allow_interruptions=True)
        except Exception as e:
            logger.error(f"Failed to speak error message: {e}")
