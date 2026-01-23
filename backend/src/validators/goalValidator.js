const Joi = require('joi');

// Validation schema for creating a goal
const createGoalSchema = Joi.object({
  title: Joi.string().required().trim().max(200).messages({
    'string.empty': 'Title is required',
    'string.max': 'Title must not exceed 200 characters',
  }),
  description: Joi.string().allow('').trim().max(1000).optional().messages({
    'string.max': 'Description must not exceed 1000 characters',
  }),
  startDate: Joi.alternatives().try(
    Joi.date(),
    Joi.string().isoDate()
  ).required().messages({
    'date.base': 'Start date must be a valid date',
    'any.required': 'Start date is required',
  }),
  dueDate: Joi.alternatives().try(
    Joi.date(),
    Joi.string().isoDate()
  ).required().messages({
    'date.base': 'Due date must be a valid date',
    'any.required': 'Due date is required',
  }),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium').messages({
    'any.only': 'Priority must be one of: low, medium, high',
  }),
  category: Joi.string().allow('').trim().max(50).optional().messages({
    'string.max': 'Category must not exceed 50 characters',
  }),
  status: Joi.string().valid('active', 'completed', 'abandoned').default('active').messages({
    'any.only': 'Status must be one of: active, completed, abandoned',
  }),
  progress: Joi.number().integer().min(0).max(100).default(0).optional().messages({
    'number.min': 'Progress must be at least 0',
    'number.max': 'Progress must be at most 100',
  }),
}).unknown(true); // Allow additional fields like user_id

// Validation schema for updating a goal
const updateGoalSchema = Joi.object({
  title: Joi.string().trim().max(200).optional().messages({
    'string.max': 'Title must not exceed 200 characters',
  }),
  description: Joi.string().allow('').trim().max(1000).optional().messages({
    'string.max': 'Description must not exceed 1000 characters',
  }),
  startDate: Joi.alternatives().try(
    Joi.date(),
    Joi.string().isoDate()
  ).optional().messages({
    'date.base': 'Start date must be a valid date',
  }),
  dueDate: Joi.alternatives().try(
    Joi.date(),
    Joi.string().isoDate()
  ).optional().messages({
    'date.base': 'Due date must be a valid date',
  }),
  priority: Joi.string().valid('low', 'medium', 'high').optional().messages({
    'any.only': 'Priority must be one of: low, medium, high',
  }),
  category: Joi.string().allow('').trim().max(50).optional().messages({
    'string.max': 'Category must not exceed 50 characters',
  }),
  status: Joi.string().valid('active', 'completed', 'abandoned').optional().messages({
    'any.only': 'Status must be one of: active, completed, abandoned',
  }),
  progress: Joi.number().integer().min(0).max(100).optional().messages({
    'number.min': 'Progress must be at least 0',
    'number.max': 'Progress must be at most 100',
  }),
}).min(1).unknown(true).messages({
  'object.min': 'At least one field must be provided for update',
});

// Validation schema for query parameters
const getGoalsQuerySchema = Joi.object({
  status: Joi.string().valid('active', 'completed', 'abandoned').optional(),
  priority: Joi.string().valid('low', 'medium', 'high').optional(),
  user_id: Joi.string().optional(),
});

// Middleware to validate request body
const validateCreateGoal = (req, res, next) => {
  const { error, value } = createGoalSchema.validate(req.body, { abortEarly: false, convert: true });
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => detail.message),
    });
  }
  // Convert date strings to Date objects if needed
  if (value.startDate && typeof value.startDate === 'string') {
    value.startDate = new Date(value.startDate);
  }
  if (value.dueDate && typeof value.dueDate === 'string') {
    value.dueDate = new Date(value.dueDate);
  }
  // Validate that dueDate is after startDate
  if (value.startDate && value.dueDate && value.dueDate <= value.startDate) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: ['Due date must be after start date'],
    });
  }
  req.body = value;
  next();
};

const validateUpdateGoal = (req, res, next) => {
  const { error, value } = updateGoalSchema.validate(req.body, { abortEarly: false, convert: true });
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => detail.message),
    });
  }
  // Convert date strings to Date objects if needed
  if (value.startDate && typeof value.startDate === 'string') {
    value.startDate = new Date(value.startDate);
  }
  if (value.dueDate && typeof value.dueDate === 'string') {
    value.dueDate = new Date(value.dueDate);
  }
  // Validate that dueDate is after startDate if both are provided
  if (value.startDate && value.dueDate && value.dueDate <= value.startDate) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: ['Due date must be after start date'],
    });
  }
  req.body = value;
  next();
};

const validateGetGoalsQuery = (req, res, next) => {
  const { error, value } = getGoalsQuerySchema.validate(req.query, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => detail.message),
    });
  }
  req.query = value;
  next();
};

module.exports = {
  validateCreateGoal,
  validateUpdateGoal,
  validateGetGoalsQuery,
};
