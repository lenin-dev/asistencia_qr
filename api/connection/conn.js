const mysql = require('mysql2/promise');
require('dotenv').config();

async function connection() {
    const conn = mysql.createPool({
        host                    : process.env.HOST,
        port                    : process.env.PORT,
        user                    : process.env.USER_DB,
        password                : process.env.PASSWORD,
        database                : process.env.DATABASE,
        waitForConnections      : true,
        connectionLimit         : 200,
        maxIdle                 : 10,
        idleTimeout             : 60000,
        queueLimit              : 0,
        enableKeepAlive         : true,
        keepAliveInitialDelay   : 0,
    });
    const pool = await conn.getConnection();
    return pool
}

module.exports = connection