import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VenueService } from './venue.service';
import { VenueDTO, ReservationDTO } from '../models/venue.model';
import { environment } from '../../../../../environments/environment';

describe('VenueService', () => {
  let service: VenueService;
  let http: HttpTestingController;
  const BASE = `${environment.baseUrl}/venue`;
  const RES  = `${environment.baseUrl}/reservations`;

  const mockVenue: VenueDTO = {
    id: 1, name: 'Arena Nord', address: 'Tunis',
    pricePerHour: 50, capacity: 22, available: true, verified: true
  } as VenueDTO;

  const mockReservation: ReservationDTO = {
    id: 10, venueId: 1, venueName: 'Arena Nord',
    status: 'PENDING', duration: 2, price: 100
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VenueService]
    });
    service = TestBed.inject(VenueService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Venue Owner CRUD ───────────────────────────────────────────────────────

  it('getMyVenues: GETs /venue/my-venues', () => {
    service.getMyVenues().subscribe(v => expect(v.length).toBe(1));
    http.expectOne(`${BASE}/my-venues`).flush([mockVenue]);
  });

  it('getVenueDetails: GETs /venue/details/:id', () => {
    service.getVenueDetails(1).subscribe(v => expect(v.id).toBe(1));
    http.expectOne(`${BASE}/details/1`).flush(mockVenue);
  });

  it('createVenue: POSTs to /venue/create', () => {
    const payload = { name: 'Arena Nord', address: 'Tunis', pricePerHour: 50, capacity: 22 };
    service.createVenue(payload).subscribe(v => {
      expect(v.name).toBe('Arena Nord');
      expect(v.pricePerHour).toBe(50);
    });

    const req = http.expectOne(`${BASE}/create`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockVenue);
  });

  it('updateVenue: PUTs to /venue/update/:id', () => {
    const payload = { name: 'Updated Arena', address: 'Sousse', pricePerHour: 80, capacity: 30 };
    service.updateVenue(1, payload).subscribe(v => expect(v.name).toBe('Arena Nord'));

    const req = http.expectOne(`${BASE}/update/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockVenue);
  });

  it('deleteVenue: DELETEs /venue/delete/:id', () => {
    service.deleteVenue(1).subscribe(res => expect(res).toBeNull());
    const req = http.expectOne(`${BASE}/delete/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ── Public (player) ────────────────────────────────────────────────────────

  it('getVerifiedVenues: GETs /reservations/venues', () => {
    service.getVerifiedVenues().subscribe(v => expect(v.length).toBe(1));
    http.expectOne(`${RES}/venues`).flush([mockVenue]);
  });

  it('getAllVenues: GETs /venue/all', () => {
    service.getAllVenues().subscribe(v => expect(v.length).toBe(2));
    http.expectOne(`${BASE}/all`).flush([mockVenue, { ...mockVenue, id: 2 }]);
  });

  it('getVenueReservations: GETs /reservations/venue/:id', () => {
    service.getVenueReservations(1).subscribe(r => expect(r.length).toBe(1));
    http.expectOne(`${RES}/venue/1`).flush([mockReservation]);
  });

  // ── Venue Owner reservations ───────────────────────────────────────────────

  it('getOwnerReservations: GETs /reservations/owner/my', () => {
    service.getOwnerReservations().subscribe(r => expect(r.length).toBe(1));
    http.expectOne(`${RES}/owner/my`).flush([mockReservation]);
  });

  it('ownerConfirmReservation: PUTs to /reservations/owner/:id/confirm', () => {
    service.ownerConfirmReservation(10).subscribe(() => {});
    const req = http.expectOne(`${RES}/owner/10/confirm`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  it('ownerCancelReservation: PUTs to /reservations/owner/:id/cancel', () => {
    service.ownerCancelReservation(10).subscribe(() => {});
    const req = http.expectOne(`${RES}/owner/10/cancel`);
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  it('blockPeriod: POSTs to /reservations/owner/block', () => {
    service.blockPeriod(1, '2025-06-01T09:00:00', 2, 'Maintenance').subscribe(r => {
      expect(r.status).toBe('PENDING');
    });

    const req = http.expectOne(`${RES}/owner/block`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ venueId: 1, start: '2025-06-01T09:00:00', duration: 2, reason: 'Maintenance' });
    req.flush(mockReservation);
  });

  it('removeBlock: DELETEs /reservations/owner/block/:id', () => {
    service.removeBlock(10).subscribe(() => {});
    const req = http.expectOne(`${RES}/owner/block/10`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getOwnerBlocks: GETs /reservations/owner/blocks', () => {
    service.getOwnerBlocks().subscribe(r => expect(r.length).toBe(1));
    http.expectOne(`${RES}/owner/blocks`).flush([mockReservation]);
  });
});
