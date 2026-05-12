"""
train_advanced.py
Explainable AI Healthcare Analytics Platform — Advanced Training Pipeline
Trains a stacked ensemble optimized for balanced multiclass (macro-F1) performance.
"""

import os, json, logging, pickle, warnings
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.model_selection import (train_test_split, StratifiedKFold,
                                     cross_val_score, RandomizedSearchCV)
from sklearn.preprocessing import RobustScaler, label_binarize
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.ensemble import (StackingClassifier, HistGradientBoostingClassifier,
                               RandomForestClassifier)
from sklearn.linear_model import LogisticRegression
from sklearn.feature_selection import VarianceThreshold
from sklearn.metrics import (classification_report, confusion_matrix,
                              roc_auc_score, precision_recall_curve,
                              average_precision_score, brier_score_loss,
                              f1_score, roc_curve)
from sklearn.utils.class_weight import compute_sample_weight
from imblearn.over_sampling import SMOTE
from scipy.stats import randint, uniform

warnings.filterwarnings('ignore')
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
log = logging.getLogger(__name__)

OUTPUTS_DIR = 'outputs'
MODELS_DIR  = 'models'
os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR,  exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# ICD-9 MAPPING
# ─────────────────────────────────────────────────────────────────────────────
def map_icd9(code):
    if pd.isnull(code): return 'Other'
    s = str(code).upper().strip()
    if s.startswith(('E', 'V')): return 'External'
    try:
        n = float(s)
    except ValueError:
        return 'Other'
    if 390 <= n <= 459 or n == 785:
        if 401 <= n <= 405: return 'Circ_Hypertension'
        if 410 <= n <= 414: return 'Circ_HeartDisease'
        return 'Circ_Other'
    if 460 <= n <= 519 or n == 786:
        if 490 <= n <= 496: return 'Resp_COPD'
        return 'Resp_Other'
    if 520 <= n <= 579 or n == 787: return 'Digestive'
    if 250 <= n < 251: return 'Diabetes_Type2'
    if 240 <= n <= 279: return 'Endocrine_Other'
    if 800 <= n <= 999: return 'Injury'
    if 710 <= n <= 739: return 'Musculoskeletal'
    if 580 <= n <= 629 or n == 788: return 'Genitourinary'
    if 140 <= n <= 239: return 'Neoplasms'
    if 680 <= n <= 709 or n == 782: return 'Skin'
    if 290 <= n <= 319: return 'Mental'
    if 1   <= n <= 139: return 'Infectious'
    if 280 <= n <= 289: return 'Blood'
    if 320 <= n <= 389: return 'Nervous'
    return 'Other'

# ─────────────────────────────────────────────────────────────────────────────
# FEATURE ENGINEERING
# ─────────────────────────────────────────────────────────────────────────────
def engineer_features(df):
    df['total_visits']            = df['number_inpatient'] + df['number_outpatient'] + df['number_emergency']
    df['medication_density']      = df['num_medications'] / df['time_in_hospital'].clip(lower=1)
    df['procedure_intensity']     = df['num_lab_procedures'] + df['num_procedures']
    df['chronic_complexity']      = df['number_diagnoses'] * df['num_medications']
    df['admission_severity_score']= df['number_inpatient'] * 2 + df['number_emergency']
    df['utilization_score']       = df['total_visits'] * df['num_medications']
    df['hospital_load_score']     = df['time_in_hospital'] * df['num_lab_procedures']
    # Interaction features
    age_map = {'[0-10)':5,'[10-20)':15,'[20-30)':25,'[30-40)':35,'[40-50)':45,
               '[50-60)':55,'[60-70)':65,'[70-80)':75,'[80-90)':85,'[90-100)':95}
    df['age_num'] = df['age'].map(age_map).fillna(60)
    df['age_x_medications']  = df['age_num'] * df['num_medications']
    df['inpatient_x_diagnoses'] = df['number_inpatient'] * df['number_diagnoses']
    df['time_x_medications']  = df['time_in_hospital'] * df['num_medications']
    # Quantile bins
    for col in ['num_medications', 'number_diagnoses', 'num_lab_procedures']:
        if col in df.columns:
            df[f'{col}_qbin'] = pd.qcut(df[col], q=4, labels=False, duplicates='drop')
    return df

