import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { catchError, EMPTY, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const loginInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  const authReq = token
    ? req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === HttpStatusCode.Unauthorized) {
        localStorage.clear();
        router.navigate(['/login']);
        return EMPTY;
      }
      return throwError(() => error);
    }),
  );
};
