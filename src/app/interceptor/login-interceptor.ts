import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginService } from '../services/login-service';

export const loginInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const login = inject(LoginService);
  const propia = req.url.startsWith(environment.apiURL + '/');
  const publica = req.url.endsWith('/authenticate') || req.url.endsWith('/register');
  const token = login.getToken();
  const authReq = propia && !publica && token
    ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : req;
  return next(authReq).pipe(catchError(error => {
    if (propia && !publica && token && token === login.getToken() && error.status === 401) {
      login.logout();
      router.navigate(['/login']);
    }
    return throwError(() => error);
  }));
};
