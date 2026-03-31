import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';
import { guestGuard } from './guest.guard';
import { AuthService } from '../services/auth.service';

function makeAuthSvc(loggedIn = false, role = '') {
  return jasmine.createSpyObj<AuthService>('AuthService', {
    isLoggedIn: loggedIn,
    hasRole: false,
    getToken: null,
    logout: undefined
  });
}

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authService = makeAuthSvc();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authService }]
    });
    router = TestBed.inject(Router);
  });

  it('should allow access when logged in', () => {
    authService.isLoggedIn.and.returnValue(true);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/home' } as RouterStateSnapshot)
    );
    expect(result).toBeTrue();
  });

  it('should redirect to /login with returnUrl when not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);
    const navigateSpy = spyOn(router, 'navigate');
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/home' } as RouterStateSnapshot)
    );
    expect(result).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/login'], { queryParams: { returnUrl: '/home' } });
  });
});

describe('roleGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authService = makeAuthSvc();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authService }]
    });
    router = TestBed.inject(Router);
  });

  it('should redirect to /login when not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);
    const navigateSpy = spyOn(router, 'navigate');
    const route = { data: { role: 'ADMIN' } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(route, {} as RouterStateSnapshot)
    );
    expect(result).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });

  it('should allow access when logged in and has required role', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.hasRole.and.returnValue(true);
    const route = { data: { role: 'ADMIN' } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(route, {} as RouterStateSnapshot)
    );
    expect(result).toBeTrue();
  });

  it('should redirect to / when logged in but wrong role', () => {
    authService.isLoggedIn.and.returnValue(true);
    authService.hasRole.and.returnValue(false);
    const navigateSpy = spyOn(router, 'navigate');
    const route = { data: { role: 'ADMIN' } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(route, {} as RouterStateSnapshot)
    );
    expect(result).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});

describe('guestGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authService = makeAuthSvc();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authService }]
    });
    router = TestBed.inject(Router);
  });

  it('should allow access when not logged in', () => {
    authService.isLoggedIn.and.returnValue(false);
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeTrue();
  });

  it('should redirect to / when already logged in', () => {
    authService.isLoggedIn.and.returnValue(true);
    const navigateSpy = spyOn(router, 'navigate');
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});
