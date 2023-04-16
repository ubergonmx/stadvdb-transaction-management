const mysql = require('mysql2');

const nodeEnv = process.env.NODE_ENV;

const node1 = mysql.createPool({
  host: nodeEnv === 'development' ? process.env.NODE_DB_HOST : process.env.NODE1_DB_HOST,
  port: nodeEnv === 'development' ? process.env.NODE1_DB_PORT : process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.NODE1_DB_NAME,
});

const node2 = mysql.createPool({
  host: nodeEnv === 'development' ? process.env.NODE_DB_HOST : process.env.NODE2_DB_HOST,
  port: nodeEnv === 'development' ? process.env.NODE2_DB_PORT : process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.NODE2_DB_NAME,
});

const node3 = mysql.createPool({
  host: nodeEnv === 'development' ? process.env.NODE_DB_HOST : process.env.NODE3_DB_HOST,
  port: nodeEnv === 'development' ? process.env.NODE3_DB_PORT : process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.NODE3_DB_NAME,
});

const db = {
  connectDB: async () => {
    try {
      if (node1) {
        await db.connectNode(node1);
      }
      if (node2) {
        await db.connectNode(node2);
      }
      if (node3) {
        await db.connectNode(node3);
      }
    } catch (err) {
      console.log(err);
    }
  },
  connectNode: async (node) => {
    try {
      node.getConnection((err) => {
        if (err) {
          console.log(`Error connecting to ${node.config.connectionConfig.database} database`);
          console.log(err);
        } else {
          console.log(`Connected to ${node.config.connectionConfig.database} database`);
        }
      });
    } catch (err) {
      console.log(err);
    }
  },
  ping: async (node) => {
    try {
      node.getConnection((err, conn) => {
        if (err) {
          console.log(`Error connecting to ${node.config.connectionConfig.database} database`);
          console.log(err);
          node.releaseConnection(conn);
          return false;
        }
        console.log(`Connected to ${node.config.connectionConfig.database} database`);
        node.releaseConnection(conn);
        return true;
      });
      return false;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  node1: () => node1,
  node2: () => node2,
  node3: () => node3,
  localNode: () => {
    try {
      let node;
      if (process.env.NODE_NUMBER === '1') {
        node = node1;
      } else if (process.env.NODE_NUMBER === '2') {
        node = node2;
      } else if (process.env.NODE_NUMBER === '3') {
        node = node3;
      } else {
        node = undefined;
      }
      return node;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  },
  // query: async (query, node) => {
  //   try {
  //     const nodeQuery = util.promisify(node.query).bind(node);
  //     await nodeQuery(query, (err, result) => {
  //       if (err) {
  //         console.log(err);
  //         return undefined;
  //       }
  //       return result;
  //     });
  //     return undefined;
  //   } catch (err) {
  //     console.log(err);
  //     return undefined;
  //   }
  // },
};

module.exports = db;
