const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    mood: {
      type: String,
      default: null
    },
    stickers: {
      type: Array,
      default: []
    },
    backgroundTheme: {
      type: String,
      default: 'soft-lavender'
    }
  },
  {
    timestamps: true
  }
);

const Journal = mongoose.model("Journal", journalSchema);

module.exports = Journal;

