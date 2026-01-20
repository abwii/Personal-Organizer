const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
  habit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true,
    index: true,
  },
  date: {
    type: Date,
    required: true,
    // Store date at midnight UTC to prevent timezone issues
    // This ensures one completion per day regardless of timezone
  },
  is_completed: {
    type: Boolean,
    default: true,
    required: true,
  },
}, {
  timestamps: true,
});

// Compound index to prevent double counting: one log per habit per date
habitLogSchema.index({ habit_id: 1, date: 1 }, { unique: true });

// Index for efficient queries
habitLogSchema.index({ habit_id: 1, date: -1 });

const HabitLog = mongoose.model('HabitLog', habitLogSchema);

module.exports = HabitLog;
