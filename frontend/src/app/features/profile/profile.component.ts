import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="profile-container">
      <h2>{{ 'PROFILE.TITLE' | translate }}</h2>

      <div class="profile-card">
        <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
          <div class="form-group">
            <label>{{ 'PROFILE.NAME' | translate }}</label>
            <input type="text" formControlName="name" />
          </div>

          <div class="form-group">
            <label>{{ 'PROFILE.EMAIL' | translate }}</label>
            <input type="email" formControlName="email" />
          </div>

          @if (successMessage()) {
            <p class="success-msg">{{ successMessage() }}</p>
          }

          <button type="submit" [disabled]="profileForm.invalid || isLoading()">
            {{ isLoading() ? ('COMMON.LOADING' | translate) : ('PROFILE.SAVE_BTN' | translate) }}
          </button>
        </form>
      </div>

      <div class="profile-card password-section">
        <h3>{{ 'PROFILE.CHANGE_PASSWORD' | translate }}</h3>

        <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()">
          <div class="form-group">
            <label>{{ 'PROFILE.OLD_PASSWORD' | translate }}</label>
            <input type="password" formControlName="oldPassword" />
          </div>

          <div class="form-group">
            <label>{{ 'PROFILE.NEW_PASSWORD' | translate }}</label>
            <input type="password" formControlName="newPassword" />
          </div>

          @if (passwordSuccessMessage()) {
            <p class="success-msg">{{ passwordSuccessMessage() }}</p>
          }

          <button type="submit" [disabled]="passwordForm.invalid || isPasswordLoading()">
            {{ isPasswordLoading() ? ('COMMON.LOADING' | translate) : ('PROFILE.UPDATE_PASSWORD_BTN' | translate) }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-container { padding: 2rem; max-width: 600px; margin: 0 auto; }
    h2, h3 { margin-bottom: 1.5rem; color: var(--text-primary); }
    .profile-card { background: var(--bg-card); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 2rem; }
    .form-group { margin-bottom: 1rem; display: flex; flex-direction: column; }
    label { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.3rem; }
    input { padding: 0.6rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); }
    input:disabled { opacity: 0.6; cursor: not-allowed; }
    button { padding: 0.75rem; background: var(--accent-color); color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    .success-msg { color: #22c55e; font-size: 0.875rem; margin-bottom: 0.5rem; }
  `]
})
export class ProfileComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoading = signal(false);
  isPasswordLoading = signal(false);
  successMessage = signal('');
  passwordSuccessMessage = signal('');

  currentUser = this.authService.currentUser;

  profileForm = this.fb.group({
    name: [this.currentUser()?.name || '', [Validators.required]],
    email: [{ value: this.currentUser()?.email || '', disabled: true }]
  });

  passwordForm = this.fb.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]]
  });

  onUpdateProfile(): void {
    if (this.profileForm.invalid) return;
    this.isLoading.set(true);

    // تنفيذ تحديث البيانات
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;
    this.isPasswordLoading.set(true);

    // تنفيذ تغيير كلمة السر
  }
}
