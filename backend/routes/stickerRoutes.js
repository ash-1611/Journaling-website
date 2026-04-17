const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/stickers'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('sticker'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const fullUrl = `${req.protocol}://${req.get('host')}/uploads/stickers/${req.file.filename}`;
  res.json({ url: fullUrl });
});

// List uploaded stickers
router.get('/list', (req, res) => {
  const dir = path.join(__dirname, '../uploads/stickers');
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).json({ message: 'Failed to read stickers directory' });
    const urls = files
      .filter(f => !f.startsWith('.'))
      .map(f => ({ id: `/uploads/stickers/${f}`, src: `${req.protocol}://${req.get('host')}/uploads/stickers/${f}` }));
    res.json(urls);
  });
});

module.exports = router;
