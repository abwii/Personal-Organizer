# Documentation de l'API REST - Personal Organizer

## 📍 Documentation Interactive (Swagger)

Une interface **Swagger UI** est disponible pour explorer et tester les endpoints directement depuis votre navigateur.

- **URL d'accès** : `http://localhost:3000/api-docs/`
- **Fonctionnalité** : Permet de voir les schémas de données et d'exécuter des requêtes (Try it out).

---

## 1. Authentification

Gestion des utilisateurs et de la sécurité.

| Méthode  | Endpoint             | Description                         | Corps de la requête (Body)                                                            | Réponses (Status)                    |
| :------- | :------------------- | :---------------------------------- | :------------------------------------------------------------------------------------ | :----------------------------------- |
| **POST** | `/api/auth/register` | Inscription d'un nouvel utilisateur | `{ "email": "user@example.com", "password": "securePass123", "name": "Jean Dupont" }` | 201 (Created), 400 (Bad Request)     |
| **POST** | `/api/auth/login`    | Connexion utilisateur               | `{ "email": "user@example.com", "password": "securePass123" }`                        | 200 (OK + Token), 401 (Unauthorized) |
| **POST** | `/api/auth/logout`   | Déconnexion                         | -                                                                                     | 200 (OK)                             |
| **GET**  | `/api/auth/me`       | Récupérer le profil connecté        | -                                                                                     | 200 (OK + User Object)               |
| **PUT**  | `/api/auth/me`       | Modifier le profil                  | `{ "name": "Nouveau Nom", "email": "new@example.com" }`                               | 200 (OK), 400 (Bad Request)          |

---

## 2. Gestion des Objectifs (Goals)

CRUD complet pour les objectifs.

| Méthode    | Endpoint                       | Description                      | Corps de la requête / Params                                                                                                                    | Réponses               |
| :--------- | :----------------------------- | :------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------- |
| **GET**    | `/api/goals`                   | Lister les objectifs             | Query Params: `?status=active&priority=high&user_id=userId`                                                                                     | 200 (Array of Goals)   |
| **POST**   | `/api/goals`                   | Créer un objectif                | `{ "title": "Marathon", "description": "42km", "start_date": "2023-01-01", "deadline": "2023-06-01", "priority": "high", "category": "Santé" }` | 201 (Created)          |
| **GET**    | `/api/goals/:id`               | Récupérer un objectif spécifique | Query Params: `?user_id=userId`                                                                                                                 | 200 (Goal Object), 404 |
| **PUT**    | `/api/goals/:id`               | Modifier un objectif             | `{ "title": "Nouveau titre", "status": "completed", "priority": "medium" }`                                                                     | 200 (OK), 404          |
| **DELETE** | `/api/goals/:id`               | Supprimer un objectif            | Query Params: `?user_id=userId`                                                                                                                 | 200 (OK), 404          |
| **POST**   | `/api/goals/:id/steps`         | Ajouter une étape à l'objectif   | `{ "title": "Étape 1", "description": "Première étape" }`                                                                                       | 201 (Created)          |
| **DELETE** | `/api/goals/:id/steps/:stepId` | Supprimer une étape              | -                                                                                                                                               | 200 (OK), 404          |
| **PUT**    | `/api/goals/:id/steps/:stepId` | Mettre à jour l'état d'une étape | `{ "is_completed": true }`                                                                                                                      | 200 (OK), 404          |

### Champs disponibles pour les objectifs

| Champ         | Type   | Description                         | Exemples               |
| :------------ | :----- | :---------------------------------- | :--------------------- |
| `title`       | String | Titre de l'objectif (requis)        | "Courir un marathon"   |
| `description` | String | Description détaillée               | "Préparer un marathon" |
| `start_date`  | Date   | Date de début (format ISO)          | "2024-01-01"           |
| `deadline`    | Date   | Date limite (format ISO)            | "2024-06-01"           |
| `priority`    | String | Priorité (low, medium, high)        | "high"                 |
| `category`    | String | Catégorie                           | "Santé", "Carrière"    |
| `status`      | String | État (active, completed, abandoned) | "active"               |
| `progress`    | Number | Progrès en pourcentage (0-100)      | 75                     |

---

## 3. Gestion des Habitudes (Habits)

CRUD et journalisation des habitudes.

