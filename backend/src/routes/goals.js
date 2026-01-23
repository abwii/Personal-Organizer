const express = require('express');
const router = express.Router();
const {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goalsController');
const {
  validateCreateGoal,
  validateUpdateGoal,
  validateGetGoalsQuery,
} = require('../validators/goalValidator');

// GET /api/goals - Get all goals (with optional query params: ?status=active&priority=high)
router.get('/', validateGetGoalsQuery, getGoals);

// GET /api/goals/:id - Get a single goal by ID
router.get('/:id', getGoalById);

// POST /api/goals - Create a new goal
router.post('/', validateCreateGoal, createGoal);

// PUT /api/goals/:id - Update a goal
router.put('/:id', validateUpdateGoal, updateGoal);

// DELETE /api/goals/:id - Delete a goal
router.delete('/:id', deleteGoal);

// Step Routes
const {
  getSteps,
  createStep,
  updateStep,
  deleteStep,
} = require('../controllers/stepsController');

router.get('/:id/steps', getSteps);
router.post('/:id/steps', createStep);
router.put('/:id/steps/:stepId', updateStep);
router.delete('/:id/steps/:stepId', deleteStep);

module.exports = router;
