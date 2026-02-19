from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from .user import UserContext

class CalmRequest(BaseModel):
    """Request model for the calm endpoint."""
    user_id: str
    context: Optional[UserContext] = None
    voice_type: str = "default"  # default, coach, emergency
    duration: int = 5  # minutes
    emergency_mode: bool = False  # Added to match usage in route

class CalmResponse(BaseModel):
    """Response model for the calm endpoint."""
    message: str
    audio_url: str
    duration: int = 5  # Added default value
    breathing_exercise: Optional[Dict[str, Any]] = None
    meditation_exercise: Optional[Dict[str, Any]] = None
    suggested_actions: List[Dict[str, str]] = []  # Added to match usage in route
    follow_up_questions: List[str] = []  # Added to match usage in route 