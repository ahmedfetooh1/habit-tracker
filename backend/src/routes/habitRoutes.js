const express = require('express');
const { 
    getHabits,
    createHabit, 
    toggleHabitStatus,
    deleteHabit 
} = require('../controllers/habitController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getHabits);
router.post('/', createHabit);
router.post('/:id/toggle', toggleHabitStatus);
router.delete('/:id', deleteHabit);

module.exports = router;