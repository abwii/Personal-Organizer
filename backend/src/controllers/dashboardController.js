const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const { calculateStreak } = require('../utils/habitUtils');

// GET /api/dashboard - Get dashboard aggregated data
const getDashboard = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user_id || req.body.user_id; // Temporary: will use auth middleware later

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required',
      });
    }

    // Get completed goals count
    const completedGoalsCount = await Goal.countDocuments({
      user_id: userId,
      status: 'completed',
    });

    // Get all active habits for the user
    const activeHabits = await Habit.find({
      user_id: userId,
      status: 'active',
    });

    // Calculate best streak across all habits
    let bestStreak = 0;
    const habitsWithStreaks = await Promise.all(
      activeHabits.map(async (habit) => {
        const logs = await HabitLog.find({ habit_id: habit._id });
        const currentStreak = calculateStreak(logs);
        
        // Update habit streak if needed
        if (habit.current_streak !== currentStreak) {
          habit.current_streak = currentStreak;
          if (currentStreak > habit.best_streak) {
            habit.best_streak = currentStreak;
          }
          await habit.save();
        }

        if (habit.best_streak > bestStreak) {
          bestStreak = habit.best_streak;
        }

        return habit;
      })
    );

    // Get today's date at midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    // Get habits to do today (active daily habits that haven't been completed today)
    const habitsToDoToday = await Promise.all(
      habitsWithStreaks
        .filter((habit) => habit.frequency === 'daily')
        .map(async (habit) => {
          // Check if habit was already logged today
          const todayLog = await HabitLog.findOne({
            habit_id: habit._id,
            date: {
              $gte: today,
              $lt: tomorrow,
            },
          });

          return {
            _id: habit._id,
            title: habit.title,
            description: habit.description,
            category: habit.category,
            current_streak: habit.current_streak,
            best_streak: habit.best_streak,
            weekly_completion_rate: habit.weekly_completion_rate,
            is_completed_today: !!todayLog,
          };
        })
    );

    res.status(200).json({
      success: true,
      data: {
        completed_goals_count: completedGoalsCount,
        best_streak: bestStreak,
        habits_today: habitsToDoToday,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
    });
  }
};

module.exports = {
  getDashboard,
};
