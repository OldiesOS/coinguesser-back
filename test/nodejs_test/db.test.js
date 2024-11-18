// dbConnection.test.js
require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

describe('Database Connection', () => {
  let connection;

  beforeAll(async () => {
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
      console.log('Database connection successful!');
    } catch (error) {
      console.error('Error connecting to the database:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (connection) {
      await connection.end();
    }
  });

  it('should execute a simple query successfully', async () => {
    const [rows] = await connection.query('SELECT 1 + 1 AS solution');
    expect(rows[0].solution).toBe(2); // 쿼리 결과가 2인지 확인
    console.log('Test query result:', rows[0].solution);
  });

  it('should handle connection errors', async () => {
    jest.spyOn(mysql, 'createConnection').mockImplementation(() => {
      throw new Error('Connection error');
    });

    try {
      await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Connection error');
      console.error('Error connecting to the database:', error);
    }
  });
});
