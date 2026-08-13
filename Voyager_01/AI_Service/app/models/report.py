from pydantic import BaseModel

class ReportCreate(BaseModel):
    destination_id: str
    incident_type: str
    severity: int
    description: str

class ReportResponse(ReportCreate):
    id: str