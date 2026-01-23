import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Goal {
  _id?: string;
  user_id: string;
  title: string;
  description?: string;
  startDate: string | Date;
  dueDate: string | Date;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  status: 'active' | 'completed' | 'abandoned';
  steps?: Array<{
    title: string;
    dueDate?: string | Date;
    is_completed: boolean;
  }>;
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalsResponse {
  success: boolean;
  count?: number;
  data: Goal[];
}

export interface GoalResponse {
  success: boolean;
  data: Goal;
}

@Injectable({
  providedIn: 'root'
})
export class GoalsService {
  private apiUrl = 'http://localhost:3000/api/goals';

  constructor(private http: HttpClient) {}

  getGoals(userId: string, filters?: { status?: string; priority?: string }): Observable<GoalsResponse> {
    let url = `${this.apiUrl}?user_id=${userId}`;
    if (filters?.status) url += `&status=${filters.status}`;
    if (filters?.priority) url += `&priority=${filters.priority}`;
    return this.http.get<GoalsResponse>(url);
  }

  getGoalById(id: string, userId: string): Observable<GoalResponse> {
    return this.http.get<GoalResponse>(`${this.apiUrl}/${id}?user_id=${userId}`);
  }

  createGoal(goal: Goal): Observable<GoalResponse> {
    return this.http.post<GoalResponse>(this.apiUrl, goal);
  }

  updateGoal(id: string, goal: Partial<Goal>): Observable<GoalResponse> {
    return this.http.put<GoalResponse>(`${this.apiUrl}/${id}`, goal);
  }

  deleteGoal(id: string, userId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}?user_id=${userId}`);
  }

  duplicateGoal(id: string, userId: string, options?: { title?: string; startDate?: string; dueDate?: string }): Observable<GoalResponse & { data: { goal: Goal; steps: any[] } }> {
    return this.http.post<GoalResponse & { data: { goal: Goal; steps: any[] } }>(`${this.apiUrl}/${id}/duplicate`, {
      user_id: userId,
      ...options
    });
  }
}