| Méthode    | Endpoint              | Description                       | Corps de la requête / Params                                                                    | Réponses                |
| :--------- | :-------------------- | :-------------------------------- | :---------------------------------------------------------------------------------------------- | :---------------------- |
| **GET**    | `/api/habits`         | Lister les habitudes              | Query Params: `?status=active&frequency=daily&user_id=userId`                                   | 200 (Array of Habits)   |
| **POST**   | `/api/habits`         | Créer une habitude                | `{ "user_id": "userId", "title": "Méditation", "frequency": "daily", "category": "Bien-être" }` | 201 (Created)           |
| **GET**    | `/api/habits/:id`     | Récupérer une habitude spécifique | Query Params: `?user_id=userId`                                                                 | 200 (Habit Object), 404 |
| **PUT**    | `/api/habits/:id`     | Modifier une habitude             | `{ "title": "Nouvelle habitude", "status": "archived" }`                                        | 200 (OK), 404           |
| **DELETE** | `/api/habits/:id`     | Supprimer une habitude            | Query Params: `?user_id=userId`                                                                 | 200 (OK), 404           |
| **POST**   | `/api/habits/:id/log` | Enregistrer une complétude        | `{ "user_id": "userId", "date": "2024-01-15" }`                                                 | 201 (Created), 400      |
| **DELETE** | `/api/habits/:id/log` | Retirer un enregistrement de date | Query Params: `?user_id=userId&date=2024-01-15`                                                 | 200 (OK), 404           |

### Champs disponibles pour les habitudes

| Champ                    | Type   | Description                         | Exemples               |
| :----------------------- | :----- | :---------------------------------- | :--------------------- |
| `user_id`                | String | ID de l'utilisateur (requis)        | ObjectId               |
| `title`                  | String | Titre de l'habitude (requis)        | "Méditation"           |
| `description`            | String | Description détaillée               | "30 min de méditation" |
| `frequency`              | String | Fréquence (daily, weekly)           | "daily"                |
| `category`               | String | Catégorie                           | "Bien-être", "Sport"   |
| `status`                 | String | État (active, archived)             | "active"               |
| `current_streak`         | Number | Série actuelle de jours consécutifs | 5                      |
| `best_streak`            | Number | Meilleure série enregistrée         | 30                     |
| `weekly_completion_rate` | Number | Taux de complétude hebdomadaire (%) | 85                     |

### Détails du log d'habitude

| Champ                    | Type    | Description                           | Exemples     |
| :----------------------- | :------ | :------------------------------------ | :----------- |
| `habit_id`               | String  | ID de l'habitude (requis)             | ObjectId     |
| `date`                   | Date    | Date de l'enregistrement (UTC minuit) | "2024-01-15" |
| `is_completed`           | Boolean | État de complétude                    | true         |
| `current_streak`         | Number  | Série calculée après log (réponse)    | 5            |
| `best_streak`            | Number  | Meilleure série (réponse)             | 30           |
| `weekly_completion_rate` | Number  | Taux hebdomadaire (réponse)           | 85           |

**Remarques :**

- Le double enregistrement à la même date est **bloqué** (retourne 400)
- Les dates sont normalisées à **minuit UTC** pour éviter les problèmes de fuseau horaire
- Les streaks et taux sont recalculés automatiquement

---

## 4. Tableau de Bord (Dashboard)

Vues agrégées et statistiques utilisateur.

| Méthode | Endpoint         | Description                          | Corps de la requête / Params    | Réponses               |
| :------ | :--------------- | :----------------------------------- | :------------------------------ | :--------------------- |
| **GET** | `/api/dashboard` | Récupérer le tableau de bord complet | Query Params: `?user_id=userId` | 200 (Dashboard Object) |

### Structure du dashboard

```json
{
  "success": true,
  "data": {
    "user": { "id": "userId", "name": "Jean", "email": "jean@example.com" },
    "stats": {
      "total_goals": 10,
      "active_goals": 7,
      "completed_goals": 3,
      "total_habits": 15,
      "active_habits": 12,
      "archived_habits": 3
    },
    "recent_activity": [
      {
        "type": "goal",
        "action": "created",
        "title": "Marathon",
        "date": "2024-01-20"
      },
      {
        "type": "habit",
        "action": "logged",
        "title": "Méditation",
        "date": "2024-01-20"
      }
    ],
    "weekly_summary": {
      "habits_completed_this_week": 25,
      "goals_updated": 3,
      "average_streak": 5
    }
  }
}
```

---

## 5. Statistiques (Stats)

Analyses détaillées des performances et tendances.

| Méthode | Endpoint            | Description                          | Corps de la requête / Params                 | Réponses           |
| :------ | :------------------ | :----------------------------------- | :------------------------------------------- | :----------------- |
| **GET** | `/api/stats`        | Récupérer les statistiques générales | Query Params: `?user_id=userId&period=month` | 200 (Stats Object) |
| **GET** | `/api/stats/goals`  | Statistiques détaillées par objectif | Query Params: `?user_id=userId`              | 200 (Array)        |
| **GET** | `/api/stats/habits` | Statistiques détaillées par habitude | Query Params: `?user_id=userId`              | 200 (Array)        |

### Filtres disponibles

| Paramètre  | Type   | Description           | Valeurs possibles         |
| :--------- | :----- | :-------------------- | :------------------------ |
| `period`   | String | Période d'analyse     | "week", "month", "year"   |
| `category` | String | Filtrer par catégorie | "Santé", "Carrière", etc. |
| `status`   | String | Filtrer par statut    | "active", "completed"     |

