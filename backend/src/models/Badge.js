const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true, // e.g., 'STREAK_7_DAYS'
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String, // URL or icon name
    default: 'default_badge.png',
  },
  xp_reward: {
    type: Number,
    default: 0,
  },
  criteria: {
    type: mongoose.Schema.Types.Mixed, // Flexible criteria object
    default: {},
  },
}, {
  timestamps: true,
});

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;
