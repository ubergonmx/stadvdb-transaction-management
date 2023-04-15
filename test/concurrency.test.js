require('dotenv').config();
const mysql = require('mysql2');

const nodeEnv = process.env.NODE_ENV;

describe('Perform Basic Queries', () => {
  let connection;

  beforeEach(async () => {
    connection = await mysql.createConnection({
      host: nodeEnv === 'development' ? process.env.NODE_DB_HOST : process.env.NODE1_DB_HOST,
      port: nodeEnv === 'development' ? process.env.NODE1_DB_PORT : process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.NODE1_DB_NAME,
    });
    console.log('Connection created');
  });
  it('should be able to connect to the database', async () => {
    expect(connection).toBeDefined();
  });
  it('should be able to ping the database', async () => {
    const [rows] = await connection.execute('SELECT 1');
    expect(rows).toBeDefined();
  });
});
