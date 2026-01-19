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
