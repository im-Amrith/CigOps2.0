from fastapi import APIRouter, HTTPException
from models import UserRequest
from services import user

router = APIRouter()

@router.post("/users")
async def create_user(user_data: UserRequest):
    """
    Create a new user.
    
    Args:
        user_data (UserRequest): The user data
        
    Returns:
        dict: The created user
    """
    try:
        # Convert Pydantic model to dict
        user_dict = user_data.dict()
        
        # Create user
        created_user = await user.create_user(user_dict)
        
        return created_user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@router.get("/users/{user_id}")
async def get_user(user_id: str):
    """
    Get a user by ID.
    
    Args:
        user_id (str): The user ID
        
    Returns:
        dict: The user data
    """
    try:
        user_data = await user.get_user(user_id)
        if user_data:
            return user_data
        else:
            raise HTTPException(status_code=404, detail=f"User not found: {user_id}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting user: {str(e)}")

@router.put("/users/{user_id}")
async def update_user(user_id: str, user_data: UserRequest):
    """
    Update a user.
    
    Args:
        user_id (str): The user ID
        user_data (UserRequest): The updated user data
        
    Returns:
        dict: The updated user
    """
    try:
        # Convert Pydantic model to dict
        user_dict = user_data.dict()
        
        # Update user
        updated_user = await user.update_user(user_id, user_dict)
        
        if updated_user:
            return updated_user
        else:
            raise HTTPException(status_code=404, detail=f"User not found: {user_id}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")

@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """
    Delete a user.
    
    Args:
        user_id (str): The user ID
        
    Returns:
        dict: Success message
    """
    try:
        success = await user.delete_user(user_id)
        if success:
            return {"message": f"User deleted: {user_id}"}
        else:
            raise HTTPException(status_code=404, detail=f"User not found: {user_id}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting user: {str(e)}")

@router.get("/users")
async def get_all_users():
    """
    Get all users.
    
    Returns:
        list: All users
    """
    try:
        users = await user.get_all_users()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting all users: {str(e)}") 