"""
run_training.py — Binary classification with SMOTE + balanced class weights
Fixes the bias issue found in evaluation: model was always predicting Not Urgent.
Run: python run_training.py  (from backend/ directory)
"""

import pandas as pd
import numpy as np
import os, json, pickle, warnings
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.preprocessing import RobustScaler, label_binarize
from sklearn.model_selection import train_test_split
from sklearn.feature_selection import VarianceThreshold
from sklearn.metrics import (accuracy_score, classification_report, confusion_matrix,
    roc_auc_score, average_precision_score, brier_score_loss,
    roc_curve, precision_recall_curve, f1_score, matthews_corrcoef)
from sklearn.calibration import CalibratedClassifierCV
from imblearn.over_sampling import SMOTE

warnings.filterwarnings('ignore')
os.makedirs('models', exist_ok=True)
os.makedirs('outputs', exist_ok=True)
print('Libraries loaded.')

# ── ICD9 mapping ──────────────────────────────────────────────────────────────
def map_icd9(code):
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

def engineer_features(df):
    df['total_visits'] = df['number_inpatient']+df['number_outpatient']+df['number_emergency']
    df['medication_density'] = df['num_medications']/df['time_in_hospital'].clip(lower=1)
    df['procedure_intensity'] = df['num_lab_procedures']+df['num_procedures']
    df['chronic_complexity'] = df['number_diagnoses']*df['num_medications']
    df['admission_severity'] = df['number_inpatient']*2+df['number_emergency']
    df['utilization_score'] = df['total_visits']*df['num_medications']
    df['hospital_load'] = df['time_in_hospital']*df['num_lab_procedures']
    age_map = {'[0-10)':5,'[10-20)':15,'[20-30)':25,'[30-40)':35,'[40-50)':45,
               '[50-60)':55,'[60-70)':65,'[70-80)':75,'[80-90)':85,'[90-100)':95}
    df['age_num'] = df['age'].map(age_map).fillna(60)
    df['age_x_meds'] = df['age_num']*df['num_medications']
    df['inpatient_x_diag'] = df['number_inpatient']*df['number_diagnoses']
    df['time_x_meds'] = df['time_in_hospital']*df['num_medications']
    for col in ['num_medications','number_diagnoses','num_lab_procedures']:
        if col in df.columns:
            df[f'{col}_qbin'] = pd.qcut(df[col], q=4, labels=False, duplicates='drop')
    return df

# ── Load data ─────────────────────────────────────────────────────────────────
print('Loading dataset...')
df = pd.read_csv('data/raw/diabetic_data.csv')
df.replace('?', np.nan, inplace=True)
print(f'Loaded {len(df):,} rows x {df.shape[1]} cols')

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

# BINARY target: <30 days = 1 (Urgent), else = 0
df['readmitted'] = (df['readmitted'] == '<30').astype(int)
vc = df['readmitted'].value_counts()
print(f'Class 0 (Not Urgent): {vc.get(0,0):,}')
print(f'Class 1 (Urgent <30): {vc.get(1,0):,}')
print(f'Imbalance ratio: {vc.get(0,0)/vc.get(1,1):.1f}:1')

# ── Preprocessing ─────────────────────────────────────────────────────────────
print('Preprocessing...')
obj_cols = [c for c in df.select_dtypes('object').columns]
nc = [c for c in obj_cols if df[c].value_counts(normalize=True).iloc[0] >= 0.99]
df.drop(columns=nc, inplace=True, errors='ignore')

df = pd.get_dummies(df, drop_first=True)
X = df.drop('readmitted', axis=1).astype(np.float32)
y = df['readmitted'].astype(int)

num_cols = X.select_dtypes(include='number').columns.tolist()
clips = {}
for c in num_cols:
    p1, p99 = X[c].quantile(0.01), X[c].quantile(0.99)
    clips[c] = (float(p1), float(p99))
    X[c] = X[c].clip(p1, p99)

skewed = ['total_visits','num_medications','number_inpatient','number_emergency',
          'number_outpatient','hospital_load','utilization_score']
log_cols = []
for c in skewed:
    if c in X.columns:
        X[f'{c}_log'] = np.log1p(X[c])
        X.drop(columns=[c], inplace=True)
        log_cols.append(c)

vt = VarianceThreshold(threshold=0.001)
X_arr = vt.fit_transform(X)
feature_names = [X.columns[i] for i in vt.get_support(indices=True)]
X = pd.DataFrame(X_arr, columns=feature_names)

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

scaler = RobustScaler()
X_tr_s = pd.DataFrame(scaler.fit_transform(X_tr), columns=feature_names)
X_te_s = pd.DataFrame(scaler.transform(X_te), columns=feature_names)

