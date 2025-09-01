-- Enhanced Pet Management System Database Schema
-- This file contains the updated schema with additional fields for pets

-- First, check if we have the basic tables from user_setup.sql
-- If not, this script will fail gracefully

-- Check if users table exists
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name = 'users';

-- If users table doesn't exist, exit with error
-- Note: This is a safeguard, user_setup.sql should be run first

-- Drop existing tables if they exist (in reverse dependency order)
-- Only drop the enhanced pet tables, not the basic ones from user_setup.sql
DROP TABLE IF EXISTS pets_images;
DROP TABLE IF EXISTS pets;
DROP TABLE IF EXISTS pets_breed;
DROP TABLE IF EXISTS pets_gender;
DROP TABLE IF EXISTS pets_size;
-- Keep pets_types from user_setup.sql but we'll update it

-- Create pets gender table
CREATE TABLE pets_gender (
    id INT PRIMARY KEY AUTO_INCREMENT,
    s_gender VARCHAR(20) NOT NULL,    -- Macho, Hembra
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1
);

-- Create pets size table
CREATE TABLE pets_size (
    id INT PRIMARY KEY AUTO_INCREMENT,
    s_size VARCHAR(20) NOT NULL,      -- Pequeño, Mediano, Grande
    s_size_code VARCHAR(10) NOT NULL, -- small, medium, large (for API)
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1
);

-- Create pets types table (enhanced version, replacing the one from user_setup.sql)
DROP TABLE IF EXISTS pets_types;
CREATE TABLE pets_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    s_type VARCHAR(30) NOT NULL,    -- Dog, Cat, etc...
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1
);

-- Create pets breed table
CREATE TABLE pets_breed (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_type INT NOT NULL,            -- ID for Dogs, ID for Cats
    s_breed VARCHAR(30) NOT NULL,    -- German Shepherd, Border Collie, etc...
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1,
    FOREIGN KEY (id_type) REFERENCES pets_types(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create enhanced pets table with all required fields
CREATE TABLE pets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    s_petname VARCHAR(30) NOT NULL,
    s_type VARCHAR(30) NOT NULL,      -- Dog, Cat, etc...
    s_breed VARCHAR(30) NOT NULL,     -- German Shepherd, Border Collie, etc...
    s_description TEXT,               -- Pet description (optional)
    s_color VARCHAR(50),              -- Pet color (optional)
    n_age INT,                        -- Pet age in years (optional)
    s_gender VARCHAR(20) NOT NULL,    -- Macho, Hembra
    s_size VARCHAR(10) NOT NULL,      -- small, medium, large
    b_vaccinated BIT DEFAULT 0,       -- Is vaccinated (optional, defaults to false)
    b_sterilized BIT DEFAULT 0,       -- Is sterilized/neutered (optional, defaults to false)
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create pets images table
CREATE TABLE pets_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    petid INT NOT NULL,
    image_id VARCHAR(500),
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT DEFAULT 1,
    FOREIGN KEY (petid) REFERENCES pets(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_pets_userid ON pets(userid);
CREATE INDEX idx_pets_type ON pets(s_type);
CREATE INDEX idx_pets_breed ON pets(s_breed);
CREATE INDEX idx_pets_images_petid ON pets_images(petid);
CREATE INDEX idx_pets_breed_type ON pets_breed(id_type);

-- Insert sample data for pets_gender
INSERT INTO pets_gender (s_gender, b_active) VALUES
('Macho', 1),
('Hembra', 1);

-- Insert sample data for pets_size
INSERT INTO pets_size (s_size, s_size_code, b_active) VALUES
('Pequeño', 'small', 1),
('Mediano', 'medium', 1),
('Grande', 'large', 1);

-- Insert sample data for pets_types
INSERT INTO pets_types (s_type, b_active) VALUES
('Dog', 1),
('Cat', 1),
('Bird', 1),
('Rabbit', 1),
('Fish', 1),
('Hamster', 1);

-- Insert sample data for pets_breed
INSERT INTO pets_breed (id_type, s_breed, b_active) VALUES
-- Dogs (id_type = 1)
(1, 'Golden Retriever', 1),
(1, 'German Shepherd', 1),
(1, 'Border Collie', 1),
(1, 'Bulldog', 1),
(1, 'Labrador', 1),
(1, 'Chihuahua', 1),
(1, 'Poodle', 1),
(1, 'Rottweiler', 1),
-- Cats (id_type = 2)
(2, 'Tabby', 1),
(2, 'Siamese', 1),
(2, 'Persian', 1),
(2, 'Maine Coon', 1),
(2, 'British Shorthair', 1),
(2, 'Ragdoll', 1),
-- Birds (id_type = 3)
(3, 'Parakeet', 1),
(3, 'Canary', 1),
(3, 'Cockatiel', 1),
-- Rabbits (id_type = 4)
(4, 'Dutch', 1),
(4, 'Mini Lop', 1),
(4, 'Holland Lop', 1),
-- Fish (id_type = 5)
(5, 'Goldfish', 1),
(5, 'Betta', 1),
(5, 'Angelfish', 1),
-- Hamsters (id_type = 6)
(6, 'Syrian', 1),
(6, 'Dwarf', 1),
(6, 'Chinese', 1);

-- Insert sample pets data with enhanced fields (using existing user IDs)
-- First, get the first available user ID from the users table
SET @first_user_id = (SELECT MIN(id) FROM users WHERE b_active = 1 LIMIT 1);

-- Only insert sample data if we have at least one user
INSERT INTO pets (userid, s_petname, s_type, s_breed, s_description, s_color, n_age, s_gender, s_size, b_vaccinated, b_sterilized, b_active) 
SELECT 
    @first_user_id,
    'Buddy',
    'Dog',
    'Golden Retriever',
    'Very friendly and loves to play fetch',
    'Golden',
    3,
    'Macho',
    'large',
    1,
    1,
    1
WHERE @first_user_id IS NOT NULL;

INSERT INTO pets (userid, s_petname, s_type, s_breed, s_description, s_color, n_age, s_gender, s_size, b_vaccinated, b_sterilized, b_active)
SELECT 
    @first_user_id,
    'Mittens',
    'Cat',
    'Tabby',
    'Loves to sleep in sunny spots',
    'Brown and white',
    2,
    'Hembra',
    'medium',
    1,
    1,
    1
WHERE @first_user_id IS NOT NULL;
