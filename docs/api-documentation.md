# Documentation de l'API REST

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

| Méthode  | Endpoint     | Description                      | Corps de la requête / Params                                                                                                                    | Réponses             |
| :------- | :----------- | :------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- | :------------------- |
| **GET**  | `/api/goals` | Liste des objectifs avec filtres | Query Params: `?status=active&priority=high`                                                                                                    | 200 (Array of Goals) |
| **POST** | `/api/goals` | Créer un objectif                | `{ "title": "Marathon", "description": "42km", "start_date": "2023-01-01", "deadline": "2023-06-01", "priority": "high", "category": "Santé" }` | 201 (Created)        |
| **GET**  | `/api/goals  |
