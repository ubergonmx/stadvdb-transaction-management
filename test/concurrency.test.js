/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();

const mysql = require('mysql2');

const request = require('supertest');

const app = require('../routes/routes');

describe('Perform Basic Api Requests', () => {
  test('should be able to connect to the server', async () => {
    expect(app).toBeDefined();
  });
  test('should be able to ping the server', async () => {
    const res = await request(app).get('/api/getMovies');
    expect(res.statusCode).toEqual(200);
  });
});

describe('Perform Basic Queries', () => {
  let connection;

  beforeEach(async () => {
    jest.useFakeTimers();
    connection = mysql
      .createPool({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: 'password',
        database: 'node1',
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
  test('should be able to ping the database', async () => {
    const [rows, fields] = await connection.query('SELECT 1;');
    console.log(rows);
    console.log(fields);
    expect(rows).toBeDefined();
  }, 10000);
});
