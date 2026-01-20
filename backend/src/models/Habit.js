const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily',
    required: true,
  },
  category: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active',
    required: true,
  },
  current_streak: {
    type: Number,
    default: 0,
  },
  best_streak: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
habitSchema.index({ user_id: 1, status: 1 });
habitSchema.index({ user_id: 1, frequency: 1 });
habitSchema.index({ user_id: 1, createdAt: -1 });

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;
