from fastapi import APIRouter
from models import QueryRequest
from services import groq_service

router = APIRouter()

@router.post("/query")
async def query_endpoint(request: QueryRequest):
    response = await groq_service.query_groq(request.message, request.context.dict())
    return {"response": response}