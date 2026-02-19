from pydantic import BaseModel
from typing import Optional

class Location(BaseModel):
    latitude: float
    longitude: float

class Resource(BaseModel):
    name: str
    description: str
    address: str
    phone: Optional[str] = None
    website: Optional[str] = None
    distance_km: Optional[float] = None 