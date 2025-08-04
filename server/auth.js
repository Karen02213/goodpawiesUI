// server/auth.js
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

const SECRET_KEY = 'your-very-secure-key'; // Use env var in production

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  const [ivHex, encrypted] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(SECRET_KEY), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// JWT-like token structure
const jwt = require('jsonwebtoken');
const jwtSecret = 'your-jwt-secret'; // Use env var in production
const jwtExpiry = '1h'; // Token expiry time
const jwtSign = (payload) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });
};

const dbConfig = {
  host: 'localhost',
  user: 'goodpawiesuser',
  password: 'goodpawiespass',
  database: 'goodpawiesdb'
};

// POST /api/login/uid=:userid
router.post('/login/uid=:userid', async (req, res) => {
  try {
    const { userid } = req.params;
    const encryptedData = req.body.data;
    const decriptedId = decrypt(userid);
    if (decriptedId !== userid) {
      return res.status(401).json({ error: 'Invalid user ID' });
    }
    if (!encryptedData) {
      return res.status(400).json({ error: 'Missing encrypted data' });
    }
    const decrypted = JSON.parse(decrypt(encryptedData));
    if (!decrypted || !decrypted.username || !decrypted.email || !decrypted.phone || !decrypted.password) {
      return res.status(400).json({ error: 'Invalid data' });
    }
    // Validate decrypted data
    if (!decrypted.username || !decrypted.email || !decrypted.phone || !decrypted.password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const {username, email, phone, password} = decrypted;

    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.query('CALL sp_validate_user(? , ?, ?, ?, ?)', [userid ,username, email, phone, password]);
    await conn.end();
    if (rows[0].length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (rows[0].length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    // Create token (simple example, use JWT in production)
    const token = encrypt(JSON.stringify({ username, time: Date.now() }));
    res.cookie('auth_token', token, { httpOnly: true, secure: true });
    // Return encrypted uid, token,
    res.json({ token: encrypt(token) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/logout
router.post('/logout', (req, res) => {
  try {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
// POST /api/validate_auth
router.post('/validate_auth', (req, res) => {
  try {
    const encryptedCookie = req.body.token;
    const token = decrypt(encryptedCookie);
    // Optionally, validate token structure, expiration, etc.
    res.json({ valid: true });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;