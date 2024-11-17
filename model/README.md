## **도커 명령어**

- **이미지 빌드**
`docker build -t fastapi-ml-app .`

- **컨테이너 실행**
`docker run -d -p 8000:8000 fastapi-ml-app`

## **API 명세서**

- **HTTP 메서드** : `POST`

- **URL** : `/predict`

- **요청 형식** : json

- **응답 형식** : json

- **요청 예시**
```json
{
    "open": 721.0,
    "high": 722.0,
    "low": 720.0,
    "volume": 10000,
    "value": 5000000,
    "Moving_Avg_5": 721.5,
    "Moving_Avg_10": 720.8,
    "Moving_Avg_20": 720.3,
    "RSI_14": 55.5,
    "MACD": 0.01,
    "Signal": 0.02,
    "Price_Change_Rate": -0.1,
    "Bollinger_Upper": 725.0,
    "Bollinger_Lower": 718.0,
    "Volume_Change_Rate": 5.0,
    "Cumulative_Volume": 100000000,
    "Time_of_Day": 0.5,
    "Recent_Volatility": 0.2
}
```
- **응답 예시**
```json
{
    "predicted_close": 721.345
}
```