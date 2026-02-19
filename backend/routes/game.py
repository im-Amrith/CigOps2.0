from fastapi import APIRouter, Depends, HTTPException
from typing import List
from services import game as game_service
from models import GameProgress, Achievement

router = APIRouter(prefix="/game", tags=["game"])

@router.post("/log_progress")
async def log_progress(progress_data: GameProgress):
    # Call the service to log user progress
    result = await game_service.log_progress(progress_data)
    return {"message": "Progress logged successfully", "data": result}

@router.get("/achievements")
async def get_achievements(user_id: str):
    # Call the service to get user achievements
    achievements = await game_service.get_achievements(user_id)
    return achievements

@router.get("/progress")
async def get_progress(user_id: str):
    # Call the service to get user progress
    progress = await game_service.get_progress(user_id)
    return progress 

@router.get("/daily_challenges")
async def get_daily_challenges(user_id: str):
    # Return mock daily challenges for now
    return [
        {
            "id": "challenge-1",
            "title": "Log a Craving",
            "description": "Use the chat to log a craving today.",
            "xp_reward": 25,
            "completed": False
        },
        {
            "id": "challenge-2",
            "title": "Meditate for 5 Minutes",
            "description": "Complete a short meditation session.",
            "xp_reward": 30,
            "completed": False
        },
        {
            "id": "challenge-3",
            "title": "Identify a Trigger",
            "description": "Recognize and note down a smoking trigger.",
            "xp_reward": 20,
            "completed": False
        },
    ] 