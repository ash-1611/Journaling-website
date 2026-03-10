const Yoga = require('../models/Yoga');

exports.getAllYoga = async (req, res) => {
  try {
    const yoga = await Yoga.find({});
    res.json(yoga);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getYogaById = async (req, res) => {
  try {
    const yoga = await Yoga.findById(req.params.id);
    if (!yoga) return res.status(404).json({ message: 'Yoga not found' });
    res.json(yoga);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
