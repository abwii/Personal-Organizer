const mongoose = require('mongoose');

const userBadgeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  badge_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge',
    required: true,
  },
  badge_code: { // Denormalized for easier querying without population
    type: String,
    required: true,
  },
  obtained_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ensure a user can only earn a badge once
userBadgeSchema.index({ user_id: 1, badge_code: 1 }, { unique: true });

const UserBadge = mongoose.model('UserBadge', userBadgeSchema);

module.exports = UserBadge;
