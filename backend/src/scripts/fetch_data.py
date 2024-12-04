import ccxt
import pandas as pd
import numpy as np
from datetime import datetime
import time
import requests
import json
import argparse

# Binance API 연결
exchange = ccxt.binance({
    "rateLimit": 1200,
    "enableRateLimit": True,
})
parser = argparse.ArgumentParser(description="arg that controls number of data")
parser.add_argument('--count', type=int, required=True, help='data count')
args = parser.parse_args()

# 심볼 및 시간 간격 설정
symbol_List = ['XRP/USDT','ADA/USDT','BTC/USDT','SOL/USDT','BCH/USDT','BRETT/USDT','ONDO/USDT','ETH/USDT']
timeframe = '5m'     # 5분 간격 데이터

data_limit = 100  # 가져올 데이터 개수

final_columns = ['coin','timestamp','real_value','predicted_value']
final_result = pd.DataFrame()
for symbol in symbol_List:
    ohlcv = []
    final_data=[]
    df=pd.DataFrame()
    # 데이터 수집
    while len(ohlcv) < data_limit:
        try:
            new_data = exchange.fetch_ohlcv(symbol, timeframe, limit=data_limit)
            if len(new_data) == 0:
                break
            ohlcv += new_data
            start_timestamp = new_data[-1][0] + 1  # 중복 방지
            time.sleep(1)  # API 제한 준수
        except Exception as e:
            print(f"Error fetching data: {e}")
            break

    # 데이터프레임으로 변환
    columns = ['timestamp', 'open', 'high', 'low', 'close', 'volume']
    df = pd.DataFrame(ohlcv, columns=columns)

    # 시간 변환 (유닉스 타임스탬프 -> 읽을 수 있는 시간)

    # 목표값 생성 (target_close: 5분 후의 close 값)
    df['target_close'] = df['close'].shift(-1)

    # 이동 평균 (5분, 10분)
    df['ma_5'] = df['close'].rolling(window=5).mean()
    df['ma_10'] = df['close'].rolling(window=10).mean()
    df['ma_5_minus_ma_10'] = df['ma_5'] - df['ma_10']

    # 표준편차 (5분)
    df['std_5'] = df['close'].rolling(window=5).std()

    # 볼린저 밴드
    df['bollinger_high'] = df['ma_5'] + (df['std_5'] * 2)
    df['bollinger_low'] = df['ma_5'] - (df['std_5'] * 2)

    # RSI 계산
    def calculate_rsi(series, window=14):
        delta = series.diff()
        gain = np.where(delta > 0, delta, 0)
        loss = np.where(delta < 0, -delta, 0)
        avg_gain = pd.Series(gain).rolling(window=window, min_periods=1).mean()
        avg_loss = pd.Series(loss).rolling(window=window, min_periods=1).mean()
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi

    df['rsi'] = calculate_rsi(df['close'], window=14)

    # MACD 계산
    short_ema = df['close'].ewm(span=12, adjust=False).mean()
    long_ema = df['close'].ewm(span=26, adjust=False).mean()
    df['macd'] = short_ema - long_ema
    df['macd_signal'] = df['macd'].ewm(span=9, adjust=False).mean()

    # ATR (Average True Range)
    df['true_range'] = np.maximum(
        df['high'] - df['low'],
        np.maximum(abs(df['high'] - df['close'].shift(1)), abs(df['low'] - df['close'].shift(1)))
    )
    df['atr_5'] = df['true_range'].rolling(window=5).mean()

    # 최근 상승/하락 비율
    df['up_down_ratio'] = df['close'].diff().apply(lambda x: 1 if x > 0 else 0).rolling(window=5).mean()

    # 종가와 최고가/최저가 간 거리
    df['close_to_high_ratio'] = (df['close'] - df['low']) / (df['high'] - df['low'])
    df['close_to_low_ratio'] = (df['high'] - df['close']) / (df['high'] - df['low'])

    # 5분 변화율 (change_rate)
    df['change_rate'] = df['close'].pct_change(periods=5)

    # 필요 없는 첫 14개의 행 제거 (RSI 및 기타 계산에 필요한 초기 값이 NaN인 경우)
    #df = df.dropna()
    df = df.tail(args.count)
    volume_value = df[['volume']]
    volume_value = volume_value.reset_index(drop=True)
    json_data = df.to_json(orient='records')
    json_list = json.loads(json_data)

    url = 'http://fastapi-service:8000/predict/'
    for payload in json_list:
        temp=[]
        temp.extend([symbol.split('/')[0],payload['timestamp'],payload['target_close']])
        del payload['timestamp']
        del payload['target_close']
        response = requests.post(url+symbol.split('/')[0], json=payload)

        # 응답 데이터 확인
        if response.status_code == 200:
            temp.append(response.json()[symbol.split('/')[0]+'_predicted_close'])
        else:
            print(f"Error: {response.status_code}")
        
        final_data.append(temp)
            
            
    final_df = pd.DataFrame(final_data, columns=final_columns)
    result = pd.concat([final_df, volume_value], axis=1)
    result['rate'] = None  # 먼저 빈 컬럼 생성
    result['updown'] = None

    r_value = result.iloc[-2]['real_value']
    p_value = result.iloc[-1]['predicted_value']
    prev_value = result.iloc[-2]['predicted_value']
    next_value = result.iloc[-1]['predicted_value']
    if prev_value <= next_value:
        updown_value = 'UP'
    else:
        updown_value = 'DOWN'
    increase_rate = ((p_value - r_value) / r_value) * 100
    # 마지막 행의 값으로 채우기
    result.loc[result.index[-1], 'rate'] = increase_rate
    result.loc[result.index[-1], 'updown'] = updown_value
    final_result = pd.concat([final_result,result], axis=0)


print(final_result.to_json(orient='records'))

