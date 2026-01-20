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

### 1) Infrastructure & CI/CD
- Démarrage complet via `docker-compose up`
- `docker-compose.yml` incluant **backend**, **frontend** et **base de données**
- Pipeline **GitHub Actions** pour exécuter **tests** + **lint**
- Fichiers de base du projet :
  - `README.md`
  - `.env.example`

### 2) Authentification (Users)
- Inscription (email + mot de passe)
- Connexion avec émission d’un **token (JWT)**
- Mots de passe **hashés** en base
- Consultation et modification du profil utilisateur

### 3) Gestion des Objectifs (Goals)
- CRUD complet : création / lecture / modification / suppression
- Champs : titre, description, dates, priorité, catégorie
- Validation : **date d’échéance > date de début**
- Liste avec filtres (statut, priorité)
- Statuts : “Complété” / “Abandonné” (au minimum)

### 4) Étapes & Progression (Steps)
- Ajout d’étapes à un objectif (titre, échéance)
- Marquer une étape “fait” met à jour l’objectif parent
- Progression calculée : `(étapes complétées / total étapes) * 100`
- Affichage d’une barre de progression

### 5) Habitudes & Tracking (Habits)
- CRUD des habitudes
- Fréquence : Quotidienne / Hebdomadaire
- Interface “Calendrier” ou “Grille” pour cocher les jours
- Anti double comptage : une seule complétion par date
- Archivage d’une habitude sans perdre l’historique
- Stockage des dates en **UTC** (gestion fuseaux horaires)

### 6) Streaks (Séries)
- Calcul du streak actuel basé sur les jours consécutifs complétés
- Prend en compte “aujourd’hui” (si fait) ou “hier” pour être actif
- Jour manqué → streak actuel = 0
- Conservation du **meilleur streak**

### 7) Dashboard MVP
- Vue d’ensemble :
  - nombre d’objectifs complétés
  - meilleur streak
- Liste des habitudes à faire aujourd’hui + validation rapide
- Feedback visuel immédiat à la complétion (couleur / animation)
- Interface responsive (mobile/desktop)

---

## 🚀 Getting Started

### Prérequis

- Docker et Docker Compose installés
- Git

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
   
   Éditez le fichier `.env` et modifiez les valeurs selon vos besoins (notamment les mots de passe et secrets).

3. **Lancer l'application**
   ```bash
   docker compose up
   ```
   
   Ou en mode détaché :
   ```bash
   docker compose up -d
   ```

### URLs et Ports

Une fois l'application démarrée, vous pouvez accéder à :

- **Frontend** : http://localhost:4200 (mode développement)
- **Backend API** : http://localhost:3000
- **MongoDB** : localhost:27017

### Commandes utiles

- **Arrêter l'application** : `docker compose down`
- **Voir les logs** : `docker compose logs -f`
- **Rebuild les images** : `docker compose build`
- **Mode production** : `docker compose -f docker-compose.prod.yml up`

### CI/CD

Le projet utilise GitHub Actions pour exécuter automatiquement :

- **Lint** : Vérification du code avec ESLint (backend et frontend)
- **Tests** : Exécution des tests Jest

Le workflow CI s'exécute automatiquement sur :
- Push vers `main` ou `develop`
- Pull requests vers `main` ou `develop`

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
├── backend/          # API Node.js + Express.js
│   ├── src/          # Code source
│   ├── Dockerfile    # Image production
│   └── Dockerfile.dev # Image développement
├── frontend/         # Application Angular
│   ├── src/          # Code source
│   ├── Dockerfile    # Image production
│   └── Dockerfile.dev # Image développement
├── docker-compose.yml        # Configuration dev
├── docker-compose.prod.yml  # Configuration production
├── .env.example      # Template variables d'environnement
└── .github/
    └── workflows/
        └── ci.yml    # Pipeline CI/CD
```

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
