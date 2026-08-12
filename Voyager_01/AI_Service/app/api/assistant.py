from fastapi import APIRouter
from app.models.request_models import AssistantRequest, ChatRequest
from app.models.response_models import ChatResponse
from app.services.assistant_service import process_destination
from app.services.llm_service import generate_travel_copilot_response

router = APIRouter(prefix="/assistant", tags=["Voyager Assistant"])

@router.post("/")
async def voyager_assistant(request: AssistantRequest):
    result = await process_destination(request)
    return result

@router.post("/chat", response_model=ChatResponse)
async def voyager_chat(request: ChatRequest):
    response_text = await generate_travel_copilot_response(
        destination_name=request.destination,
        query=request.query,
        chat_history=request.chat_history,
        visit_date=request.visit_date
    )
    return ChatResponse(
        destination=request.destination,
        response=response_text
    )