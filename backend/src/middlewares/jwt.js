const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

module.exports = {
  verifyUser: async (req, res, next) => {
    try {
      let token = req.headers["authorization"];

      // 1. Vérifie la présence du token
      if (!token) {
        return res.status(401).send({
          message: "Aucun token fourni",
        });
      }

      // 2. Nettoyage du format "Bearer <token>"
      // Si le header est juste "<token>", le replace ne fait rien de mal
      token = token.replace("Bearer ", "");

      // 3. Vérification du token
      // Si le token est expiré ou invalide, jwt.verify lance une erreur
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

      // 4. Vérifie si l'utilisateur existe toujours en base de données
      // (Sécurité : utile si l'user a été supprimé entre temps)
      const user = await UserModel.findById(decoded.userId);

      if (!user) {
        return res.status(401).send({
          message: "Utilisateur introuvable",
        });
      }

      // 5. Attache l'utilisateur à la requête
      req.user = user;

      next();
    } catch (error) {
      // 6. Gestion des erreurs JWT (expiration, signature invalide)
      return res.status(401).send({
        message: "Token invalide",
      });
    }
  },
};
