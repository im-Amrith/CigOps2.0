import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from typing import Dict, List, Any, Optional
import random

load_dotenv()

# Path to user data directory
USER_DATA_DIR = os.getenv("USER_DATA_DIR", "data/users")

async def get_user_dashboard(user_id):
    """
    Get user dashboard data.
    
    Args:
        user_id (str): The user ID
        
    Returns:
        dict: The dashboard data
    """
    # Directly return mock data for MVP
    return generate_mock_dashboard_data(user_id)

def create_default_dashboard(user_id):
    """
    Create default dashboard data.
    
    Args:
        user_id (str): The user ID
        
    Returns:
        dict: The default dashboard data
    """
    # Get quit date from user plan
    quit_date = get_user_quit_date(user_id)
    
    # Calculate days smoke-free
    if quit_date:
        quit_date = datetime.strptime(quit_date, "%Y-%m-%d")
        days_smoke_free = (datetime.now() - quit_date).days
    else:
        days_smoke_free = 0
    
    # Calculate percentage of 30-day goal
    percentage = min(100, int((days_smoke_free / 30) * 100))
    
    # Create default dashboard data
    dashboard_data = {
        "progress": {
            "daysSmokeFree": days_smoke_free,
            "percentage": percentage,
            "message": get_progress_message(days_smoke_free)
        },
        "cravings": {
            "resisted": 0,
            "total": 0
        },
        "triggers": ["Stress", "After meals", "Social situations", "Driving"],
        "badges": [],
        "moneySaved": calculate_money_saved(days_smoke_free),
        "healthImprovements": get_health_improvements(days_smoke_free)
    }
    
    # Add badges based on days smoke-free
    if days_smoke_free >= 1:
        dashboard_data["badges"].append({"id": 1, "name": "First Day", "icon": "🎉"})
    if days_smoke_free >= 7:
        dashboard_data["badges"].append({"id": 2, "name": "One Week", "icon": "🏆"})
    if days_smoke_free >= 30:
        dashboard_data["badges"].append({"id": 3, "name": "One Month", "icon": "🌟"})
    
    return dashboard_data

def get_user_quit_date(user_id):
    """
    Get user quit date from plan.
    
    Args:
        user_id (str): The user ID
        
    Returns:
        str: The quit date
    """
    try:
        # Path to user plan file
        plan_path = f"{USER_DATA_DIR}/{user_id}_plan.json"
        
        # Check if plan file exists
        if os.path.exists(plan_path):
            # Load plan data
            with open(plan_path, "r") as f:
                plan_data = json.load(f)
            
            # Return quit date
            return plan_data.get("quitDate")
    except Exception as e:
        print(f"Error getting user quit date: {str(e)}")
    
    return None

def get_progress_message(days_smoke_free):
    """
    Get progress message based on days smoke-free.
    
    Args:
        days_smoke_free (int): The days smoke-free
        
    Returns:
        str: The progress message
    """
    if days_smoke_free == 0:
        return "Start your journey to a smoke-free life today!"
    elif days_smoke_free < 3:
        return "You're in the early stages of quitting. Stay strong!"
    elif days_smoke_free < 7:
        return "You're making progress! The first week is the hardest."
    elif days_smoke_free < 14:
        return "You're doing great! Your body is starting to heal."
    elif days_smoke_free < 30:
        return "You're making excellent progress! Keep going!"
    else:
        return "Congratulations! You've reached a major milestone!"

def calculate_money_saved(days_smoke_free):
    """
    Calculate money saved based on days smoke-free.
    
    Args:
        days_smoke_free (int): The days smoke-free
        
    Returns:
        float: The money saved
    """
    # Average cost of a pack of cigarettes
    cost_per_pack = 8.00
    
    # Average number of packs per day
    packs_per_day = 1
    
    # Calculate money saved
    money_saved = days_smoke_free * cost_per_pack * packs_per_day
    
    return round(money_saved, 2)

def get_health_improvements(days_smoke_free):
    """
    Get health improvements based on days smoke-free.
    
    Args:
        days_smoke_free (int): The days smoke-free
        
    Returns:
        list: The health improvements
    """
    health_improvements = []
    
    if days_smoke_free >= 1:
        health_improvements.append("Blood pressure and heart rate normalizing")
    if days_smoke_free >= 2:
        health_improvements.append("Sense of taste and smell returning")
    if days_smoke_free >= 3:
        health_improvements.append("Breathing becoming easier")
    if days_smoke_free >= 7:
        health_improvements.append("Lung function improving")
    if days_smoke_free >= 14:
        health_improvements.append("Circulation improving")
    if days_smoke_free >= 30:
        health_improvements.append("Risk of heart disease decreasing")
    
    return health_improvements

