// backend/models/AIInsight.js
const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    journalText: {
      type: String,
      required: true,
    },
    journalEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Journal',
      default: null,
    },
    detectedMood: {
      type: String,
      enum: ['happy', 'calm', 'anxious', 'sad', 'stressed', 'motivated', 'tired', 'neutral'],
      default: 'neutral',
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },
    explanation: {
      type: String,
      default: '',
    },
    suggestions: {
      type: [String],
      default: [],
    },
    affirmations: {
      type: [String],
      default: [],
    },
    recommendedPlaylist: {
      type: String,
      default: '',
    },
    moodPrediction: {
      predictedMood: { type: String, default: '' },
      confidence: { type: Number, default: 0 },
      recommendation: { type: String, default: '' },
    },
    dailySummary: {
      summary: { type: String, default: '' },
      positiveHighlights: { type: [String], default: [] },
      tomorrowActivity: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIInsight', aiInsightSchema);
