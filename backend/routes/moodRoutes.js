const express = require("express");
const { addMood, getMoodHistory } = require("../controllers/moodController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addMood);
router.get("/user", protect, getMoodHistory);

module.exports = router;

