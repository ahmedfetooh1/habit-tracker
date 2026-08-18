import { Component, OnInit, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from '../../core/services/habit.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-container">
      <h2>إحصائيات الإلتزام بالعادات 📊</h2>

      <div class="stats-summary">
        <div class="stat-card">
          <h3>إجمالي العادات</h3>
          <p>{{ habitService.habits().length }}</p>
        </div>
        <div class="stat-card">
          <h3>أعلى تتابع (Streak)</h3>
          <p>{{ getMaxStreak() }} أيام 🔥</p>
        </div>
      </div>

      <div class="chart-container">
        <h3>نسبة الإنجاز خلال الأسبوع</h3>
        <canvas #habitChart></canvas>
      </div>
    </div>
  `,
  styles: [`
    .analytics-container { max-width: 800px; margin: 0 auto; }
    .stats-summary { display: flex; gap: 1rem; margin-bottom: 2rem; }
    .stat-card { flex: 1; background: var(--bg-card); padding: 1.5rem; border-radius: 8px; text-align: center; border: 1px solid var(--border-color); }
    .stat-card h3 { margin: 0 0 0.5rem 0; color: var(--text-secondary); font-size: 0.9rem; }
    .stat-card p { margin: 0; font-size: 1.8rem; font-weight: bold; color: var(--accent-color); }
    .chart-container { background: var(--bg-card); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); }
  `]
})
export class AnalyticsComponent implements OnInit {
  @ViewChild('habitChart') habitChartCanvas!: ElementRef<HTMLCanvasElement>;
  habitService = inject(HabitService);
  chart!: Chart;

  ngOnInit(): void {
    if (this.habitService.habits().length === 0) {
      this.habitService.getHabits().subscribe(() => this.renderChart());
    } else {
      setTimeout(() => this.renderChart(), 100);
    }
  }

  getMaxStreak(): number {
    const habits = this.habitService.habits();
    return habits.length ? Math.max(...habits.map(h => h.streak || 0)) : 0;
  }

  renderChart(): void {
    if (!this.habitChartCanvas) return;

    const habits = this.habitService.habits();
    const labels = habits.map(h => h.title);
    const data = habits.map(h => h.completedDates?.length || 0);

    this.chart = new Chart(this.habitChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'عدد أيام الإكتمال',
          data: data,
          backgroundColor: '#3b82f6',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }
}
