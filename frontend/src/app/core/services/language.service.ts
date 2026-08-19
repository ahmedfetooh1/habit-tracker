import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);

  readonly currentLang = signal<string>(localStorage.getItem('lang') || 'ar');

  constructor() {
    this.initLanguage(this.currentLang());
  }

  initLanguage(lang: string) {
    this.translate.addLangs(['ar', 'en']);
    this.setLanguage(lang);
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem('lang', lang);

    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }

  toggleLanguage() {
    const nextLang = this.currentLang() === 'ar' ? 'en' : 'ar';
    this.setLanguage(nextLang);
  }
}
