from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Aircraft Engine RUL Prediction API")
# fixed CORS if you need safe access from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None

@app.on_event("startup")
def load_model():
    global model
    try:
        model = joblib.load("best_engine_model.joblib")
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Error loading model: {e}")

class EngineData(BaseModel):
    sensor_data: dict 

FEATURES_ORDER = [
    's2', 's3', 's4', 's7', 's8', 's9', 's11', 
    's12', 's13', 's15', 's17', 's20', 's21'
]

@app.post("/predict")
def predict_rul(data: EngineData):
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        input_df = pd.DataFrame([data.sensor_data])

        input_df = input_df.reindex(columns=FEATURES_ORDER, fill_value=0)

        predicted_rul = model.predict(input_df)[0]

        status = "Normal"
        color = "green"
        
        if predicted_rul <= 30:
            status = "URGENT: Maintainance Required"
            color = "red"
        elif predicted_rul <= 50:
            status = "WARNING: Schedule Inspection"
            color = "orange"
            
        return {
            "predicted_rul": float(predicted_rul),
            "status": status,
            "color_code": color,
            "message": f"Engine has approx {predicted_rul:.0f} cycles remaining."
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/")
def read_root():
    return {"status": "API is running", "model_version": "XGBoost v1.0"}