import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { HabitService } from '../../core/services/habit.service';
import { LanguageService } from '../../core/services/language.service';
import { Habit } from '../../core/models/habit.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="dashboard-container">
      <div class="top-bar">
        <h2>{{ 'DASHBOARD.TITLE' | translate }}</h2>
      </div>

      <div class="calendar-card">
        <div class="date-picker-header">
          <label for="selectedDate">{{ 'DASHBOARD.SELECT_DATE' | translate }}</label>
          <input
            type="date"
            id="selectedDate"
            [value]="selectedDate()"
            (change)="onDateChange($event)"
          />
          <button type="button" class="today-btn" (click)="resetToToday()">
            {{ 'DASHBOARD.TODAY' | translate }}
          </button>
        </div>
        <p class="current-view-text">
          {{ 'DASHBOARD.VIEW_DATE' | translate }} <strong>{{ selectedDate() }}</strong>
        </p>
      </div>

      <div class="add-habit-card">
        <h3>{{ 'DASHBOARD.ADD_NEW' | translate }}</h3>
        <form [formGroup]="habitForm" (ngSubmit)="onAddHabit()">
          <div class="form-row">
            <input type="text" formControlName="title" [placeholder]="'DASHBOARD.HABIT_NAME' | translate" />
            <input type="text" formControlName="description" [placeholder]="'DASHBOARD.SHORT_DESC' | translate" />
          </div>

          <div class="form-row">
            <select formControlName="frequency">
              <option value="daily">{{ 'DASHBOARD.FREQUENCIES.DAILY' | translate }}</option>
              <option value="weekly">{{ 'DASHBOARD.FREQUENCIES.WEEKLY' | translate }}</option>
              <option value="monthly">{{ 'DASHBOARD.FREQUENCIES.MONTHLY' | translate }}</option>
              <option value="yearly">{{ 'DASHBOARD.FREQUENCIES.YEARLY' | translate }}</option>
            </select>

            <div class="time-picker">
              <label>{{ 'DASHBOARD.REMINDER_TIME' | translate }}</label>
              <input type="time" formControlName="reminderTime" />
            </div>

            <button type="submit" [disabled]="habitForm.invalid || isSubmitting()">
              {{ isSubmitting() ? ('DASHBOARD.ADDING_BTN' | translate) : ('DASHBOARD.ADD_BTN' | translate) }}
            </button>
          </div>
        </form>
      </div>

      <div class="habits-list">
        @if (habitService.isLoading()) {
          <p class="loading-msg">{{ 'DASHBOARD.LOADING' | translate }}</p>
        } @else if (filteredHabits().length === 0) {
          <p class="empty-msg">
            {{ 'DASHBOARD.EMPTY' | translate:{ date: selectedDate() } }}
          </p>
        } @else {
          <div *ngFor="let habit of filteredHabits()" class="habit-item">
            <div class="habit-info">
              <div class="title-group">
                <h4>{{ habit.title }}</h4>
                <span class="freq-badge">{{ getFrequencyLabel(habit.frequency) }}</span>
              </div>
              <p *ngIf="habit.description">{{ habit.description }}</p>

              <div class="meta-info">
                <span class="streak">
                  {{ 'DASHBOARD.STREAK' | translate:{ count: habit.streak || 0 } }}
                </span>
                <span *ngIf="habit.reminderTime" class="reminder-badge">⏰ {{ habit.reminderTime }}</span>
              </div>
            </div>

            <div class="habit-actions">
              <button
                [class.completed]="isCompletedOnSelectedDate(habit)"
                (click)="toggleHabit(habit)">
                {{ isCompletedOnSelectedDate(habit) ? ('DASHBOARD.COMPLETED' | translate) : ('DASHBOARD.MARK_COMPLETED' | translate) }}
              </button>

              <button class="delete-btn" (click)="onDelete(getHabitId(habit))">
                {{ 'DASHBOARD.DELETE' | translate }}
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { max-width: 800px; margin: 0 auto; padding: 1rem; }
    .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
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
    .add-habit-card button[type="submit"]:disabled { opacity: 0.5; cursor: not-allowed; }

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
  langService = inject(LanguageService);
  private translate = inject(TranslateService);
  private fb = inject(FormBuilder);

  selectedDate = signal<string>(this.formatDateToString(new Date()));
  isSubmitting = signal<boolean>(false);

  filteredHabits = computed(() => {
    const habits = this.habitService.habits();
    const selectedStr = this.selectedDate();

    return habits.filter(habit => {
      if (!habit.createdAt) return true;

      const createdDateStr = this.normalizeDate(habit.createdAt);

      if (selectedStr < createdDateStr) return false;

      if (habit.archivedAt) {
        const archivedDateStr = this.normalizeDate(habit.archivedAt);
        if (selectedStr >= archivedDateStr) return false;
      }

      const freq = habit.frequency || 'daily';

      const [sYear, sMonth, sDay] = selectedStr.split('-').map(Number);
      const selectedDateObj = new Date(sYear, sMonth - 1, sDay);
      selectedDateObj.setHours(0, 0, 0, 0);

      const [cYear, cMonth, cDay] = createdDateStr.split('-').map(Number);
      const createdDateObj = new Date(cYear, cMonth - 1, cDay);
      createdDateObj.setHours(0, 0, 0, 0);

      switch (freq) {
        case 'daily':
          return true;

        case 'weekly': {
          const diffInTime = selectedDateObj.getTime() - createdDateObj.getTime();
          const diffInDays = Math.round(diffInTime / (1000 * 3600 * 24));
          return diffInDays % 7 === 0;
        }

        case 'monthly':
          return selectedDateObj.getDate() === createdDateObj.getDate();

        case 'yearly':
          return selectedDateObj.getDate() === createdDateObj.getDate() &&
                 selectedDateObj.getMonth() === createdDateObj.getMonth();

        default:
          return true;
      }
    });
  });

  habitForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    frequency: ['daily', Validators.required],
    reminderTime: ['']
  });

  ngOnInit(): void {
    this.habitService.getHabits().subscribe();
  }

  getHabitId(habit: Habit): string {
    return habit._id || (habit as any).id || '';
  }

  private formatDateToString(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private normalizeDate(dateInput: string | Date): string {
    return this.habitService.toLocalYMD(dateInput);
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.selectedDate.set(input.value);
    }
  }

  resetToToday(): void {
    this.selectedDate.set(this.formatDateToString(new Date()));
  }

  isCompletedOnSelectedDate(habit: Habit): boolean {
    if (!habit.completedDates || habit.completedDates.length === 0) return false;
    const targetDate = this.selectedDate();

    return habit.completedDates.some((d) => this.normalizeDate(d) === targetDate);
  }

  toggleHabit(habit: Habit): void {
    const id = this.getHabitId(habit);
    if (!id) return;
    this.habitService.toggleHabitStatus(id, this.selectedDate()).subscribe();
  }

  onAddHabit(): void {
    if (this.habitForm.invalid) return;
    this.isSubmitting.set(true);

    const payload = { ...this.habitForm.value };
    if (!payload.reminderTime) delete payload.reminderTime;
    if (!payload.description) delete payload.description;

    this.habitService.createHabit(payload as any).subscribe({
      next: () => {
        this.habitForm.reset({
          title: '',
          description: '',
          frequency: 'daily',
          reminderTime: ''
        });
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('فشل إنشاء العادة:', err);
        this.isSubmitting.set(false);
      }
    });
  }

  onDelete(id: string): void {
    if (!id) return;
    const confirmMsg = this.translate.instant('DASHBOARD.CONFIRM_DELETE');

    if (confirm(confirmMsg)) {
      this.habitService.deleteHabit(id).subscribe({
        error: (err) => console.error('فشل حذف العادة:', err)
      });
    }
  }

  getFrequencyLabel(freq: string | undefined): string {
    const key = (freq || 'daily').toUpperCase();
    return this.translate.instant(`DASHBOARD.FREQUENCIES.${key}`);
  }
}
