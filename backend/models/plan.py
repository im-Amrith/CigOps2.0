from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from .user import UserContext

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