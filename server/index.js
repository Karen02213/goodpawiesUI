// server/index.js - Enhanced Main Server File
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

// Import middleware and routes
const authRoutes = require('./auth');
const { verifyToken, optionalAuth, requireOwnership } = require('./middleware/auth');
const { 
  validatePetRegistration, 
  validateUserId, 
  validatePetId, 
  validatePagination,
  validateQRGeneration,
  sanitizeInput 
} = require('./middleware/validation');
const { apiRateLimiter } = require('./middleware/rateLimiting');
const { cleanupExpiredTokens } = require('./utils/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'goodpawiesuser',
  password: process.env.DB_PASSWORD || 'goodpawiespass',
  database: process.env.DB_NAME || 'goodpawiesdb'
};

// Create database connection pool
const db = mysql.createPool({
  ...dbConfig,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request sanitization
app.use(sanitizeInput);

// Rate limiting
app.use('/api', apiRateLimiter);

// Authentication routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT 1 as health');
    res.json({ 
      success: true, 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      success: false, 
      status: 'unhealthy', 
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

// Legacy endpoint for compatibility
app.get('/api/hello', (req, res) => {
  res.json({ 
    success: true,
    message: 'Hello from GoodPawies API!',
    version: '2.0.0'
  });
});

// User management endpoints

/**
 * GET /api/users/:userid
 * Get user profile information
 */
app.get('/api/users/:userid',
  optionalAuth,
  validateUserId,
  async (req, res) => {
    try {
      const { userid } = req.params;
      const requestingUserId = req.user ? req.user.id : null;
      
      // Determine what information to return based on privacy and ownership
      const isOwner = requestingUserId && parseInt(userid) === requestingUserId;
      
      let query, params;
      if (isOwner) {
        // Return full profile for owner
        query = `
          SELECT u.id, u.s_username, u.s_email, u.s_full_name, u.s_full_surname,
                 CONCAT(u.s_phone_prefix, u.s_phone_number) as phone,
                 u.email_verified, u.phone_verified, u.dt_created_at,
                 ui.s_description, ui.dt_updated_at as description_updated
          FROM users u
          LEFT JOIN user_info ui ON u.id = ui.userid AND ui.b_active = 1
          WHERE u.id = ? AND u.b_active = 1
        `;
        params = [userid];
      } else {
        // Return public profile for others
        query = `
          SELECT u.id, u.s_username, u.s_full_name, u.s_full_surname,
                 u.dt_created_at, ui.s_description
          FROM users u
          LEFT JOIN user_info ui ON u.id = ui.userid AND ui.b_active = 1
          WHERE u.id = ? AND u.b_active = 1
        `;
        params = [userid];
      }
      
      const [users] = await db.execute(query, params);
      
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }
      
      const user = users[0];
      
      // Get user's pets
      const [pets] = await db.execute(
        `SELECT id, s_petname, s_type, s_breed, s_description, dt_created_at
         FROM pets 
         WHERE userid = ? AND b_active = 1
         ORDER BY dt_created_at DESC`,
        [userid]
      );
      
      const responseData = {
        id: user.id,
        username: user.s_username,
        fullName: user.s_full_name,
        fullSurname: user.s_full_surname,
        description: user.s_description,
        createdAt: user.dt_created_at,
        pets: pets.map(pet => ({
          id: pet.id,
          name: pet.s_petname,
          type: pet.s_type,
          breed: pet.s_breed,
          description: pet.s_description,
          createdAt: pet.dt_created_at
        }))
      };
      
      // Add private information for owner
      if (isOwner) {
        responseData.email = user.s_email;
        responseData.phone = user.phone;
        responseData.emailVerified = user.email_verified;
        responseData.phoneVerified = user.phone_verified;
        responseData.descriptionUpdated = user.description_updated;
      }
      
      res.json({
        success: true,
        data: responseData
      });
      
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Failed to get user information'
      });
    }
  }
);

/**
 * PUT /api/users/:userid
 * Update user profile information
 */
app.put('/api/users/:userid',
  verifyToken,
  validateUserId,
  requireOwnership('userid'),
  async (req, res) => {
    let connection;
    try {
      const { userid } = req.params;
      const { fullName, fullSurname, description } = req.body;
      
      connection = await mysql.createConnection(dbConfig);
      await connection.beginTransaction();
      
      // Update user basic information
      if (fullName || fullSurname) {
        await connection.execute(
          'UPDATE users SET s_full_name = COALESCE(?, s_full_name), s_full_surname = COALESCE(?, s_full_surname) WHERE id = ?',
          [fullName, fullSurname, userid]
        );
      }
      
      // Update user description
      if (description !== undefined) {
        const [existingInfo] = await connection.execute(
          'SELECT id FROM user_info WHERE userid = ? AND b_active = 1',
          [userid]
        );
        
        if (existingInfo.length > 0) {
          await connection.execute(
            'UPDATE user_info SET s_description = ? WHERE userid = ? AND b_active = 1',
            [description, userid]
          );
        } else {
          await connection.execute(
            'INSERT INTO user_info (userid, s_description, b_active) VALUES (?, ?, 1)',
            [userid, description]
          );
        }
      }
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
      
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'Failed to update profile'
      });
    } finally {
      if (connection) await connection.end();
    }
  }
);

