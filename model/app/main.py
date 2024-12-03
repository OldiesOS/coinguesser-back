from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from tensorflow.keras.models import load_model
import joblib
import pandas as pd
import logging
import os

logging.basicConfig(level=logging.INFO)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    models_scalers = {
        "XRP": (
            load_model(os.path.join(BASE_DIR, "XRP_model_LSTM_7.0.keras")),
            joblib.load(os.path.join(BASE_DIR, "XRP_scaler_LSTM_7.0.pkl")),
        ),
        "BTC": (
            load_model(os.path.join(BASE_DIR, "BTC_model_LSTM_1.0.keras")),
            joblib.load(os.path.join(BASE_DIR, "BTC_scaler_LSTM_1.0.pkl")),
        ),
        "SOL": (
            load_model(os.path.join(BASE_DIR, "SOL_model_LSTM_1.0.keras")),
            joblib.load(os.path.join(BASE_DIR, "SOL_scaler_LSTM_1.0.pkl")),
        ),
        "ADA": (
            load_model(os.path.join(BASE_DIR, "ADA_model_LSTM_1.0.keras")),
            joblib.load(os.path.join(BASE_DIR, "ADA_scaler_LSTM_1.0.pkl")),
        ),
    }
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

FEATURE_NAMES = [
    "open", "high", "low", "close", "volume",
    "ma_5", "ma_10", "ma_5_minus_ma_10",
    "std_5", "bollinger_high", "bollinger_low",
    "rsi", "macd", "macd_signal",
    "true_range", "atr_5", "up_down_ratio",
    "close_to_high_ratio", "close_to_low_ratio",
    "change_rate",
]

def predict_crypto(model, scaler, request):
    try:
        input_data = pd.DataFrame([[
            request.open, request.high, request.low, request.close, request.volume,
            request.ma_5, request.ma_10, request.ma_5_minus_ma_10,
            request.std_5, request.bollinger_high, request.bollinger_low,
            request.rsi, request.macd, request.macd_signal,
            request.true_range, request.atr_5, request.up_down_ratio,
            request.close_to_high_ratio, request.close_to_low_ratio,
            request.change_rate,
        ]], columns=FEATURE_NAMES)

        input_scaled = scaler.transform(input_data)
        input_reshaped = input_scaled.reshape(1, 1, len(FEATURE_NAMES))  # (batch_size, time_steps=1, features)

        prediction = model.predict(input_reshaped)
        logging.info(f"Prediction result: {prediction}")

        return float(prediction[0])
    except Exception as e:
        logging.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

@app.post("/predict/{asset}") # 종목별 엔드포인트 관리
def predict(asset: str, request: PredictRequest):
    asset = asset.upper()
    if asset not in models_scalers:
        raise HTTPException(status_code=400, detail="Invalid asset type. Supported assets: XRP, BTC, SOL, ADA")

    model, scaler = models_scalers[asset]
    predicted_close = predict_crypto(model, scaler, request)
    return {f"{asset}_predicted_close": predicted_close}