# ─────────────────────────────────────────────────────────────────────────────
# PREPROCESSING
# ─────────────────────────────────────────────────────────────────────────────
def preprocess(df):
    drop = ['weight','payer_code','medical_specialty','max_glu_serum','A1Cresult',
            'encounter_id','patient_nbr','race','gender']
    df.drop(columns=drop, inplace=True, errors='ignore')
    for col in df.select_dtypes('object').columns:
        if col != 'readmitted' and df[col].isnull().sum() > 0:
            df[col] = df[col].fillna(df[col].mode()[0])
    for col in ['diag_1','diag_2','diag_3']:
        df[col+'_cat'] = df[col].apply(map_icd9)
        df.drop(columns=[col], inplace=True)
    df = engineer_features(df)
    # Remove near-constant categoricals
    obj_cols = [c for c in df.select_dtypes('object').columns if c != 'readmitted']
    nc = [c for c in obj_cols if df[c].value_counts(normalize=True).iloc[0] >= 0.99]
    df.drop(columns=nc, inplace=True, errors='ignore')
    return df

# ─────────────────────────────────────────────────────────────────────────────
# APPLY NUMERIC TRANSFORMS (clipping + log)
# ─────────────────────────────────────────────────────────────────────────────
def fit_transforms(X):
    clips = {}
    num_cols = X.select_dtypes(include='number').columns.tolist()
    for c in num_cols:
        p1, p99 = X[c].quantile(0.01), X[c].quantile(0.99)
        clips[c] = (float(p1), float(p99))
        X[c] = X[c].clip(p1, p99)
    skewed = ['total_visits','num_medications','number_inpatient','number_emergency',
              'number_outpatient','hospital_load_score','utilization_score']
    log_cols = []
    for c in skewed:
        if c in X.columns:
            X[f'{c}_log'] = np.log1p(X[c])
            X.drop(columns=[c], inplace=True)
            log_cols.append(c)
    return X, clips, log_cols

def apply_transforms(X, clips, log_cols):
    for c, (lo, hi) in clips.items():
        if c in X.columns:
            X[c] = X[c].clip(lo, hi)
    for c in log_cols:
        if c in X.columns:
            X[f'{c}_log'] = np.log1p(X[c])
            X.drop(columns=[c], inplace=True)
    return X

# ─────────────────────────────────────────────────────────────────────────────
# SAVE PLOT HELPER
# ─────────────────────────────────────────────────────────────────────────────
def save_plot(fig, name):
    path = os.path.join(OUTPUTS_DIR, name)
    fig.savefig(path, dpi=150, bbox_inches='tight')
    plt.close(fig)
    log.info(f'Saved plot: {path}')

# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
def main():
    log.info('=== BALANCED MULTICLASS TRAINING PIPELINE START ===')

    # ── 1. Load ──
    log.info('Loading dataset...')
    df = pd.read_csv('data/raw/diabetic_data.csv')
    df.replace('?', np.nan, inplace=True)
    log.info(f'Loaded {len(df):,} rows x {df.shape[1]} cols')

    # ── 2. Preprocess ──
    log.info('Preprocessing...')
    df = preprocess(df)

    # ── 3. Encode target ──
    target_map = {'NO': 0, '>30': 1, '<30': 2}
    df['readmitted'] = df['readmitted'].map(target_map)
    df.dropna(subset=['readmitted'], inplace=True)

    # ── 4. OHE ──
    df = pd.get_dummies(df, drop_first=True)
    X = df.drop('readmitted', axis=1).astype(np.float32)
    y = df['readmitted'].astype(int)
    log.info(f'After OHE: {X.shape[1]} features')

    # ── 5. Transforms ──
    X, clips, log_cols = fit_transforms(X)
    feature_names = X.columns.tolist()
    log.info(f'After transforms: {len(feature_names)} features')

    # ── 6. Variance filter ──
    vt = VarianceThreshold(threshold=0.001)
    X_arr = vt.fit_transform(X)
    feature_names = [feature_names[i] for i in vt.get_support(indices=True)]
    X = pd.DataFrame(X_arr, columns=feature_names)
    log.info(f'After variance filter: {len(feature_names)} features')

    # ── 7. Split ──
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

    # ── 8. Scale ──
    log.info('RobustScaler...')
    scaler = RobustScaler()
    X_tr_s = pd.DataFrame(scaler.fit_transform(X_tr), columns=feature_names)
    X_te_s = pd.DataFrame(scaler.transform(X_te),     columns=feature_names)

    # ── 9. SMOTE (standard oversampling — no undersampling) ──
    log.info('SMOTE resampling...')
    smote = SMOTE(random_state=42)
    X_res, y_res = smote.fit_resample(X_tr_s, y_tr)
    log.info(f'Resampled shape: {X_res.shape}, class counts: {np.bincount(y_res)}')

    # ── 10. Class distribution plot ──
    fig, ax = plt.subplots(figsize=(6,4))
    counts = np.bincount(y_res)
    ax.bar(['Low Risk (0)','Medium Risk (1)','High Risk (2)'], counts,
           color=['#22d3ee','#a78bfa','#f87171'])
    ax.set_title('Class Distribution After SMOTE'); ax.set_ylabel('Count')
    save_plot(fig, 'class_distribution.png')
    class_dist_json = {'Low Risk': int(counts[0]), 'Medium Risk': int(counts[1]), 'High Risk': int(counts[2])}

    # ── 11. RandomizedSearchCV for HistGradientBoosting (macro-F1) ──
    #        Use a stratified 30K subsample to keep search fast, then refit on full data
    skf = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
    SEARCH_SIZE = 30000
    if len(X_res) > SEARCH_SIZE:
        from sklearn.model_selection import StratifiedShuffleSplit
        sss = StratifiedShuffleSplit(n_splits=1, train_size=SEARCH_SIZE, random_state=42)
        sub_idx, _ = next(sss.split(X_res, y_res))
        X_sub, y_sub = X_res.iloc[sub_idx], y_res.iloc[sub_idx] if hasattr(y_res, 'iloc') else y_res[sub_idx]
        log.info(f'Subsampled {SEARCH_SIZE} rows for hyperparameter search')
    else:
        X_sub, y_sub = X_res, y_res

    log.info('RandomizedSearchCV for HistGradientBoosting (scoring=f1_macro)...')
    hgb_param_dist = {
        'max_iter':      randint(100, 300),
        'learning_rate': uniform(0.03, 0.12),
        'max_depth':     randint(4, 8),
        'min_samples_leaf': randint(10, 40),
        'l2_regularization': uniform(0.0, 0.5),
    }
    hgb_search = RandomizedSearchCV(
        HistGradientBoostingClassifier(class_weight='balanced', random_state=42),
        hgb_param_dist, n_iter=12, scoring='f1_macro',
        cv=skf, random_state=42, n_jobs=1, verbose=1
    )
    hgb_search.fit(X_sub, y_sub)
    log.info(f'  Best HistGB params: {hgb_search.best_params_}  CV F1-macro: {hgb_search.best_score_:.4f}')

    # Refit best params on full resampled data
    best_p = hgb_search.best_params_
    hgb = HistGradientBoostingClassifier(**best_p, class_weight='balanced', random_state=42)
    log.info('  Refitting best HistGB on full SMOTE data...')

    # ── 12. Other base models ──
    log.info('Training remaining base models...')
    hgb2 = HistGradientBoostingClassifier(
        max_iter=150, learning_rate=0.08, max_depth=5,
        class_weight='balanced', random_state=99)
    rf  = RandomForestClassifier(
        n_estimators=200, max_depth=12, class_weight='balanced',
        random_state=42, n_jobs=-1)

    model_defs = [('HistGB', hgb), ('HistGB2', hgb2), ('RandomForest', rf)]
    model_cv_scores = {}
    for name, m in model_defs:
        log.info(f'  CV scoring {name}...')
        scores = cross_val_score(m, X_res, y_res, cv=skf, scoring='f1_macro', n_jobs=1)
        model_cv_scores[name] = {'cv_f1_macro_mean': float(scores.mean()),
                                  'cv_f1_macro_std':  float(scores.std())}
        log.info(f'  {name} CV F1-macro: {scores.mean():.4f} +/- {scores.std():.4f}')

    # ── 13. Stacking Ensemble ──
    log.info('Building Stacking Ensemble...')
    stack = StackingClassifier(
        estimators=model_defs,
        final_estimator=LogisticRegression(class_weight='balanced', max_iter=1000, random_state=42),
        cv=3, n_jobs=1, passthrough=False
    )

    log.info('Calibrating ensemble (isotonic)...')
    calibrated = CalibratedClassifierCV(estimator=stack, method='isotonic', cv=2)
    calibrated.fit(X_res, y_res)
    log.info('Calibrated ensemble trained.')

    # ── 14. Test evaluation (argmax only — no threshold override) ──
    log.info('Evaluating on test set (argmax prediction)...')
    y_probs = calibrated.predict_proba(X_te_s)
    y_pred  = np.argmax(y_probs, axis=1)

    target_names = ['Low Risk', 'Medium Risk', 'High Risk']
    report = classification_report(y_te, y_pred, output_dict=True)
    log.info('\n' + classification_report(y_te, y_pred, target_names=target_names))

    roc_auc = roc_auc_score(y_te, y_probs, multi_class='ovr')
    log.info(f'Overall ROC-AUC (OVR): {roc_auc:.4f}')

    # Per-class PR-AUC and Brier scores
    Y_bin = label_binarize(y_te, classes=[0, 1, 2])
    per_class_pr_auc = {}
    per_class_brier  = {}
    for i, cls in enumerate(target_names):
        per_class_pr_auc[cls] = float(average_precision_score(Y_bin[:, i], y_probs[:, i]))
        per_class_brier[cls]  = float(brier_score_loss(Y_bin[:, i], y_probs[:, i]))
        log.info(f'  {cls}: PR-AUC={per_class_pr_auc[cls]:.4f}  Brier={per_class_brier[cls]:.4f}')

    # ── 15. Per-class metrics JSON ──
    per_class_metrics = {}
    for i, cls in enumerate(target_names):
        key = str(i)
        per_class_metrics[cls] = {
            'precision': float(report[key]['precision']),
            'recall':    float(report[key]['recall']),
            'f1_score':  float(report[key]['f1-score']),
            'support':   int(report[key]['support']),
            'pr_auc':    per_class_pr_auc[cls],
            'brier':     per_class_brier[cls],
        }

    # ── 16. Confusion Matrix ──
    cm = confusion_matrix(y_te, y_pred)
    fig, ax = plt.subplots(figsize=(6,5))
    im = ax.imshow(cm, cmap='Blues')
    ax.set_xticks([0,1,2]); ax.set_yticks([0,1,2])
    ax.set_xticklabels(['Low','Medium','High']); ax.set_yticklabels(['Low','Medium','High'])
    for i in range(3):
        for j in range(3):
            ax.text(j, i, str(cm[i,j]), ha='center', va='center',
                    color='white' if cm[i,j] > cm.max()/2 else 'black')
    ax.set_xlabel('Predicted'); ax.set_ylabel('Actual')
    ax.set_title('Confusion Matrix — Calibrated Stacked Ensemble (Balanced)')
    plt.colorbar(im, ax=ax)
    save_plot(fig, 'confusion_matrix.png')

    # ── 17. ROC Curves (per-class) ──
    roc_data = {}
    fig, ax = plt.subplots(figsize=(7,5))
    colors = ['#22d3ee','#a78bfa','#f87171']
    MAX_PTS = 200
    for i, (cls, col) in enumerate(zip(target_names, colors)):
        fpr, tpr, _ = roc_curve(Y_bin[:,i], y_probs[:,i])
        auc_i = roc_auc_score(Y_bin[:,i], y_probs[:,i])
        ax.plot(fpr, tpr, color=col, lw=2, label=f'{cls} (AUC={auc_i:.3f})')
        idx = np.linspace(0, len(fpr)-1, min(MAX_PTS, len(fpr)), dtype=int)
        roc_data[cls] = {'fpr': fpr[idx].tolist(), 'tpr': tpr[idx].tolist(), 'auc': float(auc_i)}
    ax.plot([0,1],[0,1],'k--',lw=1); ax.set_xlabel('FPR'); ax.set_ylabel('TPR')
    ax.set_title('ROC Curves (One-vs-Rest)'); ax.legend()
    save_plot(fig, 'roc_curves.png')

    # ── 18. PR Curves (per-class) ──
    pr_data = {}
    fig, ax = plt.subplots(figsize=(7,5))
    for i, (cls, col) in enumerate(zip(target_names, colors)):
        p, r, _ = precision_recall_curve(Y_bin[:,i], y_probs[:,i])
        ap = average_precision_score(Y_bin[:,i], y_probs[:,i])
        ax.plot(r, p, color=col, lw=2, label=f'{cls} (AP={ap:.3f})')
        idx = np.linspace(0, len(p)-1, min(MAX_PTS, len(p)), dtype=int)
        pr_data[cls] = {'precision': p[idx].tolist(), 'recall': r[idx].tolist(), 'auc': float(ap)}
    ax.set_xlabel('Recall'); ax.set_ylabel('Precision')
    ax.set_title('Precision-Recall Curves (One-vs-Rest)'); ax.legend()
    save_plot(fig, 'pr_curves.png')

    # ── 19. Calibration Curves (all classes) ──
    fig, ax = plt.subplots(figsize=(6,5))
    cal_data = {}
    for i, (cls, col) in enumerate(zip(target_names, colors)):
        prob_true, prob_pred = calibration_curve(Y_bin[:,i], y_probs[:,i], n_bins=10)
        ax.plot(prob_pred, prob_true, 's-', label=cls, color=col)
        cal_data[cls] = {'prob_pred': prob_pred.tolist(), 'prob_true': prob_true.tolist()}
    ax.plot([0,1],[0,1],'k--', label='Perfect')
    ax.set_xlabel('Mean Predicted Prob'); ax.set_ylabel('Fraction of Positives')
    ax.set_title('Calibration Curves (All Classes)'); ax.legend()
    save_plot(fig, 'calibration_curve.png')

    # ── 20. Feature Importance (RF component) ──
    log.info('Extracting feature importance from RandomForest base...')
    try:
        rf_fi = RandomForestClassifier(n_estimators=100, class_weight='balanced',
                                       random_state=42, n_jobs=-1)
        rf_fi.fit(X_res, y_res)
        importances = rf_fi.feature_importances_
        fi_pairs = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)
        top20 = fi_pairs[:20]
        fi_names  = [x[0] for x in top20]
        fi_values = [float(x[1]) for x in top20]
        fig, ax = plt.subplots(figsize=(9,6))
        ax.barh(fi_names[::-1], fi_values[::-1], color='#22d3ee')
        ax.set_xlabel('Importance'); ax.set_title('Top 20 Feature Importances (RandomForest)')
        save_plot(fig, 'feature_importance.png')
        fi_json = [{'feature': n, 'importance': v} for n, v in zip(fi_names, fi_values)]
    except Exception as e:
        log.warning(f'Feature importance failed: {e}')
        fi_json = []

    # ── 21. Model comparison (argmax only — no threshold) ──
    model_comparison = {}
    log.info('Evaluating individual base models on test set (argmax)...')
    for name, m in model_defs:
        m.fit(X_res, y_res)
        prb = m.predict_proba(X_te_s)
        prd = np.argmax(prb, axis=1)
        model_comparison[name] = {
            'accuracy':  float((prd == y_te.values).mean()),
            'f1_macro':  float(f1_score(y_te, prd, average='macro', zero_division=0)),
            'roc_auc':   float(roc_auc_score(y_te, prb, multi_class='ovr')),
            **model_cv_scores.get(name, {})
        }
    model_comparison['CalibratedEnsemble'] = {
        'accuracy':  float(report['accuracy']),
        'f1_macro':  float(report['macro avg']['f1-score']),
        'roc_auc':   float(roc_auc)
    }
    fig, ax = plt.subplots(figsize=(8,5))
    names = list(model_comparison.keys())
    accs  = [model_comparison[n]['accuracy']  for n in names]
    f1s   = [model_comparison[n]['f1_macro']  for n in names]
    x = np.arange(len(names))
    ax.bar(x-0.2, accs, 0.4, label='Accuracy', color='#22d3ee')
    ax.bar(x+0.2, f1s,  0.4, label='Macro F1', color='#a78bfa')
    ax.set_xticks(x); ax.set_xticklabels(names, rotation=15, ha='right')
    ax.set_title('Model Comparison (Balanced)'); ax.legend()
    save_plot(fig, 'model_comparison.png')

    # ── 22. Compile metrics ──
    metrics = {
        'accuracy':       float(report['accuracy']),
        'macro_f1':       float(report['macro avg']['f1-score']),
        'weighted_f1':    float(report['weighted avg']['f1-score']),
        'macro_precision': float(report['macro avg']['precision']),
        'macro_recall':   float(report['macro avg']['recall']),
        'roc_auc':        float(roc_auc),
        'per_class_pr_auc': per_class_pr_auc,
        'per_class_brier':  per_class_brier,
        'prediction_mode': 'argmax',
        'model_name':     'CalibratedStackedEnsemble_Balanced',
        'dataset_size':   len(df),
        'feature_count':  len(feature_names),
        'train_samples':  len(X_res),
    }
    log.info(f'METRICS: {json.dumps(metrics, indent=2)}')

    # ── 23. Save all artifacts ──
    log.info('Saving artifacts...')
    with open(f'{MODELS_DIR}/best_model.pkl', 'wb')       as f: pickle.dump(calibrated, f)
    with open(f'{MODELS_DIR}/scaler.pkl', 'wb')            as f: pickle.dump(scaler, f)
    with open(f'{MODELS_DIR}/feature_names.pkl', 'wb')     as f: pickle.dump(feature_names, f)
    with open(f'{MODELS_DIR}/variance_selector.pkl', 'wb') as f: pickle.dump(vt, f)

    meta = {'clips': clips, 'log_cols': log_cols}
    _save_json('meta_info.json',          meta)
    _save_json('metrics.json',            metrics)
    _save_json('per_class_metrics.json',  per_class_metrics)
    _save_json('confusion_matrix.json',   {'matrix': cm.tolist(),
                                            'labels': ['Low Risk','Medium Risk','High Risk']})
    _save_json('roc_data.json',           roc_data)
    _save_json('pr_curve_data.json',      pr_data)
    _save_json('feature_importance.json', {'features': fi_json})
    _save_json('model_comparison.json',   model_comparison)
    _save_json('calibration_data.json',   cal_data)
    _save_json('class_distribution.json', class_dist_json)
    _save_json('system_info.json', {
        'dataset_size':    metrics['dataset_size'],
        'feature_count':   metrics['feature_count'],
        'train_samples':   metrics['train_samples'],
        'model_count':     len(model_defs) + 1,
        'platform_version': '3.0.0',
        'prediction_mode': 'argmax',
        'optimization':    'f1_macro',
        'resampling':      'SMOTE',
        'models': [n for n, _ in model_defs] + ['CalibratedEnsemble']
    })

    log.info('=== TRAINING COMPLETE — ALL ARTIFACTS SAVED ===')

def _save_json(name, data):
    path = os.path.join(MODELS_DIR, name)
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
    log.info(f'Saved {path}')

if __name__ == '__main__':
    main()