// Pet management endpoints

/**
 * GET /api/users/:userid/pets
 * Get user's pets
 */
app.get('/api/users/:userid/pets',
  optionalAuth,
  validateUserId,
  validatePagination,
  async (req, res) => {
    try {
      const { userid } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      // Check if user exists
      const [users] = await db.execute(
        'SELECT id FROM users WHERE id = ? AND b_active = 1',
        [userid]
      );
      
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }
      
      // Get pets with pagination
      const [pets] = await db.execute(
        `SELECT p.id, p.s_petname, p.s_type, p.s_breed, p.s_description, p.dt_created_at,
                COUNT(pi.id) as image_count
         FROM pets p
         LEFT JOIN pets_images pi ON p.id = pi.petid AND pi.b_active = 1
         WHERE p.userid = ? AND p.b_active = 1
         GROUP BY p.id
         ORDER BY p.dt_created_at DESC
         LIMIT ? OFFSET ?`,
        [userid, limit, offset]
      );
      
      // Get total count
      const [countResult] = await db.execute(
        'SELECT COUNT(*) as total FROM pets WHERE userid = ? AND b_active = 1',
        [userid]
      );
      
      const totalPets = countResult[0].total;
      const totalPages = Math.ceil(totalPets / limit);
      
      res.json({
        success: true,
        data: {
          pets: pets.map(pet => ({
            id: pet.id,
            name: pet.s_petname,
            type: pet.s_type,
            breed: pet.s_breed,
            description: pet.s_description,
            imageCount: pet.image_count,
            createdAt: pet.dt_created_at
          })),
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalPets,
            itemsPerPage: limit,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
      
    } catch (error) {
      console.error('Get pets error:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Failed to get pets'
      });
    }
  }
);

/**
 * POST /api/users/:userid/pets
 * Create a new pet
 */
app.post('/api/users/:userid/pets',
  verifyToken,
  validateUserId,
  requireOwnership('userid'),
  validatePetRegistration,
  async (req, res) => {
    let connection;
    try {
      const { userid } = req.params;
      const { petname, type, breed, description } = req.body;
      
      connection = await mysql.createConnection(dbConfig);
      
      // Insert new pet
      const [result] = await connection.execute(
        'INSERT INTO pets (userid, s_petname, s_type, s_breed, s_description, b_active) VALUES (?, ?, ?, ?, ?, 1)',
        [userid, petname, type, breed, description]
      );
      
      const petId = result.insertId;
      
      res.status(201).json({
        success: true,
        message: 'Pet registered successfully',
        data: {
          petId,
          name: petname,
          type,
          breed,
          description
        }
      });
      
    } catch (error) {
      console.error('Create pet error:', error);
      res.status(500).json({
        success: false,
        error: 'PET_CREATION_FAILED',
        message: 'Failed to register pet'
      });
    } finally {
      if (connection) await connection.end();
    }
  }
);

/**
 * GET /api/pets/:petid
 * Get specific pet information
 */
app.get('/api/pets/:petid',
  optionalAuth,
  validatePetId,
  async (req, res) => {
    try {
      const { petid } = req.params;
      
      const [pets] = await db.execute(
        `SELECT p.id, p.userid, p.s_petname, p.s_type, p.s_breed, p.s_description, 
                p.dt_created_at, u.s_username, u.s_full_name, u.s_full_surname
         FROM pets p
         JOIN users u ON p.userid = u.id
         WHERE p.id = ? AND p.b_active = 1 AND u.b_active = 1`,
        [petid]
      );
      
      if (pets.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'PET_NOT_FOUND',
          message: 'Pet not found'
        });
      }
      
      const pet = pets[0];
      
      // Get pet images
      const [images] = await db.execute(
        'SELECT image_id FROM pets_images WHERE petid = ? AND b_active = 1 ORDER BY dt_created_at DESC',
        [petid]
      );
      
      res.json({
        success: true,
        data: {
          id: pet.id,
          name: pet.s_petname,
          type: pet.s_type,
          breed: pet.s_breed,
          description: pet.s_description,
          createdAt: pet.dt_created_at,
          owner: {
            id: pet.userid,
            username: pet.s_username,
            fullName: pet.s_full_name,
            fullSurname: pet.s_full_surname
          },
          images: images.map(img => img.image_id)
        }
      });
      
    } catch (error) {
      console.error('Get pet error:', error);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Failed to get pet information'
      });
    }
  }
);

