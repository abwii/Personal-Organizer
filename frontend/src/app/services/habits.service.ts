import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Habit {
  _id?: string;
  user_id: string;
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly';
  category?: string;
  status: 'active' | 'archived';
  current_streak?: number;
  best_streak?: number;
  weekly_completion_rate?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HabitLog {
  _id?: string;
  habit_id: string;
  date: string | Date;
  is_completed: boolean;
  createdAt?: string;
}

export interface HabitsResponse {
  success: boolean;
  count?: number;
  data: Habit[];
}

export interface HabitResponse {
  success: boolean;
  data: Habit | (HabitLog & { current_streak?: number; best_streak?: number; weekly_completion_rate?: number });
}

@Injectable({
  providedIn: 'root'
})
export class HabitsService {
  private apiUrl = 'http://localhost:3000/api/habits';

  constructor(private http: HttpClient) {}

  getHabits(userId: string, filters?: { status?: string; frequency?: string }): Observable<HabitsResponse> {
    let url = `${this.apiUrl}?user_id=${userId}`;
    if (filters?.status) url += `&status=${filters.status}`;
    if (filters?.frequency) url += `&frequency=${filters.frequency}`;
    return this.http.get<HabitsResponse>(url);
  }

  getHabitById(id: string, userId: string): Observable<HabitResponse> {
    return this.http.get<HabitResponse>(`${this.apiUrl}/${id}?user_id=${userId}`);
  }

  createHabit(habit: Habit): Observable<HabitResponse> {
    return this.http.post<HabitResponse>(this.apiUrl, habit);
  }

  updateHabit(id: string, habit: Partial<Habit>): Observable<HabitResponse> {
    return this.http.put<HabitResponse>(`${this.apiUrl}/${id}`, habit);
  }

  deleteHabit(id: string, userId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}?user_id=${userId}`);
  }

  logHabit(id: string, userId: string, date?: string): Observable<HabitResponse> {
    const body: any = { user_id: userId };
    if (date) body.date = date;
    return this.http.post<HabitResponse>(`${this.apiUrl}/${id}/log`, body);
  }
}
