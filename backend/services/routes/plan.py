from fastapi import APIRouter
from models import PlanRequest

router = APIRouter()

@router.post("/plan")
async def plan_endpoint(request: PlanRequest):
    # Placeholder: Generate a simple plan
    return {"plan": ["Day 1: 8 cigs", "Day 2: 7 cigs", "Day 3: 6 cigs", "..."]}