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
                     req.url.includes('/comment-reactions')||
                     req.url.includes('/user/me');

  if (token) {
    console.log(`[authInterceptor] Found token for ${req.url}. Attaching Authorization header.`);
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  } else {
    console.warn(`[authInterceptor] NO TOKEN FOUND for ${req.url}. Request will be sent unauthenticated!`);
  }

  return next(req).pipe(
    catchError(error => {
      console.error(`[authInterceptor] Caught HTTP error on ${req.url}:`, error.status);
      // Only redirect on 401 Unauthorized (invalid/expired token) - 403 is just access denied
      if (error.status === 401 && !skipLogout) {
        if (isPlatformBrowser(platformId)) {
          console.warn('[authInterceptor] Forcing logout due to 401 error.');
          authService.logout();
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};