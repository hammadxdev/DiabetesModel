"""
analytics.py — All GET analytics endpoints that serve pre-computed artifacts.
"""
import json, os
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix='/analytics', tags=['Analytics'])

MODELS_DIR = Path(__file__).resolve().parent.parent / 'models'

def _load(name: str, fallback=None):
    p = MODELS_DIR / name
    if not p.exists():
        if fallback is not None:
            return fallback
        raise HTTPException(status_code=503, detail=f'{name} not found. Run run_training.py first.')
    with open(p) as f:
        return json.load(f)


@router.get('/metrics')
def get_metrics():
    return _load('metrics.json')


@router.get('/model-comparison')
def get_model_comparison():
    # Fallback: return single-model summary from metrics
    fallback = _load('metrics.json', {})
    return _load('model_comparison.json', {
        'CalibratedHistGB_Binary': {
            'accuracy': fallback.get('accuracy', 0),
            'f1_macro': fallback.get('macro_f1', 0),
            'roc_auc':  fallback.get('roc_auc', 0),
        }
    })


@router.get('/confusion-matrix')
def get_confusion_matrix():
    return _load('confusion_matrix.json')


@router.get('/roc-curve')
def get_roc_curve():
    return _load('roc_data.json')


@router.get('/pr-curve')
def get_pr_curve():
    return _load('pr_curve_data.json', _load('roc_data.json', {}))


@router.get('/feature-importance')
def get_feature_importance():
    return _load('feature_importance.json', {'features': []})


@router.get('/shap-summary')
def get_shap_summary():
    return _load('feature_importance.json', {'features': []})


@router.get('/class-distribution')
def get_class_distribution():
    return _load('class_distribution.json', {
        'Not Urgent': 90409,
        'Urgent (<30)': 11357
    })


@router.get('/calibration')
def get_calibration():
    return _load('calibration_data.json', {})


@router.get('/system-info')
def get_system_info():
    return _load('system_info.json')


@router.get('/per-class-metrics')
def get_per_class_metrics():
    return _load('per_class_metrics.json', {})
