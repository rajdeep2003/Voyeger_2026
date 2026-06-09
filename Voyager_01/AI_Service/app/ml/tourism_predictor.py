import pandas as pd
from app.ml.model_loader import (tourism_model, tourism_columns)
from app.core.constants import TOURISM_LABELS

def predict_tourism(features: dict):
    sample = pd.DataFrame([features])
    sample = sample[tourism_columns]
    prediction = tourism_model.predict(sample)[0]
    probabilities = tourism_model.predict_proba(sample)[0]
    confidence = float(max(probabilities))

    return {
        "prediction": int(prediction),
        "crowd_level": TOURISM_LABELS[int(prediction)],
        "confidence": round(confidence, 4)
    }