import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "UserData")

client = AsyncIOMotorClient(MONGO_URL)

db = client[MONGO_DB]

destinations_collection = db["destinations"]
reports_collection = db["user_reports"]
prediction_collection = db["prediction_history"]