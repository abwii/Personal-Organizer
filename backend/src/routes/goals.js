const express = require('express');
const router = express.Router();
const {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
} = require('../controllers/goalsController');

// GET /api/goals - Get all goals (with optional query params: ?status=active&priority=high)
router.get('/', getGoals);

// GET /api/goals/:id - Get a single goal by ID
router.get('/:id', getGoalById);

// POST /api/goals - Create a new goal
router.post('/', createGoal);

// PUT /api/goals/:id - Update a goal
router.put('/:id', updateGoal);

// DELETE /api/goals/:id - Delete a goal
router.delete('/:id', deleteGoal);

module.exports = router;
