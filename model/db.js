const mysql = require('mysql2');

const nodeEnv = process.env.NODE_ENV;

const localNodeStatus = {
  isLocalNodeDown: false,
  runRecovery: false, // for node 1
  runReplication: true, // for nodes 2 and 3
};

const node1 = mysql.createPool({
  host: nodeEnv === 'development' ? process.env.NODE_DB_HOST : process.env.NODE1_DB_HOST,
  port: nodeEnv === 'development' ? process.env.NODE1_DB_PORT : process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.NODE1_DB_NAME,
  multipleStatements: true,
});

const node2 = mysql.createPool({
  host: nodeEnv === 'development' ? process.env.NODE_DB_HOST : process.env.NODE2_DB_HOST,
  port: nodeEnv === 'development' ? process.env.NODE2_DB_PORT : process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.NODE2_DB_NAME,
  multipleStatements: true,
});

const node3 = mysql.createPool({
  host: nodeEnv === 'development' ? process.env.NODE_DB_HOST : process.env.NODE3_DB_HOST,
  port: nodeEnv === 'development' ? process.env.NODE3_DB_PORT : process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.NODE3_DB_NAME,
  multipleStatements: true,
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
  ping: (node, callback = undefined) => {
    try {
      node.getConnection((err, conn) => {
        if (err) {
          console.log(`Error connecting to ${node.config.connectionConfig.database} database`);
          if (callback) callback(false);
          return false;
        }
        console.log(`Connected to ${node.config.connectionConfig.database} database`);
        node.releaseConnection(conn);
        if (callback) callback(true);
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
  node1DownLog: (body, operation) => {
    try {
      if (body.rank < 1980) {
        let query = '';
        let values = '';
        if (operation === 'add') {
          db.getLastId((lastId) => {
            query = 'INSERT INTO node2_log (query) VALUES (?)';
            values = [
              `INSERT INTO movies (id, name, year, \`rank\`) VALUES ('${lastId + 1}', '${body.name}', '${
                body.year
              }', '${body.rank}');`,
            ];
            db.node2().query(query, values, (err) => {
              if (err) {
                console.log('Insert node2 log (node1 down) failed');
                console.log(err);
                return;
              }
              console.log('Insert node2 log (node1 down) successful');
            });
          });
          return;
        }
        if (operation === 'update') {
          query = 'INSERT INTO node2_log (query) VALUES (?)';
          values = [
            `UPDATE movies SET name = '${body.name}', year = '${body.year}', \`rank\` = '${body.rank}' WHERE id = ${body.id};`,
          ];
        }
        if (operation === 'delete') {
          query = 'INSERT INTO node2_log (query) VALUES (?)';
          values = [`DELETE FROM movies WHERE id = ${body.id};`];
        }
        db.node2().query(query, values, (err) => {
          if (err) {
            console.log('Insert node2 log (node1 down) failed');
            console.log(err);
            return;
          }
          console.log('Insert node2 log (node1 down) successful');
        });
      } else {
        let query = '';
        let values = '';
        if (operation === 'add') {
          db.getLastId((lastId) => {
            query = 'INSERT INTO node3_log (query) VALUES (?)';
            values = [
              `INSERT INTO movies (id, name, year, \`rank\`) VALUES ('${lastId + 1}','${body.name}', '${body.year}', '${
                body.rank
              }');`,
            ];
            db.node3().query(query, values, (err) => {
              if (err) {
                console.log('Insert node3 log (node1 down) failed');
                console.log(err);
                return;
              }
              console.log('Insert node3 log (node1 down) successful');
            });
          });
          return;
        }
        if (operation === 'update') {
          query = 'INSERT INTO node3_log (query) VALUES (?)';
          values = [
            `UPDATE movies SET name = '${body.name}', year = '${body.year}', \`rank\` = '${body.rank}' WHERE id = ${body.id};`,
          ];
        }
        if (operation === 'delete') {
          query = 'INSERT INTO node3_log (query) VALUES (?)';
          values = [`DELETE FROM movies WHERE id = ${body.id};`];
        }
        db.node3().query(query, values, (err) => {
          if (err) {
            console.log('Insert node3 log (node1 down) failed');
            console.log(err);
            return;
          }
          console.log('Insert node3 log (node1 down) successful');
        });
      }
    } catch (err) {
      console.log(err);
    }
  },
  node2DownLog: (body, operation) => {
    try {
      let query = '';
      let values = '';
      if (operation === 'add') {
        db.getLastId((lastId) => {
          query = 'INSERT INTO node2_log (query) VALUES (?)';
          values = [
            `INSERT INTO movies (id, name, year, \`rank\`) VALUES ('${lastId + 1}', '${body.name}', '${body.year}', '${
              body.rank
            }');`,
          ];
          db.node1().query(query, values, (err) => {
            if (err) {
              console.log('Insert node2 log (node2 down) failed');
              console.log(err);
              return;
            }
            console.log('Insert node2 log (node2 down) successful');
          });
        });
        return;
      }
      if (operation === 'update') {
        query = 'INSERT INTO node2_log (query) VALUES (?)';
        values = [
          `UPDATE movies SET name = '${body.name}', year = '${body.year}', \`rank\` = '${body.rank}' WHERE id = ${body.id};`,
        ];
      }
      if (operation === 'delete') {
        query = 'INSERT INTO node2_log (query) VALUES (?)';
        values = [`DELETE FROM movies WHERE id = ${body.id};`];
      }
      db.node1().query(query, values, (err) => {
        if (err) {
          console.log('Insert node2 log (node2 down) failed');
          console.log(err);
          return;
        }
        console.log('Insert node2 log (node2 down) successful');
      });
    } catch (err) {
      console.log(err);
    }
  },
  node3DownLog: (body, operation) => {
    try {
      let query = '';
      let values = '';
      if (operation === 'add') {
        db.getLastId((lastId) => {
          query = 'INSERT INTO node3_log (query) VALUES (?)';
          values = [
            `INSERT INTO movies (id, name, year, \`rank\`) VALUES ('${lastId + 1}','${body.name}', '${body.year}', '${
              body.rank
            }');`,
          ];
          db.node1().query(query, values, (err) => {
            if (err) {
              console.log('Insert node3 log (node3 down) failed');
              console.log(err);
              return;
            }
            console.log('Insert node3 log (node3 down) successful');
          });
        });
        return;
      }
      if (operation === 'update') {
        query = 'INSERT INTO node3_log (query) VALUES (?)';
        values = [
          `UPDATE movies SET name = '${body.name}', year = '${body.year}', \`rank\` = '${body.rank}' WHERE id = ${body.id};`,
        ];
      }
      if (operation === 'delete') {
        query = 'INSERT INTO node3_log (query) VALUES (?)';
        values = [`DELETE FROM movies WHERE id = ${body.id};`];
      }
      db.node1().query(query, values, (err) => {
        if (err) {
          console.log('Insert node3 log (node3 down) failed');
          console.log(err);
          return;
        }
        console.log('Insert node3 log (node3 down) successful');
      });
    } catch (err) {
      console.log(err);
    }
  },
  getLastId: (callback) => {
    try {
      db.ping(node1, (isServerUp) => {
        if (isServerUp) {
          node1.query('SELECT id FROM movies ORDER BY id DESC LIMIT 1', (err, result) => {
            if (err) {
              console.log('Get last id failed');
              console.log(err);
              return;
            }
            console.log(`Get last id successful from node1: ${result[0].id}`);
            callback(result[0].id);
          });
        } else {
          // node2
          node2.query('SELECT id FROM movies ORDER BY id DESC LIMIT 1', (err, node2res) => {
            if (err) {
              console.log('Get last id failed');
              console.log(err);
              return;
            }
            console.log(`Get last id successful from node2: ${node2res[0].id}`);
            callback(node2res[0].id);
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
  },
  listenLocalNode: () => {
    try {
      setInterval(() => {
        console.log('Checking local database connection');
        db.ping(db.localNode(), (isServerUp) => {
          if (!localNodeStatus.isLocalNodeDown && !isServerUp) {
            localNodeStatus.isLocalNodeDown = true;
            localNodeStatus.runRecovery = true;
            console.log('Local database connection is down');
          }
          if (localNodeStatus.isLocalNodeDown && localNodeStatus.runRecovery && isServerUp) {
            console.log('Attempting to recover local database connection');
            // do recovery for node1 - check logs of node2 and node3 and see if they have any logs in nodeX_log table
            // if they do, replicate the logs to local node
            if (process.env.NODE_NUMBER === '1') {
              node2.query('SELECT * FROM node2_log', (err, node2res) => {
                if (err) {
                  console.log('Get node2_log failed');
                  console.log(err);
                  return;
                }
                console.log(`Get node2_log successful: ${node2res}`);
                if (node2res.length > 0) {
                  node2res.forEach((log) => {
                    node1.query(log.query, (errLogNode) => {
                      if (errLogNode) {
                        console.log('Replicate node2 log failed');
                        console.log(errLogNode);
                        return;
                      }
                      console.log('Replicate node2 log successful');
                    });
                  });
                }
              });
              node3.query('SELECT * FROM node3_log', (err, node3res) => {
                if (err) {
                  console.log('Get node3_log failed');
                  console.log(err);
                  return;
                }
                console.log(`Get node3_log successful: ${node3res}`);
                if (node3res.length > 0) {
                  node3res.forEach((log) => {
                    node1.query(log.query, (errLogNode) => {
                      if (errLogNode) {
                        console.log('Replicate node3 log failed');
                        console.log(errLogNode);
                        return;
                      }
                      console.log('Replicate node3 log successful');
                    });
                  });
                }
              });
            }
            localNodeStatus.isLocalNodeDown = false;
            localNodeStatus.runRecovery = false;
          }
        });

        // replication for node 2 and 3
        if (!localNodeStatus.isLocalNodeDown && process.env.NODE_NUMBER !== '1') {
          db.ping(node1, (isServerUp) => {
            localNodeStatus.runReplication = isServerUp;
          });

          if (localNodeStatus.runReplication) {
            console.log('Attempting to replicate data from central node');
            // do replication
            // first check nodeX_log table to see if there are any logs
            node1.query(`SELECT * FROM node${process.env.NODE_NUMBER}_log`, (err, node1res) => {
              if (err) {
                console.log('Get nodeX_log failed');
                console.log(err);
                return;
              }
              console.log(`Get nodeX_log successful: ${node1res}`);
              if (node1res.length > 0) {
                node1res.forEach((log) => {
                  db.localNode().query(log.query, (errLogNode) => {
                    if (errLogNode) {
                      console.log('Replication failed');
                      console.log(errLogNode);
                      return;
                    }
                    console.log('Replication successful');
                    // delete log from nodeX_log table
                    node1.query(
                      `DELETE FROM node${process.env.NODE_NUMBER}_log WHERE id = ${log.id}`,
                      (errDeleteLog) => {
                        if (errDeleteLog) {
                          console.log('Delete log failed');
                          console.log(errDeleteLog);
                          return;
                        }
                        console.log('Delete log successful');
                      }
                    );
                  });
                });
              }
            });

            localNodeStatus.runReplication = false;
          }
        }
      }, 5000);
    } catch (err) {
      console.log(err);
    }
  },
};

module.exports = db;
