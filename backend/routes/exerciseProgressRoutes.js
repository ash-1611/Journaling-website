const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controllers/exerciseController');
const { protect } = require('../middleware/authMiddleware');

router.post('/start',    protect, ctrl.startExercise);
router.post('/update',   protect, ctrl.updateProgress);
router.post('/complete', protect, ctrl.completeExercise);
router.get ('/user',     protect, ctrl.getUserProgress);

module.exports = router;
