const User = require('../models/User');
const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');

// XP Values
const XP_HABIT_COMPLETION = 5;
const XP_GOAL_COMPLETION = 50;

// Level Calculation (Example: Level = 1 + floor(sqrt(xp / 50)))
// Or simple thresholds
const calculateLevel = (xp) => {
  return 1 + Math.floor(Math.sqrt(xp / 50));
};

/**
 * Add XP to a user and check for level up
 * @param {string} userId
 * @param {number} amount
 * @returns {Promise<{xp: number, level: number, leveledUp: boolean, previousLevel: number}>}
 */
const addXp = async (userId, amount) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const previousLevel = user.level || 1;
  user.xp = (user.xp || 0) + amount;
  
  const newLevel = calculateLevel(user.xp);
  const leveledUp = newLevel > previousLevel;

  if (leveledUp) {
    user.level = newLevel;
  }

  await user.save();

  return {
    xp: user.xp,
    level: user.level,
    leveledUp,
    previousLevel
  };
};

/**
 * Check and award badges based on action and data
 * @param {string} userId
 * @param {string} actionType - 'habit_log', 'goal_complete'
 * @param {object} data - Context data (e.g., streak, habit info)
 * @returns {Promise<Array>} - List of newly awarded badges
 */
const checkBadges = async (userId, actionType, data) => {
  const newBadges = [];

  // Ensure default badges exist (lazy initialization for simplicity)
  await ensureDefaultBadges();

  // 1. Check for "7 Days Streak" Badge
  if (actionType === 'habit_log' && data.current_streak >= 7) {
    const badgeCode = 'STREAK_7_DAYS';
    const awarded = await awardBadge(userId, badgeCode);
    if (awarded) newBadges.push(awarded);
  }

  // 2. Check for "First Goal" Badge
  if (actionType === 'goal_complete') {
    // We could check if it's the first goal, but for now let's just have a "Goal Getter" badge for 1st goal
    // This requires checking count of completed goals, or just trying to award it if we assume this is a completion event
    // Let's query count
    // const Goal = require('../models/Goal');
    // const count = await Goal.countDocuments({ user_id: userId, status: 'completed' });
    // if (count === 1) ... 
    
    // For this specific task, the user asked for "7 days streak" example. 
    // I'll add a generic "Goal Achiever" badge for finishing a goal.
    const badgeCode = 'GOAL_ACHIEVER';
    const awarded = await awardBadge(userId, badgeCode);
    if (awarded) newBadges.push(awarded);
  }

  return newBadges;
};

/**
 * Award a badge to a user if they don't have it
 * @param {string} userId
 * @param {string} badgeCode
 * @returns {Promise<object|null>} - The badge if newly awarded, null otherwise
 */
const awardBadge = async (userId, badgeCode) => {
  const badge = await Badge.findOne({ code: badgeCode });
  if (!badge) {
    console.warn(`Badge with code ${badgeCode} not found.`);
    return null;
  }

  // Check if already owned
  const existing = await UserBadge.findOne({ user_id: userId, badge_code: badgeCode });
  if (existing) {
    return null; // Already has it
  }

  // Award badge
  const userBadge = new UserBadge({
    user_id: userId,
    badge_id: badge._id,
    badge_code: badgeCode,
  });
  await userBadge.save();

  // Optionally update User.badges array if we want to keep it for quick access
  await User.findByIdAndUpdate(userId, {
    $addToSet: { badges: badgeCode }
  });

  return badge;
};

/**
 * Ensure default badges exist in the database
 */
const ensureDefaultBadges = async () => {
  const defaults = [
    {
      code: 'STREAK_7_DAYS',
      name: '7 Days Streak',
      description: 'Completed a habit for 7 days in a row!',
      icon: 'fire', // Placeholder
      xp_reward: 20
    },
    {
      code: 'GOAL_ACHIEVER',
      name: 'Goal Achiever',
      description: 'Completed a goal!',
      icon: 'trophy', // Placeholder
      xp_reward: 50
    }
  ];

  for (const def of defaults) {
    const exists = await Badge.findOne({ code: def.code });
    if (!exists) {
      await Badge.create(def);
    }
  }
};

module.exports = {
  addXp,
  checkBadges,
  awardBadge,
  XP_HABIT_COMPLETION,
  XP_GOAL_COMPLETION
};
