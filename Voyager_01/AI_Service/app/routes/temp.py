from fastapi import APIRouter
from app.services.maps_service import (
    get_nearest_hospital_distance,
    get_nearest_police_distance
)

router = APIRouter()

@router.get("/hospital-test")
async def hospital_test():
    return get_nearest_hospital_distance(
        28.6139,
        77.2090
    )


@router.get("/police-test")
async def police_test():
    return get_nearest_police_distance(
        28.6139,
        77.2090
    )