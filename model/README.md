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
    "open": 0.5987,
    "high": 0.5993,
    "low": 0.5986,
    "close": 0.599,
    "volume": 317815.0,
    "ma_5": 0.59904,
    "ma_10": 0.59901,
    "ma_5_minus_ma_10": 2.999999999997449e-05,
    "std_5": 0.0002701851222832,
    "bollinger_high": 0.5995803702445666,
    "bollinger_low": 0.5984996297554335,
    "rsi": 66.66666666666666,
    "macd": -0.000116041323472,
    "macd_signal": -0.0002386743338107,
    "true_range": 0.0007,
    "atr_5": 0.00078,
    "up_down_ratio": 0.8,
    "close_to_high_ratio": 0.5714285714284808,
    "close_to_low_ratio": 0.4285714285715192,
    "change_rate": 0.0008354218880533
}
```
- **응답 예시**
```json
{
  "predicted_close": 0.5979
}
```