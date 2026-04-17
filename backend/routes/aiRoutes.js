// backend/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  analyzeJournal,
  generateSmartPlaylist,
  getDailySummary,
  getMoodPrediction,
  getEmotionalAnalytics,
  chatWithTherapist,
  getUserInsights,
  healthCheck,
} = require('../controllers/aiController');

// Health check endpoint (no auth required - for diagnostics)
router.get('/health', (req, res, next) => {
  healthCheck(req, res).catch(next);
});

// All routes below require authentication
router.use(protect);

// POST /api/ai/analyze-journal
router.post('/analyze-journal', analyzeJournal);

// POST /api/ai/smart-playlist
router.post('/smart-playlist', generateSmartPlaylist);

// GET  /api/ai/daily-summary
router.get('/daily-summary', getDailySummary);

// GET  /api/ai/mood-prediction
router.get('/mood-prediction', getMoodPrediction);

// GET  /api/ai/analytics
router.get('/analytics', getEmotionalAnalytics);

// POST /api/ai/chat
router.post('/chat', chatWithTherapist);

// GET  /api/ai/insights
router.get('/insights', getUserInsights);

module.exports = router;
