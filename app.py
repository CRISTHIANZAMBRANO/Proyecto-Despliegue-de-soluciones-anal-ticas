from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np

# ===== Cargar el modelo entrenado =====
model = joblib.load("model_xgboost.pkl")

app = FastAPI(title="API de Riesgo de Muerte", version="1.0")

# ===== Habilitar CORS =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            # <--- Permite cualquier origen (puedes restringirlo luego)
    allow_credentials=True,
    allow_methods=["*"],            # GET, POST, PUT, DELETE...
    allow_headers=["*"],            # Permite cualquier header (Content-Type, Authorization, etc.)
)

# ===== Esquema de entrada =====
class PatientData(BaseModel):
    age: float
    bmi: float
    cholesterol: float
    systolic_bp: float
    smoker: int
    alcohol: int
    daily_steps: float
    sleep_hours: float
    family_history: int


# ===== Helpers =====
def get_risk_level(proba: float) -> str:
    if proba < 0.25: return "low"
    if proba < 0.5: return "moderate"
    if proba < 0.75: return "high"
    return "critical"


def generate_recommendations(data: PatientData, risk_level: str) -> list[str]:
    recs = []

    if data.smoker:
        recs.append(
            "Quitting smoking can significantly reduce your health risks. "
            "Consider consulting with a healthcare provider about smoking cessation programs."
        )

    if data.bmi > 25:
        recs.append(
            "Maintaining a healthy weight through balanced diet and regular exercise can improve overall health outcomes."
        )

    if data.daily_steps < 8000:
        recs.append(
            "Increasing daily physical activity to 8,000-10,000 steps can help reduce cardiovascular risks."
        )

    if data.cholesterol > 200:
        recs.append(
            "Consider discussing cholesterol management strategies with your doctor, including dietary changes and regular monitoring."
        )

    if data.systolic_bp > 120:
        recs.append(
            "Monitor blood pressure regularly and discuss management strategies with a healthcare provider."
        )

    if data.sleep_hours < 7 or data.sleep_hours > 9:
        recs.append(
            "Aim for 7-9 hours of quality sleep per night to support overall health and recovery."
        )

    if risk_level in ["high", "critical"]:
        recs.append(
            "Schedule a comprehensive health checkup with your healthcare provider to discuss these risk factors."
        )

    if not recs:
        recs.append("Continue maintaining your healthy lifestyle habits.")
        recs.append("Schedule regular health checkups to monitor your wellness.")

    return recs


# ===== Endpoint de predicción =====
@app.post("/predict")
def predict(data: PatientData):
    X = np.array([[
        data.age, data.bmi, data.cholesterol, data.systolic_bp,
        data.smoker, data.alcohol, data.daily_steps,
        data.sleep_hours, data.family_history
    ]])

    proba = float(model.predict_proba(X)[0][1])

    risk_level = get_risk_level(proba)
    recommendations = generate_recommendations(data, risk_level)

    return {
        "riskScore": proba,
        "riskLevel": risk_level,
        "recommendations": recommendations
    }


@app.get("/")
def root():
    return {"status": "ok", "message": "API running with CORS enabled"}
