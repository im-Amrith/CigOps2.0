from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from services import chat as chat_service
from services import groq_service
from services.voice import synthesize_speech, get_audio_url
from datetime import datetime

router = APIRouter()

class ChatMessage(BaseModel):
    user_id: str
    message: str
    timestamp: str = None
    sender: str = "user"  # 'user' or 'bot'
    context: Dict[str, Any] = {}

@router.post("/chat")
async def chat_endpoint(msg: ChatMessage):
    """
    Send a message to the chatbot, get a response, and store both in chat history.
    """
    # Save user message
    user_msg = msg.dict()
    user_msg["timestamp"] = user_msg["timestamp"] or datetime.utcnow().isoformat()
    user_msg["sender"] = "user"
    chat_service.save_message(msg.user_id, user_msg)

    # Prepare context with user_id for groq_service
    context = msg.context or {}
    context["user_id"] = msg.user_id  # Ensure user_id is always in context
    
    # Get bot response using Groq API
    response_text = await groq_service.query_groq(msg.message, context)
    
    # Generate audio response only if requested
    audio_url = None
    if msg.context.get("generate_audio", False):
        audio_path = synthesize_speech(response_text)
        if audio_path:
            audio_url = get_audio_url(audio_path)
    
    bot_msg = {
        "user_id": msg.user_id,
        "message": response_text,
        "timestamp": datetime.utcnow().isoformat(),
        "sender": "bot",
        "context": context
    }
    chat_service.save_message(msg.user_id, bot_msg)
    return {
        "response": response_text, 
        "timestamp": bot_msg["timestamp"],
        "audio_url": audio_url
    }

@router.get("/chat/history/{user_id}")
async def chat_history(user_id: str):
    """
    Get chat history for a user.
    """
    try:
        history = chat_service.get_history(user_id)
        return {"history": history}
    except Exception as e:
        import logging
        logging.error(f"Error retrieving chat history for {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving chat history: {str(e)}") 