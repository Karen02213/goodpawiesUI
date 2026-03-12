-- ============================================================================
-- GoodPawies Database Setup - Consolidated Schema
-- ============================================================================
-- Single source of truth for database schema.
-- Images stored as filenames, actual files in server/uploads/
-- ============================================================================

-- ============================================================================
-- SECTION 1: DROP ALL TABLES (reverse dependency order)
-- ============================================================================
DROP TABLE IF EXISTS pets_images;
DROP TABLE IF EXISTS pets;
DROP TABLE IF EXISTS pets_breed;
DROP TABLE IF EXISTS pets_types;
DROP TABLE IF EXISTS pets_gender;
DROP TABLE IF EXISTS pets_size;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS login_attempts;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS cookies;
DROP TABLE IF EXISTS user_images;
DROP TABLE IF EXISTS user_info;
DROP TABLE IF EXISTS users;

-- ============================================================================
-- SECTION 2: CORE USER TABLES
-- ============================================================================

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    s_username VARCHAR(30) NOT NULL UNIQUE,
    s_password_hash VARCHAR(300) NOT NULL,
    s_phone_prefix VARCHAR(5) NOT NULL,
    s_phone_number VARCHAR(10) NOT NULL,
    s_email VARCHAR(50),
    s_full_name VARCHAR(30),
    s_full_surname VARCHAR(30),
    s_city VARCHAR(100),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(32),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    account_locked BOOLEAN DEFAULT FALSE,
    lock_until TIMESTAMP NULL,
    failed_login_attempts INT DEFAULT 0,
    last_login TIMESTAMP NULL,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1
);

CREATE TABLE user_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    s_description VARCHAR(200) NOT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- image_id stores filename, actual file in server/uploads/users/
CREATE TABLE user_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    image_id VARCHAR(255),
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- SECTION 3: AUTHENTICATION TABLES
-- ============================================================================

