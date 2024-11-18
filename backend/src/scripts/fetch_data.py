import pyupbit
import pandas as pd
import json

# 암호화폐의 OHLCV 데이터를 가져오는 함수
def get_ohlcv(ticker, interval="minute5", count=32):
    """
    OHLCV 데이터를 가져오는 함수
    :param ticker: 암호화폐 티커, 예를 들어 "KRW-BTC"
    :param interval: 데이터 간격 ("day", "minute1", "minute5" 등)
    :param count: 가져올 데이터 개수
    :return: OHLCV 데이터 (DataFrame)
    """
    df = pyupbit.get_ohlcv(ticker, interval=interval, count=count)
    return df

# 이동평균선 (Moving Average) 계산
def get_moving_average(df, window=20):
    """
    이동평균선을 계산하는 함수
    :param df: OHLCV 데이터
    :param window: 이동평균 기간
    :return: 이동평균 데이터 (Series)
    """
    return df['close'].rolling(window=window).mean()

# RSI (Relative Strength Index) 계산
def get_rsi(df, period=14):
    """
    RSI를 계산하는 함수
    :param df: OHLCV 데이터
    :param period: RSI 계산에 사용할 기간
    :return: RSI 데이터 (Series)
    """
    delta = df['close'].diff(1)
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.rolling(window=period).mean()
    avg_loss = loss.rolling(window=period).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

# MACD (Moving Average Convergence Divergence) 계산
def get_macd(df, short_window=12, long_window=26, signal_window=9):
    """
    MACD와 Signal 라인을 계산하는 함수
    :param df: OHLCV 데이터
    :param short_window: 단기 이동평균 기간
    :param long_window: 장기 이동평균 기간
    :param signal_window: 시그널선 이동평균 기간
    :return: MACD, Signal 데이터 (DataFrame)
    """
    short_ema = df['close'].ewm(span=short_window, adjust=False).mean()
    long_ema = df['close'].ewm(span=long_window, adjust=False).mean()
    macd = short_ema - long_ema
    signal = macd.ewm(span=signal_window, adjust=False).mean()
    return pd.DataFrame({'macd': macd, 'signal_value': signal})

# 최근 가격 변화 (변동률) 계산 함수
def get_price_change_rate(df, period=1):
    """
    가격 변화율을 계산하는 함수
    :param df: OHLCV 데이터 (DataFrame)
    :param period: 변화율을 계산할 기간 (기본값: 직전 구간)
    :return: 변화율 데이터 (Series)
    """
    return df['close'].pct_change(periods=period) * 100

# 볼린저 밴드 계산 함수
def get_bollinger_bands(df, window=20, num_std=2):
    """
    볼린저 밴드를 계산하는 함수
    :param df: OHLCV 데이터 (DataFrame)
    :param window: 볼린저 밴드의 기준 이동평균 기간 (기본값: 20)
    :param num_std: 표준편차 배수 (기본값: 2)
    :return: 볼린저 밴드 상한선, 하한선 데이터 (DataFrame)
    """
    rolling_mean = df['close'].rolling(window=window).mean()
    rolling_std = df['close'].rolling(window=window).std()
    upper_band = rolling_mean + (rolling_std * num_std)
    lower_band = rolling_mean - (rolling_std * num_std)
    return pd.DataFrame({'Bollinger_Upper': upper_band, 'Bollinger_Lower': lower_band})

# 직전 구간 거래량 대비 비율 계산 함수
def get_volume_change_rate(df):
    """
    직전 구간 거래량 대비 비율을 계산하는 함수
    :param df: OHLCV 데이터 (DataFrame)
    :return: 거래량 변화율 데이터 (Series)
    """
    return df['volume'].pct_change() * 100

# 누적 거래량 계산 함수
def get_cumulative_volume(df):
    """
    누적 거래량을 계산하는 함수
    :param df: OHLCV 데이터 (DataFrame)
    :return: 누적 거래량 데이터 (Series)
    """
    return df['volume'].cumsum()

# 시간대 계산 함수
def get_time_of_day(df):
    """
    시간대를 구하는 함수 (예: 오전, 오후, 야간)
    :param df: OHLCV 데이터 (DataFrame, index는 datetime이어야 함)
    :return: 시간대 데이터 (Series)
    """
    hours = df.index.hour
    time_of_day = pd.cut(hours, bins=[-1, 6, 12, 18, 24], labels=[0, 1, 2, 3], ordered=True)
    return time_of_day

# 최근 N 구간 변동성 (표준편차) 계산 함수
def get_recent_volatility(df, window=5):
    """
    최근 N 구간 동안의 변동성을 계산하는 함수
    :param df: OHLCV 데이터 (DataFrame)
    :param window: 변동성을 계산할 기간
    :return: 변동성 데이터 (Series)
    """
    return df['close'].rolling(window=window).std()

def save_to_excel(df, filename="output.xlsx"):
    """
    DataFrame을 엑셀 파일로 저장하는 함수
    :param df: 저장할 DataFrame
    :param filename: 저장할 파일 이름 (기본값: "output.xlsx")
    """
    df.to_excel(filename, index=True)  # index=True로 설정하면 인덱스도 엑셀에 포함됩니다
    print(f"파일이 '{filename}' 이름으로 저장되었습니다.")
    
    
#ticker = ['KRW-BTC', 'KRW-ETH', 'KRW-NEO', 'KRW-MTL', 'KRW-XRP', 'KRW-ETC', 'KRW-SNT', 'KRW-WAVES', 'KRW-XEM', 'KRW-QTUM']
ticker = ['KRW-XRP']
result_df = pd.DataFrame()
for tick in ticker:
    df = pd.DataFrame()
    df = get_ohlcv(tick)

    # 각 지표 계산
    df['moving_avg_5'] = get_moving_average(df, window=5)
    df['moving_avg_10'] = get_moving_average(df, window=10)
    df['moving_avg_20'] = get_moving_average(df, window=20)
    df['rsi_14'] = get_rsi(df, period=14)
    macd_df = get_macd(df)
    df = pd.concat([df, macd_df], axis=1)

    df['price_change_rate'] = get_price_change_rate(df)
    bollinger_bands = get_bollinger_bands(df)
    df['bollinger_upper'] = bollinger_bands['Bollinger_Upper']
    df['bollinger_lower'] = bollinger_bands['Bollinger_Lower']
    df['volume_change_rate'] = get_volume_change_rate(df)
    df['cumulative_volume'] = get_cumulative_volume(df)
    df['time_of_day'] = get_time_of_day(df)
    df['recent_volatility'] = get_recent_volatility(df)
    
    df.drop('close', axis=1, inplace=True)
    
    last_row = df.tail(12)
    last_row = last_row.reset_index(drop=True)
    last_row.insert(0, 'ticker', tick)

result_json = last_row.to_json(orient='records', date_format='iso')
print(result_json)


