const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// @route   POST /api/habits
const createHabit = async (req, res, next) => {
    try {
        const { title, description, category, goalType, targetValue, unit, frequency, targetDays, reminderTime } = req.body;
        const habit = await Habit.create({
        user: req.user._id,
        title,
        description,
        category,
        goalType,
        targetValue,
        unit,
        frequency,
        targetDays,
        reminderTime
    });
    res.status(201).json(habit);
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/habits/calendar?date=YYYY-MM-DD&dayName=Mon
const getCalendarHabits = async (req, res, next) => {
    try {
        const { date, dayName } = req.query; // date: "2026-08-11"
        
        const habits = await Habit.find({
        user: req.user._id,
        $or: [
            { frequency: 'daily' },
            { frequency: 'custom', targetDays: dayName }
        ]
        });

        const logs = await HabitLog.find({
        user: req.user._id,
        dateString: date
    });

    const logMap = new Map();
    logs.forEach(log => logMap.set(log.habit.toString(), log));

    const result = habits.map(habit => {
        const log = logMap.get(habit._id.toString());
        const currentProgress = log ? log.progressValue : 0;
        const isCompleted = log ? log.isCompleted : false;
        const progressPercentage = Math.min(Math.round((currentProgress / habit.targetValue) * 100), 100);

        return {
            _id: habit._id,
            title: habit.title,
            goalType: habit.goalType,
            targetValue: habit.targetValue,
            unit: habit.unit,
            reminderTime: habit.reminderTime,
            currentProgress,
            progressPercentage,
            isCompleted,
            logId: log ? log._id : null
        };
    });

    res.json(result);
    } catch (error) {
        next(error);
    }
};

// @route   POST /api/habits/log
const logHabitProgress = async (req, res, next) => {
    try {
        const { habitId, dateString, progressValue, notes } = req.body;
        
        const habit = await Habit.findById(habitId);
        if (!habit) {
        res.status(404);
        throw new Error('العادة غير موجودة');
    }

    const isCompleted = progressValue >= habit.targetValue;

    const log = await HabitLog.findOneAndUpdate(
        { habit: habitId, dateString },
        { 
            user: req.user._id,
            progressValue, 
            isCompleted,
            notes 
        },
        { new: true, upsert: true }
    );

    res.json({ message: 'تم تحديث التقدم بنجاح', log });
    } catch (error) {
        next(error);
    }
};


// @route   PUT /api/habits/:id
const updateHabit = async (req, res, next) => {
    try {
        const habit = await Habit.findById(req.params.id);

    if (!habit) {
        res.status(404);
        throw new Error('العادة غير موجودة');
    }

    if (habit.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('غير مصرح لك بتعديل هذه العادة');
    }

    const updatedHabit = await Habit.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json(updatedHabit);
    } catch (error) {
        next(error);
    }
};

// @route   DELETE /api/habits/:id
const deleteHabit = async (req, res, next) => {
    try {
    const habit = await Habit.findById(req.params.id);

    if (!habit) {
        res.status(404);
        throw new Error('العادة غير موجودة');
    }

    if (habit.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('غير مصرح لك بحذف هذه العادة');
    }

    await habit.deleteOne();
    
    await HabitLog.deleteMany({ habit: req.params.id });

    res.json({ message: 'تم حذف العادة وسجلاتها التاريخية بنجاح' });
    } catch (error) {
        next(error);
    }
};


module.exports = { 
    createHabit, 
    getCalendarHabits, 
    logHabitProgress, 
    updateHabit, 
    deleteHabit 
};
