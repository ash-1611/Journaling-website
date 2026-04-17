const mongoose = require('mongoose');

// ── Song sub-document ──────────────────────────────────────────────────────────
const SongSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true },
    artist:     { type: String, required: true },
    audioUrl:   { type: String, required: true }, // relative path served by Express
    duration:   { type: String, default: '3:00' },
    coverImage: { type: String, default: '' },
  },
  { _id: true }
);

// ── Playlist document ──────────────────────────────────────────────────────────
const PlaylistSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['Focus', 'Relax', 'Sleep', 'Anxiety Relief', 'Energy', 'Meditation'],
    },
    description:    { type: String, default: '' },
    coverGradient:  { type: String, default: 'linear-gradient(135deg,#6C63FF,#48C9B0)' },
    emoji:          { type: String, default: '🎵' },
    numberOfTracks: { type: Number, default: 0 },
    duration:       { type: String, default: '30 min' },
    moodTag:        { type: String, default: '' },
    songs:          [SongSchema],
  },
  { timestamps: true }
);

// Keep numberOfTracks in sync automatically on save AND insertMany
PlaylistSchema.pre('save', function (next) {
  this.numberOfTracks = this.songs.length;
  next();
});

// insertMany does NOT trigger pre('save'), so we use pre('insertMany') hook
PlaylistSchema.pre('insertMany', function (next, docs) {
  docs.forEach(d => { d.numberOfTracks = (d.songs || []).length; });
  next();
});

module.exports = mongoose.model('Playlist', PlaylistSchema);
