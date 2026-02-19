import os
import json
import logging
from datetime import datetime
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Get the absolute path to the backend directory
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHAT_HISTORY_DIR = os.getenv("CHAT_HISTORY_DIR", os.path.join(BACKEND_DIR, "data", "chat_history"))

# Ensure directory exists
try:
    os.makedirs(CHAT_HISTORY_DIR, exist_ok=True)
    logger.info(f"Chat history directory: {CHAT_HISTORY_DIR}")
except Exception as e:
    logger.error(f"Error creating chat history directory: {e}")

def get_history_path(user_id: str) -> str:
    return os.path.join(CHAT_HISTORY_DIR, f"{user_id}.json")

def save_message(user_id: str, message: Dict[str, Any]):
    try:
        # Ensure directory exists
        os.makedirs(CHAT_HISTORY_DIR, exist_ok=True)
        
        path = get_history_path(user_id)
        history = []
        
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    history = json.load(f)
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON in {path}, starting with empty history")
                history = []
        
        history.append(message)
        
        with open(path, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)
        
        logger.info(f"Saved message for user {user_id}")
    except Exception as e:
        logger.error(f"Error saving message for user {user_id}: {e}")
        raise

def get_history(user_id: str) -> List[Dict[str, Any]]:
    try:
        # Ensure directory exists
        os.makedirs(CHAT_HISTORY_DIR, exist_ok=True)
        
        path = get_history_path(user_id)
        
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    history = json.load(f)
                logger.info(f"Retrieved {len(history)} messages for user {user_id}")
                return history
            except json.JSONDecodeError:
                logger.warning(f"Invalid JSON in {path}, returning empty history")
                return []
        
        logger.info(f"No history file found for user {user_id}, returning empty history")
        return []
    except Exception as e:
        logger.error(f"Error getting history for user {user_id}: {e}")
        return [] 