const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

const getHabits = async (req, res, next) => {
    try {
        const habits = await Habit.find({ user: req.user._id }).sort({ createdAt: -1 });
        const habitIds = habits.map(h => h._id);

        const completedLogs = await HabitLog.find({
            habit: { $in: habitIds },
            isCompleted: true
        });

        const completedDatesMap = new Map();
        completedLogs.forEach(log => {
            const hId = log.habit.toString();
            if (!completedDatesMap.has(hId)) completedDatesMap.set(hId, []);
            completedDatesMap.get(hId).push(log.dateString);
        });

        const result = habits.map(habit => ({
            ...habit.toObject(),
            completedDates: completedDatesMap.get(habit._id.toString()) || [],
            streak: habit.currentStreak
        }));

        res.json(result);
    } catch (error) {
        next(error);
    }
};

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
            frequency: frequency || 'daily',
            targetDays,
            reminderTime
        });

        res.status(201).json({
            ...habit.toObject(),
            completedDates: [],
            streak: 0
        });
    } catch (error) {
        next(error);
    }
};

const toggleHabitStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date } = req.body;

        const habit = await Habit.findById(id);
        if (!habit) {
            res.status(404);
            throw new Error('العادة غير موجودة');
        }

        const existingLog = await HabitLog.findOne({ habit: id, dateString: date });

        if (existingLog && existingLog.isCompleted) {
            await HabitLog.deleteOne({ _id: existingLog._id });
        } else {
            await HabitLog.findOneAndUpdate(
                { habit: id, dateString: date },
                {
                    user: req.user._id,
                    progressValue: habit.targetValue || 1,
                    isCompleted: true
                },
                { upsert: true, new: true }
            );
        }

        const allLogs = await HabitLog.find({ habit: id, isCompleted: true });
        const completedDates = allLogs.map(l => l.dateString);

        res.json({
            ...habit.toObject(),
            completedDates,
            streak: habit.currentStreak
        });
    } catch (error) {
        next(error);
    }
};

// أرشفة العادة لتظل السجلات القديمة محفوظة
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

        habit.archivedAt = new Date();
        await habit.save();

        res.json({ message: 'تم أرشفة العادة بنجاح ولن تظهر في الأيام القادمة' });
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    getHabits,
    createHabit, 
    toggleHabitStatus,
    deleteHabit 
};