import { Component, OnInit } from '@angular/core';
import { HabitsService, Habit } from '../../services/habits.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-habits',
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css']
})
export class HabitsComponent implements OnInit {
  habits: Habit[] = [];
  loading = true;
  error: string | null = null;
  showForm = false;
  editingHabit: Habit | null = null;
  filterStatus: string = '';
  filterFrequency: string = '';

  constructor(
    private habitsService: HabitsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadHabits();
  }

  loadHabits() {
    this.loading = true;
    this.error = null;
    const userId = this.authService.getCurrentUserId();
    const filters: any = {};
    if (this.filterStatus) filters.status = this.filterStatus;
    if (this.filterFrequency) filters.frequency = this.filterFrequency;

    this.habitsService.getHabits(userId, filters).subscribe({
      next: (response) => {
        this.habits = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load habits';
        this.loading = false;
        console.error('Error loading habits:', err);
      }
    });
  }

  openCreateForm() {
    this.editingHabit = null;
    this.showForm = true;
  }

  openEditForm(habit: Habit) {
    this.editingHabit = { ...habit };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingHabit = null;
  }

  onHabitSaved() {
    this.closeForm();
    this.loadHabits();
  }

  deleteHabit(habit: Habit) {
    if (!habit._id) return;
    if (!confirm(`Are you sure you want to delete "${habit.title}"?`)) return;

    const userId = this.authService.getCurrentUserId();
    this.habitsService.deleteHabit(habit._id, userId).subscribe({
      next: () => {
        this.loadHabits();
      },
      error: (err) => {
        this.error = 'Failed to delete habit';
        console.error('Error deleting habit:', err);
      }
    });
  }

  applyFilters() {
    this.loadHabits();
  }

  clearFilters() {
    this.filterStatus = '';
    this.filterFrequency = '';
    this.loadHabits();
  }
}
