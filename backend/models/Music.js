const mongoose = require('mongoose');

const MusicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String },
  category: { type: String, enum: ['relax', 'meditation', 'sleep'], required: true },
  audioUrl: { type: String },
  thumbnail: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Music', MusicSchema);
