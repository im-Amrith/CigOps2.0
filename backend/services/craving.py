import os
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Path to user data directory
USER_DATA_DIR = os.getenv("USER_DATA_DIR", "data/users")

async def log_craving(user_id, craving_data):
    """
    Log a craving for a user.
    
    Args:
        user_id (str): The user ID
        craving_data (dict): The craving data
        
    Returns:
        dict: The logged craving
    """
    try:
        # Create user data directory if it doesn't exist
        os.makedirs(USER_DATA_DIR, exist_ok=True)
        
        # Path to user cravings file
        cravings_path = f"{USER_DATA_DIR}/{user_id}_cravings.json"
        
        # Add timestamp if not provided
        if "timestamp" not in craving_data:
            craving_data["timestamp"] = datetime.now().isoformat()
        
        # Add ID if not provided
        if "id" not in craving_data:
            craving_data["id"] = f"craving_{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Load existing cravings or create new list
        if os.path.exists(cravings_path):
            with open(cravings_path, "r") as f:
                cravings = json.load(f)
        else:
            cravings = []
        
        # Add new craving
        cravings.append(craving_data)
        
        # Save updated cravings
        with open(cravings_path, "w") as f:
            json.dump(cravings, f, indent=2)
        
        return craving_data
    except Exception as e:
        print(f"Error logging craving: {str(e)}")
        raise e

async def get_cravings(user_id, limit=10):
    """
    Get user's recent cravings.
    
    Args:
        user_id (str): The user ID
        limit (int): Maximum number of cravings to return
        
    Returns:
        list: The user's recent cravings
    """
    try:
        # Path to user cravings file
        cravings_path = f"{USER_DATA_DIR}/{user_id}_cravings.json"
        
        # Check if cravings file exists
        if os.path.exists(cravings_path):
            # Load cravings data
            with open(cravings_path, "r") as f:
                cravings = json.load(f)
            
            # Sort by timestamp (newest first)
            cravings.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
            
            # Limit the number of cravings
            return cravings[:limit]
        else:
            # Return empty list if no cravings file
            return []
    except Exception as e:
        print(f"Error getting cravings: {str(e)}")
        return []

async def get_craving_stats(user_id):
    """
    Get user's craving statistics.
    
    Args:
        user_id (str): The user ID
        
    Returns:
        dict: The user's craving statistics
    """
    try:
        # Get all cravings
        cravings = await get_cravings(user_id, limit=1000)
        
        # Calculate statistics
        total_cravings = len(cravings)
        
        # Count triggers
        triggers = {}
        for craving in cravings:
            trigger = craving.get("trigger", "Unknown")
            triggers[trigger] = triggers.get(trigger, 0) + 1
        
        # Count intensity levels
        intensities = {
            "low": 0,
            "medium": 0,
            "high": 0
        }
        for craving in cravings:
            intensity = craving.get("intensity", "medium").lower()
            if intensity in intensities:
                intensities[intensity] += 1
        
        # Count coping strategies used
        coping_strategies = {}
        for craving in cravings:
            strategy = craving.get("copingStrategy", "None")
            coping_strategies[strategy] = coping_strategies.get(strategy, 0) + 1
        
        # Calculate success rate (cravings where user didn't smoke)
        successful_cravings = sum(1 for c in cravings if not c.get("smoked", False))
        success_rate = (successful_cravings / total_cravings * 100) if total_cravings > 0 else 0
        
        # Create stats object
        stats = {
            "totalCravings": total_cravings,
            "triggers": triggers,
            "intensities": intensities,
            "copingStrategies": coping_strategies,
            "successRate": round(success_rate, 1)
        }
        
        return stats
    except Exception as e:
        print(f"Error getting craving stats: {str(e)}")
        return {
            "totalCravings": 0,
            "triggers": {},
            "intensities": {"low": 0, "medium": 0, "high": 0},
            "copingStrategies": {},
            "successRate": 0
        } 