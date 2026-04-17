const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['stretching', 'breathing', 'morning'],
    },
    description: { type: String, default: '' },
    duration:    { type: Number, default: 5 },       // minutes
    difficulty:  { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    videoUrl:    { type: String, default: '' },
    thumbnail:   { type: String, default: '' },
    steps:       { type: [String], default: [] },
    benefits:    { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exercise', exerciseSchema);
