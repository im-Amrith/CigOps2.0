from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.responses import JSONResponse
from models import VoiceChatRequest, VoiceChatResponse
from services.voice import synthesize_speech, get_audio_url, synthesize_speech_stream
from services import groq_service
import json
import os
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/voice_chat")
async def voice_chat_endpoint(request: VoiceChatRequest):
    """
    Endpoint for the conversational AI voice chat (text response only).
    Receives transcribed text, processes it with AI, and returns text response.
    """
    try:
        user_id = request.user_id
        text = request.text
        context = request.context.dict() if request.context else {}
        context["user_id"] = user_id  # Ensure user_id is always in context
        conversation_history = request.conversation_history or []
        
        logger.info(f"Received voice chat request (text only) from user {user_id} with text: {text[:50]}...")

        # Get response from Groq AI (incorporating history)
        ai_response_text = await groq_service.query_groq_voice(context, text, conversation_history)
        logger.info(f"Groq generated text response: {ai_response_text[:50]}...")

        # Log the interaction
        log_voice_chat_interaction(user_id, context, text, ai_response_text, context.get("voice_type", "default"))

        # Return text response as JSON
        return JSONResponse(content={"response_text": ai_response_text})

    except HTTPException as e:
        logger.error(f"HTTP Exception in voice_chat_endpoint: {e.detail}")
        return JSONResponse(status_code=e.status_code, content={"detail": e.detail})
    except Exception as e:
        logger.error(f"Error in voice_chat_endpoint: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Internal server error: {str(e)}"})

@router.get("/voice/chat/history/{user_id}")
async def get_voice_chat_history(user_id: str, limit: int = 10):
    """
    Get voice chat history for a user.
    
    Args:
        user_id (str): The user ID
        limit (int): The maximum number of messages to return
        
    Returns:
        list: The voice chat history
    """
    try:
        # Create logs directory if it doesn't exist
        os.makedirs("data/logs", exist_ok=True)
        
        # Check if history file exists
        history_file = f"data/logs/voice_chat_{user_id}.json"
        if not os.path.exists(history_file):
            return []
        
        # Read history file
        with open(history_file, "r") as f:
            # Read lines and parse JSON, handling potential errors
            history = []
            for line in f:
                try:
                    history.append(json.loads(line))
                except json.JSONDecodeError:
                    logger.error(f"Skipping invalid JSON line in history for user {user_id}: {line.strip()}")
                    continue
        
        # Return limited history, reversing to get most recent first
        return history[-limit:]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting voice chat history: {str(e)}")

def generate_suggested_actions(context, message):
    """
    Generate suggested actions based on user context and message.
    
    Args:
        context (dict): The user context
        message (str): The user message
        
    Returns:
        list: The suggested actions
    """
    # Extract relevant context
    cravings = context.get("cravings", 5)
    
    # Check if message contains craving keywords
    craving_keywords = ["craving", "urge", "want to smoke", "need a cigarette", "temptation"]
    has_craving = any(keyword in message.lower() for keyword in craving_keywords)
    
    # Generate suggested actions based on context and message
    if has_craving or cravings >= 8:
        return [
            {"id": "breathing", "name": "Try a breathing exercise", "icon": "breath"},
            {"id": "distraction", "name": "Find a distraction", "icon": "distraction"},
            {"id": "call_friend", "name": "Call a friend", "icon": "phone"},
            {"id": "emergency", "name": "Emergency support", "icon": "emergency"}
        ]
    else:
        return [
            {"id": "journal", "name": "Write in your journal", "icon": "journal"},
            {"id": "meditation", "name": "Try a meditation", "icon": "meditation"},
            {"id": "exercise", "name": "Do some exercise", "icon": "exercise"},
            {"id": "reward", "name": "Reward yourself", "icon": "reward"}
        ]

