from fastapi import APIRouter
from app.ml.model_loader import (safety_model, scam_model, tourism_model)

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/models")
async def model_status():
    return {
        "safety_model_loaded": safety_model is not None,
        "scam_model_loaded": scam_model is not None,
        "tourism_model_loaded": tourism_model is not None
    }