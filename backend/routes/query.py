from fastapi import APIRouter, HTTPException
from models import QueryRequest, QueryResponse
from services import groq_service
from services.voice import synthesize_speech, get_audio_url
import json
import os
from datetime import datetime

router = APIRouter()

@router.post("/chat", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest):
    """
    Endpoint for the nicotine recovery chatbot.
    Receives user context and message, returns AI-generated response with audio.
    """
    try:
        # Extract user context and message
        context = request.context.dict() if request.context else {}
        context["user_id"] = request.user_id
        message = request.message
        voice_enabled = request.voice_enabled
        conversation_mode = request.conversation_mode
        
        # Get response from Groq RAG
        response = await groq_service.query_groq(message, context)
        
        # Always generate audio response for chat messages
        # Determine voice type based on conversation mode
        voice_type = "default"
        if conversation_mode == "coaching":
            voice_type = "coach"
        elif conversation_mode == "emergency":
            voice_type = "emergency"
        
        audio_path = synthesize_speech(response, voice_type=voice_type)
        audio_url = get_audio_url(audio_path)
        
        # Generate suggested actions
        suggested_actions = generate_suggested_actions(context, message)
        
        # Generate follow-up questions
        follow_up_questions = generate_follow_up_questions(context, message)
        
        # Detect emotion and craving
        emotion_detected = detect_emotion(message)
        craving_detected, craving_intensity = detect_craving(message)
        
        # Log the interaction
        log_query_interaction(request.user_id, context, message, response, True, conversation_mode)
        
        return QueryResponse(
            response=response,
            audio_url=audio_url,
            suggested_actions=suggested_actions,
            follow_up_questions=follow_up_questions,
            emotion_detected=emotion_detected,
            craving_detected=craving_detected,
            craving_intensity=craving_intensity
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

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

def detect_emotion(message):
    """
    Detect emotion in the message.
    
    Args:
        message (str): The user message
        
    Returns:
        str: The detected emotion
    """
    # Simple emotion detection based on keywords
    emotions = {
        "happy": ["happy", "joy", "excited", "great", "wonderful", "fantastic", "amazing"],
        "sad": ["sad", "depressed", "down", "unhappy", "miserable", "terrible", "awful"],
        "angry": ["angry", "mad", "furious", "annoyed", "irritated", "frustrated"],
        "anxious": ["anxious", "nervous", "worried", "stressed", "overwhelmed", "panicked"],
        "calm": ["calm", "relaxed", "peaceful", "serene", "tranquil", "content"]
    }
    
    message_lower = message.lower()
    for emotion, keywords in emotions.items():
        if any(keyword in message_lower for keyword in keywords):
            return emotion
    
    return None

def detect_craving(message):
    """
    Detect craving in the message.
    
    Args:
        message (str): The user message
        
    Returns:
        tuple: (craving_detected, craving_intensity)
    """
    # Craving keywords
    craving_keywords = ["craving", "urge", "want to smoke", "need a cigarette", "temptation"]
    
    # Intensity keywords
    intensity_keywords = {
        "high": ["really", "very", "extremely", "intense", "strong", "powerful", "overwhelming"],
        "medium": ["somewhat", "moderate", "fairly", "quite"],
        "low": ["slight", "mild", "little", "bit"]
    }
    
    message_lower = message.lower()
    
    # Check if craving is detected
    craving_detected = any(keyword in message_lower for keyword in craving_keywords)
    
    # Determine intensity if craving is detected
    craving_intensity = None
    if craving_detected:
        # Default to medium intensity
        craving_intensity = 5
        
        # Check for intensity keywords
        for intensity, keywords in intensity_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                if intensity == "high":
                    craving_intensity = 8
                elif intensity == "medium":
                    craving_intensity = 5
                elif intensity == "low":
                    craving_intensity = 3
    
    return craving_detected, craving_intensity

def log_query_interaction(user_id, context, message, response, voice_enabled, conversation_mode):
    """
    Log the query interaction.
    
    Args:
        user_id (str): The user ID
        context (dict): The user context
        message (str): The user message
        response (str): The assistant response
        voice_enabled (bool): Whether voice was enabled
        conversation_mode (str): The conversation mode
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
            "response": response,
            "voice_enabled": voice_enabled,
            "conversation_mode": conversation_mode
        }
        
        # Append to log file
        with open(f"data/logs/query_interactions.json", "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        print(f"Error logging query interaction: {str(e)}")

@router.get("/chat/history/{user_id}")
async def get_chat_history_endpoint(user_id: str):
    """
    Endpoint to get chat history for a user.
    """
    return get_chat_history(user_id) 