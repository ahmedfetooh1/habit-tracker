import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { HabitService } from '../../core/services/habit.service';
import { Habit } from '../../core/models/habit.model';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="analytics-container">
      <h2>{{ 'ANALYTICS.TITLE' | translate }}</h2>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>{{ 'ANALYTICS.TOTAL_HABITS' | translate }}</h3>
          <p class="stat-number">{{ totalHabits() }}</p>
        </div>

        <div class="stat-card">
          <h3>{{ 'ANALYTICS.COMPLETED_TODAY' | translate }}</h3>
          <p class="stat-number">{{ completedToday() }}</p>
        </div>

        <div class="stat-card">
          <h3>{{ 'ANALYTICS.COMPLETION_RATE' | translate }}</h3>
          <p class="stat-number">{{ completionRate() }}%</p>
        </div>

        <div class="stat-card">
          <h3>{{ 'ANALYTICS.BEST_STREAK' | translate }}</h3>
          <p class="stat-number">{{ bestStreak() }} 🔥</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container { padding: 2rem; max-width: 1100px; margin: 0 auto; }
    h2 { margin-bottom: 1.5rem; color: var(--text-primary); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { background: var(--bg-card); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); text-align: center; }
    .stat-card h3 { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
    .stat-number { font-size: 1.8rem; font-weight: bold; color: var(--accent-color); margin: 0; }
  `]
})
export class AnalyticsComponent implements OnInit {
  habitService = inject(HabitService);
  todayStr = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    this.habitService.getHabits().subscribe();
  }

  // فلترة العادات النشطة فقط وتجاهل العادات التي تحتوي على archivedAt
  activeHabits = computed(() => {
    return this.habitService.habits().filter((h: Habit) => !h.archivedAt);
  });

  totalHabits = computed(() => this.activeHabits().length);

  completedToday = computed(() => {
    return this.activeHabits().filter((h: Habit) =>
      h.completedDates?.includes(this.todayStr)
    ).length;
  });

  completionRate = computed(() => {
    const total = this.totalHabits();
    if (total === 0) return 0;
    return Math.round((this.completedToday() / total) * 100);
  });

  bestStreak = computed(() => {
    const habits = this.activeHabits();
    if (habits.length === 0) return 0;
    return Math.max(...habits.map((h: Habit) => h.streak || 0));
  });
}
