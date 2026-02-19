import requests
import uuid
import os
from fastapi import HTTPException
import logging
from dotenv import load_dotenv
from datetime import datetime
import httpx

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get API keys from environment variables
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID")

# Voice IDs for different conversation modes
VOICE_IDS = {
    "default": os.getenv("ELEVENLABS_VOICE_ID"),
    "coach": os.getenv("ELEVENLABS_COACH_VOICE_ID"),
    "emergency": os.getenv("ELEVENLABS_EMERGENCY_VOICE_ID"),
    "calming": os.getenv("ELEVENLABS_CALMING_VOICE_ID")
}

# Voice settings for different conversation modes
VOICE_SETTINGS = {
    "default": {
        "stability": 0.5,
        "similarity_boost": 0.75,
        "style": 0.0,
        "use_speaker_boost": True
    },
    "coach": {
        "stability": 0.7,
        "similarity_boost": 0.8,
        "style": 0.3,
        "use_speaker_boost": True
    },
    "emergency": {
        "stability": 0.9,
        "similarity_boost": 0.9,
        "style": 0.5,
        "use_speaker_boost": True
    },
    "calming": {
        "stability": 0.8,
        "similarity_boost": 0.7,
        "style": 0.2,
        "use_speaker_boost": True
    }
}

def synthesize_speech(text, voice_type="default"):
    """
    Synthesize speech from text using ElevenLabs API.
    
    Args:
        text (str): The text to synthesize
        voice_type (str): The type of voice to use (default, coach, emergency, calming)
        
    Returns:
        str: The path to the generated audio file
    """
    # Check if API key is configured
    if not ELEVENLABS_API_KEY:
        logger.error("ElevenLabs API key not configured")
        return None
    
    # Get voice ID and settings for the specified voice type
    voice_id = VOICE_IDS.get(voice_type, VOICE_IDS["default"])
    
    # If no voice ID is configured, use the default one
    if not voice_id:
        voice_id = ELEVENLABS_VOICE_ID
    
    if not voice_id:
        logger.error("No ElevenLabs voice ID configured")
        return None
        
    voice_settings = VOICE_SETTINGS.get(voice_type, VOICE_SETTINGS["default"])
    
    # Create static directory if it doesn't exist
    os.makedirs("static/audio", exist_ok=True)
    
    # Generate a unique filename
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    filename = f"static/audio/speech_{timestamp}_{unique_id}.mp3"
    
    logger.info(f"Synthesizing speech for text: {text[:50]}... using voice_id: {voice_id}")
    
    # Prepare the request
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": voice_settings
    }
    
    try:
        # Make the request
        response = requests.post(url, json=data, headers=headers, timeout=30)
        
        # Check if the request was successful
        if response.status_code == 200:
            # Save the audio file
            with open(filename, "wb") as f:
                f.write(response.content)
            logger.info(f"Successfully synthesized speech to {filename}")
            return filename
        else:
            # Log the error
            logger.error(f"Error synthesizing speech: {response.status_code} - {response.text}")
            return None
    except requests.exceptions.RequestException as e:
        logger.error(f"Request exception during speech synthesis: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error during speech synthesis: {str(e)}")
        return None
        return filename
    else:
        # Log the error
        print(f"Error synthesizing speech: {response.status_code} - {response.text}")
        return None

def get_audio_url(audio_path):
    """
    Get the URL for an audio file.
    
    Args:
        audio_path (str): The path to the audio file
        
    Returns:
        str: The URL for the audio file
    """
    if audio_path is None:
        return None
    
    # Extract the filename from the path
    filename = os.path.basename(audio_path)
    
    # Return the URL
    return f"/static/audio/{filename}"

def get_available_voices():
    """
    Get a list of available voices from ElevenLabs API.
    
    Returns:
        list: A list of available voices
    """
    # Prepare the request
    url = "https://api.elevenlabs.io/v1/voices"
    headers = {
        "Accept": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    
    # Make the request
    response = requests.get(url, headers=headers)
    
    # Check if the request was successful
    if response.status_code == 200:
        # Parse the response
        voices = response.json().get("voices", [])
        return voices
    else:
        # Log the error
        print(f"Error getting available voices: {response.status_code} - {response.text}")
        return []

def update_voice_settings(voice_id, settings):
    """
    Update the settings for a voice.
    
    Args:
        voice_id (str): The ID of the voice to update
        settings (dict): The new settings for the voice
        
    Returns:
        bool: True if the update was successful, False otherwise
    """
    # Prepare the request
    url = f"https://api.elevenlabs.io/v1/voices/{voice_id}/settings"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    
    # Make the request
    response = requests.post(url, json=settings, headers=headers)
    
    # Check if the request was successful
    if response.status_code == 200:
        return True
    else:
        # Log the error
        print(f"Error updating voice settings: {response.status_code} - {response.text}")
        return False

async def synthesize_speech_stream(text: str, voice_type: str = "default"):
    """
    Synthesize speech from text using ElevenLabs API and stream the audio.
    
    Args:
        text (str): The text to synthesize
        voice_type (str): The type of voice to use (default, coach, emergency, calming)
        
    Yields:
        bytes: Audio data chunks
    """
    # Check if API key is configured
    if not ELEVENLABS_API_KEY:
        logger.error("ElevenLabs API key not found.")
        yield b""
        return

    # Get voice ID and settings for the specified voice type
    voice_id = VOICE_IDS.get(voice_type, VOICE_IDS["default"])
    
    # If no voice ID is configured, use the default one
    if not voice_id:
        voice_id = ELEVENLABS_VOICE_ID
    
    if not voice_id:
        logger.error("No ElevenLabs voice ID configured")
        yield b""
        return
        
    voice_settings = VOICE_SETTINGS.get(voice_type, VOICE_SETTINGS["default"])

    # Prepare the request
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1", # Or another appropriate model
        "voice_settings": voice_settings,
        "optimize_streaming_latency": 4 # Optimize for lowest latency
    }
    
    logger.info(f"Attempting to stream speech for text: {text[:50]}... using voice_id: {voice_id}")

    # Make the streaming request
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", url, json=data, headers=headers) as response:
                response.raise_for_status() # Raise an exception for bad status codes
                logger.info("ElevenLabs streaming response received.")
                async for chunk in response.aiter_bytes():
                    yield chunk
        logger.info("ElevenLabs streaming complete.")
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP status error during streaming: {e.response.status_code} - {e.response.text}")
        yield b""
    except httpx.RequestError as e:
        logger.error(f"HTTP request failed: {e}")
        yield b""
    except Exception as e:
        logger.error(f"Error during ElevenLabs streaming: {e}")
        yield b"" 