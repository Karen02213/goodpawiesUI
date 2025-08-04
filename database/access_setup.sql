-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS pets_images;
DROP TABLE IF EXISTS pets;
DROP TABLE IF EXISTS user_images;
DROP TABLE IF EXISTS user_info;
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS cookies;
-- Cookies table
CREATE TABLE cookies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    s_cookie_value VARCHAR(255) NOT NULL,
    dt_expires_at TIMESTAMP NOT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tokens table
CREATE TABLE tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    s_token_value VARCHAR(255) NOT NULL,
    e_token_type ENUM('access', 'refresh') NOT NULL,
    dt_expires_at TIMESTAMP NOT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_cookies_user_id ON cookies(userid);
CREATE INDEX idx_tokens_user_id ON tokens(userid);