const Step = require('../models/Step');
const Goal = require('../models/Goal');
const { calculateProgress } = require('../utils/goalUtils');

// GET /api/goals/:id/steps - Get all steps for a goal
const getSteps = async (req, res) => {
  try {
    const { id } = req.params;
    const steps = await Step.find({ goal_id: id }).sort({ createdAt: 1 });
    
    res.status(200).json({
      success: true,
      count: steps.length,
      data: steps,
    });
  } catch (error) {
    console.error('Error fetching steps:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch steps',
    });
  }
};

// POST /api/goals/:id/steps - Add a step to a goal
const createStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required',
      });
    }

    const step = new Step({
      goal_id: id,
      title,
      dueDate,
    });

    await step.save();

    // Update goal progress
    await updateGoalProgress(id);

    res.status(201).json({
      success: true,
      data: step,
    });
  } catch (error) {
    console.error('Error creating step:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create step',
    });
  }
};

// PUT /api/goals/:id/steps/:stepId - Update a step
const updateStep = async (req, res) => {
  try {
    const { id, stepId } = req.params;
    const { title, dueDate, is_completed } = req.body;

    const step = await Step.findOne({ _id: stepId, goal_id: id });

    if (!step) {
      return res.status(404).json({
        success: false,
        error: 'Step not found',
      });
    }

    if (title !== undefined) step.title = title;
    if (dueDate !== undefined) step.dueDate = dueDate;
    if (is_completed !== undefined) step.is_completed = is_completed;

    await step.save();

    // Update goal progress
    await updateGoalProgress(id);

    res.status(200).json({
      success: true,
      data: step,
    });
  } catch (error) {
    console.error('Error updating step:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update step',
    });
  }
};

// DELETE /api/goals/:id/steps/:stepId - Delete a step
const deleteStep = async (req, res) => {
  try {
    const { id, stepId } = req.params;

    const step = await Step.findOneAndDelete({ _id: stepId, goal_id: id });

    if (!step) {
      return res.status(404).json({
        success: false,
        error: 'Step not found',
      });
    }

    // Update goal progress
    await updateGoalProgress(id);

    res.status(200).json({
      success: true,
      message: 'Step deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting step:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete step',
    });
  }
};

// Helper function to update goal progress
const updateGoalProgress = async (goalId) => {
  const steps = await Step.find({ goal_id: goalId });
  const progress = calculateProgress(steps);
  await Goal.findByIdAndUpdate(goalId, { progress });
};

module.exports = {
  getSteps,
  createStep,
  updateStep,
  deleteStep,
};
