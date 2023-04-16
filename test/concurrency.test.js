require('dotenv').config();

const mysql = require('mysql2');

// const request = require('supertest');

const app = require('../routes/routes');

describe('Perform Basic Api Requests', () => {
  test('should be able to connect to the server', async () => {
    expect(app).toBeDefined();
  });
  // test('should be able to ping the server', async () => {
  //   const res = await request(app).get('/');
  //   expect(res.statusCode).toEqual(200);
  // });
});

describe('Perform Basic Queries', () => {
  let connection;

  beforeEach(async () => {
    jest.useFakeTimers();
    connection = mysql
      .createPool({
        host: process.env.NODE_DB_HOST,
        port: process.env.NODE1_DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.NODE1_DB_NAME,
      })
      .promise();

    await connection.getConnection();
    console.log('Connection created');
  });

  afterEach(async () => {
    await connection.end();
    console.log('Connection ended');
  });

  test('should be able to connect to the database', async () => {
    expect(connection).toBeDefined();
  });
  // test('should be able to ping the database', async () => {
  //   const [rows, fields] = await connection.query('SELECT 1;');
  //   console.log(rows);
  //   console.log(fields);
  //   expect(rows).toBeDefined();
  // }, 10000);
});
