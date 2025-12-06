import asyncio
import logging
import re
from datetime import datetime
from typing import Optional, Any

from src.api_client import NestJSClient

logger = logging.getLogger(__name__)


class InterviewOrchestrator:
    """Orchestrates the interview flow with questions and answers"""
    
    def __init__(
        self,
        nestjs_client: NestJSClient,
        session: Any,  # AgentSession
        room_name: str,
    ):
        self.nestjs_client = nestjs_client
        self.session = session
        self.room_name = room_name
        self.interview_data: Optional[dict[str, Any]] = None
        self.current_question_index = 0
        self.questions: list[dict[str, Any]] = []
        self.interview_id: Optional[str] = None
        self.answer_start_time: Optional[datetime] = None
        self.current_transcript = ""
        self._background_tasks = set()
        self._processing_speech = False
    
    async def initialize(self) -> bool:
        """Fetch interview details from NestJS"""
        try:
            # Extract interview_id from room_name (format: interview-{uuid})
            match = re.search(r"interview-([0-9a-fA-F-]+)", self.room_name)
            if not match:
                logger.error(f"Invalid room name format: {self.room_name}")
                return False
            
            self.interview_id = match.group(1)
            logger.info(
                f"Initializing interview {self.interview_id} "
                f"for room {self.room_name}"
            )
            
            self.interview_data = await self.nestjs_client.get_interview_details(
                self.interview_id, self.room_name
            )
            
            if not self.interview_data:
                logger.error("Failed to fetch interview data")
                return False
            
            self.questions = self.interview_data.get("questions", [])
            # Sort questions by order field if available
            self.questions.sort(key=lambda x: x.get("order", 0))
            
            # Resume from last completed question
            completed_count = self.interview_data.get("completedQuestions", 0)
            if completed_count > 0 and completed_count < len(self.questions):
                self.current_question_index = completed_count
            
            logger.info(
                f"Interview initialized: {self.interview_data.get('jobRole')} "
                f"({self.interview_data.get('difficulty')}) "
                f"with {len(self.questions)} questions"
            )
            return True
            
        except Exception as e:
            logger.error(f"Error initializing interview: {e}", exc_info=True)
            return False
    
    async def start_interview(self, session: Any):
        """Begin the interview by asking first question"""
        if not self.interview_data:
            logger.error("Cannot start interview: Not initialized")
            return
        
        job_role = self.interview_data.get("jobRole", "unknown role")
        difficulty = self.interview_data.get("difficulty", "standard")
        question_count = len(self.questions)
        
        greeting = (
            f"Hello! I'm your AI interviewer today. "
            f"We'll be conducting a {difficulty} level interview for the {job_role} position. "
            f"I have {question_count} questions prepared. "
            f"Please answer each question to the best of your ability. "
            f"Let's begin!"
        )
        
        await session.generate_reply(instructions=greeting)
        await asyncio.sleep(1.0)
        await self.ask_next_question(session)
    
    async def ask_next_question(self, session: Any):
        """Ask the next question in sequence"""
        if self.current_question_index >= len(self.questions):
            await self.conclude_interview(session)
            return
        
        question = self.questions[self.current_question_index]
        question_number = self.current_question_index + 1
        self.answer_start_time = datetime.now()
        self.current_transcript = ""
        
        logger.info(f"Asking question {question_number}: {question.get('content')}")
        
        text = f"Question {question_number}: {question.get('content')}"
        await session.generate_reply(instructions=text)
    
    async def handle_user_finished_speaking(self):
        """Called when user finishes speaking (from user_state_changed event)"""
        if not self.session:
            return
        
        # Get the latest transcript from the session
        # Note: You may need to track this differently based on your implementation
        # This is a placeholder - you'll need to capture transcripts through the session
        
        duration = 0.0
        if self.answer_start_time:
            duration = (datetime.now() - self.answer_start_time).total_seconds()
        
        if self.current_question_index >= len(self.questions):
            logger.warning("Received speech after interview completion")
            return
        
        question = self.questions[self.current_question_index]
        question_id = question.get("id")
        
        # Note: You'll need to implement transcript capture
        # This is a simplified version
        if self.current_transcript and not self._processing_speech:
            self._processing_speech = True
            
            submit_task = asyncio.create_task(
                self.handle_answer_submission(
                    question_id, self.current_transcript, duration
                )
            )
            self._background_tasks.add(submit_task)
            submit_task.add_done_callback(self._background_tasks.discard)

            transition_task = asyncio.create_task(self.transition_to_next_question())
            self._background_tasks.add(transition_task)
            transition_task.add_done_callback(lambda t: self._cleanup_task_and_reset_speech_flag(t))
    
    async def on_user_speech_committed(self, transcript: str):
        """Store user transcript"""
        self.current_transcript = transcript
        logger.info(f"User speech committed: {len(transcript)} chars")
        
        duration = 0.0
        if self.answer_start_time:
            duration = (datetime.now() - self.answer_start_time).total_seconds()
        
        if self.current_question_index >= len(self.questions):
            return
        
        question = self.questions[self.current_question_index]
        question_id = question.get("id")
        
        # Submit answer and move to next question
        if not self._processing_speech:
            self._processing_speech = True

            submit_task = asyncio.create_task(
                self.handle_answer_submission(question_id, transcript, duration)
            )
            self._background_tasks.add(submit_task)
            submit_task.add_done_callback(self._background_tasks.discard)
            
            transition_task = asyncio.create_task(self.transition_to_next_question())
            self._background_tasks.add(transition_task)
            transition_task.add_done_callback(lambda t: self._cleanup_task_and_reset_speech_flag(t))
    
    def _cleanup_task_and_reset_speech_flag(self, task):
        self._background_tasks.discard(task)
        self._processing_speech = False
        if task.exception():
            logger.error(f"Background task failed: {task.exception()}", exc_info=task.exception())

    async def handle_answer_submission(
        self, question_id: str, transcript: str, duration: float
    ):
        """Submit answer to backend"""
        logger.info(f"Submitting answer for question {question_id}")
        await self.nestjs_client.submit_answer(
            question_id=question_id,
            transcript=transcript,
            duration=duration,
        )
    
    async def transition_to_next_question(self):
        """Handle transition between questions"""
        acknowledgment = "Thank you. Let me note your answer."
        await self.session.generate_reply(instructions=acknowledgment)
        
        self.current_question_index += 1
        await asyncio.sleep(1.0)
        await self.ask_next_question(self.session)
    
    async def conclude_interview(self, session: Any):
        """Finish the interview"""
        logger.info("Concluding interview")
        
        closing = (
            "Thank you for completing the interview! "
            f"That concludes all {len(self.questions)} questions. "
            "Your responses are being evaluated and you'll receive "
            "a detailed report shortly. Have a great day!"
        )
        
        await session.generate_reply(instructions=closing)
        await asyncio.sleep(2.0)
        
        if self.interview_id:
            await self.nestjs_client.complete_interview(self.interview_id)
    
    async def handle_error(self, error: Exception):
        """Handle errors gracefully"""
        logger.error(f"Interview error: {error}", exc_info=True)
        message = (
            "I apologize, but we've encountered a technical issue. "
            "Please try refreshing or contacting support."
        )
        try:
            await self.session.generate_reply(instructions=message)
        except Exception as e:
            logger.error(f"Failed to generate error reply: {e}", exc_info=True)
