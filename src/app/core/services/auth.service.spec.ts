import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

const BASE = environment.baseUrl;

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { http.verify(); localStorage.clear(); });

  it('should be created', () => expect(service).toBeTruthy());

  describe('login', () => {
    it('should POST to /auth/login and store token', () => {
      const resp = { token: 'tok123', email: 'a@b.com', role: 'ROLE_PLAYER', username: 'player' };
      service.login('a@b.com', 'pass').subscribe(r => expect(r.token).toBe('tok123'));
      http.expectOne(`${BASE}/auth/login`).flush(resp);
      expect(localStorage.getItem('jwt_token')).toBe('tok123');
    });

    it('should handle login error', () => {
      let errored = false;
      service.login('bad@b.com', 'wrong').subscribe({ error: () => errored = true });
      http.expectOne(`${BASE}/auth/login`).flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      expect(errored).toBeTrue();
    });
  });

  describe('register', () => {
    it('should POST to /auth/register', () => {
      const req: any = { fullName: 'Test', email: 't@t.com', password: 'pass', role: 'PLAYER' };
      service.register(req).subscribe(r => expect(r).toBe('OK'));
      http.expectOne(`${BASE}/auth/register`).flush('OK');
    });
  });

  describe('logout', () => {
    it('should clear localStorage and navigate', () => {
      localStorage.setItem('jwt_token', 'tok');
      localStorage.setItem('user_data', '{}');
      service.logout();
      expect(localStorage.getItem('jwt_token')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return false when no token', () => expect(service.isLoggedIn()).toBeFalse());
    it('should return true when token exists', () => {
      localStorage.setItem('jwt_token', 'tok');
      expect(service.isLoggedIn()).toBeTrue();
    });
  });

  describe('getToken', () => {
    it('should return null when no token', () => expect(service.getToken()).toBeNull());
    it('should return token from localStorage', () => {
      localStorage.setItem('jwt_token', 'mytoken');
      expect(service.getToken()).toBe('mytoken');
    });
  });

  describe('getUserRole', () => {
    it('should return null when no user', () => expect(service.getUserRole()).toBeNull());
    it('should return role from stored user', () => {
      localStorage.setItem('user_data', JSON.stringify({ email: 'a@b.com', role: 'ROLE_ADMIN', username: 'admin' }));
      // Re-read from storage by calling getCurrentUser which reads from BehaviorSubject seeded at construction
      // We need to simulate login to update the subject
      (service as any).currentUserSubject.next({ email: 'a@b.com', role: 'ROLE_ADMIN', username: 'admin' });
      expect(service.getUserRole()).toBe('ROLE_ADMIN');
    });
  });

  describe('hasRole', () => {
    it('should return false when no user', () => expect(service.hasRole('ADMIN')).toBeFalse());
    it('should match ROLE_ prefix', () => {
      (service as any).currentUserSubject.next({ role: 'ROLE_PLAYER', email: 'p@p.com', username: 'p' });
      expect(service.hasRole('PLAYER')).toBeTrue();
      expect(service.hasRole('ADMIN')).toBeFalse();
    });
    it('should match exact role', () => {
      (service as any).currentUserSubject.next({ role: 'ADMIN', email: 'a@a.com', username: 'a' });
      expect(service.hasRole('ADMIN')).toBeTrue();
    });
  });

  describe('getUsernameFromToken', () => {
    it('should return null when no token', () => expect(service.getUsernameFromToken()).toBeNull());
    it('should decode sub from JWT payload', () => {
      const payload = btoa(JSON.stringify({ sub: 'testuser' }));
      localStorage.setItem('jwt_token', `header.${payload}.sig`);
      expect(service.getUsernameFromToken()).toBe('testuser');
    });
  });

  describe('getUserIdFromToken', () => {
    it('should return null when no token', () => expect(service.getUserIdFromToken()).toBeNull());
    it('should decode userId from JWT payload', () => {
      const payload = btoa(JSON.stringify({ userId: 42 }));
      localStorage.setItem('jwt_token', `header.${payload}.sig`);
      expect(service.getUserIdFromToken()).toBe(42);
    });
  });

  describe('getMyUserId', () => {
    it('should return null when no role', () => {
      let result: any;
      service.getMyUserId().subscribe(v => result = v);
      expect(result).toBeNull();
    });

    it('should call player profile endpoint for ROLE_PLAYER', () => {
      (service as any).currentUserSubject.next({ role: 'ROLE_PLAYER', email: 'p@p.com', username: 'p' });
      let result: any;
      service.getMyUserId().subscribe(v => result = v);
      http.expectOne(`${BASE}/players/my-profile`).flush({ user: { id: 5 } });
      expect(result).toBe(5);
    });

    it('should return cached userId on second call', () => {
      (service as any).currentUserSubject.next({ role: 'ROLE_PLAYER', email: 'p@p.com', username: 'p' });
      service.getMyUserId().subscribe();
      http.expectOne(`${BASE}/players/my-profile`).flush({ user: { id: 7 } });
      let result: any;
      service.getMyUserId().subscribe(v => result = v);
      expect(result).toBe(7);
      http.expectNone(`${BASE}/players/my-profile`);
    });

    it('should call coach profile endpoint for ROLE_COACH', () => {
      (service as any).currentUserSubject.next({ role: 'ROLE_COACH', email: 'c@c.com', username: 'c' });
      service.getMyUserId().subscribe();
      http.expectOne(`${BASE}/coaches/my-profile`).flush({ user: { id: 10 } });
    });

    it('should call admin profile endpoint for ROLE_ADMIN', () => {
      (service as any).currentUserSubject.next({ role: 'ROLE_ADMIN', email: 'a@a.com', username: 'a' });
      service.getMyUserId().subscribe();
      http.expectOne(`${BASE}/admins/my-profile`).flush({ user: { id: 1 } });
    });

    it('should return null when profile call fails', () => {
      (service as any).currentUserSubject.next({ role: 'ROLE_PLAYER', email: 'p@p.com', username: 'p' });
      let result: any = 'not-null';
      service.getMyUserId().subscribe(v => result = v);
      http.expectOne(`${BASE}/players/my-profile`).flush('error', { status: 500, statusText: 'Error' });
      expect(result).toBeNull();
    });
  });

  describe('uploadSponsorLogoFile', () => {
    it('should POST FormData', () => {
      const file = new File(['data'], 'logo.png');
      service.uploadSponsorLogoFile(file).subscribe();
      const req = http.expectOne(`${BASE}/sponsors/upload-logo`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();
      req.flush('{"url":"http://img.com/logo.png"}');
    });
  });

  describe('uploadSponsorLogoUrl', () => {
    it('should POST with imageUrl param', () => {
      service.uploadSponsorLogoUrl('http://img.com/logo.png').subscribe();
      const req = http.expectOne(r => r.url === `${BASE}/sponsors/upload-logo`);
      expect(req.request.params.get('imageUrl')).toBe('http://img.com/logo.png');
      req.flush('{}');
    });
  });
});
