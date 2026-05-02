-- HIS Database Initialization
-- Chạy script này TRƯỚC TIÊN để tạo database

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'HIS_DB')
BEGIN
    CREATE DATABASE HIS_DB;
END
GO

USE HIS_DB;
GO

-- ============================================================
-- M0: Auth & Users
-- ============================================================
CREATE TABLE IF NOT EXISTS Roles (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_name NVARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(255),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETUTCDATE()
);

CREATE TABLE IF NOT EXISTS Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    email NVARCHAR(100),
    role NVARCHAR(50) NOT NULL DEFAULT 'user',
    staff_id INT NULL,
    is_active BIT DEFAULT 1,
    failed_login_attempts INT DEFAULT 0,
    locked_until DATETIME NULL,
    last_login_at DATETIME NULL,
    created_at DATETIME DEFAULT GETUTCDATE(),
    updated_at DATETIME DEFAULT GETUTCDATE()
);

CREATE TABLE IF NOT EXISTS Permissions (
    permission_id INT IDENTITY(1,1) PRIMARY KEY,
    resource NVARCHAR(50) NOT NULL,
    action NVARCHAR(20) NOT NULL,
    description NVARCHAR(255)
);

CREATE TABLE IF NOT EXISTS UserPermissions (
    user_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (user_id, permission_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (permission_id) REFERENCES Permissions(permission_id)
);

CREATE TABLE IF NOT EXISTS AuditLogs (
    audit_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NULL,
    action NVARCHAR(50) NOT NULL,
    resource NVARCHAR(100) NOT NULL,
    resource_id BIGINT NULL,
    old_value NVARCHAR(MAX) NULL,
    new_value NVARCHAR(MAX) NULL,
    ip_address NVARCHAR(45) NULL,
    user_agent NVARCHAR(255) NULL,
    created_at DATETIME DEFAULT GETUTCDATE()
);

CREATE TABLE IF NOT EXISTS SystemConfigs (
    config_id INT IDENTITY(1,1) PRIMARY KEY,
    config_key NVARCHAR(100) NOT NULL UNIQUE,
    config_value NVARCHAR(MAX) NULL,
    description NVARCHAR(255),
    updated_at DATETIME DEFAULT GETUTCDATE()
);

-- ============================================================
-- M0: Master Data
-- ============================================================
CREATE TABLE IF NOT EXISTS Departments (
    department_id INT IDENTITY(1,1) PRIMARY KEY,
    department_code NVARCHAR(20) UNIQUE,
    department_name NVARCHAR(100) NOT NULL,
    department_type NVARCHAR(50),
    head_doctor_id INT NULL,
    floor NVARCHAR(10) NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETUTCDATE()
);

CREATE TABLE IF NOT EXISTS MedicalServices (
    service_id INT IDENTITY(1,1) PRIMARY KEY,
    service_code NVARCHAR(20) UNIQUE,
    service_name NVARCHAR(200) NOT NULL,
    category NVARCHAR(100),
    department_id INT NULL,
    base_price DECIMAL(18,2) DEFAULT 0,
    bhyt_price DECIMAL(18,2) DEFAULT 0,
    is_bhyt BIT DEFAULT 0,
    is_active BIT DEFAULT 1,
    FOREIGN KEY (department_id) REFERENCES Departments(department_id)
);

CREATE TABLE IF NOT EXISTS ICD10Codes (
    icd10_id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(10) NOT NULL UNIQUE,
    description_vn NVARCHAR(500) NOT NULL,
    description_en NVARCHAR(500) NULL,
    chapter NVARCHAR(100) NULL,
    is_notifiable BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETUTCDATE()
);

CREATE TABLE IF NOT EXISTS Doctors (
    doctor_id INT IDENTITY(1,1) PRIMARY KEY,
    staff_id INT NULL,
    specialty NVARCHAR(100),
    license_number NVARCHAR(50),
    license_expiry DATE,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETUTCDATE()
);

CREATE INDEX IX_AuditLogs_UserId ON AuditLogs(user_id);
CREATE INDEX IX_AuditLogs_CreatedAt ON AuditLogs(created_at);
CREATE INDEX IX_ICD10Codes_Code ON ICD10Codes(code);
CREATE INDEX IX_MedicalServices_Code ON MedicalServices(service_code);
