const express = require('express');
const { getAllExercises, getExerciseById } = require('../controllers/exerciseController');
const router = express.Router();

router.get('/all', getAllExercises);
router.get('/:id', getExerciseById);

module.exports = router;
