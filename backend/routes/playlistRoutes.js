const express = require('express');
const {
  getAllPlaylists,
  getPlaylistsByCategory,
  getPlaylistById,
  streamSong,
} = require('../controllers/playlistController');

const router = express.Router();

// Specific named routes FIRST — must be registered before /:id wildcard
router.get('/',                        getAllPlaylists);         // GET /api/playlists
router.get('/category/:category',      getPlaylistsByCategory); // GET /api/playlists/category/Focus
router.get('/songs/:id/stream',        streamSong);             // GET /api/playlists/songs/:id/stream

// Wildcard route last
router.get('/:id',                     getPlaylistById);        // GET /api/playlists/:id

module.exports = router;
