const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    mood: {
      type: String,
      enum: ["happy", "sad", "anxious", "calm", "angry", "tired", "excited"],
      required: true
    },
    note: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

const Mood = mongoose.model("Mood", moodSchema);

module.exports = Mood;
