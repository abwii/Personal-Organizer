const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getDashboard } = require('../controllers/dashboardController');

// GET /api/dashboard - Get dashboard aggregated data
router.get('/', authMiddleware, getDashboard);

module.exports = router;
