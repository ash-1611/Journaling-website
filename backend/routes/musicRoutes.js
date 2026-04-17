const express = require('express');
const { getAllMusic, getMusicByCategory } = require('../controllers/musicController');
const { streamSong } = require('../controllers/playlistController');
const router = express.Router();

router.get('/all',                  getAllMusic);
router.get('/category/:category',   getMusicByCategory);

// Song streaming shortcut: GET /api/music/songs/:id/stream
router.get('/songs/:id/stream',     streamSong);

module.exports = router;
