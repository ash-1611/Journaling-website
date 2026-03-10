const Mood = require("../models/Mood");
const ALLOWED_MOODS = new Set([
  "happy",
  "sad",
  "anxious",
  "calm",
  "angry",
  "tired",
  "excited"
]);

// @desc    Add a mood entry
// @route   POST /api/mood/add
// @access  Private
const addMood = async (req, res) => {
  const mood = (req.body.mood || "").trim().toLowerCase();
  const note = typeof req.body.note === "string" ? req.body.note.trim() : "";

  if (!mood) {
    return res.status(400).json({ message: "Mood is required" });
  }

  if (!ALLOWED_MOODS.has(mood)) {
    return res.status(400).json({ message: "Invalid mood value" });
  }

  try {
    const moodEntry = await Mood.create({
      userId: req.user._id,
      mood,
      note
    });

    return res.status(201).json(moodEntry);
  } catch (error) {
    console.error("Add mood error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get logged-in user's mood history
// @route   GET /api/mood/user
// @access  Private
const getMoodHistory = async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user._id }).sort({
      createdAt: -1
    });
    return res.json(moods);
  } catch (error) {
    console.error("Get mood history error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addMood,
  getMoodHistory
};
