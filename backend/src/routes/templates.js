const express = require("express");
const router = express.Router();
const {
  getTemplates,
  getTemplateById,
  createGoalFromTemplate,
} = require("../controllers/templatesController");

/**
 * @swagger
 * tags:
 *   name: Templates
 *   description: Gestion des modèles d'objectifs prédéfinis
 */

/**
 * @swagger
 * /api/templates:
 *   get:
 *     summary: Lister tous les templates disponibles
 *     tags: [Templates]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des templates (système + utilisateur)
 */
router.get("/", getTemplates);

/**
 * @swagger
 * /api/templates/{id}:
 *   get:
 *     summary: Obtenir un template par son ID
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Détails du template
 *       404:
 *         description: Template non trouvé
 */
router.get("/:id", getTemplateById);

/**
 * @swagger
 * /api/templates/{id}/goals:
 *   post:
 *     summary: Créer un objectif depuis un template (copie automatique des étapes)
 *     tags: [Templates]
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
 *             required: [user_id]
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "65a1b2c3d4e5f6g7h8i9j0k1"
 *               title:
 *                 type: string
 *                 example: "Apprendre l'anglais"
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
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Objectif créé depuis le template avec ses étapes
 *       404:
 *         description: Template non trouvé
 */
router.post("/:id/goals", createGoalFromTemplate);

module.exports = router;
