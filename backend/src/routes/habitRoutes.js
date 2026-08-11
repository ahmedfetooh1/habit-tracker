const express = require('express');
const { 
    createHabit, 
    getCalendarHabits, 
    logHabitProgress, 
    updateHabit, 
    deleteHabit 
} = require('../controllers/habitController');
const { protect } = require('../middlewares/authMiddleware');
const { 
    validateCreateHabit, 
    validateUpdateHabit, 
    validateLogHabit, 
    validateMongoId 
} = require('../middlewares/validationMiddleware');

const router = express.Router();

// Protect all habit routes with JWT Authentication
router.use(protect);

router.post('/', validateCreateHabit, createHabit);
router.get('/calendar', getCalendarHabits);
router.post('/log', validateLogHabit, logHabitProgress);
router.put('/:id', validateMongoId('id'), validateUpdateHabit, updateHabit);
router.delete('/:id', validateMongoId('id'), deleteHabit);

module.exports = router;