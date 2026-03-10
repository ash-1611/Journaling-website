const express = require("express");
const {
  createJournal,
  getUserJournals,
  updateJournal,
  deleteJournal
} = require("../controllers/journalController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", protect, createJournal);
router.get("/user", protect, getUserJournals);
router.put("/update/:id", protect, updateJournal);
router.delete("/delete/:id", protect, deleteJournal);

module.exports = router;

