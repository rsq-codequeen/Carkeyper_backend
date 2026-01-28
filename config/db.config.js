const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER, // The value you just copied
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
});

pool.getConnection()
  .then(connection=>{
    console.log('pool created and connected successfully');
    connection.release();
})
.catch(err=>{
  console.error('FATAL: Database connection failed during pool setup:', err.message)
  process.exit(1);
})



module.exports = pool;