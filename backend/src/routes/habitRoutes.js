const express = require('express');
const { 
    getHabits,
    createHabit, 
    toggleHabitStatus,
    deleteHabit 
} = require('../controllers/habitController');
const { protect } = require('../middlewares/authMiddleware');
const checkHabitOwner = require('../middleware/checkHabitOwner');

const router = express.Router();

router.use(protect);

router.get('/', getHabits);
router.post('/', createHabit);
router.post('/:id/toggle', checkHabitOwner, toggleHabitStatus);
router.delete('/:id', checkHabitOwner, deleteHabit);

module.exports = router;