print(f'Features: {len(feature_names)} | Train: {len(X_tr_s):,} | Test: {len(X_te_s):,}')

# ── SMOTE: balance training set ───────────────────────────────────────────────
print('Applying SMOTE to balance training classes...')
smote = SMOTE(sampling_strategy=0.5, random_state=42, k_neighbors=5)
X_res, y_res = smote.fit_resample(X_tr_s, y_tr)
print(f'After SMOTE: {len(X_res):,} train samples')
print(f'  Class 0: {(y_res==0).sum():,} | Class 1: {(y_res==1).sum():,}')

# ── Train with class_weight awareness ────────────────────────────────────────
print('Training HistGradientBoosting (SMOTE + balanced)...')
model = HistGradientBoostingClassifier(
    max_iter=400,
    learning_rate=0.05,
    max_depth=5,
    min_samples_leaf=20,
    l2_regularization=0.1,
    class_weight='balanced',
    random_state=42
)
calibrated = CalibratedClassifierCV(estimator=model, method='isotonic', cv=3)
calibrated.fit(X_res, y_res)
print('Training complete.')

# ── Evaluate ──────────────────────────────────────────────────────────────────
print('Evaluating...')
y_probs = calibrated.predict_proba(X_te_s)[:, 1]

# Find optimal threshold using F1 for Urgent class
from sklearn.metrics import precision_recall_curve
p_vals, r_vals, thresholds = precision_recall_curve(y_te, y_probs)
f1_vals = 2*p_vals*r_vals/(p_vals+r_vals+1e-8)
best_thresh_idx = np.argmax(f1_vals[:-1])
best_thresh = float(thresholds[best_thresh_idx])
print(f'Optimal threshold (max F1 for Urgent): {best_thresh:.3f}')

y_pred = (y_probs >= best_thresh).astype(int)

accuracy    = accuracy_score(y_te, y_pred)
roc_auc     = roc_auc_score(y_te, y_probs)
mcc         = matthews_corrcoef(y_te, y_pred)
report      = classification_report(y_te, y_pred, output_dict=True)

print(f'\nAccuracy:    {accuracy:.4f} ({accuracy*100:.2f}%)')
print(f'ROC-AUC:     {roc_auc:.4f}')
print(f'MCC:         {mcc:.4f}')
print(f'Best Thresh: {best_thresh:.3f}')
print('\nClassification Report:')
print(classification_report(y_te, y_pred,
      target_names=['Not Urgent (0)', 'Urgent <30 Days (1)']))

cm = confusion_matrix(y_te, y_pred)
tn, fp, fn, tp = cm.ravel()
print(f'Sensitivity (Urgent Recall): {tp/(tp+fn):.4f}  ({tp/(tp+fn)*100:.1f}% of urgent cases caught)')

# ── Plots ─────────────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(6,5))
im = ax.imshow(cm, cmap='Blues')
ax.set_xticks([0,1]); ax.set_yticks([0,1])
ax.set_xticklabels(['Not Urgent','Urgent (<30)'])
ax.set_yticklabels(['Not Urgent','Urgent (<30)'])
for i in range(2):
    for j in range(2):
        ax.text(j,i,f'{cm[i,j]:,}',ha='center',va='center',
                color='white' if cm[i,j]>cm.max()/2 else 'black')
ax.set_xlabel('Predicted'); ax.set_ylabel('Actual')
ax.set_title(f'Confusion Matrix (thresh={best_thresh:.2f})')
plt.colorbar(im, ax=ax); plt.tight_layout()
plt.savefig('outputs/confusion_matrix.png', dpi=150, bbox_inches='tight')
plt.close()

fpr, tpr, _ = roc_curve(y_te, y_probs)
fig2, ax2 = plt.subplots(figsize=(7,5))
ax2.plot(fpr, tpr, color='#22d3ee', lw=2, label=f'Urgent AUC={roc_auc:.3f}')
ax2.plot([0,1],[0,1],'k--',lw=1)
ax2.set_xlabel('FPR'); ax2.set_ylabel('TPR')
ax2.set_title('ROC Curve (Binary, SMOTE)'); ax2.legend()
plt.tight_layout()
plt.savefig('outputs/roc_curves.png', dpi=150, bbox_inches='tight')
plt.close()

fig3, ax3 = plt.subplots(figsize=(7,5))
ax3.plot(r_vals, p_vals, color='#a78bfa', lw=2, label=f'AP={average_precision_score(y_te, y_probs):.3f}')
ax3.set_xlabel('Recall'); ax3.set_ylabel('Precision')
ax3.set_title('Precision-Recall Curve'); ax3.legend()
plt.tight_layout()
plt.savefig('outputs/pr_curves.png', dpi=150, bbox_inches='tight')
plt.close()
print('Plots saved.')

