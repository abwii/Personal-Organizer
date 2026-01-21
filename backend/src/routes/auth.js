const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const usersController = require("../controllers/usersController");
const authMiddleware = require("../middlewares/jwt");

// Routes d'authentification
router.post("/register", authController.register);
router.post("/login", authController.login);

// Routes utilisateur (protégées)
router.get("/me", authMiddleware.verifyUser, usersController.getUserInfos);
router.put("/me", authMiddleware.verifyUser, usersController.updateUserInfos);

module.exports = router;
