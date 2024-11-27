const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const { fetchData, fetchinitData } = require("./dataService");
const mysql = require("mysql2/promise");

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

    console.log("Connected to the database");

    const insertQuery = `
      INSERT INTO xrp (
        coin, _time, real_value, predicted_value
      ) VALUES (?, ?, ?, ?)
    `;

    for (const data of dataList) {
      const values = [
        data.coin,
        data.timestamp,
        data.real_value,
        data.predicted_value,
      ];

      await connection.execute(insertQuery, values);
      console.log("Data inserted successfully");
    }
  } catch (error) {
    console.error("Error updating the database:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

async function initDatabase() {
  let connection;
  try {
    const dataList = await fetchinitData();
    connection = await mysql.createConnection(dbConfig);

    console.log("Connected to the database");

    await connection.execute("TRUNCATE TABLE xrp_data");
    console.log("Existing data truncated");

    const insertQuery = `
      INSERT INTO xrp (
        coin, _time, real_value, predicted_value
      ) VALUES (?, ?, ?, ?)
    `;

    for (const data of dataList) {
      const values = [
        data.coin,
        data.timestamp,
        data.real_value,
        data.predicted_value,
      ];

      await connection.execute(insertQuery, values);
      console.log("Data inserted successfully");
    }
  } catch (error) {
    console.error("Error updating the database:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
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
      console.log("Database connection closed");
    }
  }
}

// 함수 실행 예제
// updateDatabase();
getCoinValue("xrp", true);

module.exports = {
  updateDatabase,
  initDatabase,
  getCoinValue,
};
