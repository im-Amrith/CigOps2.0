import os
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Path to user data directory
USER_DATA_DIR = os.getenv("USER_DATA_DIR", "data/users")

async def get_user_plan(user_id):
    """
    Get user quit plan.
    
    Args:
        user_id (str): The user ID
        
    Returns:
        dict: The quit plan
    """
    # Directly return default/synthetic data for MVP
    return create_default_plan()

async def update_user_plan(user_id, plan_data):
    """
    Update user quit plan.
    
    Args:
        user_id (str): The user ID
        plan_data (dict): The updated plan data
        
    Returns:
        dict: The updated plan
    """
    try:
        # Create user data directory if it doesn't exist
        os.makedirs(USER_DATA_DIR, exist_ok=True)
        
        # Path to user plan file
        plan_path = f"{USER_DATA_DIR}/{user_id}_plan.json"
        
        # Extract the actual plan data from the request
        # The frontend sends a PlanRequest object with user_id, context, plan_type, and plan data
        plan_content = {
            "quitDate": plan_data.get("quitDate"),
            "triggers": plan_data.get("triggers", []),
            "copingStrategies": plan_data.get("copingStrategies", []),
            "supportPeople": plan_data.get("supportPeople", []),
            "rewards": plan_data.get("rewards", [])
        }
        
        # Save plan data
        with open(plan_path, "w") as f:
            json.dump(plan_content, f, indent=2)
        
        return plan_content
    except Exception as e:
        print(f"Error updating user plan: {str(e)}")
        raise e

def create_default_plan():
    """
    Create default quit plan.
    
    Returns:
        dict: The default quit plan
    """
    # Get current date
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    # Create default plan data
    plan_data = {
        "quitDate": current_date,
        "triggers": [
            "Stress at work",
            "After meals",
            "Social situations",
            "Driving",
            "Morning coffee"
        ],
        "copingStrategies": [
            "Deep breathing exercises",
            "Going for a walk",
            "Drinking water",
            "Calling a support person",
            "Using nicotine gum when needed"
        ],
        "supportPeople": [
            "John (Friend)",
            "Sarah (Sister)",
            "Dr. Smith (Doctor)",
            "Quit Smoking Support Group"
        ],
        "rewards": [
            "New pair of shoes after 1 week",
            "Massage after 1 month",
            "Weekend getaway after 3 months"
        ]
    }
    
    return plan_data 