def generate_follow_up_questions(context, message):
    """
    Generate follow-up questions based on user context and message.
    
    Args:
        context (dict): The user context
        message (str): The user message
        
    Returns:
        list: The follow-up questions
    """
    # Extract relevant context
    days_smoke_free = context.get("days_smoke_free", 0)
    
    # Check if message contains specific topics
    topics = {
        "craving": ["craving", "urge", "want to smoke", "need a cigarette", "temptation"],
        "stress": ["stress", "anxious", "worried", "nervous", "overwhelmed"],
        "motivation": ["motivation", "motivated", "inspired", "encouraged", "determined"],
        "relapse": ["relapse", "slipped", "failed", "gave in", "smoked"]
    }
    
    detected_topics = []
    for topic, keywords in topics.items():
        if any(keyword in message.lower() for keyword in keywords):
            detected_topics.append(topic)
    
    # Generate follow-up questions based on detected topics
    if "craving" in detected_topics:
        return [
            "What triggered this craving?",
            "How intense is the craving on a scale of 1-10?",
            "What coping strategies have worked for you in the past?",
            "Would you like to try a guided breathing exercise?"
        ]
    elif "stress" in detected_topics:
        return [
            "What's causing your stress right now?",
            "How are you feeling physically?",
            "What relaxation techniques have you tried?",
            "Would you like to talk about your stress in more detail?"
        ]
    elif "motivation" in detected_topics:
        return [
            "What's motivating you to stay smoke-free?",
            "How do you feel about your progress so far?",
            "What are your goals for the next week?",
            "How can I help you stay motivated?"
        ]
    elif "relapse" in detected_topics:
        return [
            "What led to the relapse?",
            "How are you feeling about it?",
            "What can you learn from this experience?",
            "What's your plan to get back on track?"
        ]
    else:
        # Default questions based on days smoke-free
        if days_smoke_free > 7:
            return [
                f"Congratulations on {days_smoke_free} days smoke-free! How are you feeling?",
                "What's been helping you stay smoke-free?",
                "What challenges are you facing?",
                "What are your goals for today?"
            ]
        else:
            return [
                "How are you feeling today?",
                "What's been the hardest part of quitting so far?",
                "What's been helping you stay smoke-free?",
                "What are your goals for today?"
            ]

def log_voice_chat_interaction(user_id, context, message, response, voice_type):
    """
    Log the voice chat interaction.
    
    Args:
        user_id (str): The user ID
        context (dict): The user context
        message (str): The user message (transcribed text)
        response (str): The assistant response (text)
        voice_type (str): The voice type used
    """
    try:
        # Create logs directory if it doesn't exist
        os.makedirs("data/logs", exist_ok=True)
        
        # Log the interaction
        log_entry = {
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "context": context,
            "user_message": message,
            "assistant_response": response,
            "voice_type": voice_type
        }
        
        # Append to log file
        history_file = f"data/logs/voice_chat_{user_id}.json"
        with open(history_file, "a") as f:
            f.write(json.dumps(log_entry) + "\n")
        logger.info(f"Logged voice chat interaction for user {user_id}.")
    except Exception as e:
        logger.error(f"Error logging voice chat interaction: {str(e)}")

# --- Audio Synthesis Endpoint (Streaming Audio) ---
@router.post("/synthesize_audio")
async def synthesize_audio_endpoint(request: Request):
    """
    Endpoint to synthesize audio from text and stream it back.
    Receives text and voice type, returns audio stream.
    """
    try:
        # Read the request body to get text and voice_type
        body = await request.json()
        text = body.get("text")
        voice_type = body.get("voice_type", "default")

        if not text:
            raise HTTPException(status_code=400, detail="No text provided for synthesis")
        
        logger.info(f"Received audio synthesis request for text: {text[:50]}...")

        # Stream audio response from ElevenLabs
        audio_stream = synthesize_speech_stream(text, voice_type=voice_type)

        return StreamingResponse(audio_stream, media_type="audio/mpeg")

    except HTTPException as e:
        logger.error(f"HTTP Exception in synthesize_audio_endpoint: {e.detail}")
        return JSONResponse(status_code=e.status_code, content={"detail": e.detail})
    except Exception as e:
        logger.error(f"Error in synthesize_audio_endpoint: {str(e)}")
        return JSONResponse(status_code=500, content={"detail": f"Internal server error: {str(e)}"}) 