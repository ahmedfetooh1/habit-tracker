const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        title: { type: String, required: true },
        description: { type: String },
        category: { type: String, default: 'General' },

        goalType: { type: String, enum: ['boolean', 'numeric'], default: 'boolean' },
        targetValue: { type: Number, default: 1 },
        unit: { type: String, default: 'times' },

        frequency: { type: String, enum: ['daily', 'custom'], default: 'daily' },
        targetDays: [{ type: String }],

        reminderTime: { type: String },

        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Compound Index to optimize habit queries grouped by user and creation date
habitSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Habit', habitSchema);