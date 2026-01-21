const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route pour l'inscription
// URL finale : POST /api/users/register
router.post("/", authController.register);

// Route pour la connexion
// URL finale : POST /api/users/login
router.post("/login", authController.login);

module.exports = router;
