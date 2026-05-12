from pydantic import BaseModel, Field
from typing import Optional


class PatientData(BaseModel):
    age: str = Field(..., example='[60-70)')
    admission_type_id: int = Field(..., ge=1, le=8)
    discharge_disposition_id: int = Field(..., ge=1, le=30)
    admission_source_id: int = Field(..., ge=1, le=26)
    time_in_hospital: int = Field(..., ge=1, le=14)
    num_lab_procedures: int = Field(..., ge=0)
    num_procedures: int = Field(..., ge=0)
    num_medications: int = Field(..., ge=0)
    number_outpatient: int = Field(..., ge=0)
    number_emergency: int = Field(..., ge=0)
    number_inpatient: int = Field(..., ge=0)
    number_diagnoses: int = Field(..., ge=1)
    diag_1_cat: str = Field(..., example='Diabetes_Type2')
    insulin: str = Field(..., example='No')
    diabetesMed: str = Field(..., example='Yes')


class PredictionResponse(BaseModel):
    predicted_class: int
    risk_label: str
    confidence: float
    probabilities: dict
    threshold_used: float
    recommendation: str


class DetailedPredictionResponse(PredictionResponse):
    top_risk_features: list
    clinical_explanation: str
    risk_score: float
