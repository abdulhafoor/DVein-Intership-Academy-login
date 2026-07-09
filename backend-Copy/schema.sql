CREATE DATABASE IF NOT EXISTS internship_academy
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE internship_academy;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password VARCHAR(256) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'intern',
  department VARCHAR(100) NULL,
  batch VARCHAR(100) NULL
);

CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date DATE NOT NULL,
  check_in TIME NULL,
  check_out TIME NULL,
  status VARCHAR(20) NOT NULL,
  CONSTRAINT uniq_attendance_user_date UNIQUE (user_id, date),
  CONSTRAINT fk_attendance_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);
