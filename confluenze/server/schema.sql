-- ============================================================
-- CONFLUENZE - MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS confluenze;
USE confluenze;

-- Users / Teams table
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
);

-- Quiz progress table (autosave + resume)
CREATE TABLE IF NOT EXISTS quiz_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  current_page INT DEFAULT 1,
  answers JSON DEFAULT ('{}'),
  started_at DATETIME NULL,
  submitted_at DATETIME NULL,
  time_remaining INT DEFAULT 1800,
  status ENUM('not_started','in_progress','submitted') DEFAULT 'not_started',
  half_complete TINYINT(1) DEFAULT 0,
  last_saved DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  score INT DEFAULT 0,
  total INT DEFAULT 20,
  completion_time INT COMMENT 'seconds taken',
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Shortlist table (admin selects top teams)
CREATE TABLE IF NOT EXISTS shortlist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  selected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- Seed: Admin account (niitm/niitm)
-- bcrypt hash of 'niitm' with salt rounds 10
-- ============================================================
INSERT IGNORE INTO users 
  (username, password_hash, member1, member2, contact1, contact2, chest_number, college, is_admin)
VALUES 
  ('niitm', '$2a$10$iaQkJyUQ8.ZjmbaqUypn6egmH0xL0ovSe75Ctj47LDddJLltxbzla', 
   'Admin', 'Admin', '0000000000', '0000000000', 'ADM-001', 'NIITM', 1);
