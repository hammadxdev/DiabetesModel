"""
main.py — FastAPI app with prediction and analytics routes.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(level=logging.INFO)

try:
    from app.schemas import PatientData
    from app.predictor import predict_diabetes_risk
    from app.analytics import router as analytics_router
except ImportError:
    from schemas import PatientData
    from predictor import predict_diabetes_risk
    from analytics import router as analytics_router

app = FastAPI(
    title='Explainable AI Healthcare Analytics Platform',
    description='Diabetes Hospital Readmission Risk — Advanced ML API v2.0',
    version='2.0.0',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# ── Register analytics router ──
app.include_router(analytics_router)


@app.get('/health')
def health():
    return {'status': 'ok', 'version': '2.0.0'}


@app.get('/')
def root():
    return {'message': 'Explainable AI Healthcare Analytics Platform v2.0'}


@app.post('/predict')
def predict(data: PatientData):
    return predict_diabetes_risk(data.model_dump())


@app.post('/predict-detailed')
def predict_detailed(data: PatientData):
    """Alias for /predict — returns full detailed response."""
    return predict_diabetes_risk(data.model_dump())
