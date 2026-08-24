const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// دالة مساعدة لتوحيد تنسيق التواريخ إلى YYYY-MM-DD
const formatDate = (dateInput) => {
    if (!dateInput) return '';
    if (typeof dateInput === 'string') {
        return dateInput.split('T')[0];
    }
    return new Date(dateInput).toISOString().split('T')[0];
};

const getHabits = async (req, res, next) => {
    // Ensure authenticated user
    if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user missing'));
    }
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
            completedDatesMap.get(hId).push(formatDate(log.dateString));
        });

        const todayStr = formatDate(new Date());
            const result = habits.map(habit => ({
                ...habit.toObject(),
                completedDates: completedDatesMap.get(habit._id.toString()) || [],
                streak: habit.currentStreak || 0,
                longestStreak: habit.longestStreak || 0,
                isCompletedToday: (completedDatesMap.get(habit._id.toString()) || []).includes(todayStr)
            }));

        res.json(result);
    } catch (error) {
        next(error);
    }
};

const createHabit = async (req, res, next) => {
    // Ensure authenticated user
    if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user missing'));
    }
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

        const habitObj = habit.toObject();

        res.status(201).json({
            ...habitObj,
            completedDates: [],
            streak: 0
        });
    } catch (error) {
        next(error);
    }
};

const computeCurrentStreak = (completedDates) => {
    if (!completedDates || completedDates.length === 0) return 0;
    // Sort dates descending
    const sorted = completedDates.sort((a, b) => new Date(b) - new Date(a));
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        const diff = (prev - curr) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
};

const toggleHabitStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { date } = req.body;

        // If no date is provided, default to today
        const targetDate = date ? new Date(date) : new Date();
        const targetDateStr = formatDate(targetDate);

        const habit = await Habit.findOne({ _id: id, user: req.user._id });
        if (!habit) {
            res.status(404);
            throw new Error('العادة غير موجودة أو غير مصرح لك بالتعديل عليها');
        }

        const existingLog = await HabitLog.findOne({
            habit: id,
            dateString: targetDateStr
        });

        if (existingLog && existingLog.isCompleted) {
            await HabitLog.deleteOne({ _id: existingLog._id });
        } else {
            await HabitLog.findOneAndUpdate(
                { habit: id, dateString: targetDateStr },
                {
                    user: req.user._id,
                    habit: id,
                    dateString: targetDateStr,
                    progressValue: habit.targetValue || 1,
                    isCompleted: true
                },
                { upsert: true, new: true }
            );
        }

        const allLogs = await HabitLog.find({ habit: id, isCompleted: true });
        const completedDates = allLogs.map(l => formatDate(l.dateString));

        const todayStr = formatDate(new Date());
        const isCompletedToday = completedDates.includes(todayStr);

        // Compute and update streaks
        const currentStreak = computeCurrentStreak(completedDates);
        habit.currentStreak = currentStreak;
        if (currentStreak > (habit.longestStreak || 0)) {
            habit.longestStreak = currentStreak;
        }
        await habit.save();

        res.json({ success: true, data: { ...habit.toObject(), completedDates, streak: habit.currentStreak || 0, longestStreak: habit.longestStreak || 0, isCompletedToday } });
    } catch (error) {
        next(error);
    }
};

const deleteHabit = async (req, res, next) => {
    try {
        const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });

        if (!habit) {
            res.status(404);
            throw new Error('العادة غير موجودة أو غير مصرح لك بحذفها');
        }

        const todayStr = formatDate(new Date());
        habit.archivedAt = new Date(todayStr);

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