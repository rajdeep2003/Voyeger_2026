from fastapi import APIRouter
from app.models.request_models import AssistantRequest
from app.services.assistant_service import process_destination

router = APIRouter(prefix="/assistant", tags=["Voyager Assistant"])

@router.post("/")
async def voyager_assistant(request: AssistantRequest):
    result = process_destination(request)
    return result