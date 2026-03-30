import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, timeout, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegisterRequest, LoginRequest, LoginResponse, User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.baseUrl}/auth`;
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'user_data';
  private platformId = inject(PLATFORM_ID);

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  register(data: RegisterRequest): Observable<string> {
    return this.http.post(`${this.API_URL}/register`, data, { responseType: 'text' }).pipe(
      timeout(10000),
      catchError(error => throwError(() => error))
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = { email, password };
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, request).pipe(
      timeout(10000),
      tap(response => this.setSession(response)),
      catchError(error => throwError(() => error))
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        return localStorage.getItem(this.TOKEN_KEY);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === `ROLE_${role}` || userRole === role;
  }

  // ✅ Retourne le profileId du user connecté (utilisé par le module Health)
  getProfileId(): number | null {
    const user = this.getCurrentUser();
    return user ? (user as any).profileId ?? null : null;
  }

  private setSession(response: LoginResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      const user: any = {
        email: response.email,
        role: response.role,
        profileId: (response as any).profileId ?? null  // ✅ stocke le profileId
      };
      localStorage.setItem(this.TOKEN_KEY, response.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  private getUserFromStorage(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }
}