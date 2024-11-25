const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { fetchData } = require('./dataService'); // dataService.js의 fetchData 함수 임포트
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
    // fetchData로 데이터 가져오기
    const dataList = await fetchData();
    //console.log('Fetched data:', dataList); // 데이터 확인용 로그
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Connected to the database');

    await connection.execute('TRUNCATE TABLE xrp_data');
    console.log('Existing data truncated');

    // 데이터 삽입 쿼리 (컬럼명은 데이터의 키와 일치해야 함)
    const insertQuery = `
      INSERT INTO xrp_data (
        ticker, open, high, low, volume, value, moving_avg_5, moving_avg_10, moving_avg_20,
        rsi_14, macd, signal_value, price_change_rate, bollinger_upper,
        bollinger_lower, volume_change_rate, cumulative_volume, time_of_day, 
        recent_volatility
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    for (const data of dataList) {
        // 데이터에서 필요한 값 추출
        const values = [
        data.ticker, data.open, data.high, data.low, data.volume, data.value,
        data.moving_avg_5, data.moving_avg_10, data.moving_avg_20, data.rsi_14,
        data.macd, data.signal_value, data.price_change_rate, data.bollinger_upper,
        data.bollinger_lower, data.volume_change_rate, data.cumulative_volume,
        data.time_of_day, data.recent_volatility
        ];

        // 데이터베이스에 데이터 삽입
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
    const insertQuery = isInit ? `SELECT _time, predicted_value, real_value
    FROM (
      SELECT _time, predicted_value, real_value
      FROM \`${coinName}\`
      ORDER BY _time DESC
      LIMIT 13
    ) AS subquery
    ORDER BY _time ASC;
    ` : `SELECT _time, predicted_value, real_value FROM \`${coinName}\` ORDER BY _time DESC LIMIT 1`;

    // 데이터 조회 쿼리
    const [rows] = await connection.execute(
      insertQuery
    );
    
    // console.log(rows);
    console.log(`${coinName} 데이터 전송 `)
    return rows; // 데이터를 반환
  } catch (error) {
    console.error(`Error fetching data for ${coinName}:`, error);
    throw error; // 호출부로 에러 전달
  } finally {
    if (connection) {
      await connection.end();
      // console.log('Database connection closed');
    }
  }
}



// 함수 실행 예제 (개발 시 테스트)
//updateDatabase();
getCoinValue('xrp', true);

module.exports = {
  updateDatabase,
  getCoinValue
};
