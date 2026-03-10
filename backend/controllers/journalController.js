const Journal = require("../models/Journal");
const mongoose = require("mongoose");

// @desc    Create a new journal entry
// @route   POST /api/journal/create
// @access  Private
const createJournal = async (req, res) => {
  const { title, content, date, mood, stickers, backgroundTheme } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    const journal = await Journal.create({
      userId: req.user._id,
      title,
      content,
      date: date || Date.now(),
      mood: mood || null,
      stickers: stickers || [],
      backgroundTheme: backgroundTheme || 'soft-lavender'
    });

    return res.status(201).json(journal);
  } catch (error) {
    console.error("Create journal error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get logged-in user's journals
// @route   GET /api/journal/user
// @access  Private
const getUserJournals = async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.user._id }).sort({
      date: -1
    });
    return res.json(journals);
  } catch (error) {
    console.error("Get journals error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a journal entry
// @route   PUT /api/journal/update/:id
// @access  Private
const updateJournal = async (req, res) => {
  const { id } = req.params;
  const { title, content, date, mood, stickers, backgroundTheme } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid journal id" });
  }

  try {
    const journal = await Journal.findOne({ _id: id, userId: req.user._id });

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    journal.title = title ?? journal.title;
    journal.content = content ?? journal.content;
    journal.date = date ?? journal.date;
    journal.mood = mood ?? journal.mood;
    journal.stickers = Array.isArray(stickers) ? stickers : journal.stickers;
    journal.backgroundTheme = backgroundTheme ?? journal.backgroundTheme;

    const updated = await journal.save();
    return res.json(updated);
  } catch (error) {
    console.error("Update journal error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a journal entry
// @route   DELETE /api/journal/delete/:id
// @access  Private
const deleteJournal = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid journal id" });
  }

  try {
    const journal = await Journal.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    return res.json({ message: "Journal deleted" });
  } catch (error) {
    console.error("Delete journal error:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createJournal,
  getUserJournals,
  updateJournal,
  deleteJournal
};
