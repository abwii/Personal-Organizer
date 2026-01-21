import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardData {
  completed_goals_count: number;
  best_streak: number;
  habits_today: Array<{
    _id: string;
    title: string;
    description?: string;
    category?: string;
    current_streak: number;
    best_streak: number;
    weekly_completion_rate: number;
    is_completed_today: boolean;
  }>;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api/dashboard';

  constructor(private http: HttpClient) {}

  getDashboard(userId: string): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}`);
  }
}
