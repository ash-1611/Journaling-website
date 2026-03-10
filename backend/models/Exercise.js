const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number },
  difficulty: { type: String },
  videoUrl: { type: String },
  category: { type: String, enum: ['stretching', 'breathing', 'cardio'] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Exercise', ExerciseSchema);
