from app.services.destination_service import (get_destination_details)
from app.services.feature_builder import (build_features)
from app.services.recommendation_service import (get_recommendation)
from app.ml.safety_predictor import (predict_safety)
from app.ml.scam_predictor import (predict_scam)
from app.ml.tourism_predictor import (predict_tourism)
from app.models.response_models import (AssistantResponse)

def process_destination(request):
    destination = get_destination_details(request.destination)

    if not destination:
        raise ValueError("Destination not found")

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