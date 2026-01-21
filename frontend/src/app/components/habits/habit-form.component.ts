import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { HabitsService, Habit } from '../../services/habits.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-habit-form',
  templateUrl: './habit-form.component.html',
  styleUrls: ['./habit-form.component.css']
})
export class HabitFormComponent implements OnInit {
  @Input() habit: Habit | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  formData: Partial<Habit> = {
    title: '',
    description: '',
    frequency: 'daily',
    category: '',
    status: 'active'
  };

  error: string | null = null;
  loading = false;

  constructor(
    private habitsService: HabitsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.habit) {
      // Edit mode
      this.formData = {
        title: this.habit.title,
        description: this.habit.description || '',
        frequency: this.habit.frequency,
        category: this.habit.category || '',
        status: this.habit.status
      };
    }
  }

  onSubmit() {
    if (!this.formData.title) {
      this.error = 'Title is required';
      return;
    }

    this.loading = true;
    this.error = null;

    const habitData: Habit = {
      user_id: this.authService.getCurrentUserId(),
      title: this.formData.title!,
      description: this.formData.description,
      frequency: this.formData.frequency || 'daily',
      category: this.formData.category,
      status: this.formData.status || 'active'
    };

    const operation = this.habit
      ? this.habitsService.updateHabit(this.habit._id!, habitData)
      : this.habitsService.createHabit(habitData);

    operation.subscribe({
      next: () => {
        this.loading = false;
        this.saved.emit();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to save habit';
        console.error('Error saving habit:', err);
      }
    });
  }

  onCancel() {
    this.cancelled.emit();
  }
}
