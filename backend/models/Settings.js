const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  theme: { type: String },
  notifications: { type: Boolean, default: true },
  reminderTime: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Settings', SettingsSchema);
