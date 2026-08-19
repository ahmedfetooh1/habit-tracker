import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Habit } from '../models/habit.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/habits`;

  readonly habits = signal<Habit[]>([]);
  readonly isLoading = signal<boolean>(false);

  private matchesId(habit: Habit, id: string): boolean {
    const habitId = habit._id || (habit as any).id;
    return String(habitId) === String(id);
  }

  public toLocalYMD(dateInput: string | Date): string {
    if (!dateInput) return '';

    if (typeof dateInput === 'string') {
      const cleanStr = dateInput.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
        return cleanStr;
      }
    }

    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput).split('T')[0];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getHabits(): Observable<Habit[]> {
    this.isLoading.set(true);
    return this.http.get<Habit[]>(this.apiUrl).pipe(
      tap({
        next: (data) => {
          const normalized = (data || []).map((h) => ({
            ...h,
            completedDates: (h.completedDates || []).map((d) => this.toLocalYMD(d))
          }));
          this.habits.set(normalized);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      })
    );
  }

  createHabit(habitData: Partial<Habit>): Observable<Habit> {
    return this.http.post<any>(this.apiUrl, habitData).pipe(
      tap((res: any) => {
        const newHabit: Habit = res?.data || res?.habit || res;

        if (!newHabit.createdAt) {
          newHabit.createdAt = this.toLocalYMD(new Date());
        }

        newHabit.completedDates = (newHabit.completedDates || []).map((d) => this.toLocalYMD(d));

        this.habits.update((prev) => [...prev, newHabit]);
      })
    );
  }

  toggleHabitStatus(id: string, date: string): Observable<Habit> {
    const targetDate = this.toLocalYMD(date);

    // 1. التحديث اللحظي المحلي
    this.habits.update((prev) =>
      prev.map((h) => {
        if (this.matchesId(h, id)) {
          const dates = (h.completedDates || []).map((d) => this.toLocalYMD(d));
          const exists = dates.includes(targetDate);

          const updatedDates = exists
            ? dates.filter((d) => d !== targetDate)
            : [...dates, targetDate];

          return { ...h, completedDates: updatedDates };
        }
        return h;
      })
    );

    // 2. إرسال الطلب وحفظ النتيجة
    return this.http.patch<any>(`${this.apiUrl}/${id}/toggle`, { date: targetDate }).pipe(
      tap({
        next: (res: any) => {
          const updatedHabit: Habit = res?.data || res?.habit || res;

          if (updatedHabit && Array.isArray(updatedHabit.completedDates)) {
            const normalizedDates = updatedHabit.completedDates.map((d) => this.toLocalYMD(d));

            this.habits.update((prev) =>
              prev.map((h) =>
                this.matchesId(h, id)
                  ? { ...h, ...updatedHabit, completedDates: normalizedDates }
                  : h
              )
            );
          }
        },
        error: (err) => {
          console.error('فشل حفظ التعديل في السيرفر:', err);
          this.getHabits().subscribe();
        }
      })
    );
  }

  deleteHabit(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.habits.update((prev) => prev.filter((h) => !this.matchesId(h, id)));
      })
    );
  }
}
