const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306, // Default to 3306 if port isn't in .env
  
  // PRODUCTION SETTINGS
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0,
  
  // KEEP-ALIVE SETTINGS (Crucial for Deployment)
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000 // 10 seconds
}).promise();

// Check connection once on startup
pool.getConnection()
  .then(connection => {
    console.log('✅ Database Pool connected to:', process.env.DB_NAME);
    connection.release();
  })
  .catch(err => {
    console.error('❌ FATAL: Database connection failed:', err.message);
    // In production, you might want to alert an admin here
  });

module.exports = pool;