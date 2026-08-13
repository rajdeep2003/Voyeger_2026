from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from app.api.health import router as health_router
from app.api.assistant import router as assistant_router
from app.api.admin import router as admin_router
from app.routes.destinations import router as destination_router
from app.routes.reports import router as reports_router
from app.routes.predict import router as predict_router
from app.routes.temp import router as temp_router

app = FastAPI(
    title="Voyager AI Service",
    version="1.0.0"
)

app.include_router(health_router)
app.include_router(assistant_router)
app.include_router(admin_router)
app.include_router(destination_router)
app.include_router(reports_router)
app.include_router(predict_router)
app.include_router(temp_router)