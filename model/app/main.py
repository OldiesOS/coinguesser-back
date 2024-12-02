from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    model = joblib.load(os.path.join(BASE_DIR, "XRP_model_LSTM_4.0.pkl"))
    scaler = joblib.load(os.path.join(BASE_DIR, "XRP_scaler_LSTM_4.0.pkl"))
except Exception as e:
    raise RuntimeError(f"Error loading model or scaler: {e}")

app = FastAPI()

class PredictRequest(BaseModel):
    open: float
    high: float
    low: float
    close: float
    volume: float
    ma_5: float
    ma_10: float
    ma_5_minus_ma_10: float
    std_5: float
    bollinger_high: float
    bollinger_low: float
    rsi: float
    macd: float
    macd_signal: float
    true_range: float
    atr_5: float
    up_down_ratio: float
    close_to_high_ratio: float
    close_to_low_ratio: float
    change_rate: float

@app.post("/predict")
def predict(request: PredictRequest):
    input_data = np.array([[request.open, request.high, request.low, request.close, request.volume,
                            request.ma_5, request.ma_10, request.ma_5_minus_ma_10,
                            request.std_5, request.bollinger_high, request.bollinger_low,
                            request.rsi, request.macd, request.macd_signal,
                            request.true_range, request.atr_5, request.up_down_ratio,
                            request.close_to_high_ratio, request.close_to_low_ratio,
                            request.change_rate]])

    input_scaled = scaler.transform(input_data)

    prediction = model.predict(input_scaled)

    return {"predicted_close": float(prediction[0])}