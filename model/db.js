const mysql = require('mysql2');
const nodeEnv = process.env.NODE_ENV;
const nodeNumber = process.env.NODE_NUMBER;

const node1 = mysql.createPool({
        host: (nodeEnv==='development') ? process.env.NODE_DB_HOST : process.env.NODE1_DB_HOST,
        port: (nodeEnv==='development') ? process.env.NODE1_DB_PORT : process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.NODE1_DB_NAME,
});

const node2 = mysql.createPool({
        host: (nodeEnv==='development') ? process.env.NODE_DB_HOST : process.env.NODE2_DB_HOST,
        port: (nodeEnv==='development') ? process.env.NODE2_DB_PORT : process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.NODE2_DB_NAME,
});

const node3 = mysql.createPool({
        host: (nodeEnv==='development') ? process.env.NODE_DB_HOST : process.env.NODE3_DB_HOST,
        port: (nodeEnv==='development') ? process.env.NODE3_DB_PORT : process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.NODE3_DB_NAME,
});

function connectDB(){
    if(nodeEnv === 'production') {
        local.getConnection((err) => {
            if (err) {
                console.log(`Error connecting to ${dbName} database`)
                console.log(err);
            } else {
                console.log(`Connected to ${dbName} database`);
            }
        });
    }

    if(node1) {
        node1.getConnection((err) => {
            if (err) {
                console.log(`Error connecting to ${process.env.NODE1_DB_NAME} database`)
                console.log(err);
            } else {
                console.log(`Connected to ${process.env.NODE1_DB_NAME} database`);
            }
        });
    }
    if(node2) {
        node2.getConnection((err) => {
            if (err) {
                console.log(`Error connecting to ${process.env.NODE2_DB_NAME} database`)
                console.log(err);
            } else {
                console.log(`Connected to ${process.env.NODE2_DB_NAME} database`);
            }
        });
    }
    if(node3) {
        node3.getConnection((err) => {
            if (err) {
                console.log(`Error connecting to ${process.env.NODE3_DB_NAME} database`)
                console.log(err);
            } else {
                console.log(`Connected to ${process.env.NODE3_DB_NAME} database`);
            }
        });
    }
}

module.exports = {
    node1,
    node2,
    node3,
    connectDB
};