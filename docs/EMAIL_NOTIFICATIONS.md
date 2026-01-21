# Documentation du Système de Notifications par Email

Ce document explique le fonctionnement technique et l'architecture du système de notifications automatisées mis en place pour l'application "Personal Organizer".

## Architecture

Le système repose sur deux librairies principales :

- **Nodemailer** : Pour l'envoi des emails.
- **Node-cron** : Pour la planification des tâches récurrentes (cron jobs).

### Composants

1.  **Service Mail (`backend/src/services/mail.service.js`)**
    - Responsable de la configuration du transporteur SMTP.
    - En environnement de développement, il utilise **Ethereal Email** pour générer des comptes de test à la volée. Cela permet de visualiser les emails envoyés sans les envoyer réellement à de vraies adresses.
    - Expose la fonction `sendEmail(to, subject, html)`.

2.  **Gestionnaire de Tâches (`backend/src/cron/cron.jobs.js`)**
    - Initialise et planifie les tâches récurrentes.
    - Contient la logique métier pour récupérer les données (actuellement via des fonctions simulées `getTasksWithUpcomingDeadlines` et `getUncheckedHabits`).
    - Charge les templates HTML et injecte les données dynamiques.

3.  **Templates (`backend/src/templates/`)**
    - `deadline-reminder.html` : Modèle pour le rappel des deadlines (tâches dues dans 24h).
    - `habit-recap.html` : Modèle pour le récapitulatif journalier des habitudes non cochées.

## Fonctionnement des Tâches (Cron Jobs)

### 1. Rappel de Deadline (`checkDeadlines`)

- **Fréquence** : Toutes les heures (`0 * * * *`).
- **Action** :
  1.  Vérifie s'il y a des objectifs dont la deadline est exactement dans 24 heures.
  2.  Si oui, génère le contenu HTML à partir du template.
  3.  Envoie un email à l'utilisateur.

### 2. Récapitulatif des Habitudes (`sendHabitRecap`)

- **Fréquence** : Tous les jours à 20h00 (`0 20 * * *`).
- **Action** :
  1.  Récupère la liste des habitudes qui n'ont pas encore été validées pour la journée en cours.
  2.  Si des habitudes sont trouvées, génère le contenu HTML.
  3.  Envoie un email de rappel/motivation.

## Guide d'Utilisation et Test

### Démarrage

Le système s'initialise automatiquement au lancement du serveur backend :

```bash
npm start
```

### Vérification des Emails (Développement)

Puisque nous utilisons Ethereal Email :

1.  Regardez les logs de la console au démarrage pour voir les identifiants générés :
    ```text
    Mail Service Initialized
    Ethereal Email Credentials: ...
    ```
2.  Lorsque qu'une tâche s'exécute et envoie un email, un lien de prévisualisation est affiché dans la console :
    ```text
    Message sent: <id...>
    Preview URL: https://ethereal.email/message/...
    ```
3.  Cliquez sur ce lien pour voir le rendu de l'email dans votre navigateur.

### Tester Manuellement

Pour forcer l'exécution des tâches sans attendre l'heure programmée, vous pouvez :

- Soit décommenter les appels de fonction à la fin de `backend/src/cron/cron.jobs.js` dans `initCronJobs`.
- Soit créer un script temporaire qui importe et exécute `checkDeadlines()` ou `sendHabitRecap()`.
