import os
import json
import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Path to user data directory
USER_DATA_DIR = os.getenv("USER_DATA_DIR", "data/users")

async def create_user(user_data):
    """
    Create a new user.
    
    Args:
        user_data (dict): The user data
        
    Returns:
        dict: The created user
    """
    try:
        # Create user data directory if it doesn't exist
        os.makedirs(USER_DATA_DIR, exist_ok=True)
        
        # Generate user ID if not provided
        if "id" not in user_data:
            user_data["id"] = str(uuid.uuid4())
        
        # Add creation timestamp
        user_data["createdAt"] = datetime.now().isoformat()
        
        # Path to user file
        user_path = f"{USER_DATA_DIR}/{user_data['id']}.json"
        
        # Save user data
        with open(user_path, "w") as f:
            json.dump(user_data, f, indent=2)
        
        return user_data
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        raise e

async def get_user(user_id):
    """
    Get a user by ID.
    
    Args:
        user_id (str): The user ID
        
    Returns:
        dict: The user data
    """
    try:
        # Path to user file
        user_path = f"{USER_DATA_DIR}/{user_id}.json"
        
        # Check if user file exists
        if os.path.exists(user_path):
            # Load user data
            with open(user_path, "r") as f:
                user_data = json.load(f)
            
            return user_data
        else:
            # Return None if user not found
            return None
    except Exception as e:
        print(f"Error getting user: {str(e)}")
        return None

async def update_user(user_id, user_data):
    """
    Update a user.
    
    Args:
        user_id (str): The user ID
        user_data (dict): The updated user data
        
    Returns:
        dict: The updated user
    """
    try:
        # Path to user file
        user_path = f"{USER_DATA_DIR}/{user_id}.json"
        
        # Check if user file exists
        if os.path.exists(user_path):
            # Load existing user data
            with open(user_path, "r") as f:
                existing_data = json.load(f)
            
            # Update user data
            existing_data.update(user_data)
            
            # Add update timestamp
            existing_data["updatedAt"] = datetime.now().isoformat()
            
            # Save updated user data
            with open(user_path, "w") as f:
                json.dump(existing_data, f, indent=2)
            
            return existing_data
        else:
            # Return None if user not found
            return None
    except Exception as e:
        print(f"Error updating user: {str(e)}")
        raise e

async def delete_user(user_id):
    """
    Delete a user.
    
    Args:
        user_id (str): The user ID
        
    Returns:
        bool: True if user was deleted, False otherwise
    """
    try:
        # Path to user file
        user_path = f"{USER_DATA_DIR}/{user_id}.json"
        
        # Check if user file exists
        if os.path.exists(user_path):
            # Delete user file
            os.remove(user_path)
            
            # Also delete related files
            related_files = [
                f"{USER_DATA_DIR}/{user_id}_plan.json",
                f"{USER_DATA_DIR}/{user_id}_cravings.json",
                f"{USER_DATA_DIR}/{user_id}_dashboard.json"
            ]
            
            for file_path in related_files:
                if os.path.exists(file_path):
                    os.remove(file_path)
            
            return True
        else:
            # Return False if user not found
            return False
    except Exception as e:
        print(f"Error deleting user: {str(e)}")
        return False

async def get_all_users():
    """
    Get all users.
    
    Returns:
        list: All users
    """
    try:
        # Check if user directory exists
        if not os.path.exists(USER_DATA_DIR):
            return []
        
        # Get all user files
        user_files = [f for f in os.listdir(USER_DATA_DIR) if f.endswith(".json") and not f.endswith("_plan.json") and not f.endswith("_cravings.json") and not f.endswith("_dashboard.json")]
        
        # Load user data
        users = []
        for user_file in user_files:
            with open(f"{USER_DATA_DIR}/{user_file}", "r") as f:
                user_data = json.load(f)
                users.append(user_data)
        
        return users
    except Exception as e:
        print(f"Error getting all users: {str(e)}")
        return [] 