const Joi = require('joi');

// Validation schema for creating a habit
const createHabitSchema = Joi.object({
  title: Joi.string().required().trim().max(200).messages({
    'string.empty': 'Title is required',
    'string.max': 'Title must not exceed 200 characters',
  }),
  description: Joi.string().allow('').trim().max(1000).optional().messages({
    'string.max': 'Description must not exceed 1000 characters',
  }),
  frequency: Joi.string().valid('daily', 'weekly', 'monthly').default('daily').messages({
    'any.only': 'Frequency must be one of: daily, weekly, monthly',
  }),
  category: Joi.string().allow('').trim().max(50).optional().messages({
    'string.max': 'Category must not exceed 50 characters',
  }),
  status: Joi.string().valid('active', 'archived').default('active').messages({
    'any.only': 'Status must be one of: active, archived',
  }),
}).unknown(true); // Allow additional fields like user_id

// Validation schema for updating a habit
const updateHabitSchema = Joi.object({
  title: Joi.string().trim().max(200).optional().messages({
    'string.max': 'Title must not exceed 200 characters',
  }),
  description: Joi.string().allow('').trim().max(1000).optional().messages({
    'string.max': 'Description must not exceed 1000 characters',
  }),
  frequency: Joi.string().valid('daily', 'weekly', 'monthly').optional().messages({
    'any.only': 'Frequency must be one of: daily, weekly, monthly',
  }),
  category: Joi.string().allow('').trim().max(50).optional().messages({
    'string.max': 'Category must not exceed 50 characters',
  }),
  status: Joi.string().valid('active', 'archived').optional().messages({
    'any.only': 'Status must be one of: active, archived',
  }),
}).min(1).unknown(true).messages({
  'object.min': 'At least one field must be provided for update',
});

// Validation schema for logging a habit
const logHabitSchema = Joi.object({
  date: Joi.alternatives().try(
    Joi.date(),
    Joi.string().isoDate()
  ).optional().messages({
    'date.base': 'Date must be a valid date',
  }),
  user_id: Joi.string().optional(),
});

// Validation schema for query parameters
const getHabitsQuerySchema = Joi.object({
  status: Joi.string().valid('active', 'archived').optional(),
  frequency: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
  user_id: Joi.string().optional(),
});

// Middleware to validate request body
const validateCreateHabit = (req, res, next) => {
  const { error, value } = createHabitSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => detail.message),
    });
  }
  req.body = value;
  next();
};

const validateUpdateHabit = (req, res, next) => {
  const { error, value } = updateHabitSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => detail.message),
    });
  }
  req.body = value;
  next();
};

const validateLogHabit = (req, res, next) => {
  const { error, value } = logHabitSchema.validate(req.body, { abortEarly: false, convert: true });
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: error.details.map(detail => detail.message),
    });
  }
  // Convert date string to Date object if needed
  if (value.date && typeof value.date === 'string') {
    value.date = new Date(value.date);
  }
  req.body = value;
  next();
};

const validateGetHabitsQuery = (req, res, next) => {
  const { error, value } = getHabitsQuerySchema.validate(req.query, { abortEarly: false });
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
  validateCreateHabit,
  validateUpdateHabit,
  validateLogHabit,
  validateGetHabitsQuery,
};
