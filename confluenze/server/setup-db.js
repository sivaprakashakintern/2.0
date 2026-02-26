/**
 * CONFLUENZE - Database Setup Script (Clean Start Version)
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setup() {
  console.log('\n🔧 CONFLUENZE Database Setup (CLEAN START)\n');

  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '1525',
  };

  try {
    const conn = await mysql.createConnection(connectionConfig);
    console.log('✅ Connected to MySQL');

    await conn.query('CREATE DATABASE IF NOT EXISTS confluenze');
    await conn.query('USE confluenze');
    console.log('✅ Database "confluenze" selected');

    console.log('⏳ Cleaning and recreatring tables...');

    // Drop in correct order due to foreign keys (DISABLED BY DEFAULT TO PREVENT DATA LOSS)
    // await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    // await conn.query('DROP TABLE IF EXISTS shortlist');
    // await conn.query('DROP TABLE IF EXISTS results');
    // await conn.query('DROP TABLE IF EXISTS quiz_progress');
    // await conn.query('DROP TABLE IF EXISTS users');
    // await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    await conn.query(`
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        member1 VARCHAR(100) NOT NULL,
        member2 VARCHAR(100) NOT NULL,
        contact1 VARCHAR(20) NOT NULL,
        contact2 VARCHAR(20) NOT NULL,
        chest_number VARCHAR(20) NOT NULL,
        college VARCHAR(150) NOT NULL,
        is_admin TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE quiz_progress (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE NOT NULL,
        current_page INT DEFAULT 1,
        answers JSON,
        started_at DATETIME NULL,
        submitted_at DATETIME NULL,
        time_remaining INT DEFAULT 1800,
        status ENUM('not_started','in_progress','submitted') DEFAULT 'not_started',
        half_complete TINYINT(1) DEFAULT 0,
        last_saved DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE results (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE NOT NULL,
        score INT DEFAULT 0,
        total INT DEFAULT 20,
        completion_time INT,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE shortlist (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE NOT NULL,
        selected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    const passwordHash = bcrypt.hashSync('niitm', 10);
    await conn.query(`
      INSERT INTO users (username, password_hash, member1, member2, contact1, contact2, chest_number, college, is_admin)
      VALUES ('niitm', ?, 'Admin', 'Admin', '0000000000', '0000000000', 'ADM-001', 'NIITM', 1)
    `, [passwordHash]);

    console.log('✅ Database setup successfully completed with a clean start.');
    console.log('👤 Admin Credentials: niitm / niitm');

    await conn.end();
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  }
}

setup();
