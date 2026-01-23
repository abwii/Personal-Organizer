const mongoose = require('mongoose');

const goalTemplateSchema = new mongoose.Schema({
  name: {
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
  category: {
    type: String,
    trim: true,
    maxlength: 50,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  // Template steps (embedded or referenced)
  steps: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    order: {
      type: Number,
      default: 0,
    },
  }],
  // Estimated duration in days (for calculating startDate/dueDate)
  estimatedDuration: {
    type: Number,
    default: 30, // Default to 30 days
    min: 1,
  },
  // Whether this is a system template (true) or user-created (false)
  isSystem: {
    type: Boolean,
    default: true,
  },
  // If user-created, store the creator's user_id
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
goalTemplateSchema.index({ isSystem: 1 });
goalTemplateSchema.index({ createdBy: 1 });
goalTemplateSchema.index({ category: 1 });

const GoalTemplate = mongoose.model('GoalTemplate', goalTemplateSchema);

module.exports = GoalTemplate;
