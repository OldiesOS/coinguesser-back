import sys
import os
import pytest
from fastapi.testclient import TestClient

# Add the model/app directory to the Python path for import resolution
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'model', 'app'))

# Import the FastAPI app
from main import app

# Initialize TestClient with the FastAPI app
client = TestClient(app)

# Sample data for testing
test_input_data = {
    "open": 150.0,
    "high": 155.0,
    "low": 149.0,
    "volume": 1000000.0,
    "value": 150500.0,
    "Moving_Avg_5": 151.0,
    "Moving_Avg_10": 152.0,
    "Moving_Avg_20": 153.0,
    "RSI_14": 45.0,
    "MACD": 0.5,
    "Signal": 0.4,
    "Price_Change_Rate": 0.02,
    "Bollinger_Upper": 156.0,
    "Bollinger_Lower": 146.0,
    "Volume_Change_Rate": 0.05,
    "Cumulative_Volume": 5000000.0,
    "Time_of_Day": 12.0,
    "Recent_Volatility": 0.03
}

def test_predict_endpoint():
    # Send a POST request to the /predict endpoint with test data
    response = client.post("/predict", json=test_input_data)
    
    # Check the status code of the response
    assert response.status_code == 200
    
    # Validate the response content
    data = response.json()
    assert "predicted_close" in data
    assert isinstance(data["predicted_close"], float)
