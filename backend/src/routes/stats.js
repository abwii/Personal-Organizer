const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/statsController');

// GET /api/stats - Get statistics data for charts and visualizations
router.get('/', getStats);

module.exports = router;
