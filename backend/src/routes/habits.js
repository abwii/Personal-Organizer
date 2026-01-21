const express = require('express');
const router = express.Router();
const {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabit,
} = require('../controllers/habitsController');

// GET /api/habits - Get all habits (with optional query params: ?status=active&frequency=daily)
router.get('/', getHabits);

// GET /api/habits/:id - Get a single habit by ID
router.get('/:id', getHabitById);

// POST /api/habits - Create a new habit
router.post('/', createHabit);

// PUT /api/habits/:id - Update a habit
router.put('/:id', updateHabit);

// DELETE /api/habits/:id - Delete a habit
router.delete('/:id', deleteHabit);

// POST /api/habits/:id/log - Log a habit completion for a specific date
router.post('/:id/log', logHabit);

module.exports = router;
