const GoalTemplate = require('../models/GoalTemplate');
const Goal = require('../models/Goal');
const Step = require('../models/Step');

// GET /api/templates - Get all templates (system + user's templates)
const getTemplates = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user_id;
    
    // Get system templates and user's custom templates
    const filter = {
      $or: [
        { isSystem: true },
        ...(userId ? [{ createdBy: userId }] : [])
      ]
    };

    const templates = await GoalTemplate.find(filter).sort({ 
      isSystem: -1, // System templates first
      createdAt: -1 
    });

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates',
    });
  }
};

// GET /api/templates/:id - Get a single template by ID
const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.query.user_id;

    const template = await GoalTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    // Check if user can access this template (system or own)
    if (!template.isSystem && template.createdBy?.toString() !== userId?.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid template ID',
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template',
    });
  }
};

// POST /api/templates/:id/goals - Create a goal from a template
const createGoalFromTemplate = async (req, res) => {
  try {
    const { id: templateId } = req.params;
    const {
      user_id,
      startDate,
      dueDate,
      title, // Optional: override template name
      priority, // Optional: override template priority
      category, // Optional: override template category
    } = req.body;

    const userId = req.user?.id || user_id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required',
      });
    }

    // Get template
    const template = await GoalTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found',
      });
    }

    // Check access
    if (!template.isSystem && template.createdBy?.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Calculate dates if not provided
    let start, due;
    if (startDate && dueDate) {
      start = new Date(startDate);
      due = new Date(dueDate);
    } else {
      // Default: start today, end after estimatedDuration days
      start = new Date();
      start.setUTCHours(0, 0, 0, 0);
      due = new Date(start);
      due.setUTCDate(due.getUTCDate() + (template.estimatedDuration || 30));
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

    // Create goal from template
    const goal = new Goal({
      user_id: userId,
      title: title || template.name,
      description: template.description,
      startDate: start,
      dueDate: due,
      priority: priority || template.priority,
      category: category || template.category,
      status: 'active',
      progress: 0,
    });

    await goal.save();

    // Create steps from template steps (Deep Copy)
    if (template.steps && template.steps.length > 0) {
      const stepsToCreate = template.steps
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((templateStep, index) => {
          // Calculate step due date based on goal dates and step order
          const stepDueDate = new Date(start);
          const totalDays = Math.max(1, Math.floor((due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
          const daysPerStep = Math.max(1, Math.floor(totalDays / template.steps.length));
          const daysOffset = daysPerStep * (index + 1);
          stepDueDate.setUTCDate(stepDueDate.getUTCDate() + daysOffset);
          
          // Ensure step due date doesn't exceed goal due date
          if (stepDueDate > due) {
            stepDueDate.setTime(due.getTime());
          }

          return {
            goal_id: goal._id,
            title: templateStep.title,
            dueDate: stepDueDate,
            is_completed: false,
          };
        });

      await Step.insertMany(stepsToCreate);
    }

    // Fetch the created goal with steps
    const createdGoal = await Goal.findById(goal._id);
    const steps = await Step.find({ goal_id: goal._id });

    res.status(201).json({
      success: true,
      data: {
        goal: createdGoal,
        steps: steps,
      },
      message: 'Goal created from template successfully',
    });
  } catch (error) {
    console.error('Error creating goal from template:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create goal from template',
    });
  }
};

module.exports = {
  getTemplates,
  getTemplateById,
  createGoalFromTemplate,
};
