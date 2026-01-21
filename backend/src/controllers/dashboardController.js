const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const { calculateStreak, calculateWeeklyCompletion } = require('../utils/habitUtils');

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
        const weeklyCompletion = calculateWeeklyCompletion(logs);
        
        // Update habit streak and weekly completion
        // Always update to ensure consistency, especially after saves from other operations
        habit.current_streak = currentStreak;
        habit.weekly_completion_rate = weeklyCompletion;
        if (currentStreak > habit.best_streak) {
          habit.best_streak = currentStreak;
        }
        // Save and wait for it to complete
        await habit.save();
        
        // Reload to ensure we have the latest data
        const updatedHabit = await Habit.findById(habit._id);
        
        if (updatedHabit.best_streak > bestStreak) {
          bestStreak = updatedHabit.best_streak;
        }

        return updatedHabit;
      })
    );

    // Get today's date at midnight UTC (normalize to ensure no milliseconds)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    today.setUTCMilliseconds(0);
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    // Get habits to do today (active daily habits that haven't been completed today)
    const habitsToDoToday = await Promise.all(
      habitsWithStreaks
        .filter((habit) => habit.frequency === 'daily')
        .map(async (habit) => {
          // Check if habit was already completed today (must have a log with is_completed: true)
          // Query for logs on today's date (normalized to UTC midnight)
          const todayLog = await HabitLog.findOne({
            habit_id: habit._id,
            date: {
              $gte: today,
              $lt: tomorrow,
            },
            is_completed: true,
          });

          // Reload habit to get updated values after streak calculation
          // Ensure we get fresh data from database
          const updatedHabit = await Habit.findById(habit._id);

          return {
            _id: updatedHabit._id,
            title: updatedHabit.title,
            description: updatedHabit.description,
            category: updatedHabit.category,
            current_streak: updatedHabit.current_streak,
            best_streak: updatedHabit.best_streak,
            weekly_completion_rate: updatedHabit.weekly_completion_rate,
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
