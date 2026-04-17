const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/exerciseController');
const { protect } = require('../middleware/authMiddleware');

// ── Exercise library ──────────────────────────────────────────────────────
// NOTE: specific named routes MUST come before /:id to avoid mis-matching
router.get  ('/',                     ctrl.getAllExercises);
router.get  ('/recommendation',  protect, ctrl.getRecommendation);
router.get  ('/stats',           protect, ctrl.getStats);
router.get  ('/category/:category',   ctrl.getByCategory);
router.get  ('/:id',                  ctrl.getExerciseById);
router.post ('/',                protect, ctrl.createExercise);
router.put  ('/:id',             protect, ctrl.updateExercise);
router.delete('/:id',            protect, ctrl.deleteExercise);

module.exports = router;
