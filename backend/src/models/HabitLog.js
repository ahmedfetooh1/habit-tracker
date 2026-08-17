const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
    habit: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    
    dateString: { type: String, required: true }, 
    
    progressValue: { type: Number, default: 0 }, 
    isCompleted: { type: Boolean, default: false },
    
    notes: { type: String }
}, { timestamps: true });


habitLogSchema.index({ habit: 1, dateString: 1 }, { unique: true });

module.exports = mongoose.model('HabitLog', habitLogSchema);