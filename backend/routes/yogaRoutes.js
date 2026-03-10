const express = require('express');
const { getAllYoga, getYogaById } = require('../controllers/yogaController');
const router = express.Router();

router.get('/all', getAllYoga);
router.get('/:id', getYogaById);

module.exports = router;
