import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <h2>الملف الشخصي والإعدادات ⚙️</h2>

      <div class="profile-card">
        <h3>تعديل البيانات الشخصية</h3>

        <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
          <div class="form-group">
            <label>الاسم الكامل</label>
            <input type="text" formControlName="name" placeholder="أدخل اسمك" />
          </div>

          <div class="form-group">
            <label>البريد الإلكتروني</label>
            <input type="email" formControlName="email" readonly class="readonly-input" />
          </div>

          <button type="submit" [disabled]="profileForm.invalid || isSubmitting()">
            {{ isSubmitting() ? 'جاري الحفظ...' : 'حفظ التعديلات' }}
          </button>
        </form>

        <p *ngIf="message()" class="success-msg">{{ message() }}</p>
      </div>
    </div>
  `,
  styles: [`
    .profile-container { max-width: 600px; margin: 0 auto; }
    .profile-card { background: var(--bg-card); padding: 2rem; border-radius: 8px; border: 1px solid var(--border-color); }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.2rem; }
    .form-group label { font-size: 0.9rem; color: var(--text-secondary); }
    .form-group input { padding: 0.6rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-primary); color: var(--text-primary); }
    .readonly-input { opacity: 0.7; cursor: not-allowed; }
    button { padding: 0.7rem 1.5rem; background: var(--accent-color); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .success-msg { color: #10b981; margin-top: 1rem; font-weight: 500; }
  `]
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private fb = inject(FormBuilder);

  isSubmitting = signal(false);
  message = signal('');

  profileForm = this.fb.group({
    name: ['', Validators.required],
    email: ['']
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email
      });
    }
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) return;
    this.isSubmitting.set(true);

    // محاكاة حفظ التعديلات تحديث اسم المستخدم محلياً في Signal
    setTimeout(() => {
      const updatedName = this.profileForm.value.name!;
      const currentUser = this.authService.currentUser();
      if (currentUser) {
        this.authService.currentUser.set({ ...currentUser, name: updatedName });
      }
      this.isSubmitting.set(false);
      this.message.set('تم تحديث البيانات بنجاح! ✅');
    }, 500);
  }
}
