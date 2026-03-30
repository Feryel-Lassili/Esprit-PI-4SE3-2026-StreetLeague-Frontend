import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService } from './profile.service';
import { environment } from '../../../environments/environment';

const BASE = environment.baseUrl;

describe('ProfileService', () => {
  let service: ProfileService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [ProfileService] });
    service = TestBed.inject(ProfileService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getCoachProfile should GET /coaches/my-profile', () => {
    service.getCoachProfile().subscribe();
    http.expectOne(`${BASE}/coaches/my-profile`).flush({});
  });

  it('updateCoachProfile should PUT /coaches/update', () => {
    service.updateCoachProfile({ certificate: 'UEFA', experienceYears: 5, specialty: 'Fitness' }).subscribe();
    const req = http.expectOne(`${BASE}/coaches/update`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ certificate: 'UEFA', experienceYears: 5, specialty: 'Fitness' });
    req.flush({});
  });

  it('getPlayerProfile should GET /players/my-profile', () => {
    service.getPlayerProfile().subscribe();
    http.expectOne(`${BASE}/players/my-profile`).flush({});
  });

  it('updatePlayerProfile should PUT /players/update', () => {
    service.updatePlayerProfile({ dateOfBirth: '2000-01-01', level: 'PROFESSIONAL' }).subscribe();
    const req = http.expectOne(`${BASE}/players/update`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ dateOfBirth: '2000-01-01', level: 'PROFESSIONAL' });
    req.flush({});
  });

  it('getRefereeProfile should GET /referees/my-profile', () => {
    service.getRefereeProfile().subscribe();
    http.expectOne(`${BASE}/referees/my-profile`).flush({});
  });

  it('updateRefereeProfile should PUT /referees/update', () => {
    service.updateRefereeProfile({ certificate: 'FIFA', experienceYears: 3, licenseNumber: 'LIC123' }).subscribe();
    const req = http.expectOne(`${BASE}/referees/update`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ certificate: 'FIFA', experienceYears: 3, licenseNumber: 'LIC123' });
    req.flush({});
  });

  it('getHealthProfessionalProfile should GET /health-professionals/my-profile', () => {
    service.getHealthProfessionalProfile().subscribe();
    http.expectOne(`${BASE}/health-professionals/my-profile`).flush({});
  });

  it('updateHealthProfessionalProfile should PUT /health-professionals/update', () => {
    service.updateHealthProfessionalProfile({ certificate: 'MD', specialty: 'Sports', licenseNumber: 'HP001' }).subscribe();
    const req = http.expectOne(`${BASE}/health-professionals/update`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('getVenueOwnerProfile should GET /venue-owners/my-profile', () => {
    service.getVenueOwnerProfile().subscribe();
    http.expectOne(`${BASE}/venue-owners/my-profile`).flush({});
  });

  it('updateVenueOwnerProfile should PUT /venue-owners/update', () => {
    service.updateVenueOwnerProfile({ companyName: 'Arena Co', phone: '555-1234' }).subscribe();
    const req = http.expectOne(`${BASE}/venue-owners/update`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ companyName: 'Arena Co', phone: '555-1234' });
    req.flush({});
  });

  it('getAdminProfile should GET /admins/my-profile', () => {
    service.getAdminProfile().subscribe();
    http.expectOne(`${BASE}/admins/my-profile`).flush({});
  });
});
