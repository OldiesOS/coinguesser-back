from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import os

# Get the absolute path of the app directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load the model and scaler
model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))

# Initialize FastAPI
app = FastAPI()

# Input schema
class PredictRequest(BaseModel):
    open: float
    high: float
    low: float
    volume: float
    value: float
    Moving_Avg_5: float
    Moving_Avg_10: float
    Moving_Avg_20: float
    RSI_14: float
    MACD: float
    Signal: float
    Price_Change_Rate: float
    Bollinger_Upper: float
    Bollinger_Lower: float
    Volume_Change_Rate: float
    Cumulative_Volume: float
    Time_of_Day: float
    Recent_Volatility: float

@app.post("/predict")
def predict(request: PredictRequest):
    input_data = np.array([[request.open, request.high, request.low, request.volume,
                            request.value, request.Moving_Avg_5, request.Moving_Avg_10,
                            request.Moving_Avg_20, request.RSI_14, request.MACD,
                            request.Signal, request.Price_Change_Rate, request.Bollinger_Upper,
                            request.Bollinger_Lower, request.Volume_Change_Rate,
                            request.Cumulative_Volume, request.Time_of_Day,
                            request.Recent_Volatility]])

    # 스케일링 진행
    input_scaled = scaler.transform(input_data)

    # 스케일링 된 데이터로 예측
    prediction = model.predict(input_scaled)

    return {"predicted_close": prediction[0]}