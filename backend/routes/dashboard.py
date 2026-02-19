from fastapi import APIRouter, HTTPException
from models import UserContext
from services.dashboard import get_user_dashboard

router = APIRouter()

@router.get("/dashboard/{user_id}")
async def dashboard_endpoint(user_id: str):
    """
    Endpoint for retrieving user dashboard data.
    Returns progress, cravings, triggers, badges, money saved, and health improvements.
    """
    try:
        # Get dashboard data
        dashboard_data = await get_user_dashboard(user_id)
        
        return dashboard_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving dashboard data: {str(e)}") 