const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
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
  startDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    required: true,
  },
  category: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active',
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
});

// Validation: dueDate must be after startDate
goalSchema.pre('validate', function(next) {
  if (this.dueDate && this.startDate && this.dueDate < this.startDate) {
    const error = new Error('Due date must be after start date');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

// Index for efficient queries
goalSchema.index({ user_id: 1, status: 1 });
goalSchema.index({ user_id: 1, priority: 1 });
goalSchema.index({ user_id: 1, createdAt: -1 });

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;
