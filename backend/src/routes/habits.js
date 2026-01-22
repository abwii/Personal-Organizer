const express = require("express");
const router = express.Router();
const {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  logHabit,
  unlogHabit,
} = require("../controllers/habitsController");

/**
 * @swagger
 * tags:
 *   name: Habits
 *   description: Gestion des habitudes quotidiennes et suivi
 */

/**
 * @swagger
 * /api/habits:
 *   get:
 *     summary: Lister les habitudes
 *     tags: [Habits]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, archived] }
 *       - in: query
 *         name: frequency
 *         schema: { type: string, enum: [daily, weekly] }
 *     responses:
 *       200:
 *         description: Liste des habitudes
 *   post:
 *     summary: Créer une nouvelle habitude
 *     tags: [Habits]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, user_id]
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "65a1b2c3d4e5f6g7h8i9j0k1"
 *               title:
 *                 type: string
 *                 example: "Boire 2L d'eau"
 *               description:
 *                 type: string
 *                 example: "Une bouteille le matin, une l'après-midi"
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly]
 *                 default: daily
 *               category:
 *                 type: string
 *                 example: "Santé"
 *     responses:
 *       201:
 *         description: Habitude créée
 */
// GET /api/habits - Get all habits (with optional query params: ?status=active&frequency=daily)
router.get("/", getHabits);

/**
 * @swagger
 * /api/habits/{id}:
 *   get:
 *     summary: Obtenir une habitude par ID
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Détails de l'habitude
 *   put:
 *     summary: Mettre à jour une habitude
 *     tags: [Habits]
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
 *               status:
 *                 type: string
 *                 enum: [active, archived]
 *     responses:
 *       200:
 *         description: Habitude mise à jour
 *   delete:
 *     summary: Supprimer une habitude
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Habitude supprimée
 */
// GET /api/habits/:id - Get a single habit by ID
router.get("/:id", getHabitById);

// POST /api/habits - Create a new habit
router.post("/", createHabit);

// PUT /api/habits/:id - Update a habit
router.put("/:id", updateHabit);

/**
 * @swagger
 * /api/habits/{id}/log:
 *   post:
 *     summary: Cocher une habitude pour une date donnée
 *     tags: [Habits]
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
 *               date:
 *                 type: string
 *                 format: date
 *                 description: "Date de réalisation (YYYY-MM-DD). Défaut: aujourd'hui."
 *                 example: "2024-01-22"
 *               user_id:
 *                 type: string
 *                 example: "65a1b2c3d4e5f6g7h8i9j0k1"
 *     responses:
 *       201:
 *         description: Habitude cochée (log créé)
 *   delete:
 *     summary: Décocher une habitude (supprimer le log)
 *     tags: [Habits]
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
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-22"
 *               user_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Log supprimé (habitude décochée)
 */
// POST /api/habits/:id/log - Log a habit completion for a specific date
router.post("/:id/log", logHabit);

// DELETE /api/habits/:id/log - Remove a habit log for a specific date
router.delete("/:id/log", unlogHabit);

// DELETE /api/habits/:id - Delete a habit
router.delete("/:id", deleteHabit);

module.exports = router;