/**
 * PUT /api/pets/:petid
 * Update pet information
 */
app.put('/api/pets/:petid',
  verifyToken,
  validatePetId,
  async (req, res) => {
    let connection;
    try {
      const { petid } = req.params;
      const { petname, type, breed, description } = req.body;
      
      connection = await mysql.createConnection(dbConfig);
      
      // Check if pet exists and user owns it
      const [pets] = await connection.execute(
        'SELECT userid FROM pets WHERE id = ? AND b_active = 1',
        [petid]
      );
      
      if (pets.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'PET_NOT_FOUND',
          message: 'Pet not found'
        });
      }
      
      // Check ownership
      if (pets[0].userid !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'You can only update your own pets'
        });
      }
      
      // Update pet information
      await connection.execute(
        `UPDATE pets 
         SET s_petname = COALESCE(?, s_petname),
             s_type = COALESCE(?, s_type),
             s_breed = COALESCE(?, s_breed),
             s_description = COALESCE(?, s_description)
         WHERE id = ?`,
        [petname, type, breed, description, petid]
      );
      
      res.json({
        success: true,
        message: 'Pet updated successfully'
      });
      
    } catch (error) {
      console.error('Update pet error:', error);
      res.status(500).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: 'Failed to update pet'
      });
    } finally {
      if (connection) await connection.end();
    }
  }
);

/**
 * DELETE /api/pets/:petid
 * Delete a pet (soft delete)
 */
app.delete('/api/pets/:petid',
  verifyToken,
  validatePetId,
  async (req, res) => {
    let connection;
    try {
      const { petid } = req.params;
      
      connection = await mysql.createConnection(dbConfig);
      
      // Check if pet exists and user owns it
      const [pets] = await connection.execute(
        'SELECT userid FROM pets WHERE id = ? AND b_active = 1',
        [petid]
      );
      
      if (pets.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'PET_NOT_FOUND',
          message: 'Pet not found'
        });
      }
      
      // Check ownership
      if (pets[0].userid !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'You can only delete your own pets'
        });
      }
      
      // Soft delete pet and related images
      await connection.execute('UPDATE pets SET b_active = 0 WHERE id = ?', [petid]);
      await connection.execute('UPDATE pets_images SET b_active = 0 WHERE petid = ?', [petid]);
      
      res.json({
        success: true,
        message: 'Pet deleted successfully'
      });
      
    } catch (error) {
      console.error('Delete pet error:', error);
      res.status(500).json({
        success: false,
        error: 'DELETE_FAILED',
        message: 'Failed to delete pet'
      });
    } finally {
      if (connection) await connection.end();
    }
  }
);

// QR Code generation endpoints
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * POST /api/qr/generate
 * Generate QR code for pet profile
 */
app.post('/api/qr/generate',
  verifyToken,
  validateQRGeneration,
  async (req, res) => {
    try {
      const { url, id, name } = req.body;
      
      // Verify user owns the pet/resource
      const [pets] = await db.execute(
        'SELECT userid FROM pets WHERE id = ? AND b_active = 1',
        [id]
      );
      
      if (pets.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'RESOURCE_NOT_FOUND',
          message: 'Resource not found'
        });
      }
      
      if (pets[0].userid !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'You can only generate QR codes for your own resources'
        });
      }
      
      const qrData = `${url}?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;
      const filename = `qr_${Date.now()}_${Math.floor(Math.random() * 10000)}.png`;
      const filepath = path.join(tempDir, filename);
      
      await QRCode.toFile(filepath, qrData, {
        errorCorrectionLevel: 'M',
        type: 'png',
        quality: 0.92,
        margin: 1,
        width: 256
      });
      
      res.json({
        success: true,
        data: {
          filename,
          url: `/api/qr/image/${filename}`,
          qrData
        }
      });
      
    } catch (error) {
      console.error('QR generation error:', error);
      res.status(500).json({
        success: false,
        error: 'QR_GENERATION_FAILED',
        message: 'Failed to generate QR code'
      });
    }
  }
);

/**
 * GET /api/qr/image/:filename
 * Serve QR code image
 */
app.get('/api/qr/image/:filename', (req, res) => {
  const { filename } = req.params;
  
  // Validate filename to prevent path traversal
  if (!/^qr_\d+_\d+\.png$/.test(filename)) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_FILENAME',
      message: 'Invalid filename format'
    });
  }
  
  const filepath = path.join(tempDir, filename);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({
      success: false,
      error: 'IMAGE_NOT_FOUND',
      message: 'QR code image not found'
    });
  }
  
  res.sendFile(filepath);
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'INVALID_JSON',
      message: 'Invalid JSON in request body'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'Endpoint not found'
  });
});

// Cleanup expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await db.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await db.end();
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 GoodPawies API Server running on http://0.0.0.0:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security: Enhanced authentication enabled`);
});
