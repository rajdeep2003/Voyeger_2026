import pickle
from pathlib import Path

import pandas as pd
from app.core.constants import SAFETY_LABELS

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_DIR = BASE_DIR / "trained_models"

# SAFETY MODEL

with open(MODEL_DIR / "tourism_safety.pkl", "rb") as file:
    safety_model = pickle.load(file)

with open(MODEL_DIR / "tourism_safety_feature_columns.pkl", "rb") as file:
    safety_columns = pickle.load(file)


def predict_safety(features: dict):
    sample = pd.DataFrame([features])
    sample = sample[safety_columns]
    prediction = safety_model.predict(sample)[0]
    probabilities = safety_model.predict_proba(sample)[0]
    confidence = float(max(probabilities))

    return {
        "prediction": int(prediction),
        "risk": SAFETY_LABELS[int(prediction)],
        "confidence": round(confidence, 4)
    }

# SCAM MODEL

with open(MODEL_DIR / "scam_detection.pkl", "rb") as file:
    scam_model = pickle.load(file)

with open(MODEL_DIR / "scam_feature_columns.pkl", "rb") as file:
    scam_columns = pickle.load(file)

# TOURISM MODEL

with open(MODEL_DIR / "tourism_demand.pkl", "rb") as file:
    tourism_model = pickle.load(file)

with open(MODEL_DIR / "tourism_demand_feature_columns.pkl", "rb") as file:
    tourism_columns = pickle.load(file)