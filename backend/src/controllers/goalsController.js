const Goal = require('../models/Goal');

// GET /api/goals - Get all goals with optional filtering
const getGoals = async (req, res) => {
  try {
    const { status, priority, user_id } = req.query;
    const userId = req.user?.id || user_id; // Temporary: will use auth middleware later

    // Build filter
    const filter = {};
    if (userId) {
      filter.user_id = userId;
    }
    if (status) {
      filter.status = status;
    }
    if (priority) {
      filter.priority = priority;
    }

    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goals',
    });
  }
};

// GET /api/goals/:id - Get a single goal by ID
const getGoalById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.query.user_id || req.body.user_id; // Temporary: will use auth middleware later

    const goal = await Goal.findOne({ _id: id, user_id: userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error('Error fetching goal:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal ID',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goal',
    });
  }
};

// POST /api/goals - Create a new goal
const createGoal = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      dueDate,
      priority = 'medium',
      category,
      status = 'active',
      user_id, // Temporary: will use auth middleware later
    } = req.body;

    // Validation
    if (!title || !startDate || !dueDate) {
      return res.status(400).json({
        success: false,
        error: 'Title, startDate, and dueDate are required',
      });
    }

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required',
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const due = new Date(dueDate);

    if (isNaN(start.getTime()) || isNaN(due.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
      });
    }

    if (due < start) {
      return res.status(400).json({
        success: false,
        error: 'Due date must be after start date',
      });
    }

    // Validate priority
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Priority must be one of: low, medium, high',
      });
    }

    // Validate status
    if (status && !['active', 'completed', 'abandoned'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be one of: active, completed, abandoned',
      });
    }

    const goal = new Goal({
      user_id,
      title,
      description,
      startDate: start,
      dueDate: due,
      priority,
      category,
      status,
    });

    await goal.save();

    res.status(201).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error('Error creating goal:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create goal',
    });
  }
};

// PUT /api/goals/:id - Update a goal
const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.body.user_id; // Temporary: will use auth middleware later

    const goal = await Goal.findOne({ _id: id, user_id: userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    const {
      title,
      description,
      startDate,
      dueDate,
      priority,
      category,
      status,
    } = req.body;

    // Update fields if provided
    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (startDate !== undefined) goal.startDate = new Date(startDate);
    if (dueDate !== undefined) goal.dueDate = new Date(dueDate);
    if (priority !== undefined) {
      if (!['low', 'medium', 'high'].includes(priority)) {
        return res.status(400).json({
          success: false,
          error: 'Priority must be one of: low, medium, high',
        });
      }
      goal.priority = priority;
    }
    if (category !== undefined) goal.category = category;
    if (status !== undefined) {
      if (!['active', 'completed', 'abandoned'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Status must be one of: active, completed, abandoned',
        });
      }
      goal.status = status;
    }

    // Validate dates if both are present
    if (goal.startDate && goal.dueDate && goal.dueDate < goal.startDate) {
      return res.status(400).json({
        success: false,
        error: 'Due date must be after start date',
      });
    }

    await goal.save();

    res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal ID',
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
      error: 'Failed to update goal',
    });
  }
};

// DELETE /api/goals/:id - Delete a goal
const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.query.user_id || req.body.user_id; // Temporary: will use auth middleware later

    const goal = await Goal.findOneAndDelete({ _id: id, user_id: userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
      data: goal,
    });
  } catch (error) {
    console.error('Error deleting goal:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal ID',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete goal',
    });
  }
};

// POST /api/goals/:id/duplicate - Duplicate a goal with its steps (Deep Copy)
const duplicateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_id,
      title, // Optional: override title
      startDate, // Optional: new start date
      dueDate, // Optional: new due date
    } = req.body;

    const userId = req.user?.id || user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required',
      });
    }

    // Get original goal
    const originalGoal = await Goal.findById(id);
    if (!originalGoal) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found',
      });
    }

    // Check if user owns the original goal (optional: allow duplicating any goal)
    // For now, we'll allow duplicating any goal

    // Get original steps
    const Step = require('../models/Step');
    const originalSteps = await Step.find({ goal_id: id }).sort({ createdAt: 1 });

    // Calculate new dates
    let start, due;
    if (startDate && dueDate) {
      start = new Date(startDate);
      due = new Date(dueDate);
    } else {
      // Default: start today, maintain same duration
      const duration = originalGoal.dueDate - originalGoal.startDate;
      start = new Date();
      start.setUTCHours(0, 0, 0, 0);
      due = new Date(start);
      due.setTime(start.getTime() + duration);
    }

    if (isNaN(start.getTime()) || isNaN(due.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format',
      });
    }

    if (due < start) {
      return res.status(400).json({
        success: false,
        error: 'Due date must be after start date',
      });
    }

    // Create duplicated goal
    const duplicatedGoal = new Goal({
      user_id: userId,
      title: title || `${originalGoal.title} (Copy)`,
      description: originalGoal.description,
      startDate: start,
      dueDate: due,
      priority: originalGoal.priority,
      category: originalGoal.category,
      status: 'active', // Always start as active
      progress: 0, // Reset progress
    });

    await duplicatedGoal.save();

    // Duplicate steps (Deep Copy)
    if (originalSteps.length > 0) {
      const stepsToCreate = originalSteps.map((originalStep, index) => {
        // Calculate new step due date maintaining relative timing
        const originalStepDate = originalStep.dueDate || originalGoal.startDate;
        const relativeDays = Math.floor((originalStepDate - originalGoal.startDate) / (1000 * 60 * 60 * 24));
        const newStepDueDate = new Date(start);
        newStepDueDate.setUTCDate(newStepDueDate.getUTCDate() + relativeDays);

        return {
          goal_id: duplicatedGoal._id,
          title: originalStep.title,
          dueDate: newStepDueDate,
          is_completed: false, // Reset completion status
        };
      });

      await Step.insertMany(stepsToCreate);
    }

    // Fetch the duplicated goal with steps
    const createdGoal = await Goal.findById(duplicatedGoal._id);
    const steps = await Step.find({ goal_id: duplicatedGoal._id });

    res.status(201).json({
      success: true,
      data: {
        goal: createdGoal,
        steps: steps,
      },
      message: 'Goal duplicated successfully',
    });
  } catch (error) {
    console.error('Error duplicating goal:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid goal ID',
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
      error: 'Failed to duplicate goal',
    });
  }
};

module.exports = {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  duplicateGoal,
};
