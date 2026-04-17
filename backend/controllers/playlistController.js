const fs   = require('fs');
const path = require('path');
const Playlist = require('../models/Playlist');

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Resolve the absolute path for an audio file.
 * audioUrl is stored as "/music/focus.mp3" (relative to backend/public).
 */
const resolveAudioPath = (audioUrl) =>
  path.join(__dirname, '..', 'public', audioUrl);

// ── GET /api/playlists ─────────────────────────────────────────────────────────
exports.getAllPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({}, '-songs'); // omit songs array for card listing
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /api/playlists/category/:category ──────────────────────────────────────
exports.getPlaylistsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const playlists = await Playlist.find(
      { category: new RegExp(`^${category}$`, 'i') },
      '-songs'
    );
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /api/playlists/:id ─────────────────────────────────────────────────────
exports.getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ── GET /api/songs/:id/stream ──────────────────────────────────────────────────
// Supports HTTP Range requests so <audio> seeking works correctly.
exports.streamSong = async (req, res) => {
  try {
    // Find the playlist that contains this song
    const playlist = await Playlist.findOne(
      { 'songs._id': req.params.id },
      { 'songs.$': 1 }
    );

    if (!playlist || !playlist.songs.length) {
      return res.status(404).json({ message: 'Song not found' });
    }

    const song     = playlist.songs[0];
    const filePath = resolveAudioPath(song.audioUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Audio file not found on server' });
    }

    const stat     = fs.statSync(filePath);
    const fileSize = stat.size;
    const range    = req.headers.range;

    // Determine MIME type from extension
    const ext  = path.extname(filePath).toLowerCase();
    const mime = ext === '.ogg' ? 'audio/ogg'
               : ext === '.wav' ? 'audio/wav'
               : ext === '.webm' ? 'audio/webm'
               : 'audio/mpeg'; // default mp3

    if (range) {
      // Partial content – browser is seeking
      const parts      = range.replace(/bytes=/, '').split('-');
      const start      = parseInt(parts[0], 10);
      const end        = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize  = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range':  `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges':  'bytes',
        'Content-Length': chunkSize,
        'Content-Type':   mime,
      });
      fileStream.pipe(res);
    } else {
      // Full file
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type':   mime,
        'Accept-Ranges':  'bytes',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    res.status(500).json({ message: 'Streaming error', error: err.message });
  }
};
