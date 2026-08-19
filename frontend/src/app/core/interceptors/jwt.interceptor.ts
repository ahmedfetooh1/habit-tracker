import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('accessToken');
  const lang = localStorage.getItem('lang') || 'ar';

  const headers: Record<string, string> = {
    'Accept-Language': lang
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const clonedRequest = req.clone({
    withCredentials: true,
    setHeaders: headers
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // التعامل مع خطأ عدم التفويض أو انتهاء الصلاحية
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.refreshToken().pipe(
          switchMap((res: any) => {
            // حفظ التوكن الجديد وإعادة إرسال الطلب الأصلي
            localStorage.setItem('accessToken', res.accessToken);
            const newReq = req.clone({
              withCredentials: true,
              setHeaders: {
                ...headers,
                Authorization: `Bearer ${res.accessToken}`
              }
            });
            return next(newReq);
          }),
          catchError((refreshErr) => {
            // في حال فشل تجديد التوكن، تنظيف البيانات والتحويل لصفحة الدخول
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
