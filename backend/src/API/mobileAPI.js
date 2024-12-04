const mysql = require("mysql2/promise");

// 데이터베이스 연결 설정
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function connectToDatabaseWithRetry(
  dbConfig,
  retries = 5,
  delay = 30000
) {
  while (retries > 0) {
    try {
      const connection = await mysql.createConnection(dbConfig);
      console.log("Connected to the database");
      return connection; // 성공 시 connection 반환
    } catch (error) {
      console.error(
        `Failed to connect to the database. Retrying in ${
          delay / 1000
        } seconds...`
      );
      retries -= 1;
      if (retries === 0) {
        throw new Error("Unable to connect to the database after retries");
      }
      await new Promise((resolve) => setTimeout(resolve, delay)); // 재시도 대기
    }
  }
}

// Coin 값을 가져오는 함수
async function getMobileData(coinName) {
  let connection;

  try {
    connection = await connectToDatabaseWithRetry(dbConfig);
    const query = `
        SELECT coin, _time, volume, increase_rate, updown
        FROM mobile_data
        WHERE coin='${coinName}'
        ORDER BY id DESC
        LIMIT 1;
        `;

    const [rows] = await connection.execute(query);

    if (rows.length === 0) {
      return null; // 데이터가 없을 경우 null 반환
    }

    const row_ = rows[0];

    const result = {
      coin: row_.coin,
      time: row_._time,
      volume: parseFloat(row_.volume),
      increase_rate: parseFloat(row_.increase_rate),
      updown: row_.updown,
    };
    console.log(result);
    // volume과 increase_rate를 float로 파싱
    return result;
  } catch (error) {
    console.error(`Error fetching data for ${coinName}:`, error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

getMobileData("xrp");

module.exports = {
  getMobileData,
};
