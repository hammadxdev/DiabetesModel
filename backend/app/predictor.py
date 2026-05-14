"""
predictor.py — Inference with the binary CalibratedHistGB model.
Mirrors EXACTLY the preprocessing done in run_training.py / model_training.ipynb.
"""
import json, pickle, logging
import numpy as np
import pandas as pd
from pathlib import Path

log = logging.getLogger(__name__)

_BASE = Path(__file__).resolve().parent.parent
_MDL  = _BASE / 'models'


def _pkl(name):
    return pickle.load(open(_MDL / name, 'rb'))


# ── Load once at startup ──────────────────────────────────────────────────────
model         = _pkl('best_model.pkl')
scaler        = _pkl('scaler.pkl')
feature_names = _pkl('feature_names.pkl')
vt_selector   = _pkl('variance_selector.pkl')

with open(_MDL / 'meta_info.json') as f:
    _meta = json.load(f)

clips     = _meta['clips']
log_cols  = _meta['log_cols']
THRESHOLD = float(_meta.get('threshold', 0.5))   # optimal F1 threshold

log.info(f'[predictor] model={type(model).__name__}  features={len(feature_names)}  threshold={THRESHOLD:.3f}')

# ── Labels & text ─────────────────────────────────────────────────────────────
RISK_LABELS = {
    0: 'Not Urgent',
    1: 'Urgent — Readmission <30 Days',
}
RECOMMENDATIONS = {
    0: 'Patient is at low risk of urgent readmission. Routine discharge and follow-up care is recommended.',
    1: 'Patient is at HIGH risk of readmission within 30 days. Immediate care coordination, detailed discharge planning, and close follow-up within 7 days is strongly recommended.',
}

# ── ICD-9 map (same as training) ──────────────────────────────────────────────
def _map_icd9(code):
    if pd.isnull(code): return 'Other'
    s = str(code).upper().strip()
    if s.startswith(('E','V')): return 'External'
    try: n = float(s)
    except ValueError: return 'Other'
    if 390<=n<=459 or n==785:
        if 401<=n<=405: return 'Circ_Hypertension'
        if 410<=n<=414: return 'Circ_HeartDisease'
        return 'Circ_Other'
    if 460<=n<=519 or n==786:
        if 490<=n<=496: return 'Resp_COPD'
        return 'Resp_Other'
    if 520<=n<=579 or n==787: return 'Digestive'
    if 250<=n<251: return 'Diabetes_Type2'
    if 240<=n<=279: return 'Endocrine_Other'
    if 800<=n<=999: return 'Injury'
    if 710<=n<=739: return 'Musculoskeletal'
    if 580<=n<=629 or n==788: return 'Genitourinary'
    if 140<=n<=239: return 'Neoplasms'
    if 680<=n<=709 or n==782: return 'Skin'
    if 290<=n<=319: return 'Mental'
    if 1<=n<=139: return 'Infectious'
    if 280<=n<=289: return 'Blood'
    if 320<=n<=389: return 'Nervous'
    return 'Other'


def _engineer(df):
    df['total_visits']      = df['number_inpatient'] + df['number_outpatient'] + df['number_emergency']
    df['medication_density'] = df['num_medications'] / df['time_in_hospital'].clip(lower=1)
    df['procedure_intensity'] = df['num_lab_procedures'] + df['num_procedures']
    df['chronic_complexity'] = df['number_diagnoses'] * df['num_medications']
    df['admission_severity'] = df['number_inpatient'] * 2 + df['number_emergency']
    df['utilization_score']  = df['total_visits'] * df['num_medications']
    df['hospital_load']      = df['time_in_hospital'] * df['num_lab_procedures']
    age_map = {'[0-10)':5,'[10-20)':15,'[20-30)':25,'[30-40)':35,'[40-50)':45,
               '[50-60)':55,'[60-70)':65,'[70-80)':75,'[80-90)':85,'[90-100)':95}
    df['age_num']       = df['age'].map(age_map).fillna(60)
    df['age_x_meds']    = df['age_num'] * df['num_medications']
    df['inpatient_x_diag'] = df['number_inpatient'] * df['number_diagnoses']
    df['time_x_meds']   = df['time_in_hospital'] * df['num_medications']
    for col in ['num_medications','number_diagnoses','num_lab_procedures']:
        if col in df.columns:
            df[f'{col}_qbin'] = 0  # single row — bin = 0 (lowest)
    return df


def predict_diabetes_risk(data: dict) -> dict:
    df = pd.DataFrame([data])

    # Engineer features
    df = _engineer(df)

    # OHE
    df = pd.get_dummies(df)

    # Align to training feature set
    df = df.reindex(columns=feature_names, fill_value=0).astype(np.float32)

    # Clip outliers
    for col, (lo, hi) in clips.items():
        if col in df.columns:
            df[col] = df[col].clip(lo, hi)

    # Log transforms
    for col in log_cols:
        if col in df.columns:
            df[f'{col}_log'] = np.log1p(df[col])
            df.drop(columns=[col], inplace=True, errors='ignore')

    # Re-align after log transforms
    df = df.reindex(columns=feature_names, fill_value=0).astype(np.float32)

    # Scale
    X_scaled = scaler.transform(df)

    # Predict (binary) using optimal threshold
    probs    = model.predict_proba(X_scaled)[0]   # [p_not_urgent, p_urgent]
    p_urgent = float(probs[1])
    pred_cls = 1 if p_urgent >= THRESHOLD else 0
    conf     = p_urgent if pred_cls == 1 else float(probs[0])
    risk_score = round(p_urgent * 100, 2)

    # Top risk features (by absolute scaled value)
    top_feats = sorted(
        zip(feature_names, X_scaled[0].tolist()),
        key=lambda x: abs(x[1]), reverse=True
    )[:5]

    return {
        'predicted_class':  pred_cls,
        'risk_label':       RISK_LABELS[pred_cls],
        'confidence':       round(conf, 4),
        'probabilities': {
            'not_urgent': round(float(probs[0]), 4),
            'urgent':     round(float(probs[1]), 4),
            # Keep legacy keys so old frontend code doesn't break
            'low_risk':   round(float(probs[0]), 4),
            'medium_risk': 0.0,
            'high_risk':  round(float(probs[1]), 4),
        },
        'prediction_mode':  'binary_threshold',
        'recommendation':   RECOMMENDATIONS[pred_cls],
        'top_risk_features': [{'feature': n, 'value': round(v, 3)} for n, v in top_feats],
        'clinical_explanation': (
            f'The model predicts {"URGENT readmission risk" if pred_cls == 1 else "LOW readmission risk"} '
            f'with {conf*100:.1f}% confidence. '
            f'Probability of urgent readmission (<30 days): {p_urgent*100:.1f}%.'
        ),
        'risk_score': risk_score,
    }
