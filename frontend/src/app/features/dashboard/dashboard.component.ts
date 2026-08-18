import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HabitService } from '../../core/services/habit.service';
import { Habit } from '../../core/models/habit.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="dashboard-container">
      <h2>لوحة متابعة العادات 🎯</h2>

      <!-- Form لإضافة عادة جديدة -->
      <div class="add-habit-card">
        <h3>إضافة عادة جديدة</h3>
        <form [formGroup]="habitForm" (ngSubmit)="onAddHabit()">
          <input type="text" formControlName="title" placeholder="اسم العادة (مثلاً: القراءة Daily)" />
          <input type="text" formControlName="description" placeholder="وصف قصير (اختياري)" />
          <button type="submit" [disabled]="habitForm.invalid">إضافة العادة</button>
        </form>
      </div>

      <!-- قائمة العادات -->
      <div class="habits-list">
        @if (habitService.isLoading()) {
          <p>جاري تحميل العادات...</p>
        } @else if (habitService.habits().length === 0) {
          <p class="empty-msg">لا توجد عادات مسجلة بعد. ابدأ بإضافة عادتك الأولى!</p>
        } @else {
          <div *ngFor="let habit of habitService.habits()" class="habit-item">
            <div class="habit-info">
              <h4>{{ habit.title }}</h4>
              <p *ngIf="habit.description">{{ habit.description }}</p>
              <span class="streak">🔥 التتابع: {{ habit.streak }} أيام</span>
            </div>

            <div class="habit-actions">
              <button
                [class.completed]="isCompletedToday(habit)"
                (click)="toggleToday(habit)">
                {{ isCompletedToday(habit) ? 'مكتملة اليوم ✔️' : 'تحديد مكتملة ⭕' }}
              </button>

              <button class="delete-btn" (click)="onDelete(habit._id)">حذف</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 800px; margin: 0 auto; }
    .add-habit-card { background: var(--bg-card); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; border: 1px solid var(--border-color); }
    .add-habit-card form { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .add-habit-card input { flex: 1; min-width: 200px; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); }
    .add-habit-card button { padding: 0.5rem 1rem; background: var(--accent-color); color: white; border: none; border-radius: 4px; cursor: pointer; }

    .habit-item { background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-color); }
    .habit-info h4 { margin: 0 0 0.25rem 0; }
    .habit-info p { margin: 0; color: var(--text-secondary); font-size: 0.875rem; }
    .streak { display: inline-block; margin-top: 0.5rem; font-size: 0.8rem; font-weight: bold; color: #f59e0b; }

    .habit-actions { display: flex; gap: 0.5rem; }
    .habit-actions button { padding: 0.4rem 0.8rem; border-radius: 4px; border: 1px solid var(--border-color); cursor: pointer; background: var(--bg-primary); color: var(--text-primary); }
    .habit-actions button.completed { background: #10b981; color: white; border-color: #10b981; }
    .delete-btn { background: #ef4444 !important; color: white !important; border: none !important; }
    .empty-msg { text-align: center; color: var(--text-secondary); margin-top: 2rem; }
  `]
})
export class DashboardComponent implements OnInit {
  habitService = inject(HabitService);
  private fb = inject(FormBuilder);

  todayStr = new Date().toISOString().split('T')[0];

  habitForm = this.fb.group({
    title: ['', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.habitService.getHabits().subscribe();
  }

  isCompletedToday(habit: Habit): boolean {
    return habit.completedDates?.includes(this.todayStr) || false;
  }

  toggleToday(habit: Habit): void {
    this.habitService.toggleHabitStatus(habit._id, this.todayStr).subscribe();
  }

  onAddHabit(): void {
    if (this.habitForm.invalid) return;
    this.habitService.createHabit(this.habitForm.value as any).subscribe({
      next: () => this.habitForm.reset()
    });
  }

  onDelete(id: string): void {
    if (confirm('هل أنت تأكد من حذف هذه العادة؟')) {
      this.habitService.deleteHabit(id).subscribe();
    }
  }
}
