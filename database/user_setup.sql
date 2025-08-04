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
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    s_username VARCHAR(30) NOT NULL UNIQUE,
    s_password_hash VARCHAR(300) NOT NULL,
    s_phone_prefix VARCHAR(5) NOT NULL,
    s_phone_number VARCHAR(10) NOT NULL,
    s_email VARCHAR(50),
    s_full_name VARCHAR(30),
    s_full_surname VARCHAR(30),
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT
);

CREATE TABLE user_info (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    s_description VARCHAR(200) NOT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE user_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    image_id VARCHAR(500),
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Pets tables
CREATE TABLE pets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    s_petname VARCHAR(30) NOT NULL,
    s_type VARCHAR(30) NOT NULL,    -- Dog, Cat, etc...
    s_breed VARCHAR(30) NOT NULL,   -- German Shepherd,Border Collie, etc...
    s_description VARCHAR(200) NOT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE pets_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    petid INT NOT NULL,
    image_id VARCHAR(500),
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT,
    FOREIGN KEY (petid) REFERENCES pets(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- pet races and types

CREATE TABLE pets_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    s_type VARCHAR(30) NOT NULL,    -- Dog, Cat, etc...
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT
);

CREATE TABLE pets_breed (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_type INT NOT NULL,            -- ID for Dogs, ID for Cats
    s_breed VARCHAR(30) NOT NULL,    -- German Shepherd,Border Collie, etc...
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT,
    FOREIGN KEY (id_type) REFERENCES pets_types(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(s_username);INSERT INTO pets (userid, s_petname, s_type, s_breed, s_description, b_active)
VALUES
(1, 'Buddy', 'Dog', 'Golden Retriever', 'Golden Retriever, very friendly.', 1),
(1, 'Mittens', 'Cat', 'Tabby', 'Tabby cat, loves naps.', 1),
(2, 'Rex', 'Dog', 'German Shepherd', 'German Shepherd, trained in agility.', 1),
(3, 'Luna', 'Dog', 'Border Collie', 'Border Collie, loves to play fetch.', 1);
CREATE INDEX idx_pets_userid ON pets(userid);
CREATE INDEX idx_pets_images_petid ON pets_images(petid);
CREATE INDEX idx_user_images_userid ON user_images(userid);

-- Sample data for users
INSERT INTO users (s_username, s_password_hash, s_email, s_phone_prefix, s_phone_number, s_full_name, s_full_surname, s_description, b_active)
VALUES
('alice', '$2b$10$abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef', 'alice@example.com', '+1', '5551234', 'Alice', 'Smith', 'Loves animals and hiking.', 1),
('bob', '$2b$10$abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef', 'bob@example.com', '+44', '7778888', 'Bob', 'Brown', 'Pet enthusiast and photographer.', 1),
('carol', '$2b$10$abcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef', 'carol@example.com', '+49', '1234567', 'Carol', 'White', 'Dog lover and runner.', 1);

-- Sample data for user_info
INSERT INTO user_info (userid, s_description, b_active)
VALUES
(1, 'Alice is a passionate animal lover.', 1),
(2, 'Bob enjoys taking photos of pets.', 1),
(3, 'Carol runs with her dog every morning.', 1);

-- Sample data for pets_types
INSERT INTO pets_types (s_type, b_active) VALUES
('Dog', 1),
('Cat', 1),
('Bird', 1),
('Rabbit', 1),
('Fish', 1),
('Hamster', 1);

-- Sample data for pets_breed
INSERT INTO pets_breed (id_type, s_breed, b_active) VALUES
(1, 'Golden Retriever', 1),
(1, 'German Shepherd', 1),
(1, 'Border Collie', 1),
(1, 'Bulldog', 1),
(2, 'Tabby', 1),
(2, 'Siamese', 1),
(2, 'Persian', 1),
(3, 'Parakeet', 1),
(3, 'Canary', 1),
(4, 'Dutch', 1),
(4, 'Mini Lop', 1),
(5, 'Goldfish', 1),
(5, 'Betta', 1),
(6, 'Syrian', 1),
(6, 'Dwarf', 1);

-- Update pets insert to use s_type and s_breed
INSERT INTO pets (userid, s_petname, s_type, s_breed, s_description, b_active)
VALUES
(1, 'Buddy', 'Dog', 'Golden Retriever', 'Golden Retriever, very friendly.', 1),
(1, 'Mittens', 'Cat', 'Tabby', 'Tabby cat, loves naps.', 1),
(2, 'Rex', 'Dog', 'German Shepherd', 'German Shepherd, trained in agility.', 1),
(3, 'Luna', 'Dog', 'Border Collie', 'Border Collie, loves to play fetch.', 1);
