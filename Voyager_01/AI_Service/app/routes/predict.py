from fastapi import APIRouter
from app.services.weather_service import get_weather_features
from app.db.database import prediction_collection

router = APIRouter()

@router.get("/weather-test")
async def weather_test():

    return get_weather_features(
        latitude=27.036,
        longitude=88.262
    )

@router.get("/predictions")
async def get_prediction_history():
    predictions = []
    async for pred in prediction_collection.find().sort("timestamp", -1):
        pred["id"] = str(pred["_id"])
        del pred["_id"]
        if "timestamp" in pred:
            ts = pred["timestamp"]
            if hasattr(ts, "isoformat"):
                iso_str = ts.isoformat()
                pred["timestamp"] = iso_str + "Z" if not (iso_str.endswith("Z") or "+" in iso_str) else iso_str
            else:
                pred["timestamp"] = str(ts)
        predictions.append(pred)
    return predictions

@router.delete("/predictions")
async def clear_prediction_history():
    result = await prediction_collection.delete_many({})
    return {"message": "Prediction history cleared", "deleted_count": result.deleted_count}