const mongoose = require("mongoose");
const GoalTemplate = require("../models/GoalTemplate");
require("dotenv").config();

const seedTemplates = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/personal-organizer",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("Connected to MongoDB");

    // Check if templates already exist
    const existingTemplates = await GoalTemplate.countDocuments({ isSystem: true });
    if (existingTemplates > 0) {
      console.log("Templates already seeded. Skipping...");
      await mongoose.connection.close();
      return;
    }

    const templates = [
      {
        name: "Apprendre une langue",
        description: "Maîtriser une nouvelle langue en suivant un parcours structuré",
        category: "Éducation",
        priority: "high",
        estimatedDuration: 180, // 6 months
        isSystem: true,
        steps: [
          { title: "Choisir la langue et définir l'objectif", order: 1 },
          { title: "Installer une application d'apprentissage (Duolingo, Babbel, etc.)", order: 2 },
          { title: "Étudier 30 minutes par jour pendant 1 mois", order: 3 },
          { title: "Rejoindre un groupe de conversation ou trouver un partenaire", order: 4 },
          { title: "Lire un livre simple dans la langue cible", order: 5 },
          { title: "Regarder des films/séries avec sous-titres", order: 6 },
          { title: "Avoir une conversation de 15 minutes avec un locuteur natif", order: 7 },
        ],
      },
      {
        name: "Perdre du poids",
        description: "Atteindre un poids santé grâce à une approche équilibrée",
        category: "Santé",
        priority: "high",
        estimatedDuration: 90, // 3 months
        isSystem: true,
        steps: [
          { title: "Consulter un médecin pour définir un objectif réaliste", order: 1 },
          { title: "Calculer son apport calorique quotidien", order: 2 },
          { title: "Établir un plan d'exercice (3x par semaine minimum)", order: 3 },
          { title: "Tenir un journal alimentaire pendant 2 semaines", order: 4 },
          { title: "Réduire les aliments transformés et sucres ajoutés", order: 5 },
          { title: "Augmenter la consommation de légumes et protéines", order: 6 },
          { title: "Peser et mesurer les progrès chaque semaine", order: 7 },
        ],
      },
      {
        name: "Créer une application web",
        description: "Développer une application web complète de A à Z",
        category: "Développement",
        priority: "medium",
        estimatedDuration: 120, // 4 months
        isSystem: true,
        steps: [
          { title: "Définir le concept et les fonctionnalités principales", order: 1 },
          { title: "Créer les maquettes et le design", order: 2 },
          { title: "Configurer l'environnement de développement", order: 3 },
          { title: "Développer le backend (API, base de données)", order: 4 },
          { title: "Développer le frontend (interface utilisateur)", order: 5 },
          { title: "Implémenter l'authentification et la sécurité", order: 6 },
          { title: "Tester l'application (tests unitaires et d'intégration)", order: 7 },
          { title: "Déployer l'application en production", order: 8 },
        ],
      },
      {
        name: "Lire 12 livres par an",
        description: "Cultiver l'habitude de lecture régulière",
        category: "Culture",
        priority: "low",
        estimatedDuration: 365, // 1 year
        isSystem: true,
        steps: [
          { title: "Créer une liste de 12 livres à lire", order: 1 },
          { title: "Réserver 30 minutes de lecture par jour", order: 2 },
          { title: "Lire le premier livre", order: 3 },
          { title: "Tenir un journal de lecture avec notes", order: 4 },
          { title: "Rejoindre un club de lecture ou partager ses lectures", order: 5 },
          { title: "Lire 6 livres (milieu de l'année)", order: 6 },
          { title: "Lire les 12 livres et faire un bilan", order: 7 },
        ],
      },
      {
        name: "Apprendre à jouer d'un instrument",
        description: "Maîtriser les bases d'un instrument de musique",
        category: "Loisirs",
        priority: "medium",
        estimatedDuration: 90, // 3 months
        isSystem: true,
        steps: [
          { title: "Choisir l'instrument et l'acquérir", order: 1 },
          { title: "Trouver un professeur ou des ressources en ligne", order: 2 },
          { title: "Apprendre les bases (posture, notes, accords)", order: 3 },
          { title: "Pratiquer 30 minutes par jour pendant 1 mois", order: 4 },
          { title: "Apprendre une première chanson simple", order: 5 },
          { title: "Maîtriser 3 chansons différentes", order: 6 },
          { title: "Jouer devant un public (amis/famille)", order: 7 },
        ],
      },
    ];

    await GoalTemplate.insertMany(templates);
    console.log(`✅ Seeded ${templates.length} goal templates`);

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error seeding templates:", error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  seedTemplates();
}

module.exports = seedTemplates;
