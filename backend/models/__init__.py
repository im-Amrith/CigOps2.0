"""
Models package for the nicotine recovery application.
This package contains all the data models used across the application.
"""

from .resources import Location, Resource
from .query import QueryRequest, QueryResponse
from .user import UserContext, UserRequest
from .calm import CalmRequest, CalmResponse
from .plan import PlanRequest, PlanResponse
from .craving import CravingRequest, CravingResponse
from .voice_chat import VoiceChatRequest, VoiceChatResponse
from .game import GameProgress, Achievement 