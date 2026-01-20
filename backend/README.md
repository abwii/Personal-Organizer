# Backend - Personal Organizer

API backend construite avec Node.js et Express.js.

## Structure

```
backend/
├── src/
│   ├── index.js          # Point d'entrée de l'application
│   └── index.test.js     # Tests unitaires
├── Dockerfile            # Image Docker pour la production
├── Dockerfile.dev        # Image Docker pour le développement
├── package.json          # Dépendances et scripts
└── jest.config.js        # Configuration Jest
```

## Scripts disponibles

- `npm start` : Démarre le serveur en mode production
- `npm run dev` : Démarre le serveur en mode développement avec hot reload (nodemon)
- `npm test` : Exécute les tests Jest
- `npm run lint` : Vérifie le code avec ESLint

## Variables d'environnement

- `PORT` : Port du serveur (défaut: 3000)
- `MONGODB_URI` : URI de connexion à MongoDB
- `JWT_SECRET` : Secret pour la génération des tokens JWT
- `NODE_ENV` : Environnement (development, production, test)
