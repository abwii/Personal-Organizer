const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  goal_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  dueDate: {
    type: Date,
  },
  is_completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Step = mongoose.model('Step', stepSchema);

module.exports = Step;
