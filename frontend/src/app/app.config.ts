import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { Observable, catchError, of } from 'rxjs';


export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    // التحميل المباشر من مجلد public
    return this.http.get(`./i18n/${lang}.json`).pipe(
      catchError((error) => {
        console.error(`🔴 لم يتم العثور على ملف الترجمة: ./i18n/${lang}.json`, error);
        return of({});
      })
    );
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideTranslateService({
      fallbackLang: 'ar',
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new CustomTranslateLoader(http),
        deps: [HttpClient]
      }
    })
  ]
};
