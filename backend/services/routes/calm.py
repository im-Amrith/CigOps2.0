from fastapi import APIRouter
from models import CalmRequest
from services.elevenlabs import trigger_elevenlabs_voice

router = APIRouter()

@router.post("/calm")
async def calm_endpoint(request: CalmRequest):
    audio_url = await trigger_elevenlabs_voice(request.context.dict())
    return {"audioUrl": audio_url}