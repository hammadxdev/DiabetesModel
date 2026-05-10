<div align="center">

# 🏥 DiabetesGuard AI

### Diabetes Hospital Readmission Risk Prediction System

An end-to-end machine learning system that predicts hospital readmission risk for diabetic patients using ensemble learning models, served through a FastAPI backend and a modern React dashboard.

[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.8-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)

---

**Developer:** Muhammad Hammad — Fa-2023/BSCS/514  
**Course:** CCP Project

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Dataset](#-dataset)
- [ML Pipeline](#-ml-pipeline)
- [Model Performance](#-model-performance)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)

---

## 🔍 Overview

DiabetesGuard AI analyzes patient hospital records to predict the likelihood of hospital readmission for diabetic patients. The system classifies patients into three risk categories:

| Risk Level | Description |
|:---:|---|
| 🟢 **Low Risk** | Not readmitted — minimal follow-up needed |
| 🟡 **Medium Risk** | Readmitted after 30 days — schedule monitoring |
| 🔴 **High Risk** | Readmitted within 30 days — immediate intervention |

The complete workflow covers:
1. **Exploratory Data Analysis** on 100K+ hospital records
2. **Feature Engineering** with ICD-9 diagnosis mapping
3. **SMOTE Balancing** to handle class imbalance
4. **Ensemble Model Training** (Random Forest, Gradient Boosting, AdaBoost, Voting Classifier)
5. **REST API** for real-time inference
6. **React Dashboard** for clinician-facing predictions

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER / BROWSER                          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   React Frontend    │
                    │   (Vercel)          │
                    │                     │
                    │  • Prediction Form  │
                    │  • Result Cards     │
                    │  • About / Docs     │
                    └──────────┬──────────┘
                               │ Axios POST /predict
                    ┌──────────▼──────────┐
                    │   FastAPI Backend   │
                    │   (Render)          │
                    │                     │
                    │  • Input Validation │
                    │  • Preprocessing    │
                    │  • One-Hot Encoding │
                    │  • Feature Scaling  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   ML Inference      │
                    │                     │
                    │  • Voting Classifier│
                    │  • StandardScaler   │
                    │  • Feature Columns  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   JSON Response     │
                    │                     │
                    │  { prediction,      │
                    │    risk_code }      │
                    └─────────────────────┘
```

---

## 📊 Dataset

| Property | Detail |
|---|---|
| **Source** | [UCI Diabetes 130-US Hospitals](https://archive.ics.uci.edu/dataset/296/diabetes+130-us+hospitals+for+years+1999-2008) |
| **Records** | 100,000+ patient encounters |
| **Hospitals** | 130 US hospitals (1999–2008) |
| **Features** | 50 raw → 103 engineered |
| **Target** | `readmitted` (NO / >30 / <30) → mapped to 3 risk classes |

### Feature Engineering Highlights

- **ICD-9 Diagnosis Mapping:** 717 unique diagnosis codes → 20 clinical categories
- **One-Hot Encoding:** Categorical features expanded to binary columns
- **SMOTE Oversampling:** Balanced training set from ~54K to ~131K samples
- **StandardScaler:** Normalized all features for model stability

---

## 🧠 ML Pipeline

```
Raw CSV Data
    ↓
Exploratory Data Analysis (EDA)
    ↓
Preprocessing & ICD-9 Mapping
    ↓
SMOTE Class Balancing
    ↓
Train/Test Split (80/20)
    ↓
Model Training (4 models)
    ↓
Voting Classifier (meta-ensemble)
    ↓
Model Evaluation
    ↓
Artifact Export (.pkl)
    ↓
FastAPI Serving
    ↓
React Dashboard
```

---

## 📈 Model Performance

| Model | Type | Accuracy |
|---|---|:---:|
| **Gradient Boosting** | Boosting | **58.73%** |
| **Voting Classifier** ⭐ | Meta-Ensemble | **57.75%** |
| **Random Forest** | Bagging | **57.56%** |
| **AdaBoost** | Boosting | **52.55%** |

> ⭐ The **Voting Classifier** (soft voting of RF + GB + AdaBoost) is used in production for higher reliability across all risk classes.

> **Note:** Accuracy reflects the inherent difficulty of hospital readmission prediction — this is consistent with published medical research benchmarks for this dataset.

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Python 3.13 | Core language |
| FastAPI | REST API framework |
| scikit-learn | ML models & preprocessing |
| pandas / NumPy | Data manipulation |
| imbalanced-learn | SMOTE oversampling |
| Uvicorn | ASGI server |

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite | Build tool |
| Tailwind CSS 3 | Styling |
| Axios | HTTP client |
| React Router v7 | Navigation |
| React Icons | Icon library |

---

## 📁 Project Structure

```
DiabetesModel/
│
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI application
│   │   ├── predictor.py       # ML inference logic
│   │   ├── schemas.py         # Pydantic input validation
│   │   └── utils.py           # Helper utilities
│   │
│   ├── models/
│   │   ├── best_model.pkl     # Voting Classifier (production)
│   │   ├── scaler.pkl         # StandardScaler
│   │   └── feature_columns.pkl# Training feature alignment
│   │
│   ├── notebooks/             # Jupyter notebooks (EDA + training)
│   └── requirements.txt       # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx     # Navigation bar
│   │   │   ├── PredictionForm.jsx  # Patient input form
│   │   │   ├── ResultCard.jsx      # Risk display card
│   │   │   ├── Footer.jsx         # Footer with credits
│   │   │   └── Loader.jsx         # Loading animation
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx       # Landing page
│   │   │   ├── Predict.jsx    # Prediction page
│   │   │   └── About.jsx      # Model documentation
│   │   │
│   │   ├── services/
│   │   │   └── api.js         # Axios API configuration
│   │   │
│   │   ├── App.jsx            # Router setup
│   │   └── index.css          # Global styles
│   │
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 🚀 Installation & Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
cd app
uvicorn main:app --reload
```

Server runs at: `http://127.0.0.1:8000`  
Swagger Docs: `http://127.0.0.1:8000/docs`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 📡 API Documentation

### `GET /`

Health check endpoint.

**Response:**
```json
{
  "message": "Diabetes Risk Prediction API Running"
}
```

### `POST /predict`

Predict readmission risk for a patient.

**Request Body:**
```json
{
  "race": "Caucasian",
  "gender": "Female",
  "age": "[50-60)",
  "admission_type_id": 1,
  "discharge_disposition_id": 1,
  "admission_source_id": 7,
  "time_in_hospital": 4,
  "num_lab_procedures": 41,
  "num_procedures": 1,
  "num_medications": 12,
  "number_outpatient": 0,
  "number_emergency": 0,
  "number_inpatient": 0,
  "number_diagnoses": 5,
  "insulin": "No",
  "diabetesMed": "Yes"
}
```

**Response:**
```json
{
  "prediction": "Low Risk",
  "risk_code": 0
}
```

| risk_code | prediction | meaning |
|:---:|---|---|
| 0 | Low Risk | Not likely to be readmitted |
| 1 | Medium Risk | May be readmitted after 30 days |
| 2 | High Risk | Likely readmitted within 30 days |

---

## ☁️ Deployment

### Backend → Render

| Setting | Value |
|---|---|
| **Root Directory** | `backend` |
| **Environment** | Python |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port 10000` |

### Frontend → Vercel

| Setting | Value |
|---|---|
| **Root Directory** | `frontend` |
| **Framework** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

> ⚠️ **Important:** After deploying the backend on Render, update the API base URL in `frontend/src/services/api.js` with your Render URL before deploying the frontend.

---

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Home Page
The landing page with hero section, system statistics, and architecture feature cards.

### Prediction Form
Patient input form with 8 clinical fields for risk assessment.

### Low Risk Result
Green badge with positive assessment and lifestyle recommendations.

### Medium Risk Result
Amber badge with monitoring recommendations.

### About Page
Complete ML pipeline documentation, model comparison table, and technology stack.

### Swagger API Docs
Interactive API documentation with request/response schemas.

</details>

---

## 📄 License

This project was developed as part of the CCP coursework at LGU.

---

<div align="center">

**Developed with ❤️ by Muhammad Hammad**  
Fa-2023/BSCS/514

</div>
