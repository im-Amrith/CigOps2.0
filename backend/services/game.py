from models import GameProgress, Achievement
from datetime import datetime
from typing import List

async def log_progress(progress_data: GameProgress):
    # This is a placeholder. In a real implementation,
    # you would save progress_data to the database
    print(f"Logging progress for user {progress_data.user_id}: {progress_data}")
    # Check for and award achievements (synthetic logic)
    awarded_achievements = []
    if progress_data.days_nicotine_free >= 1 and not is_achievement_awarded(progress_data.user_id, "First Day"):
        achievement = Achievement(
            name="First Day", 
            description="Completed your first day nicotine-free",
            awarded=True,
            date_awarded=datetime.now(),
            experience_reward=100
        )
        awarded_achievements.append(achievement)
        # In a real app, mark this achievement as awarded in the DB
    # Add more achievement checks here...
    return {"awarded_achievements": awarded_achievements}

async def get_achievements(user_id: str) -> List[Achievement]:
    # This is a placeholder. In a real implementation,
    # you would fetch user achievements from the database
    print(f"Getting achievements for user {user_id}")
    # Return synthetic data for now
    return [
        Achievement(
            name="First Day", 
            description="Completed your first day nicotine-free", 
            awarded=True,
            date_awarded=datetime.now(),
            experience_reward=100
        ),
        Achievement(
            name="One Week Streak", 
            description="Stayed nicotine-free for a week", 
            awarded=False,
            experience_reward=500
        ),
    ]

async def get_progress(user_id: str) -> GameProgress:
    # This is a placeholder. In a real implementation,
    # you would fetch user progress from the database
    print(f"Getting progress for user {user_id}")
    # Return synthetic data for now
    return GameProgress(
        user_id=user_id, 
        days_nicotine_free=5, 
        total_cravings_logged=10,
        level=2,
        experience_points=250,
        streak_days=5
    )

def is_achievement_awarded(user_id: str, achievement_name: str) -> bool:
    # Placeholder function to simulate checking if an achievement is awarded
    # In a real app, this would query the database
    print(f"Checking if achievement \"{achievement_name}\" is awarded for user {user_id}")
    # For synthetic data, let's just say First Day is always awarded if checked
    return achievement_name == "First Day" 