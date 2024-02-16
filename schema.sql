CREATE DATABASE IF NOT EXISTS company_management_db;
USE company_management_db;

CREATE TABLE IF NOT EXISTS company (
    id VARCHAR(50) PRIMARY KEY,
    company_name VARCHAR(100), -- Removed UNIQUE constraint
    expected_date DATE,
    company_url VARCHAR(255) DEFAULT NULL;
);

CREATE TABLE user (
    id VARCHAR(50) PRIMARY KEY,
    company_name VARCHAR(50),
    role VARCHAR(50),
    applied_date DATE,
    email VARCHAR(50) NOT NULL, -- Removed UNIQUE constraint
    status VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS registration (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL
);