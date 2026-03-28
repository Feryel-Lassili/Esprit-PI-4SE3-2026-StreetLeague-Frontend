import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, throwError, Observable } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { BackofficeSponsorComponent } from './sponsor-management.component';
import { SponsorService } from '../services/sponsor.service';
import { SponsorProfile, Sponsorship, SponsorshipStatus } from '../models/sponsor.model';

const mockSponsor: SponsorProfile = {
  id: 1, companyName: 'Acme', logo: '', contactEmail: 'acme@test.com', budget: 5000,
  user: { id: 1, email: 'acme@test.com', username: 'acme', role: 'SPONSOR', enabled: true, createdAt: '' }
};

const pending: Sponsorship = {
  id: 7, amount: 3000, startDate: '2026-03-05', endDate: '2026-03-26',
  status: SponsorshipStatus.PENDING, targetName: 'Club Sfaxien', targetType: 'TEAM'
};

const active: Sponsorship = {
  id: 8, amount: 2000, startDate: '2026-01-01', endDate: '2026-12-31',
  status: SponsorshipStatus.ACTIVE, targetName: 'Stade Rades', targetType: 'VENUE'
};

function makeSvc() {
  return {
    getAllSponsors: vi.fn((): Observable<SponsorProfile[]> => of([])),
    getPendingSponsorships: vi.fn((): Observable<Sponsorship[]> => of([])),
    getAdminStats: vi.fn(() => of({ totalActive: 0, totalPending: 0, totalAmountThisMonth: 0 })),
    getActiveSponsorships: vi.fn((): Observable<Sponsorship[]> => of([])),
    approveSponsorship: vi.fn((): Observable<any> => of({})),
    rejectSponsorship: vi.fn((): Observable<any> => of({})),
    deleteSponsor: vi.fn((): Observable<void> => of(undefined)),
    deleteSponsorship: vi.fn((): Observable<void> => of(undefined)),
  };
}

