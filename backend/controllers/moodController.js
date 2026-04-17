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

// @desc    Get mood stats (weekly avg, most common, streak)
// @route   GET /api/mood/stats
// @access  Private
const getMoodStats = async (req, res) => {
  const MOOD_VALUE = { happy: 8, excited: 9, calm: 7, tired: 5, sad: 3, anxious: 4, angry: 2 };
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const all = await Mood.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const recent = all.filter(m => new Date(m.createdAt) >= sevenDaysAgo);

    // Weekly average
    const weeklyMoodAverage = recent.length
      ? (recent.reduce((sum, m) => sum + (MOOD_VALUE[m.mood] || 5), 0) / recent.length).toFixed(1)
      : null;

    // Most common mood (all time)
    const freq = {};
    all.forEach(m => { freq[m.mood] = (freq[m.mood] || 0) + 1; });
    const mostCommonMood = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0] || null;

    // Streak: consecutive days with at least one entry
    let streak = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i = 0; i < 365; i++) {
      const day = new Date(today); day.setDate(today.getDate() - i);
      const nextDay = new Date(day); nextDay.setDate(day.getDate() + 1);
      const hasEntry = all.some(m => {
        const d = new Date(m.createdAt);
        return d >= day && d < nextDay;
      });
      if (hasEntry) streak++;
      else if (i > 0) break; // allow today to be missing
    }

    return res.json({
      weeklyMoodAverage,
      mostCommonMood,
      totalEntries: all.length,
      weeklyEntries: recent.length,
      moodStreak: streak,
    });
  } catch (error) {
    console.error("Mood stats error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addMood,
  getMoodHistory,
  getMoodStats,
};
