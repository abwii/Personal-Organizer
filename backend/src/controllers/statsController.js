const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

// GET /api/stats - Get statistics data for charts and visualizations
const getStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user_id || req.body.user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required',
      });
    }

    // 1. Goal progression data (for line/bar chart)
    const goals = await Goal.find({ user_id: userId, status: { $in: ['active', 'completed'] } });
    const goalProgression = goals.map(goal => {
      const now = new Date();
      const start = new Date(goal.startDate);
      const due = new Date(goal.dueDate);
      const totalDays = Math.ceil((due - start) / (1000 * 60 * 60 * 24));
      const elapsedDays = Math.ceil((now - start) / (1000 * 60 * 60 * 24));
      const expectedProgress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

      return {
        id: goal._id,
        title: goal.title,
        category: goal.category || 'Uncategorized',
        startDate: goal.startDate,
        dueDate: goal.dueDate,
        currentProgress: goal.progress || 0,
        expectedProgress: Math.round(expectedProgress),
        status: goal.status,
        priority: goal.priority,
      };
    });

    // 2. Habit heatmap data (for calendar visualization)
    // Get all habit logs for the last 365 days
    const oneYearAgo = new Date();
    oneYearAgo.setUTCDate(oneYearAgo.getUTCDate() - 365);
    oneYearAgo.setUTCHours(0, 0, 0, 0);
    oneYearAgo.setUTCMilliseconds(0);

    const allHabits = await Habit.find({ user_id: userId, status: 'active' });
    const habitIds = allHabits.map(h => h._id);

    const habitLogs = await HabitLog.find({
      habit_id: { $in: habitIds },
      date: { $gte: oneYearAgo },
      is_completed: true,
    }).sort({ date: 1 });

    // Group logs by date and count completions
    const heatmapData = {};
    habitLogs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0]; // YYYY-MM-DD
      if (!heatmapData[dateKey]) {
        heatmapData[dateKey] = 0;
      }
      heatmapData[dateKey]++;
    });

    // Convert to array format for frontend
    const heatmapArray = Object.entries(heatmapData).map(([date, count]) => ({
      date,
      count,
    }));

    // 3. Success statistics by category
    const categoryStats = {
      goals: {},
      habits: {},
    };

    // Goals by category
    goals.forEach(goal => {
      const category = goal.category || 'Uncategorized';
      if (!categoryStats.goals[category]) {
        categoryStats.goals[category] = {
          total: 0,
          completed: 0,
          active: 0,
          abandoned: 0,
          successRate: 0,
        };
      }
      categoryStats.goals[category].total++;
      if (goal.status === 'completed') {
        categoryStats.goals[category].completed++;
      } else if (goal.status === 'active') {
        categoryStats.goals[category].active++;
      } else {
        categoryStats.goals[category].abandoned++;
      }
    });

    // Calculate success rate for goals by category
    Object.keys(categoryStats.goals).forEach(category => {
      const stats = categoryStats.goals[category];
      stats.successRate = stats.total > 0 
        ? Math.round((stats.completed / stats.total) * 100) 
        : 0;
    });

    // Habits by category
    allHabits.forEach(habit => {
      const category = habit.category || 'Uncategorized';
      if (!categoryStats.habits[category]) {
        categoryStats.habits[category] = {
          total: 0,
          active: 0,
          archived: 0,
          averageStreak: 0,
          averageWeeklyCompletion: 0,
        };
      }
      categoryStats.habits[category].total++;
      if (habit.status === 'active') {
        categoryStats.habits[category].active++;
      } else {
        categoryStats.habits[category].archived++;
      }
    });

    // Calculate average streak and weekly completion by category
    const habitLogsByCategory = {};
    allHabits.forEach(habit => {
      const category = habit.category || 'Uncategorized';
      if (!habitLogsByCategory[category]) {
        habitLogsByCategory[category] = {
          streaks: [],
          weeklyCompletions: [],
        };
      }
      if (habit.current_streak !== undefined) {
        habitLogsByCategory[category].streaks.push(habit.current_streak);
      }
      if (habit.weekly_completion_rate !== undefined) {
        habitLogsByCategory[category].weeklyCompletions.push(habit.weekly_completion_rate);
      }
    });

    Object.keys(categoryStats.habits).forEach(category => {
      const stats = categoryStats.habits[category];
      const logs = habitLogsByCategory[category] || { streaks: [], weeklyCompletions: [] };
      
      if (logs.streaks.length > 0) {
        const sum = logs.streaks.reduce((a, b) => a + b, 0);
        stats.averageStreak = Math.round(sum / logs.streaks.length);
      }
      
      if (logs.weeklyCompletions.length > 0) {
        const sum = logs.weeklyCompletions.reduce((a, b) => a + b, 0);
        stats.averageWeeklyCompletion = Math.round(sum / logs.weeklyCompletions.length);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        goalProgression,
        habitHeatmap: heatmapArray,
        categoryStats,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
};

module.exports = {
  getStats,
};
