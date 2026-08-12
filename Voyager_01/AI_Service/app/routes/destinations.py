from fastapi import APIRouter
from app.db.database import destinations_collection
from app.models.destination import DestinationCreate, DestinationResponse
from bson import ObjectId
from fastapi import HTTPException
from typing import List

router = APIRouter()

@router.post("/destinations")
async def create_destination(destination: DestinationCreate):

    result = await destinations_collection.insert_one(
        destination.model_dump()
    )

    return {
        "message": "Destination created",
        "id": str(result.inserted_id)
    }



@router.get("/destinations/{destination_id}")
async def get_destination(destination_id: str):

    destination = await destinations_collection.find_one(
        {"_id": ObjectId(destination_id)}
    )

    if not destination:
        raise HTTPException(
            status_code=404,
            detail="Destination not found"
        )
    destination["_id"] = str(destination["_id"])
    return destination

@router.get("/destinations",response_model=List[DestinationResponse])
async def get_destinations():

    destinations = []
    async for destination in destinations_collection.find():
        destinations.append(
            {
                "id": str(destination["_id"]),
                "destination_name": destination["destination_name"],
                "state": destination["state"],
                "country": destination["country"],
                "latitude": destination["latitude"],
                "longitude": destination["longitude"],
                "category": destination["category"],
                "description": destination["description"]
            }
        )

    return destinations

@router.put("/destinations/{destination_id}")
async def update_destination(destination_id: str, destination: DestinationCreate):
    result = await destinations_collection.update_one(
        {"_id": ObjectId(destination_id)},
        {"$set": destination.model_dump()}
    )

    if result.modified_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Destination not found"
        )

    return {
        "message": "Destination updated"
    }
