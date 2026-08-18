import { Component, OnInit, inject, signal, computed } from '@angular/core';
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

      <!-- قسم التقويم واختيار اليوم -->
      <div class="calendar-card">
        <div class="date-picker-header">
          <label for="selectedDate">📅 اختر التاريخ لمتابعة العادات:</label>
          <input
            type="date"
            id="selectedDate"
            [value]="selectedDate()"
            (change)="onDateChange($event)"
          />
          <button type="button" class="today-btn" (click)="resetToToday()">اليوم</button>
        </div>
        <p class="current-view-text">عرض عادات يوم: <strong>{{ selectedDate() }}</strong></p>
      </div>

      <!-- نموذج إضافة عادة جديدة -->
      <div class="add-habit-card">
        <h3>إضافة عادة جديدة</h3>
        <form [formGroup]="habitForm" (ngSubmit)="onAddHabit()">
          <div class="form-row">
            <input type="text" formControlName="title" placeholder="اسم العادة (مثلاً: القراءة)" />
            <input type="text" formControlName="description" placeholder="وصف قصير (اختياري)" />
          </div>

          <div class="form-row">
            <select formControlName="frequency">
              <option value="daily">يومية (Daily)</option>
              <option value="weekly">أسبوعية (Weekly)</option>
              <option value="monthly">شهرية (Monthly)</option>
              <option value="yearly">سنوية (Yearly)</option>
            </select>

            <div class="time-picker">
              <label>وقت التنبيه ⏰:</label>
              <input type="time" formControlName="reminderTime" />
            </div>

            <button type="submit" [disabled]="habitForm.invalid || isSubmitting()">
              {{ isSubmitting() ? 'جاري الإضافة...' : 'إضافة العادة' }}
            </button>
          </div>
        </form>
      </div>

      <!-- قائمة العادات للملف/التاريخ المختار -->
      <div class="habits-list">
        @if (habitService.isLoading()) {
          <p class="loading-msg">جاري تحميل العادات...</p>
        } @else if (filteredHabits().length === 0) {
          <p class="empty-msg">لا توجد عادات مسجلة لهذا التاريخ ({{ selectedDate() }}).</p>
        } @else {
          <div *ngFor="let habit of filteredHabits()" class="habit-item">
            <div class="habit-info">
              <div class="title-group">
                <h4>{{ habit.title }}</h4>
                <span class="freq-badge">{{ getFrequencyLabel(habit.frequency) }}</span>
              </div>
              <p *ngIf="habit.description">{{ habit.description }}</p>

              <div class="meta-info">
                <span class="streak">🔥 التتابع: {{ habit.streak || 0 }} أيام</span>
                <span *ngIf="habit.reminderTime" class="reminder-badge">⏰ {{ habit.reminderTime }}</span>
              </div>
            </div>

            <div class="habit-actions">
              <button
                [class.completed]="isCompletedOnSelectedDate(habit)"
                (click)="toggleHabit(habit)">
                {{ isCompletedOnSelectedDate(habit) ? 'مكتملة ✔️' : 'تحديد كـ مكتملة ⭕' }}
              </button>

              <button class="delete-btn" (click)="onDelete(getHabitId(habit))">حذف</button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 800px; margin: 0 auto; padding: 1rem; }

    .calendar-card { background: var(--bg-card); padding: 1rem 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid var(--border-color); }
    .date-picker-header { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .date-picker-header input[type="date"] { padding: 0.4rem 0.8rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); }
    .today-btn { padding: 0.4rem 0.8rem; background: var(--accent-color); color: white; border: none; border-radius: 4px; cursor: pointer; }
    .current-view-text { margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary); }

    .add-habit-card { background: var(--bg-card); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; border: 1px solid var(--border-color); }
    .form-row { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
    .form-row input[type="text"], .form-row select { flex: 1; min-width: 180px; padding: 0.6rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); }
    .time-picker { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
    .time-picker input { padding: 0.4rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); }
    .add-habit-card button[type="submit"] { padding: 0.6rem 1.2rem; background: var(--accent-color); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }

    .habit-item { background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border-color); }
    .title-group { display: flex; align-items: center; gap: 0.5rem; }
    .habit-info h4 { margin: 0; }
    .freq-badge { background: var(--bg-primary); font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-color); color: var(--text-secondary); }
    .habit-info p { margin: 0.25rem 0 0 0; color: var(--text-secondary); font-size: 0.875rem; }

    .meta-info { display: flex; gap: 1rem; margin-top: 0.5rem; align-items: center; }
    .streak { font-size: 0.8rem; font-weight: bold; color: #f59e0b; }
    .reminder-badge { font-size: 0.8rem; color: #6366f1; }

    .habit-actions { display: flex; gap: 0.5rem; }
    .habit-actions button { padding: 0.4rem 0.8rem; border-radius: 4px; border: 1px solid var(--border-color); cursor: pointer; background: var(--bg-primary); color: var(--text-primary); }
    .habit-actions button.completed { background: #10b981; color: white; border-color: #10b981; }
    .delete-btn { background: #ef4444 !important; color: white !important; border: none !important; }
    .empty-msg, .loading-msg { text-align: center; color: var(--text-secondary); margin-top: 2rem; }
  `]
})
export class DashboardComponent implements OnInit {
  habitService = inject(HabitService);
  private fb = inject(FormBuilder);

  selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
  isSubmitting = signal<boolean>(false);

  // تصفية العادات التي تم إنشاؤها في هذا التاريخ أو قبله فقط
  filteredHabits = computed(() => {
    const habits = this.habitService.habits();
    const selected = this.selectedDate();

    return habits.filter(habit => {
      if (!habit.createdAt) return true;
      const createdDate = new Date(habit.createdAt).toISOString().split('T')[0];
      return createdDate <= selected;
    });
  });

  habitForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    frequency: ['daily', Validators.required],
    reminderTime: ['']
  });

  ngOnInit(): void {
    // جلب البيانات من السيرفر فور تشغيل المكون للتعامل مع الـ Refresh
    this.habitService.getHabits().subscribe();
  }

  getHabitId(habit: Habit): string {
    return habit._id || (habit as any).id || '';
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.selectedDate.set(input.value);
    }
  }

  resetToToday(): void {
    this.selectedDate.set(new Date().toISOString().split('T')[0]);
  }

  isCompletedOnSelectedDate(habit: Habit): boolean {
    return habit.completedDates?.includes(this.selectedDate()) || false;
  }

  toggleHabit(habit: Habit): void {
    const id = this.getHabitId(habit);
    if (!id) return;
    this.habitService.toggleHabitStatus(id, this.selectedDate()).subscribe();
  }

  onAddHabit(): void {
    if (this.habitForm.invalid) return;
    this.isSubmitting.set(true);

    this.habitService.createHabit(this.habitForm.value as any).subscribe({
      next: () => {
        this.habitForm.reset({ frequency: 'daily' });
        this.isSubmitting.set(false);
      },
      error: () => this.isSubmitting.set(false)
    });
  }

  onDelete(id: string): void {
    if (!id) return;
    if (confirm('هل أنت تأكد من حذف هذه العادة؟')) {
      this.habitService.deleteHabit(id).subscribe();
    }
  }

  getFrequencyLabel(freq: string | undefined): string {
    switch (freq) {
      case 'weekly': return 'أسبوعية';
      case 'monthly': return 'شهرية';
      case 'yearly': return 'سنوية';
      default: return 'يومية';
    }
  }
}
