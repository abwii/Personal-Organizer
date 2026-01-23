const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getDashboard } = require('../controllers/dashboardController');

// Documentation Swagger

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Vue d'ensemble et statistiques utilisateur
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Obtenir les données du tableau de bord
 *     description: Récupère les statistiques globales (objectifs complétés, meilleur streak) et la liste des habitudes à faire aujourd'hui.
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur (Temporaire, sera remplacé par le token)
 *     responses:
 *       200:
 *         description: Données récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     completed_goals_count:
 *                       type: integer
 *                       example: 12
 *                     best_streak:
 *                       type: integer
 *                       example: 7
 *                     habits_today:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             example: "Faire du sport"
 *                           is_completed_today:
 *                             type: boolean
 *                             example: false
 *       400:
 *         description: ID utilisateur manquant
 */
// GET /api/dashboard - Get dashboard aggregated data
router.get('/', authMiddleware, getDashboard);

module.exports = router;
