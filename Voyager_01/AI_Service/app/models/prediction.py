from pydantic import BaseModel

class PredictionHistory(BaseModel):
    destination_id: str
    risk_score: float
    risk_level: str