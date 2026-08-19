import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals لإدارة حالة التوثيق والمستخدم
  currentUser = signal<User | null>(this.getStoredUser());
  isAuthenticated = signal<boolean>(!!localStorage.getItem('accessToken'));

  private getStoredUser(): User | null {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  }

  register(credentials: RegisterCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, credentials).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.handleAuthSuccess(res))
    );
  }

  loginWithGoogle(): void {
    window.location.href = `${this.apiUrl}/google`;
  }

  refreshToken(): Observable<{ accessToken: string }> {
    // إرسال withCredentials: true ضروري جداً لقراءة الـ Cookie الخاصة بالـ Refresh Token
    return this.http.post<{ accessToken: string }>(
      `${this.apiUrl}/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(res => {
        localStorage.setItem('accessToken', res.accessToken);
        this.isAuthenticated.set(true);
      }),
      catchError(err => {
        // تنظيف الجلسة محلياً دون استدعاء API الـ logout لمنع التكرار
        this.clearSession();
        return throwError(() => err);
      })
    );
  }

  logout(): void {
    // إرسال طلب تسجيل الخروج مع withCredentials لحذف الـ Cookie من الباك إند
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      next: () => this.clearSession(),
      error: () => this.clearSession()
    });
  }

  handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('accessToken', response.accessToken);

    const user: User = {
      _id: response._id,
      name: response.name,
      email: response.email,
      themePreference: response.themePreference
    };

    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  clearSession(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }
}
