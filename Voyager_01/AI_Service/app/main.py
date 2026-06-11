from fastapi import FastAPI
from app.api.health import router as health_router
from app.api.assistant import router as assistant_router
from app.api.admin import router as admin_router

app = FastAPI(
    title="Voyager AI Service",
    version="1.0.0"
)

app.include_router(health_router)
app.include_router(assistant_router)
app.include_router(admin_router)