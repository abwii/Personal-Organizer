import { Component, OnInit } from '@angular/core';
import { GoalsService, Goal } from '../../services/goals.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  goals: Goal[] = [];
  loading = true;
  error: string | null = null;
  showForm = false;
  editingGoal: Goal | null = null;
  filterStatus: string = '';
  filterPriority: string = '';

  constructor(
    private goalsService: GoalsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadGoals();
  }

  loadGoals() {
    this.loading = true;
    this.error = null;
    const userId = this.authService.getCurrentUserId();
    const filters: any = {};
    if (this.filterStatus) filters.status = this.filterStatus;
    if (this.filterPriority) filters.priority = this.filterPriority;

    this.goalsService.getGoals(userId, filters).subscribe({
      next: (response) => {
        this.goals = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load goals';
        this.loading = false;
        console.error('Error loading goals:', err);
      }
    });
  }

  openCreateForm() {
    this.editingGoal = null;
    this.showForm = true;
  }

  openEditForm(goal: Goal) {
    this.editingGoal = { ...goal };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingGoal = null;
  }

  onGoalSaved() {
    this.closeForm();
    this.loadGoals();
  }

  deleteGoal(goal: Goal) {
    if (!goal._id) return;
    if (!confirm(`Are you sure you want to delete "${goal.title}"?`)) return;

    const userId = this.authService.getCurrentUserId();
    this.goalsService.deleteGoal(goal._id, userId).subscribe({
      next: () => {
        this.loadGoals();
      },
      error: (err) => {
        this.error = 'Failed to delete goal';
        console.error('Error deleting goal:', err);
      }
    });
  }

  applyFilters() {
    this.loadGoals();
  }

  clearFilters() {
    this.filterStatus = '';
    this.filterPriority = '';
    this.loadGoals();
  }
}
