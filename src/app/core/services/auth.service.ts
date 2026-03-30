import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, timeout, catchError, throwError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { RegisterRequest, LoginRequest, LoginResponse, User, Role } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.baseUrl}/auth`;
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'user_data';
  private readonly BASE_URL = `${environment.baseUrl}`;
  private platformId = inject(PLATFORM_ID);
  private cachedUserId: number | null = null;
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  register(data: RegisterRequest): Observable<string> {
    return this.http.post(`${this.API_URL}/register`, data, { responseType: 'text' }).pipe(
      timeout(10000),
      catchError(error => {
        console.error('Register API error:', error);
        return throwError(() => error);
      })
    );
  }

  uploadSponsorLogoFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.BASE_URL}/sponsors/upload-logo`, formData, { responseType: 'text' }).pipe(
      map((res: string) => {
        try {
          return JSON.parse(res);
        } catch {
          return res;
        }
      }),
      timeout(10000)
    );
  }

  uploadSponsorLogoUrl(imageUrl: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/sponsors/upload-logo`, null, {
      responseType: 'text',
      params: { imageUrl }
    }).pipe(
      map((res: string) => {
        try {
          return JSON.parse(res);
        } catch {
          return res;
        }
      }),
      timeout(10000)
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const request: LoginRequest = { email, password };
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, request).pipe(
      timeout(10000),
      tap(response => {
        this.setSession(response);
      }),
      catchError(error => {
        console.error('Login API error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.cachedUserId = null;
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

  getUsernameFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ?? payload.username ?? null;
    } catch {
      return null;
    }
  }

  getUserIdFromToken(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId ?? null;
    } catch {
      return null;
    }
  }

  getMyUserId(): Observable<number | null> {
    if (this.cachedUserId) return of(this.cachedUserId);
    const role = this.getUserRole();
    const roleMap: Record<string, string> = {
      'ROLE_PLAYER': '/players/my-profile',
      'ROLE_COACH': '/coaches/my-profile',
      'ROLE_REFEREE': '/referees/my-profile',
      'ROLE_HEALTH_PROFESSIONAL': '/health-professionals/my-profile',
      'ROLE_SPONSOR': '/sponsors/my-profile',
      'ROLE_VENUE_OWNER': '/venue-owners/my-profile',
      'ROLE_ADMIN': '/admins/my-profile'
    };
    const endpoint = role ? roleMap[role] : null;
    if (!endpoint) return of(null);
    return this.http.get<any>(`${this.BASE_URL}${endpoint}`).pipe(
      map(profile => {
        const id = profile?.user?.id ?? null;
        this.cachedUserId = id;
        return id;
      }),
      catchError(() => of(null))
    );
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
<<<<<<< HEAD
        username: response.username ?? response.email
=======
        profileId: (response as any).profileId ?? null  // ✅ stocke le profileId
>>>>>>> origin/feature_yossra
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