const Exercise         = require('../models/Exercise');
const ExerciseProgress = require('../models/ExerciseProgress');
const Mood             = require('../models/Mood');

// ─── Mood → category mapping for recommendations ────────────────────────────
const MOOD_CATEGORY = {
  anxious: 'breathing',
  angry:   'breathing',
  tired:   'stretching',
  sad:     'morning',
  happy:   'morning',
  calm:    'stretching',
  excited: 'morning',
};

// ─── helpers ────────────────────────────────────────────────────────────────
const isSameDay = (a, b) => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth()    === db.getMonth()    &&
    da.getDate()     === db.getDate()
  );
};

const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date, yesterday);
};

// ═══════════════════════════════════════════════════════════════════════════
//  EXERCISE CRUD
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/exercise
exports.getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find().sort({ category: 1, createdAt: 1 });
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/exercise/category/:category
exports.getByCategory = async (req, res) => {
  try {
    const exercises = await Exercise.find({ category: req.params.category }).sort({ createdAt: 1 });
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/exercise/recommendation  (auth required)
exports.getRecommendation = async (req, res) => {
  try {
    // Find user's latest mood log
    const latestMood = await Mood.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    const category   = latestMood ? (MOOD_CATEGORY[latestMood.mood] || 'stretching') : 'stretching';

    const exercises = await Exercise.find({ category }).limit(3);
    res.json({ mood: latestMood?.mood || null, recommendedCategory: category, exercises });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/exercise/stats  (auth required)
exports.getStats = async (req, res) => {
  try {
    const allProgress = await ExerciseProgress.find({ userId: req.user._id }).populate('exerciseId');

    const totalExercisesCompleted = allProgress.filter(p => p.completed).length;
    const currentStreak           = allProgress.reduce((max, p) => Math.max(max, p.streakCount), 0);

    // Weekly progress: completions in last 7 days
    const oneWeekAgo     = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyProgress = allProgress.filter(
      p => p.completed && p.lastCompleted && new Date(p.lastCompleted) >= oneWeekAgo
    ).length;

    // Favourite category
    const categoryCounts = {};
    allProgress.forEach(p => {
      if (p.completed && p.exerciseId?.category) {
        const cat = p.exerciseId.category;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    });
    const favoriteCategory = Object.keys(categoryCounts).sort(
      (a, b) => categoryCounts[b] - categoryCounts[a]
    )[0] || null;

    res.json({ totalExercisesCompleted, weeklyProgress, currentStreak, favoriteCategory });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/exercise/:id
exports.getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
    res.json(exercise);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/exercise
exports.createExercise = async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json(exercise);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/exercise/:id
exports.updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
    res.json(exercise);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/exercise/:id
exports.deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
    await ExerciseProgress.deleteMany({ exerciseId: req.params.id });
    res.json({ message: 'Exercise deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
//  PROGRESS TRACKING
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/exercise-progress/start
exports.startExercise = async (req, res) => {
  try {
    const { exerciseId } = req.body;
    if (!exerciseId) return res.status(400).json({ message: 'exerciseId required' });

    const progress = await ExerciseProgress.findOneAndUpdate(
      { userId: req.user._id, exerciseId },
      { $setOnInsert: { userId: req.user._id, exerciseId, progress: 0, completed: false } },
      { upsert: true, new: true }
    );
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/exercise-progress/update
exports.updateProgress = async (req, res) => {
  try {
    const { exerciseId, progress } = req.body;
    if (!exerciseId || progress === undefined)
      return res.status(400).json({ message: 'exerciseId and progress required' });

    const pct = Math.min(100, Math.max(0, Number(progress)));
    const record = await ExerciseProgress.findOneAndUpdate(
      { userId: req.user._id, exerciseId },
      { progress: pct },
      { new: true, upsert: true }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/exercise-progress/complete
exports.completeExercise = async (req, res) => {
  try {
    const { exerciseId } = req.body;
    if (!exerciseId) return res.status(400).json({ message: 'exerciseId required' });

    const now      = new Date();
    let   existing = await ExerciseProgress.findOne({ userId: req.user._id, exerciseId });

    let streakCount = existing?.streakCount || 0;

    if (existing?.lastCompleted) {
      if (isSameDay(existing.lastCompleted, now)) {
        // Already completed today — don't double-count streak
      } else if (isYesterday(existing.lastCompleted)) {
        streakCount += 1; // consecutive day
      } else {
        streakCount = 1;  // streak broken — restart
      }
    } else {
      streakCount = 1;    // first ever completion
    }

    const record = await ExerciseProgress.findOneAndUpdate(
      { userId: req.user._id, exerciseId },
      { progress: 100, completed: true, lastCompleted: now, streakCount },
      { new: true, upsert: true }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/exercise-progress/user
exports.getUserProgress = async (req, res) => {
  try {
    const progress = await ExerciseProgress.find({ userId: req.user._id })
      .populate('exerciseId', 'title category duration difficulty');
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