### Structure des statistiques

```json
{
  "success": true,
  "data": {
    "period": "month",
    "date_range": { "start": "2024-01-01", "end": "2024-01-31" },
    "habits": {
      "total": 15,
      "completed_this_period": 120,
      "completion_rate": 85,
      "top_habits": [{ "title": "Méditation", "streak": 30, "completion": 95 }]
    },
    "goals": {
      "total": 10,
      "completed": 2,
      "in_progress": 7,
      "abandoned": 1,
      "average_progress": 65
    },
    "trends": [{ "date": "2024-01-01", "habits_done": 8, "goals_updated": 1 }]
  }
}
```

---

## 6. Utilisateurs (Users)

Gestion des profils utilisateur.

| Méthode    | Endpoint         | Description                     | Corps de la requête / Params                            | Réponses          |
| :--------- | :--------------- | :------------------------------ | :------------------------------------------------------ | :---------------- |
| **GET**    | `/api/users/:id` | Récupérer un profil utilisateur | -                                                       | 200 (User Object) |
| **PUT**    | `/api/users/:id` | Mettre à jour le profil         | `{ "name": "Nouveau", "email": "nouveau@example.com" }` | 200 (OK), 404     |
| **DELETE** | `/api/users/:id` | Supprimer le compte utilisateur | -                                                       | 200 (OK), 404     |

### Champs utilisateur

| Champ       | Type   | Description                   |
| :---------- | :----- | :---------------------------- |
| `id`        | String | ID unique (MongoDB ObjectId)  |
| `name`      | String | Nom complet                   |
| `email`     | String | Adresse email (unique)        |
| `password`  | String | Mot de passe hashé (bcrypt)   |
| `createdAt` | Date   | Date de création              |
| `updatedAt` | Date   | Date de dernière modification |

---

## 7. Codes d'erreur courants

| Code | Signification | Description                                |
| :--- | :------------ | :----------------------------------------- |
| 200  | OK            | Requête réussie                            |
| 201  | Created       | Ressource créée avec succès                |
| 400  | Bad Request   | Données invalides (date, champs manquants) |
| 401  | Unauthorized  | Authentification requise ou échouée        |
| 404  | Not Found     | Ressource non trouvée                      |
| 500  | Server Error  | Erreur serveur                             |

---

## 8. Format des réponses

### Réponse réussie (2xx)

```json
{
  "success": true,
  "data": {
    /* données */
  },
  "count": 10
}
```

### Réponse d'erreur (4xx, 5xx)

```json
{
  "success": false,
  "error": "Description de l'erreur"
}
```

---

## 9. Authentification (JWT)

Les requêtes protégées nécessitent un token JWT dans l'en-tête **Authorization** :

```http
Authorization: Bearer <token_jwt>
```

### Exemple de requête protégée

```bash
curl -X GET http://localhost:3000/api/goals \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json"
```

---

## 10. Exemples de requêtes (cURL)

### Créer un utilisateur

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "securePass123", "name": "Jean"}'
```

### Créer une habitude

```bash
curl -X POST http://localhost:3000/api/habits \
  -H "Content-Type: application/json" \
  -d '{"user_id": "userId", "title": "Méditation", "frequency": "daily", "category": "Bien-être"}'
```

### Enregistrer une complétude

```bash
curl -X POST http://localhost:3000/api/habits/habitId/log \
  -H "Content-Type: application/json" \
  -d '{"user_id": "userId", "date": "2024-01-15"}'
```

### Créer un objectif

```bash
curl -X POST http://localhost:3000/api/goals \
  -H "Content-Type: application/json" \
  -d '{"title": "Marathon", "description": "42km", "deadline": "2024-06-01", "priority": "high", "category": "Santé"}'
```

### Récupérer le dashboard

```bash
curl -X GET "http://localhost:3000/api/dashboard?user_id=userId" \
  -H "Content-Type: application/json"
```

### Récupérer les statistiques

```bash
curl -X GET "http://localhost:3000/api/stats?user_id=userId&period=month" \
  -H "Content-Type: application/json"
```

---

## Notes importantes

1. **Dates** : Tous les formats acceptent `YYYY-MM-DD` ou ISO 8601 (ex: `2024-01-15` ou `2024-01-15T14:30:00Z`)
2. **Habitudes** : Les logs sont stockés à **minuit UTC** pour éviter les problèmes de fuseau horaire
3. **Double comptage** : Impossible d'enregistrer deux fois la même habitude le même jour
4. **Streaks** : Calculés automatiquement sur les 7 derniers jours
5. **Validations** : Tous les champs requis sont validés côté serveur
6. **Pagination** : À implémenter (actuellement pas de limite)

---

**Dernière mise à jour** : 23 janvier 2026