CREATE TABLE user_sessions (
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

CREATE TABLE refresh_tokens (
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

CREATE TABLE login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(100) NOT NULL,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT FALSE,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    INDEX idx_login_attempts_identifier (identifier),
    INDEX idx_login_attempts_time (attempt_time)
);

CREATE TABLE password_reset_tokens (
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

CREATE TABLE cookies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    s_cookie_value VARCHAR(255) NOT NULL,
    dt_expires_at TIMESTAMP NOT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    s_token_value VARCHAR(255) NOT NULL,
    e_token_type ENUM('access', 'refresh') NOT NULL,
    dt_expires_at TIMESTAMP NOT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- SECTION 4: PET TABLES
-- ============================================================================

CREATE TABLE pets_gender (
    id INT PRIMARY KEY AUTO_INCREMENT,
    s_gender VARCHAR(20) NOT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1
);

CREATE TABLE pets_size (
    id INT PRIMARY KEY AUTO_INCREMENT,
    s_size VARCHAR(20) NOT NULL,
    s_size_code VARCHAR(10) NOT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1
);

CREATE TABLE pets_color (
    id INT PRIMARY KEY AUTO_INCREMENT,
    s_color VARCHAR(30) NOT NULL,
    s_hex VARCHAR(10) DEFAULT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1
);

CREATE TABLE pets_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    s_type VARCHAR(30) NOT NULL,
    s_icon VARCHAR(8) DEFAULT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1
);

CREATE TABLE pets_breed (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_type INT NOT NULL,
    s_breed VARCHAR(60) NOT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1,
    FOREIGN KEY (id_type) REFERENCES pets_types(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE pets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    s_petname VARCHAR(30) NOT NULL,
    s_type VARCHAR(30) NOT NULL,
    s_breed VARCHAR(60) NOT NULL,
    s_description TEXT,
    s_color VARCHAR(50),
    s_age VARCHAR(20),
    s_gender VARCHAR(20) NOT NULL DEFAULT 'Macho',
    s_size VARCHAR(10) NOT NULL DEFAULT 'medium',
    b_vaccinated BIT DEFAULT 0,
    b_sterilized BIT DEFAULT 0,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- image_id stores filename, actual file in server/uploads/pets/
CREATE TABLE pets_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    petid INT NOT NULL,
    image_id VARCHAR(255),
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1,
    FOREIGN KEY (petid) REFERENCES pets(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================================
-- SECTION 5: INDEXES
-- ============================================================================

CREATE INDEX idx_users_username ON users(s_username);
CREATE INDEX idx_users_email ON users(s_email);
CREATE INDEX idx_user_info_userid ON user_info(userid);
CREATE INDEX idx_user_images_userid ON user_images(userid);
CREATE INDEX idx_cookies_userid ON cookies(userid);
CREATE INDEX idx_tokens_userid ON tokens(userid);
CREATE INDEX idx_pets_userid ON pets(userid);
CREATE INDEX idx_pets_type ON pets(s_type);
CREATE INDEX idx_pets_breed ON pets(s_breed);
CREATE INDEX idx_pets_images_petid ON pets_images(petid);
CREATE INDEX idx_pets_breed_type ON pets_breed(id_type);

-- ============================================================================
-- SECTION 6: STORED PROCEDURES
-- ============================================================================
-- ... (Stored procedures remain unchanged) ...


-- ============================================================================
-- SECTION 6: STORED PROCEDURES
-- ============================================================================

DELIMITER //

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
    
    SELECT COUNT(*) INTO v_count FROM users 
    WHERE s_username = p_username OR s_email = p_email 
       OR (s_phone_prefix = p_phone_prefix AND s_phone_number = p_phone_number);
    
    IF v_count > 0 THEN
        SET p_user_id = 0;
        SET p_result = 'USER_EXISTS';
    ELSE
        INSERT INTO users (
            s_username, s_email, s_phone_prefix, s_phone_number, 
            s_password_hash, s_full_name, s_full_surname, b_active, password_changed_at
        ) VALUES (
            p_username, p_email, p_phone_prefix, p_phone_number,
            p_password_hash, p_full_name, p_full_surname, 1, NOW()
        );
        
        SET v_user_id = LAST_INSERT_ID();
        SET p_user_id = v_user_id;
        SET p_result = 'SUCCESS';
        
        INSERT INTO user_info (userid, s_description, b_active)
        VALUES (v_user_id, CONCAT('¡Bienvenido ', p_full_name, '!'), 1);
    END IF;
END //

DROP PROCEDURE IF EXISTS sp_authenticate_user//
CREATE PROCEDURE sp_authenticate_user(
    IN p_identifier VARCHAR(100),
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

    SELECT id, s_password_hash, account_locked, lock_until, failed_login_attempts
    INTO v_user_id, v_stored_hash, v_account_locked, v_lock_until, v_failed_attempts
    FROM users 
    WHERE (s_username = p_identifier OR s_email = p_identifier OR s_phone_number = p_identifier)
      AND b_active = 1 LIMIT 1;

    IF v_user_id = 0 THEN
        SET p_user_id = 0; SET p_result = 'USER_NOT_FOUND'; SET p_user_data = NULL;
    ELSEIF v_account_locked = TRUE AND (v_lock_until IS NULL OR v_lock_until > NOW()) THEN
        SET p_user_id = v_user_id; SET p_result = 'ACCOUNT_LOCKED'; SET p_user_data = NULL;
    ELSEIF v_stored_hash = p_password_hash THEN
        UPDATE users SET failed_login_attempts = 0, account_locked = FALSE, lock_until = NULL, last_login = NOW() WHERE id = v_user_id;
        SELECT JSON_OBJECT('id', id, 'username', s_username, 'email', s_email,
            'phone', CONCAT(s_phone_prefix, s_phone_number), 'full_name', s_full_name, 
            'full_surname', s_full_surname, 'email_verified', email_verified, 
            'phone_verified', phone_verified, 'two_factor_enabled', two_factor_enabled,
            'created_at', dt_created_at, 'last_login', last_login
        ) INTO v_user_json FROM users WHERE id = v_user_id;
        SET p_user_id = v_user_id; SET p_result = 'SUCCESS'; SET p_user_data = v_user_json;
    ELSE
        SET v_failed_attempts = v_failed_attempts + 1;
        IF v_failed_attempts >= 20 THEN 
            UPDATE users SET failed_login_attempts = v_failed_attempts, account_locked = TRUE,
                lock_until = DATE_ADD(NOW(), INTERVAL 60 MINUTE) WHERE id = v_user_id;
            SET p_result = 'ACCOUNT_LOCKED';
        ELSEIF v_failed_attempts >= 10 THEN
            UPDATE users SET failed_login_attempts = v_failed_attempts, account_locked = TRUE,
                lock_until = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE id = v_user_id;
            SET p_result = 'ACCOUNT_TIME_OUT';
        ELSE
            UPDATE users SET failed_login_attempts = v_failed_attempts WHERE id = v_user_id;
            SET p_result = 'INVALID_PASSWORD';
        END IF;
        SET p_user_id = v_user_id; SET p_user_data = NULL;
    END IF;
END //

DROP PROCEDURE IF EXISTS sp_validate_user//
CREATE PROCEDURE sp_validate_user(
    IN p_userid INT, IN p_username VARCHAR(30), IN p_email VARCHAR(50),
    IN p_phone VARCHAR(10), IN p_password_hash VARCHAR(300), OUT p_result VARCHAR(50)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_password_match INT DEFAULT 0;
    DECLARE v_user_exists INT DEFAULT 0;

    SELECT COUNT(*) INTO v_user_exists FROM users WHERE id = p_userid AND b_active = 1;
    IF v_user_exists = 0 THEN SET p_result = 'USER_NOT_FOUND';
    ELSE
        SELECT COUNT(*) INTO v_count FROM users
        WHERE ((p_username IS NOT NULL AND s_username = p_username)
            OR (p_email IS NOT NULL AND s_email = p_email)
            OR (p_phone IS NOT NULL AND s_phone_number = p_phone))
          AND id <> p_userid AND b_active = 1;
        IF v_count > 0 THEN SET p_result = 'DUPLICATE_CREDENTIALS';
        ELSE
            SELECT COUNT(*) INTO v_password_match FROM users
            WHERE id = p_userid AND s_password_hash = p_password_hash AND b_active = 1;
            IF v_password_match > 0 THEN SET p_result = 'VALID_USER';
            ELSE SET p_result = 'INVALID_PASSWORD'; END IF;
        END IF;
    END IF;
END //

DROP PROCEDURE IF EXISTS sp_cleanup_expired_tokens//
CREATE PROCEDURE sp_cleanup_expired_tokens()
BEGIN
    DELETE FROM refresh_tokens WHERE expires_at < NOW();
    DELETE FROM user_sessions WHERE expires_at < NOW();
    DELETE FROM password_reset_tokens WHERE expires_at < NOW();
    DELETE FROM login_attempts WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 24 HOUR);
    UPDATE users SET account_locked = FALSE, lock_until = NULL 
    WHERE account_locked = TRUE AND lock_until IS NOT NULL AND lock_until < NOW();
END //

DELIMITER ;

-- ============================================================================
-- SECTION 7: SAMPLE DATA - Realistic Mexican Users and Pets
-- ============================================================================

-- Users (password hash is bcrypt of 'password123')
INSERT INTO users (s_username, s_password_hash, s_email, s_phone_prefix, s_phone_number, s_full_name, s_full_surname, s_city, b_active) VALUES
('carlos.mendez', '$2b$10$LmHoJaJv7hqQF4eXn1rT2OqE8gN5k1aW9xQ3eR7tY6uI0oP2aS4dF', 'carlos.mendez@gmail.com', '+52', '5512345678', 'Carlos', 'Méndez García', 'Ciudad de México', 1),
('maria.lopez', '$2b$10$LmHoJaJv7hqQF4eXn1rT2OqE8gN5k1aW9xQ3eR7tY6uI0oP2aS4dF', 'maria.lopez@hotmail.com', '+52', '3312345678', 'María', 'López Hernández', 'Guadalajara', 1),
('juan.rodriguez', '$2b$10$LmHoJaJv7hqQF4eXn1rT2OqE8gN5k1aW9xQ3eR7tY6uI0oP2aS4dF', 'juan.rod@outlook.com', '+52', '8112345678', 'Juan Pablo', 'Rodríguez Sánchez', 'Monterrey', 1),
('ana.martinez', '$2b$10$LmHoJaJv7hqQF4eXn1rT2OqE8gN5k1aW9xQ3eR7tY6uI0oP2aS4dF', 'ana.mtz@gmail.com', '+52', '2212345678', 'Ana Sofía', 'Martínez Ruiz', 'Puebla', 1),
('pedro.gonzalez', '$2b$10$LmHoJaJv7hqQF4eXn1rT2OqE8gN5k1aW9xQ3eR7tY6uI0oP2aS4dF', 'pedro.glez@yahoo.com', '+52', '9991234567', 'Pedro', 'González Flores', 'Mérida', 1),
('laura.sanchez', '$2b$10$LmHoJaJv7hqQF4eXn1rT2OqE8gN5k1aW9xQ3eR7tY6uI0oP2aS4dF', 'laura.sanchez@gmail.com', '+52', '6621234567', 'Laura', 'Sánchez Vega', 'Hermosillo', 1),
('roberto.diaz', '$2b$10$LmHoJaJv7hqQF4eXn1rT2OqE8gN5k1aW9xQ3eR7tY6uI0oP2aS4dF', 'roberto.diaz@hotmail.com', '+52', '4421234567', 'Roberto', 'Díaz Moreno', 'Querétaro', 1),
('sofia.hernandez', '$2b$10$LmHoJaJv7hqQF4eXn1rT2OqE8gN5k1aW9xQ3eR7tY6uI0oP2aS4dF', 'sofia.hdz@gmail.com', '+52', '7771234567', 'Sofía', 'Hernández Castro', 'Cuernavaca', 1),
('miguel.torres', '$2b$10$LmHoJaJv7hqQF4eXn1rT2OqE8gN5k1aW9xQ3eR7tY6uI0oP2aS4dF', 'miguel.torres@outlook.com', '+52', '6141234567', 'Miguel Ángel', 'Torres Jiménez', 'Chihuahua', 1),
('fernanda.ramirez', '$2b$10$LmHoJaJv7hqQF4eXn1rT2OqE8gN5k1aW9xQ3eR7tY6uI0oP2aS4dF', 'fer.ramirez@gmail.com', '+52', '4771234567', 'Fernanda', 'Ramírez Ortiz', 'León', 1),
('diego.morales', '$2b$10$LmHoJaJv7hqQF4eXn1rT2OqE8gN5k1aW9xQ3eR7tY6uI0oP2aS4dF', 'diego.morales@yahoo.com', '+52', '2281234567', 'Diego', 'Morales Vargas', 'Veracruz', 1),
('valentina.castro', '$2b$10$LmHoJaJv7hqQF4eXn1rT2OqE8gN5k1aW9xQ3eR7tY6uI0oP2aS4dF', 'vale.castro@gmail.com', '+52', '9511234567', 'Valentina', 'Castro Mendoza', 'Oaxaca', 1);

-- User info
INSERT INTO user_info (userid, s_description, b_active) VALUES
(1, 'Amante de los perros, tengo 2 Golden Retrievers. Vivo en la CDMX.', 1),
(2, 'Rescatista de gatos. He adoptado 5 gatitos de la calle.', 1),
(3, 'Veterinario de profesión, me encantan todos los animales.', 1),
(4, 'Mamá de 3 perritos chihuahuas muy traviesos.', 1),
(5, 'Tengo un rancho con varios animales, principalmente perros.', 1),
(6, 'Criadora responsable de Pastor Alemán.', 1),
(7, 'Fan de los gatos persas, tengo 2 hermosas gatitas.', 1),
(8, 'Rescatista de gatos, actualmente cuido dos michis muy juguetones.', 1),
(9, 'Corredor con mi Husky Siberiano todos los días.', 1),
(10, 'Voluntaria en refugio de animales los fines de semana.', 1),
(11, 'Papá de un Bulldog Francés muy consentido.', 1),
(12, 'Artista que pinta mascotas, tengo 2 gatitos siameses.', 1);

-- Pet genders
INSERT INTO pets_gender (s_gender, b_active) VALUES ('Macho', 1), ('Hembra', 1);

-- Pet sizes
INSERT INTO pets_size (s_size, s_size_code, b_active) VALUES
('Pequeño', 'small', 1), ('Mediano', 'medium', 1), ('Grande', 'large', 1);

-- Pet colors
INSERT INTO pets_color (s_color, s_hex, b_active) VALUES
('Negro', '#000000', 1), ('Blanco', '#FFFFFF', 1), ('Café', '#8B4513', 1),
('Gris', '#808080', 1), ('Dorado', '#FFD700', 1), ('Beige', '#F5F5DC', 1),
('Manchado', NULL, 1), ('Atigrado', NULL, 1), ('Tricolor', NULL, 1),
('Bicolor', NULL, 1), ('Rojizo', '#A52A2A', 1), ('Crema', '#FFFDD0', 1);

-- Pet types
INSERT INTO pets_types (s_type, s_icon, b_active) VALUES
('Perro', '🐶', 1),
('Gato', '🐱', 1);

-- Pet breeds
INSERT INTO pets_breed (id_type, s_breed, b_active) VALUES
-- Perros (id_type = 1)
(1, 'Mestizo', 1),
(1, 'Golden Retriever', 1),
(1, 'Labrador Retriever', 1),
(1, 'Pastor Alemán', 1),
(1, 'Bulldog Francés', 1),
(1, 'Bulldog Inglés', 1),
(1, 'Chihuahua', 1),
(1, 'Poodle', 1),
(1, 'Rottweiler', 1),
(1, 'Husky Siberiano', 1),
(1, 'Schnauzer', 1),
(1, 'Beagle', 1),
(1, 'Pug', 1),
(1, 'Shih Tzu', 1),
(1, 'Yorkshire Terrier', 1),
(1, 'Terranova', 1),
(1, 'Doberman', 1),
(1, 'Border Collie', 1),
(1, 'Dálmata', 1),
(1, 'Cocker Spaniel', 1),
(1, 'Bóxer', 1),
(1, 'Gran Danés', 1),
(1, 'Maltés', 1),
(1, 'Akita Inu', 1),
(1, 'Samoyedo', 1),
(1, 'Weimaraner', 1),
(1, 'Basset Hound', 1),
(1, 'Jack Russell Terrier', 1),
(1, 'Boston Terrier', 1),
(1, 'Setter Irlandés', 1),
(1, 'Pointer Inglés', 1),
(1, 'San Bernardo', 1),
-- Gatos (id_type = 2)
(2, 'Mestizo', 1),
(2, 'Gato doméstico de pelo corto', 1),
(2, 'Gato doméstico de pelo largo', 1),
(2, 'Siamés', 1),
(2, 'Persa', 1),
(2, 'Maine Coon', 1),
(2, 'Británico de Pelo Corto', 1),
(2, 'Ragdoll', 1),
(2, 'Bengalí', 1),
(2, 'Azul Ruso', 1),
(2, 'Sphynx', 1),
(2, 'Bosque de Noruega', 1),
(2, 'Scottish Fold', 1),
(2, 'Abisinio', 1),
(2, 'Angora Turco', 1),
(2, 'Birmano', 1),
(2, 'Bombay', 1),
(2, 'Exótico de Pelo Corto', 1),
(2, 'Himalayo', 1),
(2, 'Oriental de Pelo Corto', 1);

-- Sample pets (solo perros y gatos)
INSERT INTO pets (userid, s_petname, s_type, s_breed, s_description, s_color, s_age, s_gender, s_size, b_vaccinated, b_sterilized, b_active) VALUES
-- Carlos's pets
(1, 'Max', 'Perro', 'Golden Retriever', 'Muy juguetón y cariñoso, le encanta nadar en la alberca.', 'Dorado', '4 años', 'Macho', 'large', 1, 1, 1),
(1, 'Luna', 'Perro', 'Golden Retriever', 'Hermana de Max, más tranquila pero igual de amorosa.', 'Dorado', '4 años', 'Hembra', 'large', 1, 1, 1),
-- María's cats
(2, 'Michi', 'Gato', 'Mestizo', 'Gatito rescatado de la calle, muy agradecido y ronroneador.', 'Atigrado', '2 años', 'Macho', 'medium', 1, 1, 1),
(2, 'Pelusa', 'Gato', 'Persa', 'Gatita muy elegante, le gusta dormir en lugares altos.', 'Blanco', '3 años', 'Hembra', 'medium', 1, 1, 1),
(2, 'Sombra', 'Gato', 'Mestizo', 'Gato negro muy misterioso, sale solo de noche.', 'Negro', '5 años', 'Macho', 'medium', 1, 1, 1),
-- Juan's dog
(3, 'Rocky', 'Perro', 'Rottweiler', 'Perro guardián muy leal, protector de la familia.', 'Negro', '6 años', 'Macho', 'large', 1, 1, 1),
-- Ana's chihuahuas
(4, 'Chispita', 'Perro', 'Chihuahua', 'Pequeña pero con mucho carácter, ladradora profesional.', 'Café', '3 años', 'Hembra', 'small', 1, 1, 1),
(4, 'Canela', 'Perro', 'Chihuahua', 'La más tranquila de los tres, le gusta estar en brazos.', 'Café', '4 años', 'Hembra', 'small', 1, 0, 1),
(4, 'Taquito', 'Perro', 'Chihuahua', 'El rey de la casa, muy consentido y celoso.', 'Blanco', '2 años', 'Macho', 'small', 1, 1, 1),
-- Pedro's ranch dog
(5, 'Fiero', 'Perro', 'Mestizo', 'Perro de rancho, cuida las gallinas y es muy fiel.', 'Café', '7 años', 'Macho', 'large', 1, 0, 1),
-- Laura's German Shepherd
(6, 'Kaiser', 'Perro', 'Pastor Alemán', 'Campeón de exposiciones, muy inteligente y obediente.', 'Negro', '5 años', 'Macho', 'large', 1, 0, 1),
-- Roberto's Persian cats
(7, 'Princesa', 'Gato', 'Persa', 'Gata de pelo largo, necesita cepillado diario.', 'Gris', '4 años', 'Hembra', 'medium', 1, 1, 1),
(7, 'Duquesa', 'Gato', 'Persa', 'Hermana de Princesa, un poco más juguetona.', 'Blanco', '4 años', 'Hembra', 'medium', 1, 1, 1),
-- Sofía's rescued cats
(8, 'Piolín', 'Gato', 'Gato doméstico de pelo corto', 'Rescatado de cachorro, muy curioso y le encanta dormir al sol.', 'Crema', '2 años', 'Macho', 'medium', 1, 1, 1),
(8, 'Kiwi', 'Gato', 'Mestizo', 'Gatita inquieta y juguetona, siempre persigue juguetes por toda la casa.', 'Bicolor', '1 año', 'Hembra', 'medium', 1, 1, 1),
-- Miguel's Husky
(9, 'Nieve', 'Perro', 'Husky Siberiano', 'Husky con ojos azules, muy activa y le encanta correr.', 'Blanco', '3 años', 'Hembra', 'large', 1, 1, 1),
-- Fernanda's rescue dog
(10, 'Esperanza', 'Perro', 'Mestizo', 'Perrita rescatada del refugio, muy agradecida y cariñosa.', 'Beige', '4 años', 'Hembra', 'medium', 1, 1, 1),
-- Diego's French Bulldog
(11, 'Toño', 'Perro', 'Bulldog Francés', 'Bulldog muy dormilón y consentido, ronca mucho.', 'Atigrado', '2 años', 'Macho', 'small', 1, 1, 1),
-- Valentina's Siamese cats
(12, 'Ming', 'Gato', 'Siamés', 'Gato siamés muy vocal, siempre está maullando.', 'Beige', '3 años', 'Macho', 'medium', 1, 1, 1),
(12, 'Mei', 'Gato', 'Siamés', 'Gatita siamés elegante, ojos azules impresionantes.', 'Beige', '2 años', 'Hembra', 'medium', 1, 1, 1);

-- ============================================================================
-- END OF SETUP
-- ============================================================================
