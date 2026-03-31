import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const token = authService.getToken();

  const isAuthRequest = req.url.includes('/auth/login') ||
    req.url.includes('/auth/register');

  const skipLogout = isAuthRequest ||
    req.url.includes('/cart') ||
    req.url.includes('/posts') ||
    req.url.includes('/likes') ||
    req.url.includes('/comments') ||
    req.url.includes('/comment-reactions') ||
    req.url.includes('/virtual-teams') ||
    req.url.includes('/user/me') ||
    req.url.includes('/teams') ||
    req.url.includes('/players');

  if (token && !isAuthRequest) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401 && !skipLogout) {
        if (isPlatformBrowser(platformId)) {
          authService.logout();
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
