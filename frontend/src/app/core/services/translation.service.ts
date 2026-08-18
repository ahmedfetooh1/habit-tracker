import { Injectable, signal } from '@angular/core';

export type Language = 'ar' | 'en';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  currentLang = signal<Language>('ar');

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    const savedLang = localStorage.getItem('app-lang') as Language;
    const defaultLang = savedLang || 'ar';
    this.setLanguage(defaultLang);
  }

  setLanguage(lang: Language): void {
    this.currentLang.set(lang);
    localStorage.setItem('app-lang', lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  toggleLanguage(): void {
    const nextLang = this.currentLang() === 'ar' ? 'en' : 'ar';
    this.setLanguage(nextLang);
  }
}
