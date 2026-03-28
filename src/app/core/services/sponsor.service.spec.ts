import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { SponsorService } from './sponsor.service';
import { environment } from '../../../environments/environment';

const BASE = environment.baseUrl;

describe('SponsorService', () => {
  let service: SponsorService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SponsorService]
    });
    service = TestBed.inject(SponsorService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getAllSponsors should GET /sponsors', () => {
    service.getAllSponsors().subscribe();
    http.expectOne(`${BASE}/sponsors`).flush([]);
  });

  it('getMyProfile should GET /sponsors/my-profile', () => {
    service.getMyProfile().subscribe();
    http.expectOne(`${BASE}/sponsors/my-profile`).flush({});
  });

  it('deleteSponsor should DELETE /sponsors/admin/:id', () => {
    service.deleteSponsor(1).subscribe();
    http.expectOne(`${BASE}/sponsors/admin/1`).flush(null);
  });

  it('getPendingSponsorships should GET /sponsorships/pending', () => {
    service.getPendingSponsorships().subscribe();
    http.expectOne(`${BASE}/sponsorships/pending`).flush([]);
  });

  it('getActiveSponsorships should GET /sponsorships/active', () => {
    service.getActiveSponsorships().subscribe();
    http.expectOne(`${BASE}/sponsorships/active`).flush([]);
  });

  it('getMySponsorships should GET /sponsorships/my-sponsorships', () => {
    service.getMySponsorships().subscribe();
    http.expectOne(`${BASE}/sponsorships/my-sponsorships`).flush([]);
  });

  it('submitSponsorship should POST /sponsorships/submit with body', () => {
    const req = { amount: 500, startDate: '2026-01-01', endDate: '2026-02-01' };
    service.submitSponsorship(req).subscribe();
    const r = http.expectOne(`${BASE}/sponsorships/submit`);
    expect(r.request.method).toBe('POST');
    expect(r.request.body).toEqual(req);
    r.flush({});
  });

  it('approveSponsorship should PUT /sponsorships/admin/:id/approve', () => {
    service.approveSponsorship(7).subscribe();
    const r = http.expectOne(`${BASE}/sponsorships/admin/7/approve`);
    expect(r.request.method).toBe('PUT');
    r.flush({});
  });

  it('rejectSponsorship should PUT /sponsorships/admin/:id/reject', () => {
    service.rejectSponsorship(7).subscribe();
    const r = http.expectOne(`${BASE}/sponsorships/admin/7/reject`);
    expect(r.request.method).toBe('PUT');
    r.flush({});
  });

  it('cancelSponsorship should DELETE /sponsorships/:id/cancel', () => {
    service.cancelSponsorship(7).subscribe();
    http.expectOne(`${BASE}/sponsorships/7/cancel`).flush(null);
  });

  it('getAvailableTargets should GET /sponsorships/available-targets', () => {
    service.getAvailableTargets().subscribe();
    http.expectOne(`${BASE}/sponsorships/available-targets`).flush({ targets: [] });
  });

  it('uploadPaymentProofFile should POST FormData to /sponsorships/:id/payment-proof-file', () => {
    const file = new File(['data'], 'proof.pdf');
    service.uploadPaymentProofFile(9, file).subscribe();
    const r = http.expectOne(`${BASE}/sponsorships/9/payment-proof-file`);
    expect(r.request.method).toBe('POST');
    expect(r.request.body instanceof FormData).toBe(true);
    r.flush({});
  });

  it('getAdminStats should GET /sponsorships/admin/stats', () => {
    service.getAdminStats().subscribe();
    http.expectOne(`${BASE}/sponsorships/admin/stats`).flush({ totalActive: 0, totalPending: 0, totalAmountThisMonth: 0 });
  });

  it('deleteSponsorship should DELETE /sponsorships/admin/:id', () => {
    service.deleteSponsorship(5).subscribe();
    http.expectOne(`${BASE}/sponsorships/admin/5`).flush(null);
  });

  it('getAllSponsorships should GET /sponsorships/admin/all', () => {
    service.getAllSponsorships().subscribe();
    http.expectOne(`${BASE}/sponsorships/admin/all`).flush([]);
  });
});
