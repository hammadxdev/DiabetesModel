from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from schemas import PatientData
from predictor import predict_diabetes_risk


app = FastAPI(
    title="Diabetes Risk Prediction API",
    description="Predicts hospital readmission risk for diabetic patients using ensemble ML models.",
    version="1.0.0",
)


# Enable React frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "Diabetes Risk Prediction API Running"
    }


@app.post("/predict")
def predict(data: PatientData):
    # Pydantic v2 uses model_dump() instead of deprecated dict()
    prediction = predict_diabetes_risk(data.model_dump())
    return prediction
