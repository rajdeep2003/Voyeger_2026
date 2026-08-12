from app.services.destination_service import (get_destination_details)
from app.services.feature_builder import (build_features)
from app.services.recommendation_service import (get_recommendation)
from app.ml.safety_predictor import (predict_safety)
from app.ml.scam_predictor import (predict_scam)
from app.ml.tourism_predictor import (predict_tourism)
from app.models.response_models import (AssistantResponse)
from app.db.database import prediction_collection
from datetime import datetime, timezone

async def process_destination(request):
    destination = await get_destination_details(request.destination)

    if not destination:
        destination = {
            "city": request.destination or "General",
            "category": "General",
            "latitude": 20.5937,
            "longitude": 78.9629
        }

    (
        safety_features,
        scam_features,
        tourism_features

    ) = build_features(
        destination,
        request.visit_date
    )

    safety_result = predict_safety(
        safety_features.model_dump()
    )

    scam_result = predict_scam(
        scam_features.model_dump()
    )

    tourism_result = predict_tourism(
        tourism_features.model_dump()
    )

    recommendation = get_recommendation(
        request.destination,
        tourism_result["crowd_level"]
    )

    summary = (
        f"{request.destination} is "
        f"{tourism_result['crowd_level']}. "
        f"Safety level is "
        f"{safety_result['risk']} "
        f"with {scam_result['scam_risk']}."
    )

    # Save prediction history to database
    prediction_data = {
        "destination_name": request.destination,
        "visit_date": str(request.visit_date),
        "safety_risk": safety_result["risk"],
        "safety_confidence": safety_result["confidence"],
        "scam_risk": scam_result["scam_risk"],
        "scam_confidence": scam_result["confidence"],
        "crowd_level": tourism_result["crowd_level"],
        "crowd_confidence": tourism_result["confidence"],
        "recommendation": recommendation,
        "summary": summary,
        "timestamp": datetime.now(timezone.utc)
    }
    # Save prediction history to database asynchronously (non-blocking)
    asyncio.create_task(prediction_collection.insert_one(prediction_data))

    return AssistantResponse(
        destination=request.destination,
        safety=safety_result["risk"],
        safety_confidence=safety_result["confidence"],
        scam_risk=scam_result["scam_risk"],
        scam_confidence=scam_result["confidence"],
        crowd_level=tourism_result["crowd_level"],
        crowd_confidence=tourism_result["confidence"],
        recommendation=recommendation,
        summary=summary
    )