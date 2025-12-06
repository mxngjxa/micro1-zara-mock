import httpx
import logging
from typing import Dict, Optional, Any

logger = logging.getLogger(__name__)

class NestJSClient:
    """Client for communicating with NestJS backend API"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.client = httpx.AsyncClient(timeout=30.0)
    
    def _unwrap_response(self, json_response: Dict[str, Any]) -> Any:
        """Unwrap the { success: true, data: ... } response format"""
        if isinstance(json_response, dict) and 'data' in json_response:
            return json_response['data']
        return json_response
    
    async def get_interview_details(self, interview_id: str, room_name: str) -> Optional[Dict[str, Any]]:
        """Fetch interview details with questions for agent"""
        try:
            url = f"{self.base_url}/interviews/agent/{interview_id}?room_name={room_name}"
            logger.info(f"Fetching interview details from: {url}")
            response = await self.client.get(url)
            response.raise_for_status()
            data = self._unwrap_response(response.json())
            logger.info(f"Got interview data: job_role={data.get('job_role')}, questions={len(data.get('questions', []))}")
            return data
        except httpx.RequestError as e:
            logger.error(f"Network error getting interview details: {e}")
            return None
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error getting interview details: {e.response.status_code} - {e.response.text}")
            return None
    
    async def submit_answer(self, question_id: str, transcript: str, duration: float) -> Optional[Dict[str, Any]]:
        """Submit user's answer transcript for evaluation"""
        try:
            url = f"{self.base_url}/answers"
            payload = {
                "question_id": question_id,
                "transcript": transcript,
                "duration_seconds": int(duration)
            }
            logger.info(f"Submitting answer for question {question_id}: {len(transcript)} chars")
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            data = self._unwrap_response(response.json())
            logger.info(f"Answer submitted successfully, score: {data.get('score')}")
            return data
        except httpx.RequestError as e:
            logger.error(f"Network error submitting answer: {e}")
            return None
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error submitting answer: {e.response.status_code} - {e.response.text}")
            return None

    async def complete_interview(self, interview_id: str, room_name: str) -> bool:
        """Notify NestJS that interview is complete (using agent endpoint)"""
        try:
            url = f"{self.base_url}/interviews/agent/{interview_id}/complete?room_name={room_name}"
            logger.info(f"Completing interview: {interview_id}")
            response = await self.client.post(url)
            response.raise_for_status()
            logger.info(f"Interview completed successfully")
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
