from pydantic import BaseModel

class DestinationCreate(BaseModel):
    destination_name: str
    state: str
    country: str
    latitude: float
    longitude: float
    category: str
    description: str

class DestinationResponse(DestinationCreate):
    id: str