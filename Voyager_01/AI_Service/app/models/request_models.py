from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional

class AssistantRequest(BaseModel):
    destination: str = Field(
        ...,
        example="Victoria Memorial"
    )

    visit_date: date
    interests: List[str] = []
    budget: Optional[str] = None