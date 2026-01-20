module.exports = {
  verifyUser: (data) => {
    //Vérifie si l'objet existe
    if (!data) {
      throw new Error("Aucune donnée envoyée");
    }

    const { name, email, password } = data;
    const errors = [];

    // --- VALIDATION NOM ---
    // Vérifie si name existe, est une string et n'est pas vide après nettoyage des espaces
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      errors.push("Le nom est obligatoire");
    }

    // --- VALIDATION EMAIL ---
    // Regex simple pour valider le format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push("L'email doit être une adresse valide");
    }

    // --- VALIDATION MOT DE PASSE ---
    if (!password || typeof password !== "string") {
      errors.push("Le mot de passe est requis");
    } else {
      if (password.length < 6) {
        errors.push("Le mot de passe doit faire au moins 6 caractères");
      }

      // Regex : Vérifie la présence d'au moins 1 Majuscule et 1 Chiffre
      const complexityRegex = /^(?=.*[A-Z])(?=.*[0-9])/;
      if (!complexityRegex.test(password)) {
        errors.push(
          "Le mot de passe doit contenir au moins une majuscule et un chiffre",
        );
      }
    }

    // --- RESULTAT ---
    // Si on a accumulé des erreurs, on lance l'exception
    if (errors.length > 0) {
      throw new Error(errors.join(". "));
    }
    return true;
  },
};
