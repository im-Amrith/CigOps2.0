from fastapi import APIRouter, HTTPException
from services import analytics

router = APIRouter()

@router.get("/analytics/{user_id}")
async def get_user_analytics(user_id: str, time_period: str = "week"):
    """
    Get user analytics for a specific time period.
    
    Args:
        user_id (str): The user ID
        time_period (str): The time period (day, week, month, year)
        
    Returns:
        dict: The user analytics
    """
    try:
        # Validate time period
        if time_period not in ["day", "week", "month", "year"]:
            raise HTTPException(status_code=400, detail=f"Invalid time period: {time_period}")
        
        # Get user analytics
        analytics_data = await analytics.get_user_analytics(user_id, time_period)
        
        return analytics_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user analytics: {str(e)}")

@router.get("/analytics")
async def get_global_analytics():
    """
    Get global analytics across all users.
    
    Returns:
        dict: The global analytics
    """
    try:
        # Get global analytics
        analytics_data = await analytics.get_global_analytics()
        
        return analytics_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting global analytics: {str(e)}") 