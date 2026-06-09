import pandas as pd
from app.ml.model_loader import (scam_model, scam_columns)
from app.core.constants import SCAM_LABELS

def predict_scam(features: dict):
    sample = pd.DataFrame([features])
    sample = sample[scam_columns]
    prediction = scam_model.predict(sample)[0]
    probabilities = scam_model.predict_proba(sample)[0]
    confidence = float(max(probabilities))

    return {
        "prediction": int(prediction),
        "scam_risk": SCAM_LABELS[int(prediction)],
        "confidence": round(confidence, 4)
    }