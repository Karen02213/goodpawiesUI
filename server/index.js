// server/index.js
const mysql = require('mysql2');

const db = mysql.createPool({
  host: 'localhost',
  user: 'goodpawiesuser',
  password: 'goodpawiespass',
  database: 'goodpawiesdb'
});
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Express!' });
});
app.get('/api/db-test', (req, res) => {
  db.query('SELECT NOW() AS now', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

// Ensure temp folder exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// POST: generate QR image and save to temp folder
app.post('/api/generate-qr-image', async (req, res) => {
  const url = req.query.url || req.body.url;
  const id = req.query.id || req.body.id;
  const name = req.query.name || req.body.name;
  if (!url || !id || !name) {
    return res.status(400).send('Missing url, id, or name');
  }
  const qrData = `${url}?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;
  const filename = `qr_${Date.now()}_${Math.floor(Math.random()*10000)}.png`;
  const filepath = path.join(tempDir, filename);
  try {
    await QRCode.toFile(filepath, qrData);
    res.json({ filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: serve QR image by filename
app.get('/api/generate-qr-image/:filename', (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(tempDir, filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).send('Image not found');
  }
  res.sendFile(filepath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
