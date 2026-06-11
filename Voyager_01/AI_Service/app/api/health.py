from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("/")
async def health_check():
    return {
        "status": "running",
        "service": "Voyager AI Service",
        "version": "1.0.0"
    }