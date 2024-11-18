require('dotenv').config({ path: '../.env' }); // 환경 변수 로드
const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  try {
    // 데이터베이스 연결 설정
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST, // GCE 인스턴스의 외부 IP 주소
      user: process.env.DB_USER, // MariaDB 사용자 이름
      password: process.env.DB_PASSWORD, // 비밀번호
      database: process.env.DB_NAME, // 데이터베이스 이름
    });

    console.log('Database connection successful!');

    // 연결 테스트: 간단한 쿼리 실행
    const [rows] = await connection.query('SELECT 1 + 1 AS solution');
    console.log('Test query result:', rows[0].solution); // 결과가 2인지 확인

    // 연결 닫기
    await connection.end();
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

testDatabaseConnection();
