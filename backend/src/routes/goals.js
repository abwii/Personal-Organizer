const express = require("express");
const router = express.Router();
const {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  duplicateGoal,
} = require('../controllers/goalsController');
const {
  validateCreateGoal,
  validateUpdateGoal,
  validateGetGoalsQuery,
} = require('../validators/goalValidator');

/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: Gestion des objectifs à long terme
 */

/**
 * @swagger
 * /api/goals:
 *   get:
 *     summary: Lister les objectifs
 *     tags: [Goals]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, completed, abandoned] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [low, medium, high] }
 *     responses:
 *       200:
 *         description: Liste des objectifs récupérée
 *   post:
 *     summary: Créer un nouvel objectif
 *     tags: [Goals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, startDate, dueDate, user_id]
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "65a1b2c3d4e5f6g7h8i9j0k1"
 *               title:
 *                 type: string
 *                 example: "Apprendre le piano"
 *               description:
 *                 type: string
 *                 example: "Maîtriser la Lettre à Élise"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-01"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-06-30"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: "high"
 *               category:
 *                 type: string
 *                 example: "Loisirs"
 *     responses:
 *       201:
 *         description: Objectif créé
 */
// GET /api/goals - Get all goals (with optional query params: ?status=active&priority=high)
router.get('/', validateGetGoalsQuery, getGoals);

/**
 * @swagger
 * /api/goals/{id}:
 *   get:
 *     summary: Obtenir un objectif par son ID
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Détails de l'objectif
 *       404:
 *         description: Objectif non trouvé
 *   put:
 *     summary: Mettre à jour un objectif
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Apprendre le piano (Avancé)"
 *               status:
 *                 type: string
 *                 enum: [active, completed, abandoned]
 *                 example: "completed"
 *               progress:
 *                 type: integer
 *                 example: 100
 *     responses:
 *       200:
 *         description: Objectif mis à jour
 *   delete:
 *     summary: Supprimer un objectif
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Objectif supprimé
 */
// GET /api/goals/:id - Get a single goal by ID
router.get("/:id", getGoalById);

// POST /api/goals - Create a new goal
router.post('/', validateCreateGoal, createGoal);

// PUT /api/goals/:id - Update a goal
router.put('/:id', validateUpdateGoal, updateGoal);

// DELETE /api/goals/:id - Delete a goal
router.delete("/:id", deleteGoal);

/**
 * @swagger
 * /api/goals/{id}/duplicate:
 *   post:
 *     summary: Dupliquer un objectif avec ses étapes (Deep Copy)
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id]
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "65a1b2c3d4e5f6g7h8i9j0k1"
 *               title:
 *                 type: string
 *                 example: "Apprendre le piano (Copy)"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-02-01"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-07-31"
 *     responses:
 *       201:
 *         description: Objectif dupliqué avec succès (inclut les étapes)
 *       404:
 *         description: Objectif non trouvé
 */
// POST /api/goals/:id/duplicate - Duplicate a goal with its steps
router.post("/:id/duplicate", duplicateGoal);

// Step Routes
const {
  getSteps,
  createStep,
  updateStep,
  deleteStep,
} = require("../controllers/stepsController");

/**
 * @swagger
 * /api/goals/{id}/steps:
 *   get:
 *     summary: Lister les étapes d'un objectif
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'objectif parent
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des étapes
 *   post:
 *     summary: Ajouter une étape à un objectif
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Acheter une méthode de piano"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-05"
 *     responses:
 *       201:
 *         description: Étape créée
 */
router.get("/:id/steps", getSteps);
router.post("/:id/steps", createStep);

/**
 * @swagger
 * /api/goals/{id}/steps/{stepId}:
 *   put:
 *     summary: "Mettre à jour une étape (ex: marquer comme faite)"
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'objectif
 *         schema:
 *           type: string
 *       - in: path
 *         name: stepId
 *         required: true
 *         description: ID de l'étape
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               is_completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Étape mise à jour
 *   delete:
 *     summary: Supprimer une étape
 *     tags: [Goals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Étape supprimée
 */
router.put("/:id/steps/:stepId", updateStep);
router.delete("/:id/steps/:stepId", deleteStep);

module.exports = router;
