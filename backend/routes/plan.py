from fastapi import APIRouter, HTTPException
from models import PlanRequest, PlanResponse
from services.plan import get_user_plan, update_user_plan

router = APIRouter()

@router.get("/quit-plan/{user_id}", response_model=PlanResponse)
async def get_plan_endpoint(user_id: str):
    """
    Endpoint for retrieving user quit plan.
    Returns quit date, triggers, coping strategies, support people, and rewards.
    """
    try:
        # Get quit plan
        plan_data = await get_user_plan(user_id)
        
        # Convert to PlanResponse format
        response = {
            "plan": [
                {"type": "quit_date", "value": plan_data.get("quitDate")},
                {"type": "triggers", "value": plan_data.get("triggers", [])},
                {"type": "coping_strategies", "value": plan_data.get("copingStrategies", [])},
                {"type": "support_people", "value": plan_data.get("supportPeople", [])},
                {"type": "rewards", "value": plan_data.get("rewards", [])}
            ],
            "goals": [],
            "reminders": [],
            "resources": []
        }
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving quit plan: {str(e)}")

@router.put("/quit-plan/{user_id}", response_model=PlanResponse)
async def update_plan_endpoint(user_id: str, plan_data: dict):
    """
    Endpoint for updating user quit plan.
    Updates quit date, triggers, coping strategies, support people, and rewards.
    """
    try:
        # Update quit plan
        updated_plan = await update_user_plan(user_id, plan_data)
        
        # Convert to PlanResponse format
        response = {
            "plan": [
                {"type": "quit_date", "value": updated_plan.get("quitDate")},
                {"type": "triggers", "value": updated_plan.get("triggers", [])},
                {"type": "coping_strategies", "value": updated_plan.get("copingStrategies", [])},
                {"type": "support_people", "value": updated_plan.get("supportPeople", [])},
                {"type": "rewards", "value": updated_plan.get("rewards", [])}
            ],
            "goals": [],
            "reminders": [],
            "resources": []
        }
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating quit plan: {str(e)}") 