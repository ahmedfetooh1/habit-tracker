import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Habit, CreateHabitDto } from '../models/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/habits`;

  habits = signal<Habit[]>([]);
  isLoading = signal<boolean>(false);

  getHabits(): Observable<Habit[]> {
    this.isLoading.set(true);
    return this.http.get<Habit[]>(this.apiUrl).pipe(
      tap(data => {
        this.habits.set(data || []);
        this.isLoading.set(false);
        this.checkAndScheduleNotifications(data || []);
      }),
      catchError(err => {
        this.isLoading.set(false);
        console.error('Error fetching habits:', err);
        return throwError(() => err);
      })
    );
  }

  createHabit(dto: CreateHabitDto): Observable<Habit> {
    return this.http.post<Habit>(this.apiUrl, dto).pipe(
      tap(newHabit => {
        if (newHabit) {
          this.habits.update(list => [...list, newHabit]);
          this.scheduleSingleNotification(newHabit);
        }
      }),
      catchError(err => {
        console.error('Error creating habit:', err);
        return throwError(() => err);
      })
    );
  }

  toggleHabitStatus(habitId: string, date: string): Observable<Habit> {
    return this.http.post<Habit>(`${this.apiUrl}/${habitId}/toggle`, { date }).pipe(
      tap(updatedHabit => {
        this.habits.update(list =>
          list.map(h => {
            const currentId = h._id || (h as any).id;
            const updatedId = updatedHabit._id || (updatedHabit as any).id;
            return currentId === updatedId ? updatedHabit : h;
          })
        );
      }),
      catchError(err => {
        console.error('Error toggling habit:', err);
        return throwError(() => err);
      })
    );
  }

  deleteHabit(habitId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${habitId}`).pipe(
      tap(() => {
        this.habits.update(list =>
          list.filter(h => (h._id || (h as any).id) !== habitId)
        );
      }),
      catchError(err => {
        console.error('Error deleting habit:', err);
        return throwError(() => err);
      })
    );
  }

  // --- خدمة التنبيهات (Web Notifications) ---

  private checkAndScheduleNotifications(habits: Habit[]): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    habits.forEach(habit => this.scheduleSingleNotification(habit));
  }

  private scheduleSingleNotification(habit: Habit): void {
    if (!habit.reminderTime || !('Notification' in window) || Notification.permission !== 'granted') return;

    const [hours, minutes] = habit.reminderTime.split(':').map(Number);
    const now = new Date();
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);

    // إذا كان الوقت المكتوب في اليوم قادماً
    if (reminderDate > now) {
      const timeToWait = reminderDate.getTime() - now.getTime();
      setTimeout(() => {
        new Notification(`⏰ حان موعد عادتك: ${habit.title}`, {
          body: habit.description || 'لا تنسَ إنجاز عادتك اليوم وتوثيقها!',
          icon: '/favicon.ico'
        });
      }, timeToWait);
    }
  }
}
