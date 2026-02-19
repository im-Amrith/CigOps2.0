from fastapi import APIRouter, HTTPException
from models import CalmRequest, CalmResponse
from services.voice import synthesize_speech, get_audio_url
from services import groq_service
import random
import json
import os
from datetime import datetime

router = APIRouter()

@router.post("/voice/calm", response_model=CalmResponse)
async def calm_voice_endpoint(request: CalmRequest):
    """
    Endpoint for generating a calming voice response.
    Receives user context and returns an audio URL and interactive elements.
    """
    try:
        # Extract user context
        context = request.context.dict() if request.context else {}
        user_id = request.user_id
        emergency_mode = request.emergency_mode
        voice_type = request.voice_type
        
        # Determine if this is an emergency situation
        if emergency_mode:
            # Generate an emergency calming message
            message = generate_emergency_message(context)
            voice_type = "emergency"
        else:
            # Generate a calming message based on context
            message = generate_calm_message(context)
        
        # Generate audio response
        audio_path = synthesize_speech(message, voice_type=voice_type)
        audio_url = get_audio_url(audio_path)
        
        # Generate breathing exercise if needed
        breathing_exercise = generate_breathing_exercise(context)
        
        # Generate suggested actions
        suggested_actions = generate_suggested_actions(context)
        
        # Generate follow-up questions
        follow_up_questions = generate_follow_up_questions(context)
        
        # Log the interaction
        log_calm_interaction(user_id, context, message, emergency_mode)
        
        return CalmResponse(
            message=message,
            audio_url=audio_url,
            breathing_exercise=breathing_exercise,
            suggested_actions=suggested_actions,
            follow_up_questions=follow_up_questions
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating calm voice: {str(e)}")

@router.post("/voice/chat")
async def voice_chat_endpoint(request: CalmRequest):
    """
    Endpoint for interactive voice chat with the AI assistant.
    Receives user context and message, returns AI-generated response with audio.
    """
    try:
        # Extract user context and message
        context = request.context.dict() if request.context else {}
        user_id = request.user_id
        voice_type = request.voice_type
        
        # Get response from Groq RAG
        response = await groq_service.query_groq("I need help with a craving. Can you talk to me?", context)
        
        # Generate audio response
        audio_path = synthesize_speech(response, voice_type=voice_type)
        audio_url = get_audio_url(audio_path)
        
        # Generate suggested actions
        suggested_actions = generate_suggested_actions(context)
        
        # Generate follow-up questions
        follow_up_questions = generate_follow_up_questions(context)
        
        # Log the interaction
        log_calm_interaction(user_id, context, response, False)
        
        return {
            "response": response,
            "audio_url": audio_url,
            "suggested_actions": suggested_actions,
            "follow_up_questions": follow_up_questions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in voice chat: {str(e)}")

def generate_calm_message(context):
    """
    Generate a calming message based on user context.
    
    Args:
        context (dict): The user context
        
    Returns:
        str: The calming message
    """
    # Extract relevant context
    mood = context.get("mood", "neutral")
    cravings = context.get("cravings", 5)
    days_smoke_free = context.get("days_smoke_free", 0)
    
    # Generate message based on context
    if cravings >= 8:
        return "Take a deep breath. This craving will pass. Remember why you're quitting. You're stronger than this craving. Try drinking some water or going for a short walk."
    elif cravings >= 5:
        return "You're doing great. This craving is temporary. Focus on your breathing. Inhale for 4 counts, hold for 4, exhale for 4. You've got this."
    elif days_smoke_free > 7:
        return f"Congratulations on {days_smoke_free} days smoke-free! Your body is healing. Keep up the great work. You're becoming a non-smoker every day."
    else:
        return "Remember your reasons for quitting. Every craving you resist makes you stronger. You're on the right path. Keep going."

def generate_emergency_message(context):
    """
    Generate an emergency calming message.
    
    Args:
        context (dict): The user context
        
    Returns:
        str: The emergency calming message
    """
    return "I'm here with you right now. Take a deep breath. This feeling will pass. You're not alone in this. Let's focus on your breathing together. Inhale slowly for 4 counts, hold for 4, exhale for 4. You're stronger than this craving. Remember why you're quitting. You've got this."

def generate_breathing_exercise(context):
    """
    Generate a breathing exercise based on user context.
    
    Args:
        context (dict): The user context
        
    Returns:
        dict: The breathing exercise
    """
    # Extract relevant context
    cravings = context.get("cravings", 5)
    
    # Generate breathing exercise based on context
    if cravings >= 8:
        return {
            "name": "4-7-8 Breathing",
            "description": "Inhale for 4 counts, hold for 7, exhale for 8",
            "duration": 60,
            "steps": [
                "Inhale through your nose for 4 counts",
                "Hold your breath for 7 counts",
                "Exhale through your mouth for 8 counts",
                "Repeat 5 times"
            ]
        }
    else:
        return {
            "name": "Box Breathing",
            "description": "Inhale, hold, exhale, hold - each for 4 counts",
            "duration": 60,
            "steps": [
                "Inhale through your nose for 4 counts",
                "Hold your breath for 4 counts",
                "Exhale through your mouth for 4 counts",
                "Hold your breath for 4 counts",
                "Repeat 5 times"
            ]
        }

def generate_suggested_actions(context):
    """
    Generate suggested actions based on user context.
    
    Args:
        context (dict): The user context
        
    Returns:
        list: The suggested actions
    """
    # Extract relevant context
    cravings = context.get("cravings", 5)
    
    # Generate suggested actions based on context
    if cravings >= 8:
        return [
            {"id": "drink_water", "name": "Drink a glass of water", "icon": "water"},
            {"id": "take_walk", "name": "Take a short walk", "icon": "walk"},
            {"id": "call_friend", "name": "Call a friend", "icon": "phone"},
            {"id": "distraction", "name": "Find a distraction", "icon": "distraction"}
        ]
    else:
        return [
            {"id": "deep_breathing", "name": "Practice deep breathing", "icon": "breath"},
            {"id": "meditation", "name": "Try a quick meditation", "icon": "meditation"},
            {"id": "journal", "name": "Write in your journal", "icon": "journal"},
            {"id": "reward", "name": "Reward yourself", "icon": "reward"}
        ]

def generate_follow_up_questions(context):
    """
    Generate follow-up questions based on user context.
    
    Args:
        context (dict): The user context
        
    Returns:
        list: The follow-up questions
    """
    # Extract relevant context
    cravings = context.get("cravings", 5)
    
    # Generate follow-up questions based on context
    if cravings >= 8:
        return [
            "How are you feeling now?",
            "What triggered this craving?",
            "Would you like to talk more about it?",
            "What's your plan for the next hour?"
        ]
    else:
        return [
            "How are you feeling today?",
            "What's been helping you stay smoke-free?",
            "What challenges are you facing?",
            "What are your goals for today?"
        ]

def log_calm_interaction(user_id, context, message, emergency_mode):
    """
    Log the calm interaction.
    
    Args:
        user_id (str): The user ID
        context (dict): The user context
        message (str): The message
        emergency_mode (bool): Whether this was an emergency
    """
    try:
        # Create logs directory if it doesn't exist
        os.makedirs("data/logs", exist_ok=True)
        
        # Log the interaction
        log_entry = {
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "context": context,
            "message": message,
            "emergency_mode": emergency_mode
        }
        
        # Append to log file
        with open(f"data/logs/calm_interactions.json", "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        print(f"Error logging calm interaction: {str(e)}") 