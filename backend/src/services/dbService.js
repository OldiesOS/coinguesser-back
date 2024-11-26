const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { fetchData } = require('./dataService');
const mysql = require('mysql2/promise');

// 데이터베이스 연결 설정
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// 데이터베이스 업데이트 함수
async function updateDatabase() {
  let connection;
  try {
    const dataList = await fetchData();
    connection = await mysql.createConnection(dbConfig);

    console.log('Connected to the database');

    await connection.execute('TRUNCATE TABLE xrp_data');
    console.log('Existing data truncated');

    const insertQuery = `
      INSERT INTO xrp_data (
        ticker, open, high, low, volume, value, moving_avg_5, moving_avg_10, moving_avg_20,
        rsi_14, macd, signal_value, price_change_rate, bollinger_upper,
        bollinger_lower, volume_change_rate, cumulative_volume, time_of_day, 
        recent_volatility
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const data of dataList) {
      const values = [
        data.ticker, data.open, data.high, data.low, data.volume, data.value,
        data.moving_avg_5, data.moving_avg_10, data.moving_avg_20, data.rsi_14,
        data.macd, data.signal_value, data.price_change_rate, data.bollinger_upper,
        data.bollinger_lower, data.volume_change_rate, data.cumulative_volume,
        data.time_of_day, data.recent_volatility,
      ];

      await connection.execute(insertQuery, values);
      console.log('Data inserted successfully');
    }
  } catch (error) {
    console.error('Error updating the database:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Coin 값을 가져오는 함수
async function getCoinValue(coinName, isInit) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const query = isInit
      ? `
        SELECT _time, predicted_value, real_value
        FROM (
          SELECT _time, predicted_value, real_value
          FROM coin_data
          WHERE coin='${coinName}'
          ORDER BY id DESC, _time DESC
          LIMIT 13
        ) AS subquery
        ORDER BY _time ASC;
      `
      : `
        SELECT _time, predicted_value, real_value 
        FROM coin_data 
        WHERE coin='${coinName}'
        ORDER BY id DESC, _time DESC
        LIMIT 1;
      `;

    const [rows] = await connection.execute(query);

    console.log(`${coinName} 데이터 전송 완료`);

    const convertedRows = rows.map((item) => ({
      ...item,
      predicted_value: parseFloat(item.predicted_value),
      real_value: item.real_value !== null ? parseFloat(item.real_value) : null,
    }));

    return convertedRows;
  } catch (error) {
    console.error(`Error fetching data for ${coinName}:`, error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// 함수 실행 예제
// updateDatabase();
getCoinValue('xrp', true);

module.exports = {
  updateDatabase,
  getCoinValue,
};
