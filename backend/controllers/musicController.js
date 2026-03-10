const Music = require('../models/Music');

exports.getAllMusic = async (req, res) => {
  try {
    const music = await Music.find({});
    res.json(music);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMusicByCategory = async (req, res) => {
  try {
    const music = await Music.find({ category: req.params.category });
    res.json(music);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
