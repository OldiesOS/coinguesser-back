const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mysql = require("mysql2/promise");

// 데이터베이스 연결 설정
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};


// Coin 값을 가져오는 함수
async function getMobileData(coinName) {
    let connection;

    try {
      connection = await mysql.createConnection(dbConfig);
        const query = `
        SELECT coin, _time, volume, increase_rate 
        FROM mobile_data
        WHERE coin='${coinName}'
        ORDER BY id DESC
        LIMIT 1;
      `;
  
        const [rows] = await connection.execute(query);

        

        return rows[0];
      
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

module.exports = {
  getMobileData
};

