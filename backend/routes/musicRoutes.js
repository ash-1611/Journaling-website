const express = require('express');
const { getAllMusic, getMusicByCategory } = require('../controllers/musicController');
const router = express.Router();

router.get('/all', getAllMusic);
router.get('/category/:category', getMusicByCategory);

module.exports = router;
