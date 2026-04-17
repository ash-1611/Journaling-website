const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  theme:          { type: String, default: 'calmBlue' },
  notifications:  { type: Boolean, default: true },
  dailyReminders: { type: Boolean, default: true },
  moodCheckins:   { type: Boolean, default: true },
  weeklyReports:  { type: Boolean, default: false },
  reminderTime:   { type: String, default: '09:00' },
  createdAt:      { type: Date, default: Date.now },
});

module.exports = mongoose.model('Settings', SettingsSchema);
