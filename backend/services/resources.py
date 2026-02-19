from typing import List
from models import Location, Resource
import random

async def search_resources_synthetic(location: Location, query: str = None) -> List[Resource]:
    """Synthetically search for nearby resources based on location and query."""
    print(f"Synthetically searching resources near {location.latitude}, {location.longitude} for query: {query or 'all'}")

    synthetic_data = [
        Resource(
            name="City General Hospital Cessation Program",
            description="Comprehensive smoking cessation program offered by the hospital.",
            address="123 Main St, Anytown, CA 90210",
            phone="(555) 123-4567",
            website="http://www.citygeneralhospital.com/cessation",
            distance_km=random.uniform(1, 10)
        ),
        Resource(
            name="Community Counseling Center",
            description="Offers individual and group counseling for addiction recovery.",
            address="456 Oak Ave, Anytown, CA 90210",
            phone="(555) 987-6543",
            website="http://www.communitycounseling.org",
            distance_km=random.uniform(1, 10)
        ),
        Resource(
            name="Local Support Group (Nicotine Anonymous)",
            description="Weekly peer support meetings.",
            address="789 Pine Ln, Anytown, CA 90210",
            phone=None,
            website="http://www.nicotine-anonymous.org/meetings",
            distance_km=random.uniform(1, 10)
        ),
         Resource(
            name="Anytown Pharmacy",
            description="Provides NRT products and consultations.",
            address="101 Elm St, Anytown, CA 90210",
            phone="(555) 555-1212",
            website=None,
            distance_km=random.uniform(1, 10)
        ),
    ]

    # Simple synthetic filtering based on query (case-insensitive)
    if query:
        filtered_data = [res for res in synthetic_data if query.lower() in res.name.lower() or query.lower() in res.description.lower()]
    else:
        filtered_data = synthetic_data
        
    # Sort by distance (synthetic)
    sorted_data = sorted(filtered_data, key=lambda x: x.distance_km)

    return sorted_data 