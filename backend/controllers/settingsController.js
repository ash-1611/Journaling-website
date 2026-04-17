const Settings = require('../models/Settings');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user._id });
    if (!settings) {
      // Auto-create default settings
      settings = await Settings.create({
        userId: req.user._id,
        theme: 'calmBlue',
        notifications: true,
        dailyReminders: true,
        moodCheckins: true,
        weeklyReports: false,
        reminderTime: '09:00',
      });
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const update = { ...req.body };
    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both fields required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const user = await User.findById(req.user._id);
    const match = await user.matchPassword(currentPassword);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
