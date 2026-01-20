const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyUser } = require("../validator/user");

module.exports = {
  // POST /register
  register: async (req, res) => {
    try {
      verifyUser(req.body);
      const { name, email, password } = req.body;

      // Vérifie si l'email existe avant de hasher pour gagner du temps CPU
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).send({ message: "Cet email est déjà utilisé" });
      }

      const hash = await bcrypt.hash(password, 10);
      const newUser = new UserModel({
        name,
        email,
        password: hash,
      });

      await newUser.save();

      res.status(201).send({
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      });
    } catch (error) {
      res.status(400).send({
        message: error.message || "Impossible d'enregistrer l'utilisateur",
      });
    }
  },

  // POST /login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Recherche de l'utilisateur
      const user = await UserModel.findOne({ email });

      // Vérification existence
      if (!user) {
        // return pour arrêter le script ici
        return res.status(401).send({
          message: "Email ou mot de passe incorrect", // Message vague par sécurité
        });
      }

      // Vérification du mot de passe
      const checkPassword = await bcrypt.compare(password, user.password);

      if (!checkPassword) {
        return res.status(401).send({
          message: "Email ou mot de passe incorrect",
        });
      }

      // Si tout est bon : Génération du Token
      //
      const jwtOptions = {
        expiresIn: process.env.JWT_TIMEOUT_DURATION || "1h",
      };
      const secret = process.env.JWT_SECRET || "secret";

      const token = jwt.sign({ userId: user._id }, secret, jwtOptions);

      // 5. Réponse
      res.send({
        message: "Connexion réussie",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          token: token,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: "Erreur serveur lors de la connexion",
      });
    }
  },
};
