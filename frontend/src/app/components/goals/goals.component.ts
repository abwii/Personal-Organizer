import { Component, OnInit } from '@angular/core';
import { GoalsService, Goal } from '../../services/goals.service';
import { TemplatesService, GoalTemplate } from '../../services/templates.service';
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
  showTemplates = false;
  templates: GoalTemplate[] = [];
  loadingTemplates = false;

  constructor(
    private goalsService: GoalsService,
    private templatesService: TemplatesService,
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

  openTemplatesModal() {
    this.showTemplates = true;
    this.loadTemplates();
  }

  closeTemplatesModal() {
    this.showTemplates = false;
  }

  loadTemplates() {
    this.loadingTemplates = true;
    const userId = this.authService.getCurrentUserId();
    this.templatesService.getTemplates(userId).subscribe({
      next: (response) => {
        this.templates = response.data;
        this.loadingTemplates = false;
      },
      error: (err) => {
        this.error = 'Failed to load templates';
        this.loadingTemplates = false;
        console.error('Error loading templates:', err);
      }
    });
  }

  createGoalFromTemplate(template: GoalTemplate) {
    const userId = this.authService.getCurrentUserId();
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + (template.estimatedDuration || 30));

    this.templatesService.createGoalFromTemplate(template._id!, {
      user_id: userId,
      startDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
    }).subscribe({
      next: (response) => {
        this.closeTemplatesModal();
        this.loadGoals();
      },
      error: (err) => {
        this.error = 'Failed to create goal from template';
        console.error('Error creating goal from template:', err);
      }
    });
  }

  duplicateGoal(goal: Goal) {
    if (!goal._id) return;
    if (!confirm(`Duplicate "${goal.title}"?`)) return;

    const userId = this.authService.getCurrentUserId();
    const today = new Date();
    const duration = new Date(goal.dueDate).getTime() - new Date(goal.startDate).getTime();
    const newDueDate = new Date(today.getTime() + duration);

    this.goalsService.duplicateGoal(goal._id, userId, {
      startDate: today.toISOString().split('T')[0],
      dueDate: newDueDate.toISOString().split('T')[0],
    }).subscribe({
      next: () => {
        this.loadGoals();
      },
      error: (err) => {
        this.error = 'Failed to duplicate goal';
        console.error('Error duplicating goal:', err);
      }
    });
  }
}
