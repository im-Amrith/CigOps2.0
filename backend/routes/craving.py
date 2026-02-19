from fastapi import APIRouter, HTTPException
from models import CravingRequest, CravingResponse
from services import craving as craving_service

router = APIRouter()

@router.post("/craving", response_model=CravingResponse)
async def log_craving(request: CravingRequest):
    """
    Log a craving event and get coping strategies.
    """
    try:
        # Log the craving and get response
        response = await craving_service.handle_craving(request.dict())
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error handling craving: {str(e)}")

@router.get("/craving/stats/{user_id}")
async def get_craving_stats(user_id: str):
    """
    Get craving statistics for a user.
    """
    try:
        stats = craving_service.get_craving_stats(user_id)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting craving stats: {str(e)}") 