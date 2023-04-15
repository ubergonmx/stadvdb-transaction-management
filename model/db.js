const mysql = require('mysql2');
const nodeEnv = process.env.NODE_ENV;
const nodeNumber = process.env.NODE_NUMBER;
let node1, node2, node3, dbName;

switch (nodeNumber) {
    case '1':
        dbName = process.env.NODE1_DB_NAME;
        if(nodeEnv === 'development') setNode1();
        setNode2();
        setNode3();
        break;
    case '2':
        dbName = process.env.NODE2_DB_NAME;
        setNode1();
        if(nodeEnv === 'development') setNode2();
        setNode3();
        break;
    case '3':
        dbName = process.env.NODE3_DB_NAME;
        setNode1();
        setNode2();
        if(nodeEnv === 'development') setNode3();
        break;
}

// create pool for local database
const local = mysql.createPool({
    host: process.env.LOCAL_DB_HOST,
    port: process.env.LOCAL_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
});

function setNode1() {
    node1 = mysql.createPool({
        host: process.env.NODE_HOST,
        port: process.env.NODE1_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.NODE1_DB_NAME,
    });
}

function setNode2() {
    node2 = mysql.createPool({
        host: process.env.NODE_HOST,
        port: process.env.NODE2_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.NODE2_DB_NAME,
    });
}

function setNode3() {
    node3 = mysql.createPool({
        host: process.env.NODE_HOST,
        port: process.env.NODE3_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.NODE3_DB_NAME,
    });
}

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
    local,
    node1,
    node2,
    node3,
    connectDB
};