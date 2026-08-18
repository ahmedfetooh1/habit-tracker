import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment'; // <-- الاستيراد الناقص هنا

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>تسجيل الدخول</h2>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>البريد الإلكتروني</label>
            <input type="email" formControlName="email" placeholder="example@domain.com" />
          </div>

          <div class="form-group">
            <label>كلمة المرور</label>
            <input type="password" formControlName="password" placeholder="********" />
          </div>

          @if (errorMessage()) {
            <p class="error-msg">{{ errorMessage() }}</p>
          }

          <button type="submit" [disabled]="loginForm.invalid || isLoading()">
            {{ isLoading() ? 'جاري التحميل...' : 'دخول' }}
          </button>
        </form>

        <div class="divider">أو</div>

        <button type="button" class="google-btn" (click)="onGoogleLogin()">
          <svg class="google-icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          تسجيل الدخول بواسطة Google
        </button>

        <p class="switch-auth">ليس لديك حساب؟ <a routerLink="/register">إنشاء حساب جديد</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
    .auth-card { background: var(--bg-card); padding: 2rem; border-radius: 8px; width: 100%; max-width: 400px; border: 1px solid var(--border-color); }
    .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; }
    input { padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); }
    button { width: 100%; padding: 0.75rem; background: var(--accent-color); color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; }
    .google-btn { background: #ffffff; color: #757575; border: 1px solid var(--border-color); margin-top: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background-color 0.2s; }
    .google-btn:hover { background-color: #f8f9fa; }
    .google-icon { width: 18px; height: 18px; }
    .error-msg { color: #ef4444; font-size: 0.875rem; margin-bottom: 1rem; }
    .divider { text-align: center; margin: 1rem 0; color: var(--text-secondary); }
    .switch-auth { text-align: center; margin-top: 1rem; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value as any).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'فشل تسجيل الدخول، تحقق من البيانات');
      }
    });
  }

  onGoogleLogin(): void {
    if (typeof (this.authService as any).loginWithGoogle === 'function') {
      (this.authService as any).loginWithGoogle();
    } else {
      window.location.href = `${environment.apiUrl.replace('/api', '')}/api/auth/google`;
    }
  }
}
