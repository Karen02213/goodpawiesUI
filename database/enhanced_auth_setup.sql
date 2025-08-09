-- Enhanced Authentication Setup for GoodPawies
-- This script creates additional tables and procedures for professional authentication

-- Create refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_agent VARCHAR(500),
    ip_address VARCHAR(45),
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_refresh_tokens_userid (userid),
    INDEX idx_refresh_tokens_hash (token_hash),
    INDEX idx_refresh_tokens_expires (expires_at)
);

-- Create session management table
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    session_id VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_userid (userid),
    INDEX idx_sessions_expires (expires_at)
);

-- Create login attempts table for rate limiting
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(100) NOT NULL, -- email, username, or IP
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    INDEX idx_login_attempts_identifier (identifier),
    INDEX idx_login_attempts_time (attempt_time)
);

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reset_tokens_hash (token_hash),
    INDEX idx_reset_tokens_expires (expires_at)
);

-- Add additional security fields to users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(32),
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS account_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lock_until TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Enhanced user validation procedure
DELIMITER //

DROP PROCEDURE IF EXISTS sp_authenticate_user//

CREATE PROCEDURE sp_authenticate_user(
    IN p_identifier VARCHAR(100), -- username, email, or phone
    IN p_password_hash VARCHAR(300),
    OUT p_user_id INT,
    OUT p_result VARCHAR(50),
    OUT p_user_data JSON
)
BEGIN
    DECLARE v_user_id INT DEFAULT 0;
    DECLARE v_stored_hash VARCHAR(300);
    DECLARE v_account_locked BOOLEAN DEFAULT FALSE;
    DECLARE v_lock_until TIMESTAMP;
    DECLARE v_failed_attempts INT DEFAULT 0;
    DECLARE v_user_json JSON;

    -- Find user by username, email, or phone
    SELECT id, s_password_hash, account_locked, lock_until, failed_login_attempts
    INTO v_user_id, v_stored_hash, v_account_locked, v_lock_until, v_failed_attempts
    FROM users 
    WHERE (s_username = p_identifier OR s_email = p_identifier OR s_phone_number = p_identifier)
      AND b_active = 1
    LIMIT 1;

    -- Check if user exists
    IF v_user_id = 0 THEN
        SET p_user_id = 0;
        SET p_result = 'USER_NOT_FOUND';
        SET p_user_data = NULL;
    -- Check if account is locked
    ELSEIF v_account_locked = TRUE AND (v_lock_until IS NULL OR v_lock_until > NOW()) THEN
        SET p_user_id = v_user_id;
        SET p_result = 'ACCOUNT_LOCKED';
        SET p_user_data = NULL;
    -- Validate password
    ELSEIF v_stored_hash = p_password_hash THEN
        -- Password is correct, reset failed attempts and unlock account
        UPDATE users 
        SET failed_login_attempts = 0, 
            account_locked = FALSE, 
            lock_until = NULL,
            last_login = NOW()
        WHERE id = v_user_id;
        
        -- Prepare user data
        SELECT JSON_OBJECT(
            'id', id,
            'username', s_username,
            'email', s_email,
            'phone', CONCAT(s_phone_prefix, s_phone_number),
            'full_name', s_full_name,
            'full_surname', s_full_surname,
            'email_verified', email_verified,
            'phone_verified', phone_verified,
            'two_factor_enabled', two_factor_enabled,
            'created_at', dt_created_at,
            'last_login', last_login
        ) INTO v_user_json
        FROM users WHERE id = v_user_id;
        
        SET p_user_id = v_user_id;
        SET p_result = 'SUCCESS';
        SET p_user_data = v_user_json;
    ELSE
        -- Password is incorrect, increment failed attempts
        SET v_failed_attempts = v_failed_attempts + 1;
        
        IF v_failed_attempts >= 5 THEN
            -- Lock account for 30 minutes after 5 failed attempts
            UPDATE users 
            SET failed_login_attempts = v_failed_attempts,
                account_locked = TRUE,
                lock_until = DATE_ADD(NOW(), INTERVAL 30 MINUTE)
            WHERE id = v_user_id;
            SET p_result = 'ACCOUNT_LOCKED';
        ELSE
            UPDATE users 
            SET failed_login_attempts = v_failed_attempts
            WHERE id = v_user_id;
            SET p_result = 'INVALID_PASSWORD';
        END IF;
        
        SET p_user_id = v_user_id;
        SET p_user_data = NULL;
    END IF;
END //

-- User registration procedure
DROP PROCEDURE IF EXISTS sp_register_user//

CREATE PROCEDURE sp_register_user(
    IN p_username VARCHAR(30),
    IN p_email VARCHAR(50),
    IN p_phone_prefix VARCHAR(5),
    IN p_phone_number VARCHAR(10),
    IN p_password_hash VARCHAR(300),
    IN p_full_name VARCHAR(30),
    IN p_full_surname VARCHAR(30),
    OUT p_user_id INT,
    OUT p_result VARCHAR(50)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_user_id INT DEFAULT 0;
    
    -- Check if username, email, or phone already exists
    SELECT COUNT(*) INTO v_count
    FROM users 
    WHERE s_username = p_username 
       OR s_email = p_email 
       OR (s_phone_prefix = p_phone_prefix AND s_phone_number = p_phone_number);
    
    IF v_count > 0 THEN
        SET p_user_id = 0;
        SET p_result = 'USER_EXISTS';
    ELSE
        -- Insert new user
        INSERT INTO users (
            s_username, s_email, s_phone_prefix, s_phone_number, 
            s_password_hash, s_full_name, s_full_surname, 
            b_active, password_changed_at
        ) VALUES (
            p_username, p_email, p_phone_prefix, p_phone_number,
            p_password_hash, p_full_name, p_full_surname,
            1, NOW()
        );
        
        SET v_user_id = LAST_INSERT_ID();
        SET p_user_id = v_user_id;
        SET p_result = 'SUCCESS';
        
        -- Create default user_info record
        INSERT INTO user_info (userid, s_description, b_active)
        VALUES (v_user_id, CONCAT('Welcome ', p_full_name, '!'), 1);
    END IF;
END //

-- Cleanup expired tokens procedure
DROP PROCEDURE IF EXISTS sp_cleanup_expired_tokens//

CREATE PROCEDURE sp_cleanup_expired_tokens()
BEGIN
    -- Remove expired refresh tokens
    DELETE FROM refresh_tokens WHERE expires_at < NOW();
    
    -- Remove expired sessions
    DELETE FROM user_sessions WHERE expires_at < NOW();
    
    -- Remove expired password reset tokens
    DELETE FROM password_reset_tokens WHERE expires_at < NOW();
    
    -- Remove old login attempts (older than 24 hours)
    DELETE FROM login_attempts WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 24 HOUR);
    
    -- Unlock accounts where lock time has expired
    UPDATE users 
    SET account_locked = FALSE, lock_until = NULL 
    WHERE account_locked = TRUE AND lock_until IS NOT NULL AND lock_until < NOW();
END //

DELIMITER ;

-- Create event to run cleanup procedure every hour
SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS cleanup_tokens_event;

CREATE EVENT cleanup_tokens_event
ON SCHEDULE EVERY 1 HOUR
DO
    CALL sp_cleanup_expired_tokens();
