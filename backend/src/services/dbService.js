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
      INSERT INTO coin_data (
        coin, _time, real_value, predicted_value
      ) VALUES (?, ?, ?, ?);
    `;

    const updateQuery = `
      UPDATE coin_data SET real_value = ? WHERE id = ( SELECT id FROM coin_data ORDER BY id DESC LIMIT 1 );
    `;

    const mobileQuery = `
      INSERT INTO mobile_data (
        coin, _time, volume, increase_rate
      ) VALUES (?, ?, ?, ?);
    `;

    const groupedData = dataList.reduce((acc, curr) => {
      if (!acc[curr.coin]) {
        acc[curr.coin] = []; // 코인별 배열 초기화
      }
      acc[curr.coin].push(curr); // 해당 코인 그룹에 데이터 추가
      return acc;
    }, {});

    //데이터 시간순 정렬
    Object.keys(groupedData).forEach((coin) => {
      groupedData[coin].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    });

    Object.keys(groupedData).forEach((coin) => {
      connection.execute(updateQuery, [groupedData[coin][0].real_value]);

      connection.execute(insertQuery, [
        groupedData[coin][1].coin,
        groupedData[coin][1].timestamp,
        groupedData[coin][1].real_value,
        groupedData[coin][1].predicted_value,
      ]);

      connection.execute(mobileQuery, [
        groupedData[coin][1].coin,
        groupedData[coin][1].timestamp,
        groupedData[coin][0].volume,
        groupedData[coin][1].rate,
      ]);
    });

    console.log("Data updated successfully");

    console.log("Data inserted successfully");
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

    const groupedData = dataList.reduce((acc, curr) => {
      if (!acc[curr.coin]) {
        acc[curr.coin] = []; // 코인별 배열 초기화
      }
      acc[curr.coin].push(curr); // 해당 코인 그룹에 데이터 추가
      return acc;
    }, {});

    Object.keys(groupedData).forEach((coin) => {
      groupedData[coin].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    });

    await connection.execute("TRUNCATE TABLE coin_data");
    await connection.execute("TRUNCATE TABLE mobile_data");
    console.log("Existing data truncated");

    const insertQuery = `
      INSERT INTO coin_data (
        coin, _time, real_value, predicted_value
      ) VALUES (?, ?, ?, ?);
    `;

    const mobileQuery = `
      INSERT INTO mobile_data (
        coin, _time, volume, increase_rate
      ) VALUES (?, ?, ?, ?);
    `;

    Object.keys(groupedData).forEach((coin) => {
      groupedData[coin].forEach((data) => {
        const coinvalues = [
          data.coin,
          data.timestamp,
          data.real_value,
          data.predicted_value,
        ];

        connection.execute(insertQuery, coinvalues);
        if (data.rate != null) {
          connection.execute(mobileQuery, [
            data.coin,
            data.timestamp,
            data.volume,
            data.rate,
          ]);
        }
      });
    });
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

    if (isInit) {
      const query = `
      SELECT _time, predicted_value, real_value
      FROM (
        SELECT id, _time, predicted_value, real_value
        FROM coin_data
        WHERE coin ='${coinName}'
        ORDER BY id DESC
        LIMIT 7
      ) AS subquery
      ORDER BY id ASC;
      `;
      const [rows] = await connection.execute(query);
      console.log(`${coinName} 데이터 전송 완료`);
      const convertedRows = rows.map((item) => ({
        ...item,
        predicted_value: parseFloat(item.predicted_value),
        real_value:
          item.real_value !== null ? parseFloat(item.real_value) : null,
      }));
      return convertedRows;
    }

    if (!isInit) {
      const query = `
      SELECT _time, predicted_value, real_value 
      FROM coin_data
      WHERE coin='${coinName}'
      ORDER BY id DESC
      LIMIT 2;
    `;

      const [rows] = await connection.execute(query);
      console.log(`${coinName} 데이터 전송 완료`);
      const convertedRows = {
        time: rows[0]._time,
        predicted_value: parseFloat(rows[0].predicted_value), // 첫 번째 줄 predicted_value
        ex_real_value:
          rows[1].real_value !== null ? parseFloat(rows[1].real_value) : null, // 두 번째 줄 real_value
      };
      console.log(convertedRows);
      return convertedRows;
    }
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
// getCoinValue("xrp", true);

module.exports = {
  updateDatabase,
  initDatabase,
  getCoinValue,
};
