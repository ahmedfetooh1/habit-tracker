import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="logo">
        <a routerLink="/dashboard">🎯 Habit Tracker</a>
      </div>

      <div class="actions">
        <button (click)="themeService.toggleTheme()" class="icon-btn">
          {{ themeService.currentTheme() === 'light' ? '🌙' : '☀️' }}
        </button>

        <button (click)="translationService.toggleLanguage()" class="icon-btn">
          {{ translationService.currentLang() === 'ar' ? 'EN' : 'عربي' }}
        </button>

        @if (authService.isAuthenticated()) {
          <span class="user-name">{{ authService.currentUser()?.name }}</span>
          <button (click)="authService.logout()" class="logout-btn">خروج</button>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: var(--bg-card); border-bottom: 1px solid var(--border-color); }
    .logo a { font-weight: bold; font-size: 1.2rem; text-decoration: none; color: var(--text-primary); }
    .actions { display: flex; align-items: center; gap: 1rem; }
    .icon-btn { background: transparent; border: 1px solid var(--border-color); padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; color: var(--text-primary); }
    .logout-btn { background: #ef4444; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; }
    .user-name { font-weight: 500; color: var(--text-secondary); }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  translationService = inject(TranslationService);
}
