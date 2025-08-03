-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS qrcodes;
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS cookies;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    i_id INT PRIMARY KEY AUTO_INCREMENT,
    s_username VARCHAR(50) NOT NULL UNIQUE,
    s_password_hash VARCHAR(255) NOT NULL,
    s_email VARCHAR(100) UNIQUE,
    s_full_name VARCHAR(100),
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT
);

-- Create cookies table
CREATE TABLE cookies (
    i_id INT PRIMARY KEY AUTO_INCREMENT,
    i_user_id INT NOT NULL,
    s_cookie_value VARCHAR(255) NOT NULL,
    dt_expires_at TIMESTAMP NOT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (i_user_id) REFERENCES users(i_id) ON DELETE CASCADE
);

-- Create tokens table
CREATE TABLE tokens (
    i_id INT PRIMARY KEY AUTO_INCREMENT,
    i_user_id INT NOT NULL,
    s_token_value VARCHAR(255) NOT NULL,
    e_token_type ENUM('access', 'refresh') NOT NULL,
    dt_expires_at TIMESTAMP NOT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (i_user_id) REFERENCES users(i_id) ON DELETE CASCADE
);

-- Create qrcodes table
CREATE TABLE qrcodes (
    i_id INT PRIMARY KEY AUTO_INCREMENT,
    i_user_id INT NOT NULL,
    t_qr_data TEXT NOT NULL,
    l_base64_image LONGTEXT NOT NULL,
    s_original_url VARCHAR(255) NOT NULL,
    s_name VARCHAR(100),
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (i_user_id) REFERENCES users(i_id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_users_username ON users(s_username);
CREATE INDEX idx_cookies_user_id ON cookies(i_user_id);
CREATE INDEX idx_tokens_user_id ON tokens(i_user_id);
CREATE INDEX idx_qrcodes_user_id ON qrcodes(i_user_id);

-- Insert test user
INSERT INTO users (s_username, s_password_hash, s_email) 
VALUES ('testuser', '$2b$10$6jM7G7eHQRq/Qa99h4HyS.Qz7RCXu7H3w3LYz.7tT3STFsFi052G', 'test@example.com');
