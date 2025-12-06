import httpx
import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

class NestJSClient:
    """Client for communicating with NestJS backend API"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def get_interview_details(self, interview_id: str, room_name: str) -> Dict[str, Any]:
        """Fetch interview details with questions for agent"""
        try:
            url = f"{self.base_url}/interviews/agent/{interview_id}?room_name={room_name}"
            response = await self.client.get(url)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            logger.error(f"Network error getting interview details: {e}")
            raise
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error getting interview details: {e.response.status_code} - {e.response.text}")
            raise
    
    async def submit_answer(self, question_id: str, transcript: str, duration: float) -> Optional[Dict[str, Any]]:
        """Submit user's answer transcript for evaluation"""
        try:
            url = f"{self.base_url}/answers"
            payload = {
                "question_id": question_id,
                "transcript": transcript,
                "duration_seconds": int(duration)
            }
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            return response.json()
        except httpx.RequestError as e:
            logger.error(f"Network error submitting answer: {e}")
            return None
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error submitting answer: {e.response.status_code} - {e.response.text}")
            return None

    async def complete_interview(self, interview_id: str) -> bool:
        """Notify NestJS that interview is complete"""
        try:
            url = f"{self.base_url}/interviews/{interview_id}/complete"
            response = await self.client.post(url)
            response.raise_for_status()
            return True
        except httpx.RequestError as e:
            logger.error(f"Network error completing interview: {e}")
            return False
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error completing interview: {e.response.status_code} - {e.response.text}")
            return False
            
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
