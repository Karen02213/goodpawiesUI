// server/routes/qr.js
// QR code generation routes - extracted to reduce main file redundancy
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { verifyToken } = require('../middleware/auth');
const { validateQRGeneration } = require('../middleware/validation');
const { asyncHandler, auditAction, validateOwnership } = require('../utils/errors');
const { success, errors, send } = require('../utils/response');
const petQueries = require('../db/petQueries');

// Ensure temp directory exists
const tempDir = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

/**
 * POST /qr/generate - Generate QR code for pet profile
 */
router.post('/generate',
  verifyToken,
  validateQRGeneration,
  validateOwnership(
    async (req) => {
      const ownership = await petQueries.getPetOwnership(req.body.id);
      return ownership?.userid;
    },
    'resource'
  ),
  auditAction('QR_GENERATION'),
  asyncHandler(async (req, res) => {
    const { url, id, name } = req.body;
    
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
    
    send(res, success({
      filename,
      url: `/api/qr/image/${filename}`,
      qrData
    }));
  })
);

/**
 * GET /qr/image/:filename - Serve QR code image
 */
router.get('/image/:filename', (req, res) => {
  const { filename } = req.params;
  
  // Validate filename to prevent path traversal
  if (!/^qr_\d+_\d+\.png$/.test(filename)) {
    return send(res, errors.VALIDATION_ERROR([{
      field: 'filename',
      message: 'Invalid filename format',
      value: filename
    }]));
  }
  
  const filepath = path.join(tempDir, filename);
  
  if (!fs.existsSync(filepath)) {
    return send(res, errors.NOT_FOUND('QR code image'));
  }
  
  res.sendFile(filepath);
});

module.exports = router;
