from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from .user import UserContext

class VoiceChatRequest(BaseModel):
    """Request model for voice chat interactions."""
    user_id: str
    audio_url: str
    context: Optional[UserContext] = None
    language: str = "en"
    voice_type: str = "female"

class VoiceChatResponse(BaseModel):
    """Response model for voice chat interactions."""
    message: str
    audio_url: str
    follow_up_questions: Optional[List[str]] = None
    suggested_actions: Optional[List[Dict[str, Any]]] = None
    emotion: Optional[str] = None
    confidence: float = 0.0 