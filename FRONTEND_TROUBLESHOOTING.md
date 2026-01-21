# Frontend Troubleshooting Guide

## Problème : Rien ne s'affiche sur http://localhost:4200

### Étapes de diagnostic :

1. **Vérifier que les conteneurs sont en cours d'exécution :**
   ```bash
   docker compose ps
   ```
   Vous devriez voir `personal-organizer-frontend` avec le statut "Up"

2. **Vérifier les logs du frontend :**
   ```bash
   docker compose logs frontend
   ```
   Recherchez des erreurs comme :
   - "Cannot find module"
   - "EADDRINUSE" (port déjà utilisé)
   - Erreurs de compilation TypeScript

3. **Redémarrer le frontend :**
   ```bash
   docker compose restart frontend
   ```
   Attendez 30-60 secondes pour qu'Angular compile

4. **Vérifier que le port 4200 est accessible :**
   ```bash
   curl http://localhost:4200
   ```
   Vous devriez voir du HTML

5. **Rebuild complet si nécessaire :**
   ```bash
   docker compose down
   docker compose up -d --build frontend
   ```

### Solutions courantes :

**Problème : "Cannot find module '@angular/...'"**
- Solution : Les dépendances ne sont pas installées
  ```bash
  docker compose exec frontend npm install
  docker compose restart frontend
  ```

**Problème : Port 4200 déjà utilisé**
- Solution : Arrêter le processus qui utilise le port ou changer le port dans `.env`

**Problème : Erreurs de compilation TypeScript**
- Vérifiez que tous les fichiers sont présents dans `frontend/src/`
- Vérifiez `tsconfig.json` et `angular.json`

**Problème : Page blanche dans le navigateur**
- Ouvrez la console du navigateur (F12) et vérifiez les erreurs
- Vérifiez que le backend est accessible sur http://localhost:3000
- Le frontend essaie de charger les données du dashboard depuis l'API

### Test manuel :

1. **Accéder directement au conteneur :**
   ```bash
   docker compose exec frontend sh
   ```
   Puis à l'intérieur :
   ```bash
   npm start
   ```
   Cela vous montrera les erreurs en temps réel

2. **Vérifier les fichiers :**
   Assurez-vous que ces fichiers existent :
   - `frontend/src/main.ts`
   - `frontend/src/app/app.module.ts`
   - `frontend/src/app/app.component.ts`
   - `frontend/src/app/app.component.html`
   - `frontend/angular.json`
   - `frontend/tsconfig.json`

### Si rien ne fonctionne :

Lancez le frontend localement (sans Docker) :
```bash
cd frontend
npm install
npm start
```

Cela vous permettra de voir les erreurs directement dans le terminal.
