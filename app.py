from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

# Cargar el modelo
model = joblib.load("model_xgboost.pkl")

app = FastAPI(title="API de Riesgo de Muerte", version="1.0")

# Estructura esperada de los datos que llegarán del tablero
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

@app.post("/predict")
def predict(data: PatientData):
    # Convertir los datos a formato numpy
    X = np.array([[data.age, data.bmi, data.cholesterol, data.systolic_bp,
                   data.smoker, data.alcohol, data.daily_steps,
                   data.sleep_hours, data.family_history]])

    # Hacer la predicción
    proba = model.predict_proba(X)[0][1]  # Probabilidad de riesgo (clase 1)
    print(proba)
    return {
        float(proba)
        
    }
