const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
} = require('../validators/authValidator');

// Routes d'authentification

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Gestion de l'authentification utilisateur
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@gmail.com"
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: "Password@123!"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides ou email déjà utilisé
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Password@123!"
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne le token JWT
 *       401:
 *         description: Email ou mot de passe incorrect
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion utilisateur
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post("/logout", authController.logout);

// Routes utilisateur (protégées)

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations du profil
 *       401:
 *         description: Non autorisé (Token manquant ou invalide)
 *   put:
 *     summary: Mettre à jour le profil
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@gmail.com"
 *               password:
 *                 type: string
 *                 example: "NewPassword@123!"
 *     responses:
 *       200:
 *         description: Profil mis à jour
 */
router.get("/me", authMiddleware, usersController.getUserInfos);
router.put("/me", authMiddleware, usersController.updateUserInfos);

module.exports = router;
