import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GoalProgression {
  id: string;
  title: string;
  category: string;
  startDate: string;
  dueDate: string;
  currentProgress: number;
  expectedProgress: number;
  status: 'active' | 'completed' | 'abandoned';
  priority: 'low' | 'medium' | 'high';
}

export interface HabitHeatmapEntry {
  date: string; // YYYY-MM-DD format
  count: number;
}

export interface CategoryGoalStats {
  total: number;
  completed: number;
  active: number;
  abandoned: number;
  successRate: number;
}

export interface CategoryHabitStats {
  total: number;
  active: number;
  archived: number;
  averageStreak: number;
  averageWeeklyCompletion: number;
}

export interface CategoryStats {
  goals: { [category: string]: CategoryGoalStats };
  habits: { [category: string]: CategoryHabitStats };
}

export interface StatsData {
  goalProgression: GoalProgression[];
  habitHeatmap: HabitHeatmapEntry[];
  categoryStats: CategoryStats;
}

export interface StatsResponse {
  success: boolean;
  data: StatsData;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = 'http://localhost:3000/api/stats';

  constructor(private http: HttpClient) {}

  getStats(userId: string): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.apiUrl}?user_id=${userId}`);
  }
}
