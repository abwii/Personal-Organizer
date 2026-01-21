import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { GoalsService, Goal } from '../../services/goals.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-goal-form',
  templateUrl: './goal-form.component.html',
  styleUrls: ['./goal-form.component.css']
})
export class GoalFormComponent implements OnInit {
  @Input() goal: Goal | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  formData: Partial<Goal> = {
    title: '',
    description: '',
    startDate: '',
    dueDate: '',
    priority: 'medium',
    category: '',
    status: 'active',
    steps: []
  };

  error: string | null = null;
  loading = false;

  constructor(
    private goalsService: GoalsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.goal) {
      // Edit mode
      this.formData = {
        title: this.goal.title,
        description: this.goal.description || '',
        startDate: this.formatDate(this.goal.startDate),
        dueDate: this.formatDate(this.goal.dueDate),
        priority: this.goal.priority,
        category: this.goal.category || '',
        status: this.goal.status,
        steps: this.goal.steps || []
      };
    }
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit() {
    if (!this.formData.title || !this.formData.startDate || !this.formData.dueDate) {
      this.error = 'Title, start date, and due date are required';
      return;
    }

    this.loading = true;
    this.error = null;

    const goalData: Goal = {
      user_id: this.authService.getCurrentUserId(),
      title: this.formData.title!,
      description: this.formData.description,
      startDate: this.formData.startDate as string,
      dueDate: this.formData.dueDate as string,
      priority: this.formData.priority || 'medium',
      category: this.formData.category,
      status: this.formData.status || 'active',
      steps: this.formData.steps || []
    };

    const operation = this.goal
      ? this.goalsService.updateGoal(this.goal._id!, goalData)
      : this.goalsService.createGoal(goalData);

    operation.subscribe({
      next: () => {
        this.loading = false;
        this.saved.emit();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to save goal';
        console.error('Error saving goal:', err);
      }
    });
  }

  onCancel() {
    this.cancelled.emit();
  }
}
