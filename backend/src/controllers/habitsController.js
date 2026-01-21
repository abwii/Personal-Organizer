const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const { calculateStreak, calculateWeeklyCompletion } = require('../utils/habitUtils');

// GET /api/habits - Get all habits with optional filtering
const getHabits = async (req, res) => {
  try {
    const { status, frequency, user_id } = req.query;
    const userId = req.user?.id || user_id; // Temporary: will use auth middleware later

    // Build filter
    const filter = {};
    if (userId) {
      filter.user_id = userId;
    }
    if (status) {
      filter.status = status;
    }
    if (frequency) {
      filter.frequency = frequency;
    }

    const habits = await Habit.find(filter).sort({ createdAt: -1 });

    // Recalculate streaks for each habit to ensure they are up to date
    // (e.g., if a user hasn't logged today and the streak should be 0)
    const habitsWithUpdatedStreaks = await Promise.all(
      habits.map(async (habit) => {
        const logs = await HabitLog.find({ habit_id: habit._id });
        const currentStreak = calculateStreak(logs);
        const weeklyCompletion = calculateWeeklyCompletion(logs);
        
        if (habit.current_streak !== currentStreak || habit.weekly_completion_rate !== weeklyCompletion) {
          habit.current_streak = currentStreak;
          habit.weekly_completion_rate = weeklyCompletion;
          await habit.save();
        }
        return habit;
      })
    );

    res.status(200).json({
      success: true,
      count: habitsWithUpdatedStreaks.length,
      data: habitsWithUpdatedStreaks,
    });
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch habits',
    });
  }
};

// GET /api/habits/:id - Get a single habit by ID
const getHabitById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.query.user_id || req.body.user_id; // Temporary: will use auth middleware later

    const habit = await Habit.findOne({ _id: id, user_id: userId });

    if (!habit) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found',
      });
    }

    // Recalculate streak to ensure it's up to date
    const logs = await HabitLog.find({ habit_id: habit._id });
    const currentStreak = calculateStreak(logs);
    const weeklyCompletion = calculateWeeklyCompletion(logs);
    
    if (habit.current_streak !== currentStreak || habit.weekly_completion_rate !== weeklyCompletion) {
      habit.current_streak = currentStreak;
      habit.weekly_completion_rate = weeklyCompletion;
      await habit.save();
    }

    res.status(200).json({
      success: true,
      data: habit,
    });
  } catch (error) {
    console.error('Error fetching habit:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid habit ID',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch habit',
    });
  }
};

// POST /api/habits - Create a new habit
const createHabit = async (req, res) => {
  try {
    const {
      title,
      description,
      frequency = 'daily',
      category,
      status = 'active',
      user_id, // Temporary: will use auth middleware later
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required',
      });
    }

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required',
      });
    }

    // Validate frequency
    if (frequency && !['daily', 'weekly'].includes(frequency)) {
      return res.status(400).json({
        success: false,
        error: 'Frequency must be one of: daily, weekly',
      });
    }

    // Validate status
    if (status && !['active', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be one of: active, archived',
      });
    }

    const habit = new Habit({
      user_id,
      title,
      description,
      frequency,
      category,
      status,
    });

    await habit.save();

    res.status(201).json({
      success: true,
      data: habit,
    });
  } catch (error) {
    console.error('Error creating habit:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create habit',
    });
  }
};

// PUT /api/habits/:id - Update a habit
const updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      frequency,
      category,
      status,
      user_id, // Temporary: will use auth middleware later
    } = req.body;

    const userId = req.user?.id || user_id || req.query.user_id;

    const habit = await Habit.findOne({ _id: id, user_id: userId });

    if (!habit) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found',
      });
    }

    // Update fields
    if (title !== undefined) habit.title = title;
    if (description !== undefined) habit.description = description;
    if (category !== undefined) habit.category = category;
    if (frequency !== undefined) {
      if (!['daily', 'weekly'].includes(frequency)) {
        return res.status(400).json({
          success: false,
          error: 'Frequency must be one of: daily, weekly',
        });
      }
      habit.frequency = frequency;
    }
    if (status !== undefined) {
      if (!['active', 'archived'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status must be one of: active, archived',
        });
      }
      habit.status = status;
    }

    await habit.save();

    res.status(200).json({
      success: true,
      data: habit,
    });
  } catch (error) {
    console.error('Error updating habit:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid habit ID',
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update habit',
    });
  }
};

// DELETE /api/habits/:id - Delete a habit
const deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.query.user_id || req.body.user_id; // Temporary: will use auth middleware later

    const habit = await Habit.findOneAndDelete({ _id: id, user_id: userId });

    if (!habit) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found',
      });
    }

    // Also delete all associated logs
    await HabitLog.deleteMany({ habit_id: id });

    res.status(200).json({
      success: true,
      message: 'Habit deleted successfully',
      data: habit,
    });
  } catch (error) {
    console.error('Error deleting habit:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid habit ID',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete habit',
    });
  }
};

// POST /api/habits/:id/log - Log a habit completion for a specific date
const logHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, user_id } = req.body;

    const userId = req.user?.id || user_id || req.query.user_id;

    // Verify habit exists and belongs to user
    const habit = await Habit.findOne({ _id: id, user_id: userId });

    if (!habit) {
      return res.status(404).json({
        success: false,
        error: 'Habit not found',
      });
    }

    // Parse date and normalize to UTC midnight to prevent double counting
    let logDate;
    if (date) {
      logDate = new Date(date);
      if (Number.isNaN(logDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format',
        });
      }
    } else {
      // Default to today at midnight UTC
      logDate = new Date();
    }

    // Normalize to midnight UTC to ensure one completion per day
    logDate.setUTCHours(0, 0, 0, 0);
    logDate.setUTCMilliseconds(0);

    // Check if log already exists for this date (prevent double counting)
    const existingLog = await HabitLog.findOne({
      habit_id: id,
      date: logDate,
    });

    if (existingLog) {
      return res.status(400).json({
        success: false,
        error: 'Habit already logged for this date',
      });
    }

    // Create new log
    const habitLog = new HabitLog({
      habit_id: id,
      date: logDate,
      is_completed: true,
    });

    await habitLog.save();

    // Recalculate streak and weekly completion
    const allLogs = await HabitLog.find({ habit_id: id });
    const newStreak = calculateStreak(allLogs);
    const weeklyCompletion = calculateWeeklyCompletion(allLogs);

    // Update habit with new streak and weekly completion
    habit.current_streak = newStreak;
    habit.weekly_completion_rate = weeklyCompletion;
    if (newStreak > habit.best_streak) {
      habit.best_streak = newStreak;
    }
    await habit.save();

    res.status(201).json({
      success: true,
      data: {
        ...habitLog.toObject(),
        current_streak: habit.current_streak,
        best_streak: habit.best_streak,
        weekly_completion_rate: habit.weekly_completion_rate,
      },
    });
  } catch (error) {
    console.error('Error logging habit:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid habit ID',
      });
    }
    if (error.code === 11000) {
      // Duplicate key error (unique index violation)
      return res.status(400).json({
        success: false,
        error: 'Habit already logged for this date',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to log habit',
    });
  }
};

module.exports = {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabit,
};
