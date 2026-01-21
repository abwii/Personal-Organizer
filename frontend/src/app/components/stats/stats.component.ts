import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { StatsService, StatsData } from '../../services/stats.service';
import { AuthService } from '../../services/auth.service';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit, AfterViewInit {
  @ViewChild('goalProgressionChart') goalProgressionChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categorySuccessChart') categorySuccessChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('habitStreakChart') habitStreakChartRef!: ElementRef<HTMLCanvasElement>;

  statsData: StatsData | null = null;
  loading = true;
  error: string | null = null;

  // Chart instances
  goalProgressionChart: Chart<'bar'> | null = null;
  categorySuccessChart: Chart<'pie'> | null = null;
  habitStreakChart: Chart<'bar'> | null = null;

  // Chart.js configurations
  goalProgressionChartData: ChartData<'bar'> | null = null;
  goalProgressionChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Goal Progress: Current vs Expected'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  categorySuccessChartData: ChartData<'pie'> | null = null;
  categorySuccessChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
      title: {
        display: true,
        text: 'Success Rate by Category (Goals)'
      }
    }
  };

  habitStreakChartData: ChartData<'bar'> | null = null;
  habitStreakChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Average Streak by Category (Habits)'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Heatmap data
  heatmapData: Array<{ date: Date; count: number; intensity: number }> = [];
  heatmapMonths: string[] = [];
  heatmapDays: { [month: string]: Array<{ date: Date; count: number; intensity: number }> } = {};

  constructor(
    private statsService: StatsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  ngAfterViewInit() {
    // Charts will be created after data is loaded
  }

  loadStats() {
    const userId = this.authService.getCurrentUserId();
    this.loading = true;
    this.error = null;

    this.statsService.getStats(userId).subscribe({
      next: (response) => {
        this.statsData = response.data;
        this.prepareChartData();
        this.prepareHeatmapData();
        this.loading = false;
        // Create charts after view is ready
        setTimeout(() => {
          this.createCharts();
        }, 100);
      },
      error: (err) => {
        this.error = 'Failed to load statistics. Make sure the backend is running on http://localhost:3000';
        this.loading = false;
        console.error('Error loading stats:', err);
      }
    });
  }

  prepareChartData() {
    if (!this.statsData) return;

    // Goal Progression Chart
    const goalLabels = this.statsData.goalProgression.map(g => g.title);
    const currentProgress = this.statsData.goalProgression.map(g => g.currentProgress);
    const expectedProgress = this.statsData.goalProgression.map(g => g.expectedProgress);

    this.goalProgressionChartData = {
      labels: goalLabels,
      datasets: [
        {
          label: 'Current Progress',
          data: currentProgress,
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2
        },
        {
          label: 'Expected Progress',
          data: expectedProgress,
          backgroundColor: 'rgba(139, 92, 246, 0.6)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 2
        }
      ]
    };

    // Category Success Rate Chart (Goals)
    const goalCategories = this.getGoalCategories();
    if (goalCategories.length > 0) {
      const categoryLabels = goalCategories;
      const successRates = goalCategories.map(cat => 
        this.statsData!.categoryStats.goals[cat].successRate
      );

      // Generate colors for each category
      const colors = this.generateColors(goalCategories.length);

      this.categorySuccessChartData = {
        labels: categoryLabels,
        datasets: [{
          data: successRates,
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 2
        }]
      };
    }

    // Habit Average Streak Chart
    const habitCategories = this.getHabitCategories();
    if (habitCategories.length > 0) {
      const habitCategoryLabels = habitCategories;
      const averageStreaks = habitCategories.map(cat => 
        this.statsData!.categoryStats.habits[cat].averageStreak
      );

      this.habitStreakChartData = {
        labels: habitCategoryLabels,
        datasets: [{
          label: 'Average Streak',
          data: averageStreaks,
          backgroundColor: 'rgba(236, 72, 153, 0.6)',
          borderColor: 'rgba(236, 72, 153, 1)',
          borderWidth: 2
        }]
      };
    }
  }

  createCharts() {
    // Destroy existing charts
    if (this.goalProgressionChart) this.goalProgressionChart.destroy();
    if (this.categorySuccessChart) this.categorySuccessChart.destroy();
    if (this.habitStreakChart) this.habitStreakChart.destroy();

    // Create Goal Progression Chart
    if (this.goalProgressionChartData && this.goalProgressionChartRef?.nativeElement) {
      this.goalProgressionChart = new Chart(this.goalProgressionChartRef.nativeElement, {
        type: 'bar',
        data: this.goalProgressionChartData,
        options: this.goalProgressionChartOptions
      });
    }

    // Create Category Success Chart
    if (this.categorySuccessChartData && this.categorySuccessChartRef?.nativeElement) {
      this.categorySuccessChart = new Chart(this.categorySuccessChartRef.nativeElement, {
        type: 'pie',
        data: this.categorySuccessChartData,
        options: this.categorySuccessChartOptions
      });
    }

    // Create Habit Streak Chart
    if (this.habitStreakChartData && this.habitStreakChartRef?.nativeElement) {
      this.habitStreakChart = new Chart(this.habitStreakChartRef.nativeElement, {
        type: 'bar',
        data: this.habitStreakChartData,
        options: this.habitStreakChartOptions
      });
    }
  }

  prepareHeatmapData() {
    if (!this.statsData) return;

    // Process heatmap data
    this.heatmapData = this.statsData.habitHeatmap.map(entry => {
      const date = new Date(entry.date);
      // Calculate intensity (0-4 scale based on count)
      const maxCount = Math.max(...this.statsData!.habitHeatmap.map(e => e.count), 1);
      const intensity = Math.min(4, Math.floor((entry.count / maxCount) * 4));
      
      return {
        date,
        count: entry.count,
        intensity
      };
    });

    // Group by month for display
    type HeatmapEntry = { date: Date; count: number; intensity: number };
    const monthMap: { [key: string]: HeatmapEntry[] } = {};
    this.heatmapData.forEach(entry => {
      const monthKey = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = [];
      }
      monthMap[monthKey].push(entry);
    });

    this.heatmapMonths = Object.keys(monthMap).sort();
    this.heatmapDays = monthMap;
  }

  getIntensityColor(intensity: number): string {
    const colors = [
      '#ebedf0', // 0 - no activity
      '#c6e48b', // 1 - light
      '#7bc96f', // 2 - medium
      '#239a3b', // 3 - strong
      '#196127'  // 4 - very strong
    ];
    return colors[intensity] || colors[0];
  }

  getMonthName(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  getDayOfWeek(date: Date): number {
    return date.getDay();
  }

  getDayOfMonth(date: Date): number {
    return date.getDate();
  }

  generateColors(count: number): { background: string[]; border: string[] } {
    const baseColors = [
      'rgba(99, 102, 241, 0.6)',   // indigo
      'rgba(139, 92, 246, 0.6)',   // purple
      'rgba(236, 72, 153, 0.6)',   // pink
      'rgba(16, 185, 129, 0.6)',   // green
      'rgba(245, 158, 11, 0.6)',   // amber
      'rgba(239, 68, 68, 0.6)',    // red
    ];
    
    const borders = [
      'rgba(99, 102, 241, 1)',
      'rgba(139, 92, 246, 1)',
      'rgba(236, 72, 153, 1)',
      'rgba(16, 185, 129, 1)',
      'rgba(245, 158, 11, 1)',
      'rgba(239, 68, 68, 1)',
    ];

    const background: string[] = [];
    const border: string[] = [];

    for (let i = 0; i < count; i++) {
      background.push(baseColors[i % baseColors.length]);
      border.push(borders[i % borders.length]);
    }

    return { background, border };
  }

  // Helper methods to get category names from stats
  getGoalCategories(): string[] {
    if (!this.statsData?.categoryStats?.goals) return [];
    return Object.keys(this.statsData.categoryStats.goals);
  }

  getHabitCategories(): string[] {
    if (!this.statsData?.categoryStats?.habits) return [];
    return Object.keys(this.statsData.categoryStats.habits);
  }

  getEmptyDaysBeforeMonth(monthKey: string): number[] {
    if (!this.heatmapDays[monthKey] || this.heatmapDays[monthKey].length === 0) return [];
    const firstDay = this.heatmapDays[monthKey][0].date;
    const dayOfWeek = firstDay.getDay();
    // Adjust: Monday = 0, Sunday = 6
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return Array(mondayOffset).fill(0);
  }
}