# Mock dashboard data
def generate_mock_dashboard_data(user_id: str) -> Dict[str, Any]:
    """
    Generate mock dashboard data for a user.
    
    Args:
        user_id (str): The user ID
        
    Returns:
        Dict[str, Any]: The dashboard data
    """
    # Generate random data for testing
    days_smoke_free = random.randint(0, 30)
    money_saved = days_smoke_free * 8.0  # Assuming $8 per day
    cravings_resisted = random.randint(0, 50)
    cravings_smoked = random.randint(0, 10)
    
    # Generate random triggers
    triggers = ["Stress", "Social situations", "After meals", "Driving", "Coffee"]
    random.shuffle(triggers)
    top_triggers = triggers[:3]
    
    # Generate random coping strategies
    coping_strategies = ["Deep breathing", "Exercise", "Drinking water", "Distraction", "Meditation"]
    random.shuffle(coping_strategies)
    top_coping_strategies = coping_strategies[:3]
    
    # Generate random daily cravings data
    today = datetime.now()
    daily_cravings = []
    for i in range(7):
        date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        daily_cravings.append({
            "date": date,
            "cravings": random.randint(0, 10),
            "smoked": random.randint(0, 3)
        })
    
    # Generate random mood data
    moods = ["Happy", "Stressed", "Anxious", "Calm", "Irritable"]
    mood_data = []
    for i in range(7):
        date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        mood_data.append({
            "date": date,
            "mood": random.choice(moods)
        })
    
    return {
        "user_id": user_id,
        "days_smoke_free": days_smoke_free,
        "money_saved": money_saved,
        "cravings_resisted": cravings_resisted,
        "cravings_smoked": cravings_smoked,
        "top_triggers": top_triggers,
        "top_coping_strategies": top_coping_strategies,
        "daily_cravings": daily_cravings,
        "mood_data": mood_data
    }

async def get_dashboard_data(user_id: str) -> Dict[str, Any]:
    """
    Get dashboard data for a user.
    
    Args:
        user_id (str): The user ID
        
    Returns:
        Dict[str, Any]: The dashboard data
    """
    # For testing purposes, return mock data
    if os.getenv("USE_MOCK_RESPONSES", "true").lower() == "true":
        return generate_mock_dashboard_data(user_id)
    
    # In a real implementation, this would fetch data from a database
    # For now, we'll just return the mock data
    return generate_mock_dashboard_data(user_id)

async def get_user_stats(user_id: str) -> Dict[str, Any]:
    """
    Get statistics for a user.
    
    Args:
        user_id (str): The user ID
        
    Returns:
        Dict[str, Any]: The user statistics
    """
    # For testing purposes, return mock data
    if os.getenv("USE_MOCK_RESPONSES", "true").lower() == "true":
        dashboard_data = generate_mock_dashboard_data(user_id)
        return {
            "user_id": user_id,
            "days_smoke_free": dashboard_data["days_smoke_free"],
            "money_saved": dashboard_data["money_saved"],
            "cravings_resisted": dashboard_data["cravings_resisted"],
            "cravings_smoked": dashboard_data["cravings_smoked"],
            "success_rate": round(dashboard_data["cravings_resisted"] / (dashboard_data["cravings_resisted"] + dashboard_data["cravings_smoked"]) * 100, 2) if (dashboard_data["cravings_resisted"] + dashboard_data["cravings_smoked"]) > 0 else 0
        }
    
    # In a real implementation, this would fetch data from a database
    # For now, we'll just return the mock data
    dashboard_data = generate_mock_dashboard_data(user_id)
    return {
        "user_id": user_id,
        "days_smoke_free": dashboard_data["days_smoke_free"],
        "money_saved": dashboard_data["money_saved"],
        "cravings_resisted": dashboard_data["cravings_resisted"],
        "cravings_smoked": dashboard_data["cravings_smoked"],
        "success_rate": round(dashboard_data["cravings_resisted"] / (dashboard_data["cravings_resisted"] + dashboard_data["cravings_smoked"]) * 100, 2) if (dashboard_data["cravings_resisted"] + dashboard_data["cravings_smoked"]) > 0 else 0
    } 