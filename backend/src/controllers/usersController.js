const UserModel = require("../models/User");
const bcrypt = require("bcryptjs");

module.exports = {
  // GET /me : Voir son profil
  getUserInfos: async (req, res) => {
    try {
      // On récupère l'ID depuis le middleware d'auth (req.user._id)
      // On utilise .select("-password") pour ne jamais renvoyer le mot de passe
      const user = await UserModel.findById(req.user.id).select("-password");

      if (!user) {
        return res.status(404).send({ message: "Utilisateur introuvable" });
      }

      res.send(user);
    } catch (error) {
      res.status(500).send({ message: "Erreur serveur" });
    }
  },

  // PUT /me : Modifier son profil
  updateUserInfos: async (req, res) => {
    try {
      // 1. On récupère les champs autorisés à la modification
      const { name, email, password } = req.body;
      const updates = {};

      if (name) updates.name = name;

      // 2. (Optionnel) Vérifier si l'email est déjà pris par un AUTRE utilisateur
      if (email) {
        const existingUser = await UserModel.findOne({ email });
        // Si un user a cet email ET que ce n'est pas moi
        if (existingUser && existingUser._id.toString() !== req.user.id) {
          return res
            .status(400)
            .send({ message: "Cet email est déjà utilisé." });
        }
        updates.email = email;
      }

      // 3. Si un mot de passe est fourni, on le hashe avant la mise à jour
      if (password) {
        updates.password = await bcrypt.hash(password, 10);
      }

      // Mise à jour
      // { new: true } permet de renvoyer l'objet modifié
      // { runValidators: true } applique les validations du Schema
      const updatedUser = await UserModel.findByIdAndUpdate(
        req.user.id,
        updates,
        { new: true, runValidators: true },
      ).select("-password");

      res.send(updatedUser);
    } catch (error) {
      res
        .status(500)
        .send({ message: error.message || "Erreur lors de la mise à jour" });
    }
  },
};
