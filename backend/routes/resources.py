from fastapi import APIRouter, Query
from typing import List, Optional
from services import resources as resource_service
from models import Location, Resource

router = APIRouter(prefix="/resources", tags=["resources"])

@router.post("/search", response_model=List[Resource])
async def search_resources(location: Location, query: str = Query(None)):
    # Implement logic to search for resources based on location and query
    # Return synthetic data for now
    print(f"Searching resources near {location.latitude}, {location.longitude} for query: {query}")
    synthetic_results = await resource_service.search_resources_synthetic(location, query)
    return synthetic_results 