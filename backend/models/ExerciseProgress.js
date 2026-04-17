const mongoose = require('mongoose');

const exerciseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    progress:      { type: Number, default: 0, min: 0, max: 100 }, // percentage
    completed:     { type: Boolean, default: false },
    lastCompleted: { type: Date, default: null },
    streakCount:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One progress record per user+exercise
exerciseProgressSchema.index({ userId: 1, exerciseId: 1 }, { unique: true });

module.exports = mongoose.model('ExerciseProgress', exerciseProgressSchema);
