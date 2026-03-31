import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { SponsorService } from '../../../core/services/sponsor.service';

const mockCoachData = { certificate: 'UEFA', specialty: 'Fitness', experienceYears: 5, verified: true, user: { username: 'coach1', email: 'c@c.com', role: 'COACH' } };
const mockPlayerData = { dateOfBirth: '2000-01-01', level: 'PROFESSIONAL', user: { username: 'player1', email: 'p@p.com', role: 'PLAYER' } };
const mockSponsorData = { companyName: 'Acme', contactEmail: 'acme@test.com', budget: 5000, logo: '', user: { username: 'acme', email: 'acme@test.com', role: 'SPONSOR' } };

function makeAuthSvc(role: string) {
  return { hasRole: jasmine.createSpy().and.callFake((r: string) => r === role) };
}

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  async function setup(role: string, profileSvcOverrides: any = {}, sponsorSvcOverrides: any = {}) {
    const defaultProfileSvc = {
      getCoachProfile: jasmine.createSpy().and.returnValue(of(mockCoachData)),
      getPlayerProfile: jasmine.createSpy().and.returnValue(of(mockPlayerData))
    };
    const defaultSponsorSvc = { getMyProfile: jasmine.createSpy().and.returnValue(of(mockSponsorData)) };
    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [FormsModule],
      providers: [
        { provide: AuthService, useValue: makeAuthSvc(role) },
        { provide: ProfileService, useValue: { ...defaultProfileSvc, ...profileSvcOverrides } },
        { provide: SponsorService, useValue: { ...defaultSponsorSvc, ...sponsorSvcOverrides } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return component;
  }

  it('should create with no role', async () => {
    const comp = await setup('');
    expect(comp).toBeTruthy();
  });

  describe('loadProfile - COACH branch', () => {
    it('should load coach profile', async () => {
      const comp = await setup('COACH');
      expect(comp.isCoach).toBeTrue();
      expect(comp.coachProfile).toEqual(mockCoachData as any);
      expect(comp.loading).toBeFalse();
    });

    it('should handle coach profile error', async () => {
      const comp = await setup('COACH', { getCoachProfile: jasmine.createSpy().and.returnValue(throwError(() => new Error('fail'))) });
      expect(comp.error).toBe('Failed to load profile');
      expect(comp.loading).toBeFalse();
    });
  });

  describe('loadProfile - PLAYER branch', () => {
    it('should load player profile', async () => {
      const comp = await setup('PLAYER');
      expect(comp.isPlayer).toBeTrue();
      expect(comp.playerProfile).toEqual(mockPlayerData as any);
      expect(comp.loading).toBeFalse();
    });

    it('should handle player profile error', async () => {
      const comp = await setup('PLAYER', { getPlayerProfile: jasmine.createSpy().and.returnValue(throwError(() => new Error('fail'))) });
      expect(comp.error).toBe('Failed to load profile');
      expect(comp.loading).toBeFalse();
    });
  });

  describe('loadProfile - SPONSOR branch', () => {
    it('should handle sponsor profile error', async () => {
      const comp = await setup('SPONSOR', {}, { getMyProfile: jasmine.createSpy().and.returnValue(throwError(() => new Error('fail'))) });
      expect(comp.error).toBe('Failed to load profile');
      expect(comp.loading).toBeFalse();
    });
  });

  describe('getLogoSrc', () => {
    let comp: ProfileComponent;
    beforeEach(async () => { comp = await setup(''); });

    it('should return empty for null/empty/emoji', () => {
      expect(comp.getLogoSrc(null)).toBe('');
      expect(comp.getLogoSrc('')).toBe('');
      expect(comp.getLogoSrc('🏢')).toBe('');
    });

    it('should return data:image as-is', () => {
      expect(comp.getLogoSrc('data:image/png;base64,abc')).toBe('data:image/png;base64,abc');
    });

    it('should return https URL as-is', () => {
      expect(comp.getLogoSrc('https://cdn.example.com/logo.png')).toBe('https://cdn.example.com/logo.png');
    });

    it('should return http URL as-is', () => {
      expect(comp.getLogoSrc('http://example.com/logo.png')).toBe('http://example.com/logo.png');
    });

    it('should prefix localhost: with http://', () => {
      expect(comp.getLogoSrc('localhost:8080/img.png')).toBe('http://localhost:8080/img.png');
    });

    it('should expand lhost: shorthand', () => {
      expect(comp.getLogoSrc('lhost:8080/img.png')).toBe('http://localhost:8080/img.png');
    });

    it('should prefix /SpringSecurity/ path with apiOrigin', () => {
      const result = comp.getLogoSrc('/SpringSecurity/uploads/logo.png');
      expect(result).toContain('/SpringSecurity/uploads/logo.png');
    });

    it('should prefix /uploads/ with apiOrigin + /SpringSecurity', () => {
      const result = comp.getLogoSrc('/uploads/logo.png');
      expect(result).toContain('/SpringSecurity/uploads/logo.png');
    });

    it('should prefix uploads/ (no leading slash) with apiOrigin + /SpringSecurity/', () => {
      const result = comp.getLogoSrc('uploads/logo.png');
      expect(result).toContain('/SpringSecurity/uploads/logo.png');
    });

    it('should prefix / path with apiOrigin', () => {
      const result = comp.getLogoSrc('/some/path/logo.png');
      expect(result).toContain('/some/path/logo.png');
    });

    it('should fallback to apiBaseUrl for plain filename', () => {
      const result = comp.getLogoSrc('logo.png');
      expect(result).toContain('logo.png');
    });
  });
});