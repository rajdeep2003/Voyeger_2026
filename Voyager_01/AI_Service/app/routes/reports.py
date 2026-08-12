from fastapi import APIRouter
from app.db.database import reports_collection
from app.models.report import ReportCreate, ReportResponse
from typing import List

router = APIRouter()

@router.post("/reports")
async def create_report(report: ReportCreate):
    result = await reports_collection.insert_one(
        report.model_dump()
    )

    return {
        "message": "Report created",
        "id": str(result.inserted_id)
    }

@router.get("/reports")
async def get_reports():
    reports = []

    async for report in reports_collection.find():
        report["id"] = str(report["_id"])
        del report["_id"]
        reports.append(report)

    return reports

@router.get("/reports/{destination_id}", response_model=List[ReportResponse])
async def get_destination_reports(destination_id: str):
    reports = []

    async for report in reports_collection.find({"destination_id": destination_id}):
        report["id"] = str(report["_id"])
        del report["_id"]
        reports.append(report)

    return reports