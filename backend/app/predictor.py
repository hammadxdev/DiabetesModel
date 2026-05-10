import pandas as pd
import numpy as np
import joblib
from pathlib import Path


# Resolve paths relative to this file's location
_BASE_DIR = Path(__file__).resolve().parent.parent
_MODELS_DIR = _BASE_DIR / "models"

# Verify models directory exists
if not _MODELS_DIR.exists():
    raise FileNotFoundError(f"Models directory not found at: {_MODELS_DIR}")

# Load artefacts once at startup
model = joblib.load(_MODELS_DIR / "best_model.pkl")
scaler = joblib.load(_MODELS_DIR / "scaler.pkl")
feature_columns = joblib.load(_MODELS_DIR / "feature_columns.pkl")

print(f"[predictor] Model loaded: {type(model).__name__}")
print(f"[predictor] Features expected: {len(feature_columns)}")


def predict_diabetes_risk(data: dict):
    """
    Accept a patient data dict, preprocess it to match the
    training pipeline, then return the risk prediction.
    """

    # Convert input to dataframe
    input_df = pd.DataFrame([data])

    # One-hot encode (same as preprocessing pipeline)
    input_df = pd.get_dummies(input_df)

    # Align columns to match training feature set (fill missing with 0)
    input_df = input_df.reindex(
        columns=feature_columns,
        fill_value=0
    )

    # Scale using the fitted scaler
    input_scaled = scaler.transform(input_df.astype(np.float32))

    # Get prediction
    prediction = int(model.predict(input_scaled)[0])

    # Map to human-readable label
    risk_map = {
        0: "Low Risk",
        1: "Medium Risk",
        2: "High Risk"
    }

    return {
        "prediction": risk_map.get(prediction, "Unknown"),
        "risk_code": prediction
    }
