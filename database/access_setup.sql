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

-- Stored procedure to validate user credentials and uniqueness
DELIMITER //

CREATE PROCEDURE sp_validate_user(
    IN p_userid INT,
    IN p_username VARCHAR(30),
    IN p_email VARCHAR(50),
    IN p_phone VARCHAR(10),
    IN p_password_hash VARCHAR(300),
    OUT p_result VARCHAR(50)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_password_match INT DEFAULT 0;
    DECLARE v_user_exists INT DEFAULT 0;

    -- Check if the user exists
    SELECT COUNT(*) INTO v_user_exists
    FROM users
    WHERE id = p_userid AND b_active = 1;

    IF v_user_exists = 0 THEN
        SET p_result = 'USER_NOT_FOUND';
    ELSE
        -- Check uniqueness of username, email, or phone (excluding current user)
        SELECT COUNT(*) INTO v_count
        FROM users
        WHERE ( (p_username IS NOT NULL AND s_username = p_username)
             OR (p_email IS NOT NULL AND s_email = p_email)
             OR (p_phone IS NOT NULL AND s_phone_number = p_phone) )
          AND id <> p_userid
          AND b_active = 1;

        IF v_count > 0 THEN
            SET p_result = 'DUPLICATE_CREDENTIALS';
        ELSE
            -- Validate password for the user
            SELECT COUNT(*) INTO v_password_match
            FROM users
            WHERE id = p_userid AND s_password_hash = p_password_hash AND b_active = 1;

            IF v_password_match > 0 THEN
                SET p_result = 'VALID_USER';
            ELSE
                SET p_result = 'INVALID_PASSWORD';
            END IF;
        END IF;
    END IF;
END //

DELIMITER ;

CREATE INDEX idx_cookies_user_id ON cookies(userid);
CREATE INDEX idx_tokens_user_id ON tokens(userid);