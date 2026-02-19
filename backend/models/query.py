from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from .user import UserContext

class QueryRequest(BaseModel):
    """Request model for the chatbot query endpoint."""
    user_id: str
    message: str
    context: Optional[UserContext] = None
    voice_enabled: bool = False
    conversation_mode: str = "default"  # default, coaching, emergency

class QueryResponse(BaseModel):
    """Response model for the chatbot query endpoint."""
    response: str
    audio_url: Optional[str] = None
    suggested_actions: List[Dict[str, str]] = []
    follow_up_questions: List[str] = []
    emotion_detected: Optional[str] = None
    craving_detected: bool = False
    craving_intensity: Optional[int] = None 