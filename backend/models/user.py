from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class UserContext(BaseModel):
    """User context for the chatbot."""
    user_id: str
    days_smoke_free: int = 0
    cravings: int = 5
    triggers: List[str] = []
    goals: List[str] = []
    medications: List[str] = []
    quit_date: Optional[str] = None
    last_smoke: Optional[str] = None
    quit_attempts: int = 0
    support_network: List[str] = []
    preferred_coping_strategies: List[str] = []
    time_of_day: Optional[str] = None
    location: Optional[str] = None
    mood: Optional[str] = None
    stress_level: int = 5
    sleep_hours: Optional[int] = None
    exercise_minutes: Optional[int] = None
    water_intake: Optional[int] = None
    caffeine_intake: Optional[int] = None
    alcohol_intake: Optional[int] = None
    other_context: Dict[str, Any] = {}

class UserRequest(BaseModel):
    """Request model for user-related endpoints."""
    user_id: str
    action: str
    data: Optional[Dict[str, Any]] = None
    context: Optional[UserContext] = None 