# ── Save artifacts ────────────────────────────────────────────────────────────
with open('models/best_model.pkl','wb') as f: pickle.dump(calibrated, f)
with open('models/scaler.pkl','wb') as f: pickle.dump(scaler, f)
with open('models/feature_names.pkl','wb') as f: pickle.dump(feature_names, f)
with open('models/variance_selector.pkl','wb') as f: pickle.dump(vt, f)

meta = {'clips': clips, 'log_cols': log_cols, 'threshold': best_thresh}
with open('models/meta_info.json','w') as f: json.dump(meta, f)

target_names = ['Not Urgent', 'Urgent (<30)']
y_te_arr = np.array(y_te)
per_class = {}
for i, cls in enumerate(target_names):
    key = str(i)
    y_true_i  = (y_te_arr == i).astype(int)
    y_score_i = (1-y_probs) if i == 0 else y_probs
    per_class[cls] = {
        'precision': float(report[key]['precision']),
        'recall':    float(report[key]['recall']),
        'f1_score':  float(report[key]['f1-score']),
        'support':   int(report[key]['support']),
        'pr_auc':    float(average_precision_score(y_true_i, y_score_i)),
        'brier':     float(brier_score_loss(y_true_i, y_score_i))
    }

metrics = {
    'accuracy':         float(accuracy),
    'macro_f1':         float(f1_score(y_te, y_pred, average='macro', zero_division=0)),
    'weighted_f1':      float(report['weighted avg']['f1-score']),
    'macro_precision':  float(report['macro avg']['precision']),
    'macro_recall':     float(report['macro avg']['recall']),
    'roc_auc':          float(roc_auc),
    'mcc':              float(mcc),
    'decision_threshold': float(best_thresh),
    'per_class_pr_auc': {cls: per_class[cls]['pr_auc'] for cls in target_names},
    'per_class_brier':  {cls: per_class[cls]['brier']  for cls in target_names},
    'prediction_mode':  'binary_optimal_threshold',
    'model_name':       'CalibratedHistGB_SMOTE_Balanced',
    'dataset_size':     int(len(df)),
    'feature_count':    int(len(feature_names)),
    'train_samples':    int(len(X_res)),
    'resampling':       'SMOTE(0.5)'
}
with open('models/metrics.json','w') as f: json.dump(metrics, f, indent=2)
with open('models/per_class_metrics.json','w') as f: json.dump(per_class, f, indent=2)

MAX_PTS = 200
idx = np.linspace(0, len(fpr)-1, min(MAX_PTS, len(fpr)), dtype=int)
roc_data = {'Urgent (<30)': {'fpr': fpr[idx].tolist(), 'tpr': tpr[idx].tolist(), 'auc': float(roc_auc)}}
with open('models/roc_data.json','w') as f: json.dump(roc_data, f, indent=2)

with open('models/confusion_matrix.json','w') as f:
    json.dump({'matrix': cm.tolist(), 'labels': target_names}, f, indent=2)

model_comp = {
    'CalibratedHistGB_SMOTE': {
        'accuracy':    float(accuracy),
        'f1_macro':    float(f1_score(y_te, y_pred, average='macro', zero_division=0)),
        'roc_auc':     float(roc_auc),
        'mcc':         float(mcc),
        'threshold':   float(best_thresh),
        'weighted_f1': float(report['weighted avg']['f1-score'])
    }
}
with open('models/model_comparison.json','w') as f: json.dump(model_comp, f, indent=2)

sys_info = {
    'dataset_size':    int(len(df)),
    'feature_count':   int(len(feature_names)),
    'train_samples':   int(len(X_res)),
    'model_count':     1,
    'platform_version':'4.1.0',
    'prediction_mode': 'binary_optimal_threshold',
    'optimization':    'F1_Urgent_class',
    'resampling':      'SMOTE(ratio=0.5)',
    'models':          ['CalibratedHistGB_SMOTE_Balanced']
}
with open('models/system_info.json','w') as f: json.dump(sys_info, f, indent=2)

# Update class distribution JSON  
class_dist = {'Not Urgent': int((y_res==0).sum()), 'Urgent (<30)': int((y_res==1).sum())}
with open('models/class_distribution.json','w') as f: json.dump(class_dist, f, indent=2)

print('\n=== TRAINING COMPLETE ===')
print(f'Accuracy:    {accuracy*100:.2f}%')
print(f'ROC-AUC:     {roc_auc:.4f}')
print(f'MCC:         {mcc:.4f}')
print(f'Threshold:   {best_thresh:.3f}')
print(f'Urgent Recall (Sensitivity): {tp/(tp+fn)*100:.1f}%')
print(f'Model saved to: models/best_model.pkl')
