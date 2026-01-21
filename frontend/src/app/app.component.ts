import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface DashboardData {
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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Personal Organizer';
  dashboardData: DashboardData | null = null;
  loading = true;
  error: string | null = null;
  apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    // For demo purposes, using a test user_id
    // In production, this would come from authentication
    const testUserId = '507f1f77bcf86cd799439011';
    
    this.loading = true;
    this.error = null;

    this.http.get<{ success: boolean; data: DashboardData }>(
      `${this.apiUrl}/api/dashboard?user_id=${testUserId}`
    ).subscribe({
      next: (response) => {
        this.dashboardData = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard data. Make sure the backend is running on http://localhost:3000';
        this.loading = false;
        console.error('Error loading dashboard:', err);
      }
    });
  }

  toggleHabitCompletion(habit: DashboardData['habits_today'][0]) {
    // This would call the API to log the habit completion
    console.log('Toggle habit:', habit);
    // TODO: Implement habit logging API call
  }
}
