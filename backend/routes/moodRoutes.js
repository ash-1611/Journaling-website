const express = require("express");
const { addMood, getMoodHistory, getMoodStats } = require("../controllers/moodController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addMood);
router.get("/user", protect, getMoodHistory);
router.get("/stats", protect, getMoodStats);

module.exports = router;

