const mongoose = require('mongoose');

const YogaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  poseName: { type: String },
  description: { type: String },
  difficulty: { type: String },
  imageUrl: { type: String },
  videoUrl: { type: String },
  duration: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Yoga', YogaSchema);
