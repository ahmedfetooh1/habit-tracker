const express = require('express');
const { 
    createHabit, 
    getCalendarHabits, 
    logHabitProgress, 
    updateHabit, 
    deleteHabit 
} = require('../controllers/habitController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(protect); 

router.post('/', createHabit);
router.get('/calendar', getCalendarHabits);
router.post('/log', logHabitProgress);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);

module.exports = router;