describe('BackofficeSponsorComponent', () => {
  let svc: ReturnType<typeof makeSvc>;

  async function setup() {
    svc = makeSvc();
    await TestBed.configureTestingModule({
      imports: [BackofficeSponsorComponent, CommonModule, FormsModule],
      providers: [{ provide: SponsorService, useValue: svc }]
    }).compileComponents();
    const fixture = TestBed.createComponent(BackofficeSponsorComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  // --- Init ---
  it('should create with sponsors tab active', async () => {
    const comp = await setup();
    expect(comp).toBeTruthy();
    expect(comp.activeTab).toBe('sponsors');
  });

  it('should load sponsors on init', async () => {
    svc = makeSvc();
    svc.getAllSponsors.mockReturnValue(of([mockSponsor]));
    await TestBed.configureTestingModule({
      imports: [BackofficeSponsorComponent, CommonModule, FormsModule],
      providers: [{ provide: SponsorService, useValue: svc }]
    }).compileComponents();
    const fixture = TestBed.createComponent(BackofficeSponsorComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.sponsors.length).toBe(1);
  });

  it('should load pending on init', async () => {
    svc = makeSvc();
    svc.getPendingSponsorships.mockReturnValue(of([pending]));
    await TestBed.configureTestingModule({
      imports: [BackofficeSponsorComponent, CommonModule, FormsModule],
      providers: [{ provide: SponsorService, useValue: svc }]
    }).compileComponents();
    const fixture = TestBed.createComponent(BackofficeSponsorComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.pendingSponsorships.length).toBe(1);
  });

  it('should load stats on init', async () => {
    svc = makeSvc();
    svc.getAdminStats.mockReturnValue(of({ totalActive: 3, totalPending: 2, totalAmountThisMonth: 9000 }));
    await TestBed.configureTestingModule({
      imports: [BackofficeSponsorComponent, CommonModule, FormsModule],
      providers: [{ provide: SponsorService, useValue: svc }]
    }).compileComponents();
    const fixture = TestBed.createComponent(BackofficeSponsorComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.stats!.totalActive).toBe(3);
  });

  it('should handle stats error silently', async () => {
    svc = makeSvc();
    svc.getAdminStats.mockReturnValue(throwError(() => new Error('403')));
    await TestBed.configureTestingModule({
      imports: [BackofficeSponsorComponent, CommonModule, FormsModule],
      providers: [{ provide: SponsorService, useValue: svc }]
    }).compileComponents();
    const fixture = TestBed.createComponent(BackofficeSponsorComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.stats).toBeNull();
  });

  // --- loadAllSponsorships ---
  it('should load active sponsorships', async () => {
    const comp = await setup();
    svc.getActiveSponsorships.mockReturnValue(of([active]));
    comp.loadAllSponsorships();
    expect(comp.allSponsorships.length).toBe(1);
    expect(comp.filteredSponsorships.length).toBe(1);
  });

  it('should handle non-array response', async () => {
    const comp = await setup();
    svc.getActiveSponsorships.mockReturnValue(of(null as any));
    comp.loadAllSponsorships();
    expect(comp.allSponsorships).toEqual([]);
  });

  // --- applyFilter ---
  it('should filter by ACTIVE status', async () => {
    const comp = await setup();
    comp.allSponsorships = [pending, active];
    comp.filterStatus = SponsorshipStatus.ACTIVE;
    comp.applyFilter();
    expect(comp.filteredSponsorships.length).toBe(1);
    expect(comp.filteredSponsorships[0].status).toBe(SponsorshipStatus.ACTIVE);
  });

  it('should show all when filterStatus is empty', async () => {
    const comp = await setup();
    comp.allSponsorships = [pending, active];
    comp.filterStatus = '';
    comp.applyFilter();
    expect(comp.filteredSponsorships.length).toBe(2);
  });

  // --- approve / reject ---
  it('should approve and reload pending', async () => {
    const comp = await setup();
    svc.approveSponsorship.mockReturnValue(of({} as any));
    svc.getPendingSponsorships.mockReturnValue(of([]));
    svc.getAdminStats.mockReturnValue(of({ totalActive: 1, totalPending: 0, totalAmountThisMonth: 0 }));
    comp.approve(7);
    expect(svc.approveSponsorship).toHaveBeenCalledWith(7);
    expect(svc.getPendingSponsorships).toHaveBeenCalled();
  });

  it('should reject and reload pending', async () => {
    const comp = await setup();
    svc.rejectSponsorship.mockReturnValue(of({} as any));
    svc.getPendingSponsorships.mockReturnValue(of([]));
    svc.getAdminStats.mockReturnValue(of({ totalActive: 0, totalPending: 0, totalAmountThisMonth: 0 }));
    comp.reject(7);
    expect(svc.rejectSponsorship).toHaveBeenCalledWith(7);
  });

  it('should set error on approve failure', async () => {
    const comp = await setup();
    svc.approveSponsorship.mockReturnValue(throwError(() => new Error('fail')));
    comp.approve(7);
    expect(comp.error).toBe('Failed to approve');
  });

  it('should set error on reject failure', async () => {
    const comp = await setup();
    svc.rejectSponsorship.mockReturnValue(throwError(() => new Error('fail')));
    comp.reject(7);
    expect(comp.error).toBe('Failed to reject');
  });

  // --- approveFromTable ---
  it('approveFromTable should reload active and pending', async () => {
    const comp = await setup();
    svc.approveSponsorship.mockReturnValue(of({} as any));
    svc.getActiveSponsorships.mockReturnValue(of([]));
    svc.getPendingSponsorships.mockReturnValue(of([]));
    svc.getAdminStats.mockReturnValue(of({ totalActive: 0, totalPending: 0, totalAmountThisMonth: 0 }));
    comp.approveFromTable(7);
    expect(svc.getActiveSponsorships).toHaveBeenCalled();
    expect(svc.getPendingSponsorships).toHaveBeenCalled();
  });

  // --- deleteSponsor ---
  it('should remove sponsor after confirmed delete', async () => {
    const comp = await setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    svc.deleteSponsor.mockReturnValue(of(undefined));
    comp.sponsors = [mockSponsor];
    comp.deleteSponsor(1);
    expect(comp.sponsors.length).toBe(0);
  });

  it('should not delete if confirm cancelled', async () => {
    const comp = await setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    comp.sponsors = [mockSponsor];
    comp.deleteSponsor(1);
    expect(svc.deleteSponsor).not.toHaveBeenCalled();
  });

  // --- deleteSponsorship ---
  it('should remove sponsorship after confirmed delete', async () => {
    const comp = await setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    svc.deleteSponsorship.mockReturnValue(of(undefined));
    comp.allSponsorships = [active];
    comp.filteredSponsorships = [active];
    comp.deleteSponsorship(8);
    expect(comp.allSponsorships.length).toBe(0);
  });

  // --- getStatusClass ---
  it('should return correct status classes', async () => {
    const comp = await setup();
    expect(comp.getStatusClass(SponsorshipStatus.PENDING)).toContain('yellow');
    expect(comp.getStatusClass(SponsorshipStatus.ACTIVE)).toContain('green');
    expect(comp.getStatusClass(SponsorshipStatus.REJECTED)).toContain('red');
  });

  // --- getLogoSrc ---
  it('should return empty for null logo', async () => {
    const comp = await setup();
    expect(comp.getLogoSrc(null)).toBe('');
  });

  it('should return https URL as-is', async () => {
    const comp = await setup();
    expect(comp.getLogoSrc('https://cdn.example.com/logo.png')).toBe('https://cdn.example.com/logo.png');
  });

  it('should prefix uploads/ with apiOrigin + /SpringSecurity/', async () => {
    const comp = await setup();
    expect(comp.getLogoSrc('uploads/logo.png')).toContain('/SpringSecurity/uploads/logo.png');
  });
});
