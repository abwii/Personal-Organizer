# Guide d'utilisation de l'API Stats

## Service Angular créé

Le service `StatsService` est disponible dans `src/app/services/stats.service.ts`

## Utilisation basique

### 1. Importer le service dans votre composant

```typescript
import { StatsService, StatsData } from '../../services/stats.service';
import { AuthService } from '../../services/auth.service';

constructor(
  private statsService: StatsService,
  private authService: AuthService
) {}
```

### 2. Charger les données

```typescript
loadStats() {
  const userId = this.authService.getCurrentUserId();
  
  this.statsService.getStats(userId).subscribe({
    next: (response) => {
      const statsData = response.data;
      
      // statsData.goalProgression - pour les graphiques de progression
      // statsData.habitHeatmap - pour la heatmap calendrier
      // statsData.categoryStats - pour les statistiques par catégorie
    },
    error: (err) => {
      console.error('Error loading stats:', err);
    }
  });
}
```

## Structure des données

### Goal Progression
```typescript
statsData.goalProgression = [
  {
    id: "...",
    title: "Goal title",
    category: "Health",
    startDate: "2024-01-01T00:00:00.000Z",
    dueDate: "2024-12-31T00:00:00.000Z",
    currentProgress: 50,      // Progression actuelle (0-100)
    expectedProgress: 45,      // Progression attendue basée sur les dates
    status: "active",
    priority: "high"
  }
]
```

**Utilisation avec Chart.js/Recharts/ApexCharts:**
- Créer un graphique en barres comparant `currentProgress` vs `expectedProgress`
- Grouper par `category` pour des graphiques multiples
- Filtrer par `status` ou `priority` si nécessaire

### Habit Heatmap
```typescript
statsData.habitHeatmap = [
  { date: "2024-01-15", count: 3 },
  { date: "2024-01-16", count: 2 },
  // ... jusqu'à 365 jours
]
```

**Utilisation pour Heatmap:**
- Format de date: `YYYY-MM-DD` (prêt pour parsing)
- `count` représente le nombre d'habitudes complétées ce jour
- Utiliser une librairie comme `react-calendar-heatmap` ou créer un calendrier personnalisé
- Colorer les jours selon `count` (0 = gris, 1-2 = vert clair, 3+ = vert foncé)

### Category Statistics
```typescript
statsData.categoryStats = {
  goals: {
    "Health": {
      total: 5,
      completed: 2,
      active: 3,
      abandoned: 0,
      successRate: 40  // (completed / total) * 100
    }
  },
  habits: {
    "Health": {
      total: 3,
      active: 3,
      archived: 0,
      averageStreak: 8,
      averageWeeklyCompletion: 85
    }
  }
}
```

**Utilisation:**
- Créer des graphiques en secteurs (pie charts) pour les catégories
- Afficher les taux de réussite par catégorie
- Comparer les moyennes de streaks entre catégories

## Exemple complet dans un composant

```typescript
import { Component, OnInit } from '@angular/core';
import { StatsService, StatsData } from '../../services/stats.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-my-stats',
  templateUrl: './my-stats.component.html'
})
export class MyStatsComponent implements OnInit {
  statsData: StatsData | null = null;
  loading = true;

  constructor(
    private statsService: StatsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    const userId = this.authService.getCurrentUserId();
    
    this.statsService.getStats(userId).subscribe({
      next: (response) => {
        this.statsData = response.data;
        this.loading = false;
        
        // Exemple: préparer les données pour Chart.js
        this.prepareChartData();
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
      }
    });
  }

  prepareChartData() {
    if (!this.statsData) return;
    
    // Exemple pour Chart.js
    const goalLabels = this.statsData.goalProgression.map(g => g.title);
    const currentProgress = this.statsData.goalProgression.map(g => g.currentProgress);
    const expectedProgress = this.statsData.goalProgression.map(g => g.expectedProgress);
    
    // Utiliser ces données avec votre librairie de graphiques
  }
}
```

## Installation d'une librairie de graphiques

### Option 1: Chart.js
```bash
npm install chart.js
npm install ng2-charts  # Wrapper Angular pour Chart.js
```

### Option 2: Recharts (si vous utilisez React, mais peut être adapté)
```bash
npm install recharts
```

### Option 3: ApexCharts
```bash
npm install apexcharts
npm install ng-apexcharts  # Wrapper Angular
```

## Endpoint API

**URL:** `GET http://localhost:3000/api/stats?user_id=<userId>`

**Réponse:**
```json
{
  "success": true,
  "data": {
    "goalProgression": [...],
    "habitHeatmap": [...],
    "categoryStats": {...}
  }
}
```

## Composant exemple créé

Un composant exemple `StatsComponent` a été créé dans:
- `src/app/components/stats/stats.component.ts`
- `src/app/components/stats/stats.component.html`
- `src/app/components/stats/stats.component.css`

Pour l'utiliser, ajoutez-le au module et à la route (voir instructions ci-dessous).
