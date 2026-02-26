const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql2 = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'niitm',
    database: process.env.DB_NAME || 'confluenze',
};

// Create the pool but we'll ensure the DB exists first
const pool = mysql2.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    timezone: '+05:30'
});

async function initializeDatabase() {
    try {
        // Connect without database selected to create it if needed
        const connection = await mysql2.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        await connection.query(`USE \`${dbConfig.database}\``);
        console.log(`✅ Database "${dbConfig.database}" is ready`);

        // Create Users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                member1 VARCHAR(100) NOT NULL,
                member2 VARCHAR(100) NOT NULL,
                contact1 VARCHAR(20) NOT NULL,
                contact2 VARCHAR(20) NOT NULL,
                chest_number VARCHAR(100) NOT NULL,
                college VARCHAR(150) NOT NULL,
                is_admin TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create Quiz Progress table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS quiz_progress (
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

        // Create Results table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS results (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT UNIQUE NOT NULL,
                score INT DEFAULT 0,
                total INT DEFAULT 20,
                completion_time INT,
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Create Shortlist table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS shortlist (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT UNIQUE NOT NULL,
                selected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Ensure Admin user exists
        const [admins] = await connection.query('SELECT * FROM users WHERE is_admin = 1');
        if (admins.length === 0) {
            const passwordHash = await bcrypt.hash('niitm', 10);
            await connection.query(`
                INSERT INTO users (username, password_hash, member1, member2, contact1, contact2, chest_number, college, is_admin)
                VALUES ('niitm', ?, 'Admin', 'Admin', '0000000000', '0000000000', 'ADM-001', 'NIITM', 1)
            `, [passwordHash]);
            console.log('👤 Default Admin user created: niitm / niitm');
        }

        await connection.end();
        console.log('✅ MySQL tables checked/created successfully');
    } catch (err) {
        console.error('❌ Database Initialization failed:', err.message);
        // We don't exit if it's just a table issue, but on first run it might be needed.
    }
}

// Run initialization
initializeDatabase();

module.exports = pool;

