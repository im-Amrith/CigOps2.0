from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class Achievement(BaseModel):
    """Model for game achievements."""
    id: str
    title: str
    description: str
    points: int
    icon_url: Optional[str] = None
    unlocked_at: Optional[datetime] = None
    requirements: Dict[str, Any] = {}

class GameProgress(BaseModel):
    """Model for tracking user's game progress."""
    user_id: str
    level: int = 1
    experience: int = 0
    achievements: List[Achievement] = []
    badges: List[str] = []
    streak_days: int = 0
    last_activity: Optional[datetime] = None
    milestones_completed: List[str] = []
    current_challenges: List[Dict[str, Any]] = []
    rewards_claimed: List[str] = []
    statistics: Dict[str, Any] = {} 