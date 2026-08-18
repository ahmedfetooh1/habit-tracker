import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core'; // 👈 استيراد TranslatePipe

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, TranslatePipe], // 👈 إضافته في imports
  template: `
    <div class="analytics-container">
      <h2>{{ 'ANALYTICS.TITLE' | translate }}</h2>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>{{ 'ANALYTICS.TOTAL_HABITS' | translate }}</h3>
          <p class="stat-number">12</p>
        </div>

        <div class="stat-card">
          <h3>{{ 'ANALYTICS.COMPLETED_TODAY' | translate }}</h3>
          <p class="stat-number">8</p>
        </div>

        <div class="stat-card">
          <h3>{{ 'ANALYTICS.COMPLETION_RATE' | translate }}</h3>
          <p class="stat-number">66%</p>
        </div>

        <div class="stat-card">
          <h3>{{ 'ANALYTICS.BEST_STREAK' | translate }}</h3>
          <p class="stat-number">14 🔥</p>
        </div>
      </div>

      <div class="charts-section">
        <div class="chart-card">
          <h3>{{ 'ANALYTICS.WEEKLY_PROGRESS' | translate }}</h3>
          <!-- مكافئ للرسم البياني أو المخطط هنا -->
        </div>

        <div class="chart-card">
          <h3>{{ 'ANALYTICS.MONTHLY_OVERVIEW' | translate }}</h3>
          <!-- مكافئ للرسم البياني أو المخطط هنا -->
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
    .charts-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .chart-card { background: var(--bg-card); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); min-height: 250px; }
  `]
})
export class AnalyticsComponent {
  // الكود الخاص بجلب بيانات الإحصائيات من الـ Service كما هو لديك...
}
