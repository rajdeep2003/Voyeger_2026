from pydantic import BaseModel

class AssistantResponse(BaseModel):
    destination: str
    safety: str
    safety_confidence: float
    scam_risk: str
    scam_confidence: float
    crowd_level: str
    crowd_confidence: float
    recommendation: str
    summary: str

class ChatResponse(BaseModel):
    destination: str
    response: str