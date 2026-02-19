from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from .user import UserContext

class CravingRequest(BaseModel):
    """Request model for the craving endpoint."""
    user_id: str
    intensity: int = 5
    trigger: Optional[str] = None
    context: Optional[UserContext] = None

class CravingResponse(BaseModel):
    """Response model for the craving endpoint."""
    message: str
    audio_url: str
    coping_strategies: List[Dict[str, Any]]
    emergency_contact: Optional[Dict[str, Any]] = None
    distraction_activities: List[Dict[str, Any]]
    breathing_exercise: Optional[Dict[str, Any]] = None 