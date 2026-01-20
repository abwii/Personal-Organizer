- [Wassim Bacha](https://github.com/abwii)
- [Jimmy LETTE VOUETO](https://github.com/jlette)
- [Christian MICLEA](https://github.com/MicleaChristian)

## Spécification technique de la Stack

### Versionnement
- Git/GitHub

### Gestion de projet
- GitHub Projects

### Communication
- Discord

### Conteneurisation
- Docker
- Docker-compose

### CI/CD
- GitHub Actions

### Tests
- Jest

### Linting
- EsLint

### Backend
- Node.js + Express.js

### Frontend
- Angular
- Tailwind CSS

### Base de données
- MongoDB

### Documentation API
- Swagger

### Design UI/UX
- Figma

### Emails de test
- [Ethereal Email](https://ethereal.email/)

---

## ✅ MVP — Fonctionnalités minimales (Phase 1)

L’objectif du MVP est de livrer une première version utilisable de l’application de gestion d’objectifs et d’habitudes.

### 1) Infrastructure & CI/CD ✅ COMPLÉTÉ
- ✅ Démarrage complet via `docker-compose up`
- ✅ `docker-compose.yml` incluant **backend**, **frontend** et **base de données**
- ✅ `docker-compose.prod.yml` pour la production
- ✅ Pipeline **GitHub Actions** pour exécuter **tests** + **lint**
- ✅ Fichiers de base du projet :
  - `README.md` (documentation complète)
  - `.env.example` (template des variables d'environnement)
  - Dockerfiles pour backend et frontend (dev + prod)

### 2) Authentification (Users) ⏳ EN COURS
- Inscription (email + mot de passe)
- Connexion avec émission d’un **token (JWT)**
- Mots de passe **hashés** en base
- ⏳ Consultation et modification du profil utilisateur - *Prévu*

**Note :** Actuellement, les endpoints Goals et Habits acceptent `user_id` en paramètre. L'intégration du middleware JWT remplacera cela automatiquement.

### 3) Gestion des Objectifs (Goals) ✅ COMPLÉTÉ
- CRUD complet : création / lecture / modification / suppression
- Champs : titre, description, dates, priorité, catégorie
- Validation : **date d’échéance > date de début**
- Liste avec filtres (statut, priorité)
- Statuts : “Complété” / “Abandonné” (au minimum)

### 4) Étapes & Progression (Steps) ⏳ À FAIRE
- Ajout d’étapes à un objectif (titre, échéance)
- Marquer une étape “fait” met à jour l’objectif parent
- Progression calculée : `(étapes complétées / total étapes) * 100`
- Affichage d’une barre de progression

### 5) Habitudes & Tracking (Habits) ✅ COMPLÉTÉ
- CRUD des habitudes
- Fréquence : Quotidienne / Hebdomadaire
- Interface “Calendrier” ou “Grille” pour cocher les jours
- Anti double comptage : une seule complétion par date
- Archivage d’une habitude sans perdre l’historique
- Stockage des dates en **UTC** (gestion fuseaux horaires)

### 6) Streaks (Séries) ⏳ À FAIRE
- Calcul du streak actuel basé sur les jours consécutifs complétés
- Prend en compte “aujourd’hui” (si fait) ou “hier” pour être actif
- Jour manqué → streak actuel = 0
- Conservation du **meilleur streak**

### 7) Dashboard MVP ⏳ À FAIRE
- Vue d’ensemble :
  - nombre d’objectifs complétés
  - meilleur streak
- Liste des habitudes à faire aujourd’hui + validation rapide
- Feedback visuel immédiat à la complétion (couleur / animation)
- Interface responsive (mobile/desktop)

---

## 🚀 Getting Started

### Prérequis

- **Docker** et **Docker Compose** installés
- **Git**
- **Node.js 18+** (pour développement local sans Docker)

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone <repository-url>
   cd Personal-Organizer
   ```

2. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   
   Éditez le fichier `.env` et modifiez les valeurs selon vos besoins :
   - `MONGO_INITDB_ROOT_PASSWORD` : Mot de passe MongoDB
   - `JWT_SECRET` : Secret pour les tokens JWT (à changer en production)
   - Ports si nécessaire (par défaut : Backend 3000, Frontend 4200, MongoDB 27017)

3. **Lancer l'application avec Docker Compose**
   ```bash
   docker compose up
   ```
   
   Ou en mode détaché :
   ```bash
   docker compose up -d
   ```

   La première fois, Docker va :
   - Télécharger les images nécessaires
   - Construire les images du backend et frontend
   - Démarrer MongoDB, le backend et le frontend

4. **Vérifier que tout fonctionne**
   ```bash
   # Vérifier le health check du backend
   curl http://localhost:3000/health
   
   # Vérifier les services
   docker compose ps
   ```

### Développement local (sans Docker)

Si vous préférez développer sans Docker :

**Backend :**
```bash
cd backend
npm install
# Créer un fichier .env avec MONGODB_URI pointant vers votre MongoDB local
npm run dev  # Démarre avec nodemon (hot reload)
```

**Frontend :**
```bash
cd frontend
npm install
npm start  # Démarre Angular en mode dev
```

### URLs et Ports

Une fois l'application démarrée, vous pouvez accéder à :

- **Frontend** : http://localhost:4200 (mode développement)
- **Backend API** : http://localhost:3000
  - Health check : http://localhost:3000/health
- **MongoDB** : localhost:27017

### Commandes utiles

**Docker Compose :**
- **Arrêter l'application** : `docker compose down`
- **Arrêter et supprimer les volumes** : `docker compose down -v`
- **Voir les logs** : `docker compose logs -f`
- **Voir les logs d'un service** : `docker compose logs -f backend`
- **Rebuild les images** : `docker compose build`
- **Rebuild sans cache** : `docker compose build --no-cache`
- **Mode production** : `docker compose -f docker-compose.prod.yml up`

**Développement Backend :**
```bash
cd backend
npm run dev      # Démarre avec hot reload
npm test         # Lance les tests
npm run lint     # Vérifie le code avec ESLint
npm run lint:fix # Corrige automatiquement les erreurs de lint
```

**Accès MongoDB :**
```bash
# Via Docker
docker exec -it personal-organizer-mongodb mongosh -u admin -p password

# Une fois connecté :
use personal-organizer
db.goals.find().pretty()
db.habits.find().pretty()
db.habitlogs.find().pretty()
```

### CI/CD

Le projet utilise **GitHub Actions** pour exécuter automatiquement :

- **Lint** : Vérification du code avec ESLint (backend et frontend)
- **Tests** : Exécution des tests Jest avec MongoDB en service

Le workflow CI (`.github/workflows/main.yml`) s'exécute automatiquement sur :
- Push vers `main` ou `develop`
- Pull requests vers `main` ou `develop`

**Jobs CI :**
- `backend-lint` : Vérifie le code backend avec ESLint
- `backend-test` : Lance les tests Jest avec MongoDB
- `frontend-lint` : Vérifie le code frontend (si présent)
- `frontend-test` : Lance les tests frontend (si présents)

Pour lancer les tests localement :

**Backend** :
```bash
cd backend
npm install
npm run lint
npm test
```

**Frontend** :
```bash
cd frontend
npm install
npm run lint
npm test
```

### Structure du projet

```
Personal-Organizer/
├── backend/                    # API Node.js + Express.js
│   ├── src/
│   │   ├── controllers/        # Contrôleurs (logique métier)
│   │   │   ├── goalsController.js
│   │   │   └── habitsController.js
│   │   ├── models/             # Modèles Mongoose
│   │   │   ├── Goal.js
│   │   │   ├── Habit.js
│   │   │   └── HabitLog.js
│   │   ├── routes/             # Routes Express
│   │   │   ├── goals.js
│   │   │   ├── goals.test.js
│   │   │   ├── habits.js
│   │   │   └── habits.test.js
│   │   ├── index.js            # Point d'entrée de l'application
│   │   └── index.test.js       # Tests de base
│   ├── .eslintrc.js            # Configuration ESLint
│   ├── jest.config.js          # Configuration Jest
│   ├── jest.setup.js           # Setup Jest (connexion MongoDB)
│   ├── Dockerfile              # Image production
│   ├── Dockerfile.dev          # Image développement
│   └── package.json
├── frontend/                   # Application Angular (placeholder)
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── package.json
├── docs/                       # Documentation
│   └── mld.pdf                 # Modèle de données
├── docker-compose.yml          # Configuration développement
├── docker-compose.prod.yml     # Configuration production
├── .env.example                # Template variables d'environnement
├── .github/
│   └── workflows/
│       └── main.yml            # Pipeline CI/CD GitHub Actions
└── README.md                   # Ce fichier
```

### Fonctionnalités implémentées

#### ✅ Goals (Objectifs) - CRUD Complet

**Modèle :**
- `user_id` : Référence à l'utilisateur
- `title` : Titre (requis, max 200 caractères)
- `description` : Description (max 1000 caractères)
- `startDate` : Date de début (requis)
- `dueDate` : Date d'échéance (requis)
- `priority` : Priorité (`low`, `medium`, `high`) - défaut: `medium`
- `category` : Catégorie (max 50 caractères)
- `status` : Statut (`active`, `completed`, `abandoned`) - défaut: `active`
- `timestamps` : `createdAt`, `updatedAt` (automatiques)

**Validation :**
- `dueDate` doit être après `startDate`
- ENUMs validés pour `priority` et `status`

**Endpoints API :**
- `GET /api/goals` - Liste tous les objectifs (filtres: `?status=active&priority=high&user_id=...`)
- `GET /api/goals/:id` - Récupère un objectif par ID
- `POST /api/goals` - Crée un nouvel objectif
- `PUT /api/goals/:id` - Met à jour un objectif
- `DELETE /api/goals/:id` - Supprime un objectif

**Exemple de requête POST :**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "title": "Apprendre TypeScript",
  "description": "Maîtriser TypeScript en 3 mois",
  "startDate": "2024-01-01",
  "dueDate": "2024-03-31",
  "priority": "high",
  "category": "Apprentissage",
  "status": "active"
}
```

#### ✅ Habits (Habitudes) - CRUD + Tracking

**Modèle Habit :**
- `user_id` : Référence à l'utilisateur
- `title` : Titre (requis, max 200 caractères)
- `description` : Description (max 1000 caractères)
- `frequency` : Fréquence (`daily`, `weekly`) - défaut: `daily`
- `category` : Catégorie (max 50 caractères)
- `status` : Statut (`active`, `archived`) - défaut: `active`
- `timestamps` : `createdAt`, `updatedAt` (automatiques)

**Modèle HabitLog :**
- `habit_id` : Référence à l'habitude
- `date` : Date de complétion (normalisée à minuit UTC)
- `is_completed` : Booléen (défaut: `true`)
- Index unique `(habit_id, date)` pour éviter les doublons

**Fonctionnalités :**
- ✅ Anti-double comptage : une seule complétion par date
- ✅ Gestion UTC : dates normalisées à minuit UTC
- ✅ Archivage : possibilité d'archiver sans perdre l'historique
- ✅ Suppression en cascade : suppression des logs lors de la suppression d'une habitude

**Endpoints API :**
- `GET /api/habits` - Liste toutes les habitudes (filtres: `?status=active&frequency=daily&user_id=...`)
- `GET /api/habits/:id` - Récupère une habitude par ID
- `POST /api/habits` - Crée une nouvelle habitude
- `PUT /api/habits/:id` - Met à jour une habitude
- `DELETE /api/habits/:id` - Supprime une habitude (et ses logs)
- `POST /api/habits/:id/log` - Enregistre une complétion pour une date

**Exemple de requête POST (créer habitude) :**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "title": "Faire du sport",
  "description": "30 minutes de sport quotidien",
  "frequency": "daily",
  "category": "Santé",
  "status": "active"
}
```

**Exemple de requête POST (logger complétion) :**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "date": "2024-01-15"
}
```
Si `date` n'est pas fournie, utilise la date du jour (minuit UTC).

#### ⏳ En cours de développement

- **Authentification** : Inscription, connexion JWT (en cours par un collègue)
- **Steps** : Étapes et progression pour les objectifs
- **Streaks** : Calcul des séries consécutives pour les habitudes
- **Dashboard** : Vue d'ensemble avec statistiques

### Tests

Le projet utilise **Jest** et **Supertest** pour les tests d'intégration.

**Tests implémentés :**
- ✅ Tests Goals : CRUD complet, validation des dates, filtres
- ✅ Tests Habits : CRUD complet, logging, anti-double comptage, UTC

**Lancer les tests :**
```bash
cd backend
npm test
```

**Tests en mode watch :**
```bash
npm run test:watch
```

**Couverture des tests :**
- Routes Goals : ~15 tests
- Routes Habits : ~15 tests
- Health check : 1 test

### Troubleshooting

**Problème : Port déjà utilisé**
- Modifiez les ports dans le fichier `.env` (BACKEND_PORT, FRONTEND_PORT, MONGODB_PORT)

**Problème : MongoDB ne démarre pas**
- Vérifiez que le port 27017 n'est pas utilisé par une autre instance MongoDB
- Vérifiez les variables d'environnement MONGO_INITDB_ROOT_USERNAME et MONGO_INITDB_ROOT_PASSWORD

**Problème : Backend ne se connecte pas à MongoDB**
- Vérifiez que le service mongodb est démarré : `docker compose ps`
- Vérifiez les logs : `docker compose logs mongodb`
- Vérifiez la variable MONGODB_URI dans le fichier `.env`

**Problème : Hot reload ne fonctionne pas**
- Assurez-vous d'utiliser `docker-compose.yml` (mode dev) et non `docker-compose.prod.yml`
- Vérifiez que les volumes sont bien montés dans docker-compose.yml

**Problème : Tests échouent localement**
- Assurez-vous que MongoDB est accessible (via Docker ou local)
- Vérifiez la variable `MONGODB_URI` dans votre `.env`
- Les tests utilisent une base de données séparée (voir `jest.setup.js`)

**Problème : Erreur "user_id is required"**
- Actuellement, `user_id` doit être fourni manuellement dans les requêtes
- L'authentification JWT sera intégrée prochainement pour récupérer automatiquement `user_id`

### Accès à la base de données MongoDB

**Via Docker :**
```bash
docker exec -it personal-organizer-mongodb mongosh -u admin -p password
```

**Commandes MongoDB utiles :**
```javascript
// Se connecter à la base de données
use personal-organizer

// Lister les collections
show collections

// Voir tous les objectifs
db.goals.find().pretty()

// Voir toutes les habitudes
db.habits.find().pretty()

// Voir les logs d'habitudes
db.habitlogs.find().pretty()

// Compter les documents
db.goals.countDocuments()
db.habits.countDocuments()

// Rechercher par user_id
db.goals.find({ user_id: ObjectId("507f1f77bcf86cd799439011") })

// Supprimer tous les documents (attention !)
db.goals.deleteMany({})
db.habits.deleteMany({})
db.habitlogs.deleteMany({})
```

**Connexion depuis l'extérieur de Docker :**
```bash
mongosh "mongodb://admin:password@localhost:27017/personal-organizer?authSource=admin"
```

### Variables d'environnement

Le fichier `.env.example` contient toutes les variables nécessaires :

```ini
# Database Configuration
MONGODB_PORT=27017
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password
MONGO_INITDB_DATABASE=personal-organizer

# Backend Configuration
BACKEND_PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production

# Frontend Configuration
FRONTEND_PORT=4200

# MongoDB Connection String (for backend)
# MONGODB_URI=mongodb://admin:password@localhost:27017/personal-organizer?authSource=admin
```

**Note :** En mode Docker Compose, `MONGODB_URI` est automatiquement construite. Pour développement local, décommentez et ajustez la ligne `MONGODB_URI`.
