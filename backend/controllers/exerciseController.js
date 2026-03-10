const Exercise = require('../models/Exercise');

exports.getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find({});
    res.json(exercises);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });
    res.json(exercise);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
