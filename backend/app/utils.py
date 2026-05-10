# Utility functions for the API

def validate_input(data: dict) -> bool:
    """Validate patient data input"""
    required_fields = [
        "race", "gender", "age",
        "admission_type_id", "discharge_disposition_id",
        "admission_source_id", "time_in_hospital",
        "num_lab_procedures", "num_procedures",
        "num_medications", "number_outpatient",
        "number_emergency", "number_inpatient",
        "number_diagnoses", "insulin", "diabetesMed"
    ]
    
    return all(field in data for field in required_fields)


def format_response(prediction: str) -> dict:
    """Format prediction response"""
    return {
        "status": "success",
        "prediction": prediction,
        "risk_levels": ["Low Risk", "Medium Risk", "High Risk"]
    }
