import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('accessToken');

  const clonedRequest = req.clone({
    withCredentials: true, // ضروري لإرسال واستقبال الـ HttpOnly Cookies الخاصة بـ Refresh Token
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {}
  });

  return next(clonedRequest);
};
