const express = require('express');
const router = express.Router();
const {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabit,
  unlogHabit,
} = require('../controllers/habitsController');
const {
  validateCreateHabit,
  validateUpdateHabit,
  validateLogHabit,
  validateGetHabitsQuery,
} = require('../validators/habitValidator');

// GET /api/habits - Get all habits (with optional query params: ?status=active&frequency=daily)
router.get('/', validateGetHabitsQuery, getHabits);

// GET /api/habits/:id - Get a single habit by ID
router.get('/:id', getHabitById);

// POST /api/habits - Create a new habit
router.post('/', validateCreateHabit, createHabit);

// PUT /api/habits/:id - Update a habit
router.put('/:id', validateUpdateHabit, updateHabit);

// POST /api/habits/:id/log - Log a habit completion for a specific date
router.post('/:id/log', validateLogHabit, logHabit);

// DELETE /api/habits/:id/log - Remove a habit log for a specific date
router.delete('/:id/log', unlogHabit);

// DELETE /api/habits/:id - Delete a habit
router.delete('/:id', deleteHabit);

module.exports = router;
