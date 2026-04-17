const express = require('express');
const { getSettings, updateSettings, changePassword } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getSettings);
router.put('/', protect, updateSettings);
router.put('/change-password', protect, changePassword);

module.exports = router;
