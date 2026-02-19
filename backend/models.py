from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Union
from datetime import datetime

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

class VoiceChatRequest(BaseModel):
    """Request model for the voice chat endpoint."""
    user_id: str
    text: str
    context: Optional[UserContext] = None
    conversation_history: Optional[List[Dict[str, str]]] = None # To maintain chat history

class VoiceChatResponse(BaseModel):
    """Response model for the voice chat endpoint."""
    message: str = "Audio stream started."

class CalmRequest(BaseModel):
    """Request model for the calm endpoint."""
    user_id: str
    context: Optional[UserContext] = None
    voice_type: str = "default"  # default, coach, emergency
    duration: int = 5  # minutes

class CalmResponse(BaseModel):
    """Response model for the calm endpoint."""
    message: str
    audio_url: str
    duration: int
    breathing_exercise: Optional[Dict[str, Any]] = None
    meditation_exercise: Optional[Dict[str, Any]] = None

class DashboardRequest(BaseModel):
    """Request model for the dashboard endpoint."""
    user_id: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None

class DashboardResponse(BaseModel):
    """Response model for the dashboard endpoint."""
    days_smoke_free: int
    money_saved: float
    health_improvements: List[Dict[str, Any]]
    cravings_over_time: List[Dict[str, Any]]
    triggers: List[Dict[str, Any]]
    achievements: List[Dict[str, Any]]
    next_milestones: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]

class PlanRequest(BaseModel):
    """Request model for the plan endpoint."""
    user_id: str
    context: Optional[UserContext] = None
    plan_type: str = "daily"  # daily, weekly, monthly

class PlanResponse(BaseModel):
    """Response model for the plan endpoint."""
    plan: List[Dict[str, Any]]
    goals: List[Dict[str, Any]]
    reminders: List[Dict[str, Any]]
    resources: List[Dict[str, Any]]

class KnowledgeRequest(BaseModel):
    """Request model for the knowledge endpoint."""
    user_id: str
    topic: str
    context: Optional[UserContext] = None

class KnowledgeResponse(BaseModel):
    """Response model for the knowledge endpoint."""
    title: str
    content: str
    audio_url: Optional[str] = None
    related_topics: List[Dict[str, Any]]
    resources: List[Dict[str, Any]]

class ChatRequest(BaseModel):
    """Request model for the chat endpoint."""
    user_id: str
    message: str
    context: Optional[UserContext] = None
    conversation_history: Optional[List[Dict[str, Any]]] = None

class ChatResponse(BaseModel):
    """Response model for the chat endpoint."""
    response: str
    conversation_history: List[Dict[str, Any]]
    suggested_actions: List[Dict[str, str]] = []
    follow_up_questions: List[str] = []

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

class UserRequest(BaseModel):
    """Request model for the user endpoint."""
    user_id: str
    action: str  # create, update, delete, get
    user_data: Optional[Dict[str, Any]] = None

class UserResponse(BaseModel):
    """Response model for the user endpoint."""
    user_id: str
    user_data: Dict[str, Any]
    status: str
    message: str

# --- Chat history models for extensibility ---
class ChatMessage(BaseModel):
    id: str
    sender: str
    text: str
    timestamp: str
    audio_url: Optional[str] = None
    emotion: Optional[str] = None
    craving_detected: bool = False

class ChatHistoryResponse(BaseModel):
    user_id: str
    history: List[ChatMessage] 

# --- Game models ---
class GameProgress(BaseModel):
    """Model for tracking user's game progress."""
    user_id: str
    days_nicotine_free: int = 0
    total_cravings_logged: int = 0
    last_updated: datetime = Field(default_factory=datetime.now)
    level: int = 1
    experience_points: int = 0
    streak_days: int = 0
    badges: List[str] = []

class Achievement(BaseModel):
    """Model for user achievements."""
    name: str
    description: str
    awarded: bool = False
    date_awarded: Optional[datetime] = None
    icon: Optional[str] = None
    experience_reward: int = 0 