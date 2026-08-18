import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

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
    button { width: 100%; padding: 0.75rem; background: var(--accent-color); color: #fff; border: none; border-radius: 4px; cursor: pointer; }
    .google-btn { background: #4285f4; margin-top: 0.5rem; }
    .error-msg { color: #ef4444; font-size: 0.875rem; }
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
    this.authService.loginWithGoogle();
  }
}
