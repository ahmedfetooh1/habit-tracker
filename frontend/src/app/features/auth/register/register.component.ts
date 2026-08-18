import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>إنشاء حساب جديد</h2>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>الاسم</label>
            <input type="text" formControlName="name" placeholder="الاسم الكامل" />
          </div>

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

          <button type="submit" [disabled]="registerForm.invalid || isLoading()">
            {{ isLoading() ? 'جاري التسجيل...' : 'تسجيل' }}
          </button>
        </form>

        <p class="switch-auth">لديك حساب بالفعل؟ <a routerLink="/login">تسجيل الدخول</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; }
    .auth-card { background: var(--bg-card); padding: 2rem; border-radius: 8px; width: 100%; max-width: 400px; border: 1px solid var(--border-color); }
    .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; }
    input { padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); }
    button { width: 100%; padding: 0.75rem; background: var(--accent-color); color: #fff; border: none; border-radius: 4px; cursor: pointer; }
    .error-msg { color: #ef4444; font-size: 0.875rem; }
    .switch-auth { text-align: center; margin-top: 1rem; }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');

  registerForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.registerForm.value as any).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'حدث خطأ أثناء إنشاء الحساب');
      }
    });
  }
}
