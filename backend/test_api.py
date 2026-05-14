"""
test_api.py — Send 30 test patient samples to the /predict API.
Shows predictions vs ground truth, accuracy, and breakdown.
Run: python test_api.py  (backend must be running on port 8000)
"""
import requests, json
import pandas as pd

API = "http://localhost:8000/predict"

# ── 30 labelled test cases ─────────────────────────────────────────────────────
# Each entry: (patient_dict, true_label)
# true_label: "Not Urgent" or "Urgent (<30)"
# Patients crafted to represent realistic clinical scenarios

SAMPLES = [
    # ── True NOT URGENT (Low Risk) — 15 cases ─────────────────────────────────
    {
        "label": "Not Urgent",
        "desc": "Young, short stay, minimal meds",
        "patient": {
            "age": "[30-40)", "admission_type_id": 1, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 2, "num_lab_procedures": 20,
            "num_procedures": 0, "num_medications": 5, "number_outpatient": 0,
            "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 3,
            "diag_1_cat": "Diabetes_Type2", "insulin": "No", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Not Urgent",
        "desc": "Middle-aged, routine admission",
        "patient": {
            "age": "[50-60)", "admission_type_id": 3, "discharge_disposition_id": 1,
            "admission_source_id": 1, "time_in_hospital": 3, "num_lab_procedures": 35,
            "num_procedures": 1, "num_medications": 10, "number_outpatient": 1,
            "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 5,
            "diag_1_cat": "Circ_Other", "insulin": "Steady", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Not Urgent",
        "desc": "Elderly, low complexity",
        "patient": {
            "age": "[70-80)", "admission_type_id": 2, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 2, "num_lab_procedures": 25,
            "num_procedures": 0, "num_medications": 8, "number_outpatient": 2,
            "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 4,
            "diag_1_cat": "Endocrine_Other", "insulin": "No", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Not Urgent",
        "desc": "First-time admission, stable",
        "patient": {
            "age": "[40-50)", "admission_type_id": 1, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 1, "num_lab_procedures": 18,
            "num_procedures": 0, "num_medications": 6, "number_outpatient": 0,
            "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 2,
            "diag_1_cat": "Diabetes_Type2", "insulin": "Up", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Not Urgent",
        "desc": "Outpatient history only",
        "patient": {
            "age": "[60-70)", "admission_type_id": 3, "discharge_disposition_id": 1,
            "admission_source_id": 1, "time_in_hospital": 2, "num_lab_procedures": 30,
            "num_procedures": 1, "num_medications": 12, "number_outpatient": 5,
            "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 6,
            "diag_1_cat": "Digestive", "insulin": "Steady", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Not Urgent",
        "desc": "Low lab work, no prior visits",
        "patient": {
            "age": "[20-30)", "admission_type_id": 1, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 1, "num_lab_procedures": 10,
            "num_procedures": 0, "num_medications": 3, "number_outpatient": 0,
            "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 2,
            "diag_1_cat": "Diabetes_Type2", "insulin": "No", "diabetesMed": "No"
        }
    },
    {
        "label": "Not Urgent",
        "desc": "Scheduled surgery, clean discharge",
        "patient": {
            "age": "[55-60)", "admission_type_id": 2, "discharge_disposition_id": 1,
            "admission_source_id": 2, "time_in_hospital": 4, "num_lab_procedures": 40,
            "num_procedures": 2, "num_medications": 14, "number_outpatient": 1,
            "number_emergency": 0, "number_inpatient": 1, "number_diagnoses": 5,
            "diag_1_cat": "Musculoskeletal", "insulin": "No", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Not Urgent",
        "desc": "Senior with few meds",
        "patient": {
            "age": "[80-90)", "admission_type_id": 1, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 3, "num_lab_procedures": 28,
            "num_procedures": 0, "num_medications": 7, "number_outpatient": 0,
            "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 3,
            "diag_1_cat": "Circ_Hypertension", "insulin": "Steady", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Not Urgent",
        "desc": "No emergency history",
        "patient": {
            "age": "[45-50)", "admission_type_id": 3, "discharge_disposition_id": 1,
            "admission_source_id": 1, "time_in_hospital": 2, "num_lab_procedures": 22,
            "num_procedures": 1, "num_medications": 9, "number_outpatient": 3,
            "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 4,
            "diag_1_cat": "Respiratory_Other", "insulin": "No", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Not Urgent",
        "desc": "Very low risk profile",
        "patient": {
            "age": "[35-40)", "admission_type_id": 1, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 1, "num_lab_procedures": 15,
            "num_procedures": 0, "num_medications": 4, "number_outpatient": 0,
            "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 2,
            "diag_1_cat": "Diabetes_Type2", "insulin": "Down", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Not Urgent",
        "desc": "Stable chronic condition",
        "patient": {
            "age": "[65-70)", "admission_type_id": 3, "discharge_disposition_id": 1,
            "admission_source_id": 1, "time_in_hospital": 3, "num_lab_procedures": 32,
            "num_procedures": 1, "num_medications": 11, "number_outpatient": 2,
            "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 5,
            "diag_1_cat": "Circ_HeartDisease", "insulin": "Steady", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Not Urgent",
        "desc": "Single outpatient visit history",
        "patient": {
            "age": "[50-60)", "admission_type_id": 1, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 2, "num_lab_procedures": 26,
            "num_procedures": 0, "num_medications": 8, "number_outpatient": 1,
            "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 4,
            "diag_1_cat": "Genitourinary", "insulin": "No", "diabetesMed": "No"
        }
    },
    {
        "label": "Not Urgent",
        "desc": "Minor injury, low complexity",
        "patient": {
            "age": "[25-30)", "admission_type_id": 1, "discharge_disposition_id": 1,
            "admission_source_id": 7, "time_in_hospital": 2, "num_lab_procedures": 12,
            "num_procedures": 1, "num_medications": 5, "number_outpatient": 0,
            "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 2,
            "diag_1_cat": "Injury", "insulin": "No", "diabetesMed": "No"
        }
    },
    {
        "label": "Not Urgent",
        "desc": "Few diagnoses, stable",
        "patient": {
            "age": "[60-70)", "admission_type_id": 2, "discharge_disposition_id": 1,
            "admission_source_id": 2, "time_in_hospital": 2, "num_lab_procedures": 20,
            "num_procedures": 0, "num_medications": 6, "number_outpatient": 0,
            "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 3,
            "diag_1_cat": "Neoplasms", "insulin": "Steady", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Not Urgent",
        "desc": "Moderate stay, no prior inpatient",
        "patient": {
            "age": "[70-80)", "admission_type_id": 3, "discharge_disposition_id": 1,
            "admission_source_id": 1, "time_in_hospital": 4, "num_lab_procedures": 38,
            "num_procedures": 1, "num_medications": 13, "number_outpatient": 1,
            "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 6,
            "diag_1_cat": "Blood", "insulin": "No", "diabetesMed": "Yes"
        }
    },

    # ── True URGENT (High Risk) — 15 cases ────────────────────────────────────
    {
        "label": "Urgent (<30)",
        "desc": "Multiple prior inpatient stays",
        "patient": {
            "age": "[70-80)", "admission_type_id": 1, "discharge_disposition_id": 3,
            "admission_source_id": 7, "time_in_hospital": 10, "num_lab_procedures": 65,
            "num_procedures": 4, "num_medications": 20, "number_outpatient": 0,
            "number_emergency": 3, "number_inpatient": 5, "number_diagnoses": 9,
            "diag_1_cat": "Circ_HeartDisease", "insulin": "Up", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Urgent (<30)",
        "desc": "High emergency visits, complex",
        "patient": {
            "age": "[80-90)", "admission_type_id": 1, "discharge_disposition_id": 6,
            "admission_source_id": 4, "time_in_hospital": 12, "num_lab_procedures": 70,
            "num_procedures": 5, "num_medications": 24, "number_outpatient": 0,
            "number_emergency": 5, "number_inpatient": 6, "number_diagnoses": 10,
            "diag_1_cat": "Circ_HeartDisease", "insulin": "Up", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Urgent (<30)",
        "desc": "Long stay, many meds",
        "patient": {
            "age": "[75-80)", "admission_type_id": 1, "discharge_disposition_id": 3,
            "admission_source_id": 1, "time_in_hospital": 14, "num_lab_procedures": 72,
            "num_procedures": 6, "num_medications": 28, "number_outpatient": 0,
            "number_emergency": 4, "number_inpatient": 8, "number_diagnoses": 11,
            "diag_1_cat": "Resp_COPD", "insulin": "Up", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Urgent (<30)",
        "desc": "Frequent ER, high diagnoses",
        "patient": {
            "age": "[65-70)", "admission_type_id": 1, "discharge_disposition_id": 5,
            "admission_source_id": 7, "time_in_hospital": 11, "num_lab_procedures": 68,
            "num_procedures": 3, "num_medications": 22, "number_outpatient": 0,
            "number_emergency": 6, "number_inpatient": 7, "number_diagnoses": 9,
            "diag_1_cat": "Diabetes_Type2", "insulin": "Up", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Urgent (<30)",
        "desc": "Prior high-acuity hospitalizations",
        "patient": {
            "age": "[70-80)", "admission_type_id": 2, "discharge_disposition_id": 3,
            "admission_source_id": 4, "time_in_hospital": 9, "num_lab_procedures": 60,
            "num_procedures": 4, "num_medications": 18, "number_outpatient": 1,
            "number_emergency": 2, "number_inpatient": 4, "number_diagnoses": 8,
            "diag_1_cat": "Circ_Other", "insulin": "Down", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Urgent (<30)",
        "desc": "Severe multi-morbidity",
        "patient": {
            "age": "[80-90)", "admission_type_id": 1, "discharge_disposition_id": 6,
            "admission_source_id": 1, "time_in_hospital": 13, "num_lab_procedures": 75,
            "num_procedures": 5, "num_medications": 26, "number_outpatient": 0,
            "number_emergency": 7, "number_inpatient": 9, "number_diagnoses": 12,
            "diag_1_cat": "Resp_COPD", "insulin": "Up", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Urgent (<30)",
        "desc": "Repeated failures, complex DM",
        "patient": {
            "age": "[60-70)", "admission_type_id": 1, "discharge_disposition_id": 3,
            "admission_source_id": 7, "time_in_hospital": 8, "num_lab_procedures": 55,
            "num_procedures": 3, "num_medications": 19, "number_outpatient": 0,
            "number_emergency": 4, "number_inpatient": 5, "number_diagnoses": 8,
            "diag_1_cat": "Diabetes_Type2", "insulin": "Up", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Urgent (<30)",
        "desc": "Nursing-home discharge, high risk",
        "patient": {
            "age": "[85-90)", "admission_type_id": 1, "discharge_disposition_id": 4,
            "admission_source_id": 4, "time_in_hospital": 10, "num_lab_procedures": 62,
            "num_procedures": 4, "num_medications": 21, "number_outpatient": 0,
            "number_emergency": 3, "number_inpatient": 6, "number_diagnoses": 9,
            "diag_1_cat": "Circ_HeartDisease", "insulin": "Steady", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Urgent (<30)",
        "desc": "ICU-level complexity",
        "patient": {
            "age": "[75-80)", "admission_type_id": 1, "discharge_disposition_id": 5,
            "admission_source_id": 1, "time_in_hospital": 14, "num_lab_procedures": 80,
            "num_procedures": 6, "num_medications": 30, "number_outpatient": 0,
            "number_emergency": 8, "number_inpatient": 10, "number_diagnoses": 13,
            "diag_1_cat": "Resp_COPD", "insulin": "Up", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Urgent (<30)",
        "desc": "High insulin adjustment, inpatient repeat",
        "patient": {
            "age": "[65-70)", "admission_type_id": 2, "discharge_disposition_id": 3,
            "admission_source_id": 7, "time_in_hospital": 7, "num_lab_procedures": 50,
            "num_procedures": 2, "num_medications": 16, "number_outpatient": 0,
            "number_emergency": 2, "number_inpatient": 3, "number_diagnoses": 7,
            "diag_1_cat": "Diabetes_Type2", "insulin": "Up", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Urgent (<30)",
        "desc": "Severe cardiac + renal",
        "patient": {
            "age": "[70-80)", "admission_type_id": 1, "discharge_disposition_id": 6,
            "admission_source_id": 4, "time_in_hospital": 11, "num_lab_procedures": 67,
            "num_procedures": 5, "num_medications": 23, "number_outpatient": 0,
            "number_emergency": 5, "number_inpatient": 7, "number_diagnoses": 10,
            "diag_1_cat": "Circ_HeartDisease", "insulin": "Down", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Urgent (<30)",
        "desc": "Many diagnoses, repeated ER",
        "patient": {
            "age": "[80-90)", "admission_type_id": 1, "discharge_disposition_id": 3,
            "admission_source_id": 1, "time_in_hospital": 9, "num_lab_procedures": 58,
            "num_procedures": 3, "num_medications": 20, "number_outpatient": 0,
            "number_emergency": 4, "number_inpatient": 5, "number_diagnoses": 10,
            "diag_1_cat": "Resp_Other", "insulin": "Up", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Urgent (<30)",
        "desc": "High-med, long stay, ER history",
        "patient": {
            "age": "[72-80)", "admission_type_id": 1, "discharge_disposition_id": 5,
            "admission_source_id": 7, "time_in_hospital": 12, "num_lab_procedures": 73,
            "num_procedures": 4, "num_medications": 25, "number_outpatient": 0,
            "number_emergency": 6, "number_inpatient": 8, "number_diagnoses": 11,
            "diag_1_cat": "Digestive", "insulin": "Up", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Urgent (<30)",
        "desc": "Frail elder, poor prognosis",
        "patient": {
            "age": "[90-100)", "admission_type_id": 1, "discharge_disposition_id": 6,
            "admission_source_id": 4, "time_in_hospital": 13, "num_lab_procedures": 76,
            "num_procedures": 5, "num_medications": 27, "number_outpatient": 0,
            "number_emergency": 7, "number_inpatient": 9, "number_diagnoses": 12,
            "diag_1_cat": "Circ_Other", "insulin": "Up", "diabetesMed": "Yes"
        }
    },
    {
        "label": "Urgent (<30)",
        "desc": "Maximal complexity profile",
        "patient": {
            "age": "[80-90)", "admission_type_id": 1, "discharge_disposition_id": 5,
            "admission_source_id": 1, "time_in_hospital": 14, "num_lab_procedures": 79,
            "num_procedures": 6, "num_medications": 29, "number_outpatient": 0,
            "number_emergency": 8, "number_inpatient": 11, "number_diagnoses": 13,
            "diag_1_cat": "Circ_HeartDisease", "insulin": "Up", "diabetesMed": "Yes"
        }
    },
]

# ── Run predictions ────────────────────────────────────────────────────────────
print(f"\n{'='*75}")
print(f"  API TEST REPORT — {len(SAMPLES)} Patient Samples")
print(f"  Endpoint: {API}")
print(f"{'='*75}\n")

results = []
errors  = []

for i, s in enumerate(SAMPLES, 1):
    try:
        r = requests.post(API, json=s["patient"], timeout=10)
        r.raise_for_status()
        resp = r.json()
        pred_label = resp.get("risk_label", "Unknown")
        prob_urgent = resp.get("probabilities", {}).get("urgent", resp.get("probabilities", {}).get("high_risk", 0))
        correct = (s["label"] == "Urgent (<30)") == (pred_label != "Not Urgent")
        results.append({
            "id": i,
            "desc": s["desc"],
            "true": s["label"],
            "pred": pred_label,
            "prob_urgent": prob_urgent,
            "correct": correct
        })
    except Exception as e:
        errors.append(f"  Sample {i} ({s['desc']}): {e}")

# ── Print table ────────────────────────────────────────────────────────────────
print(f"  {'#':<3} {'Description':<35} {'True Label':<16} {'Predicted':<32} {'Prob':<7} {'OK?'}")
print(f"  {'-'*3} {'-'*35} {'-'*16} {'-'*32} {'-'*7} {'-'*5}")

for r in results:
    ok   = "YES" if r["correct"] else "NO "
    true = "Not Urgent" if r["true"] == "Not Urgent" else "Urgent (<30)"
    pred = "Urgent" if r["pred"] != "Not Urgent" else "Not Urgent"
    mark = "" if r["correct"] else "  <-- WRONG"
    print(f"  {r['id']:<3} {r['desc']:<35} {true:<16} {pred:<32} {r['prob_urgent']:<7.3f} {ok}{mark}")

# ── Summarise ──────────────────────────────────────────────────────────────────
total     = len(results)
correct   = sum(1 for r in results if r["correct"])
incorrect = total - correct

low_risk  = [r for r in results if r["pred"] == "Not Urgent"]
high_risk = [r for r in results if r["pred"] != "Not Urgent"]

true_not_urgent = [r for r in results if r["true"] == "Not Urgent"]
true_urgent     = [r for r in results if r["true"] == "Urgent (<30)"]

tp = sum(1 for r in true_urgent     if r["correct"])   # correctly flagged urgent
tn = sum(1 for r in true_not_urgent if r["correct"])   # correctly cleared
fp = sum(1 for r in true_not_urgent if not r["correct"])  # false alarms
fn = sum(1 for r in true_urgent     if not r["correct"])  # missed urgents

print(f"\n{'='*75}")
print(f"  SUMMARY")
print(f"{'='*75}")
print(f"  Total samples tested:       {total}")
print(f"  Predicted NOT URGENT:       {len(low_risk)}  ({len(low_risk)/total*100:.1f}%)")
print(f"  Predicted URGENT (<30):     {len(high_risk)}  ({len(high_risk)/total*100:.1f}%)")
print(f"\n  Overall Correct:            {correct}/{total}  ({correct/total*100:.1f}%)")
print(f"  Overall Wrong:              {incorrect}/{total}  ({incorrect/total*100:.1f}%)")

print(f"\n  Confusion Matrix:")
print(f"    True Urgent  flagged correctly (TP): {tp}/{len(true_urgent)}  ({tp/len(true_urgent)*100:.0f}%)")
print(f"    True Not-Urgent cleared (TN):        {tn}/{len(true_not_urgent)}  ({tn/len(true_not_urgent)*100:.0f}%)")
print(f"    False Alarms (FP):                   {fp}/{len(true_not_urgent)}")
print(f"    Missed Urgents (FN):                 {fn}/{len(true_urgent)}")

if len(true_urgent) > 0:
    sensitivity = tp / len(true_urgent)
    print(f"\n  Sensitivity (Urgent Recall):  {sensitivity:.2%}")
if (tp + fp) > 0:
    precision = tp / (tp + fp)
    print(f"  Precision (when says Urgent): {precision:.2%}")
if (tp + fp + tn + fn) > 0:
    accuracy = (tp + tn) / (tp + fp + tn + fn)
    print(f"  Overall Accuracy:             {accuracy:.2%}")

if errors:
    print(f"\n  ERRORS ({len(errors)}):")
    for e in errors:
        print(e)

print(f"\n{'='*75}\n")
