const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.user._id });
    if (!settings) return res.status(404).json({ message: 'Settings not found' });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { theme, notifications, reminderTime } = req.body;
    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      { theme, notifications, reminderTime },
      { new: true }
    );
    if (!settings) return res.status(404).json({ message: 'Settings not found' });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
