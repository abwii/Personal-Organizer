import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { HabitsService } from '../../services/habits.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dashboardData: any = null;
  loading = true;
  error: string | null = null;

  constructor(
    private dashboardService: DashboardService,
    private habitsService: HabitsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    const userId = this.authService.getCurrentUserId();
    this.loading = true;
    this.error = null;

    this.dashboardService.getDashboard(userId).subscribe({
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

  toggleHabitCompletion(habit: any) {
    if (!habit._id) return;

    const userId = this.authService.getCurrentUserId();
    const today = new Date().toISOString().split('T')[0];

    if (habit.is_completed_today) {
      // Already completed, do nothing (or could implement un-logging if needed)
      return;
    }

    this.habitsService.logHabit(habit._id, userId, today).subscribe({
      next: (response) => {
        // Update local state
        habit.is_completed_today = true;
        if (response.data.current_streak !== undefined) {
          habit.current_streak = response.data.current_streak;
        }
        if (response.data.best_streak !== undefined) {
          habit.best_streak = response.data.best_streak;
        }
        if (response.data.weekly_completion_rate !== undefined) {
          habit.weekly_completion_rate = response.data.weekly_completion_rate;
        }
        // Reload dashboard to get updated best_streak
        this.loadDashboard();
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to log habit completion';
        console.error('Error logging habit:', err);
      }
    });
  }
}
