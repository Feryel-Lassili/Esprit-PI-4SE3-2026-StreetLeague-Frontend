import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CarpoolingService } from './carpooling.service';
import { CarpoolingDTO } from '../models/carpooling.model';
import { environment } from '../../../../../environments/environment';

describe('CarpoolingService', () => {
  let service: CarpoolingService;
  let http: HttpTestingController;
  const BASE = `${environment.baseUrl}/carpoolings`;

  const mockTrip: CarpoolingDTO = {
    id: 1,
    departureLocation: 'Tunis',
    arrivalLocation:   'Sousse',
    carId: 10,
    driverUsername: 'alice',
    availableSeats: 3,
    participantCount: 0,
    participantUsernames: [],
    participantEmails: []
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CarpoolingService]
    });
    service = TestBed.inject(CarpoolingService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── create ─────────────────────────────────────────────────────────────────

  it('create: POSTs to /carpoolings/create', () => {
    const payload = { departureLocation: 'Tunis', arrivalLocation: 'Sousse', carId: 10 };
    service.create(payload).subscribe(res => {
      expect(res.id).toBe(1);
      expect(res.departureLocation).toBe('Tunis');
    });

    const req = http.expectOne(`${BASE}/create`);
    expect(req.request.method).toBe('POST');
    req.flush(mockTrip);
  });

  // ── getAll ─────────────────────────────────────────────────────────────────

  it('getAll: GETs /carpoolings/all', () => {
    service.getAll().subscribe(trips => expect(trips.length).toBe(1));

    const req = http.expectOne(`${BASE}/all`);
    expect(req.request.method).toBe('GET');
    req.flush([mockTrip]);
  });

  // ── getMyTrips ─────────────────────────────────────────────────────────────

  it('getMyTrips: GETs /carpoolings/my-trips', () => {
    service.getMyTrips().subscribe(trips => {
      expect(trips[0].driverUsername).toBe('alice');
    });

    const req = http.expectOne(`${BASE}/my-trips`);
    expect(req.request.method).toBe('GET');
    req.flush([mockTrip]);
  });

  // ── getMyJoined ────────────────────────────────────────────────────────────

  it('getMyJoined: GETs /carpoolings/my-joined', () => {
    service.getMyJoined().subscribe(trips => expect(trips.length).toBe(0));

    const req = http.expectOne(`${BASE}/my-joined`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  // ── getById ────────────────────────────────────────────────────────────────

  it('getById: GETs /carpoolings/details/:id', () => {
    service.getById(1).subscribe(t => expect(t.id).toBe(1));

    const req = http.expectOne(`${BASE}/details/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTrip);
  });

  // ── join ───────────────────────────────────────────────────────────────────

  it('join: PUTs to /carpoolings/:id/join', () => {
    const joined = { ...mockTrip, participantCount: 1 };
    service.join(1).subscribe(t => expect(t.participantCount).toBe(1));

    const req = http.expectOne(`${BASE}/1/join`);
    expect(req.request.method).toBe('PUT');
    req.flush(joined);
  });

  // ── leave ──────────────────────────────────────────────────────────────────

  it('leave: PUTs to /carpoolings/:id/leave', () => {
    service.leave(1).subscribe(t => expect(t).toBeTruthy());

    const req = http.expectOne(`${BASE}/1/leave`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockTrip);
  });

  // ── delete ─────────────────────────────────────────────────────────────────

  it('delete: DELETEs /carpoolings/:id/delete', () => {
    service.delete(1).subscribe(res => expect(res).toBeNull());

    const req = http.expectOne(`${BASE}/1/delete`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
