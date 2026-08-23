const Habit = require('../models/Habit');

// Middleware that verifies the habit with :id belongs to the logged‑in user.
// If validation passes, the habit document is attached to req.habit for downstream handlers.
module.exports = async function checkHabitOwner(req, res, next) {
  try {
    const { id } = req.params;
    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ success: false, error: 'Habit not found' });
    }
    if (String(habit.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, error: 'Unauthorized to modify this habit' });
    }
    // attach for possible reuse
    req.habit = habit;
    next();
  } catch (err) {
    next(err);
  }
};
