"""
analytics.py — All GET analytics endpoints that serve pre-computed artifacts.
"""
import json, os
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix='/analytics', tags=['Analytics'])

MODELS_DIR = Path(__file__).resolve().parent.parent / 'models'

def _load(name: str):
    p = MODELS_DIR / name
    if not p.exists():
        raise HTTPException(status_code=503, detail=f'{name} not found. Run train_advanced.py first.')
    with open(p) as f:
        return json.load(f)


@router.get('/metrics')
def get_metrics():
    return _load('metrics.json')


@router.get('/model-comparison')
def get_model_comparison():
    return _load('model_comparison.json')


@router.get('/confusion-matrix')
def get_confusion_matrix():
    return _load('confusion_matrix.json')


@router.get('/roc-curve')
def get_roc_curve():
    return _load('roc_data.json')


@router.get('/pr-curve')
def get_pr_curve():
    return _load('pr_curve_data.json')


@router.get('/feature-importance')
def get_feature_importance():
    return _load('feature_importance.json')


@router.get('/shap-summary')
def get_shap_summary():
    """Returns feature importance as SHAP proxy (RF importances)."""
    return _load('feature_importance.json')


@router.get('/class-distribution')
def get_class_distribution():
    return _load('class_distribution.json')


@router.get('/calibration')
def get_calibration():
    return _load('calibration_data.json')


@router.get('/system-info')
def get_system_info():
    return _load('system_info.json')
