import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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
        this.habits.set(data);
        this.isLoading.set(false);
      })
    );
  }

  createHabit(dto: CreateHabitDto): Observable<Habit> {
    return this.http.post<Habit>(this.apiUrl, dto).pipe(
      tap(newHabit => {
        this.habits.update(list => [...list, newHabit]);
      })
    );
  }

  toggleHabitStatus(habitId: string, date: string): Observable<Habit> {
    return this.http.post<Habit>(`${this.apiUrl}/${habitId}/toggle`, { date }).pipe(
      tap(updatedHabit => {
        this.habits.update(list =>
          list.map(h => (h._id === updatedHabit._id ? updatedHabit : h))
        );
      })
    );
  }

  deleteHabit(habitId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${habitId}`).pipe(
      tap(() => {
        this.habits.update(list => list.filter(h => h._id !== habitId));
      })
    );
  }
}
