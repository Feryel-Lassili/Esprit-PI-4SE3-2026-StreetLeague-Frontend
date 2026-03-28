import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError, Observable } from 'rxjs';

import { FrontofficeSponsorsComponent } from './sponsors.component';
import { SponsorService } from '../../core/services/sponsor.service';
import { AuthService } from '../../core/services/auth.service';
import { SponsorProfile, Sponsorship, SponsorshipStatus } from '../../core/models/sponsor.model';

const mockSponsor: SponsorProfile = {
  id: 1, companyName: 'Acme', logo: '', contactEmail: 'acme@test.com', budget: 10000,
  user: { id: 1, email: 'acme@test.com', username: 'acme', role: 'SPONSOR', enabled: true, createdAt: '' }
};

const mockSponsorship: Sponsorship = {
  id: 7, amount: 3000, startDate: '2026-03-05', endDate: '2026-03-26',
  status: SponsorshipStatus.PENDING, targetName: 'Club Sfaxien', targetType: 'TEAM'
};

function makeSponsorSvc() {
  return {
    getAllSponsors: jasmine.createSpy().and.returnValue(of([])),
    getMySponsorships: jasmine.createSpy().and.returnValue(of([])),
    getPendingSponsorships: jasmine.createSpy().and.returnValue(of([])),
    getAvailableTargets: jasmine.createSpy().and.returnValue(of({ targets: [] })),
    submitSponsorship: jasmine.createSpy().and.returnValue(of({})),
    uploadPaymentProofFile: jasmine.createSpy().and.returnValue(of({})),
    approveSponsorship: jasmine.createSpy().and.returnValue(of({})),
    rejectSponsorship: jasmine.createSpy().and.returnValue(of({})),
    cancelSponsorship: jasmine.createSpy().and.returnValue(of(undefined)),
  };
}

function makeAuthSvc(isSponsor = false, isAdmin = false) {
  return { hasRole: jasmine.createSpy().and.callFake((role: string) => (role === 'SPONSOR' && isSponsor) || (role === 'ADMIN' && isAdmin)) };
}

describe('FrontofficeSponsorsComponent', () => {
  let sponsorSvc: ReturnType<typeof makeSponsorSvc>;
  let authSvc: ReturnType<typeof makeAuthSvc>;

  async function setup(isSponsor = false, isAdmin = false) {
    sponsorSvc = makeSponsorSvc();
    authSvc = makeAuthSvc(isSponsor, isAdmin);
    await TestBed.configureTestingModule({
      imports: [FrontofficeSponsorsComponent, ReactiveFormsModule, CommonModule],
      providers: [
        { provide: SponsorService, useValue: sponsorSvc },
        { provide: AuthService, useValue: authSvc }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(FrontofficeSponsorsComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  // --- Init ---
  it('should create and default to sponsors tab', async () => {
    const comp = await setup();
    expect(comp).toBeTruthy();
    expect(comp.activeTab).toBe('sponsors');
  });

  it('should load sponsors on init', async () => {
    sponsorSvc = makeSponsorSvc();
    sponsorSvc.getAllSponsors.and.returnValue(of([mockSponsor]));
    authSvc = makeAuthSvc();
    await TestBed.configureTestingModule({
      imports: [FrontofficeSponsorsComponent, ReactiveFormsModule, CommonModule],
      providers: [
        { provide: SponsorService, useValue: sponsorSvc },
        { provide: AuthService, useValue: authSvc }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(FrontofficeSponsorsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.sponsors.length).toBe(1);
  });

  it('should load pending on init when admin', async () => {
    sponsorSvc = makeSponsorSvc();
    sponsorSvc.getPendingSponsorships.and.returnValue(of([mockSponsorship]));
    authSvc = makeAuthSvc(false, true);
    await TestBed.configureTestingModule({
      imports: [FrontofficeSponsorsComponent, ReactiveFormsModule, CommonModule],
      providers: [
        { provide: SponsorService, useValue: sponsorSvc },
        { provide: AuthService, useValue: authSvc }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(FrontofficeSponsorsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.pendingSponsorships.length).toBe(1);
  });

  it('should handle non-array available targets', async () => {
    sponsorSvc = makeSponsorSvc();
    sponsorSvc.getAvailableTargets.and.returnValue(of(null as any));
    authSvc = makeAuthSvc(true, false);
    await TestBed.configureTestingModule({
      imports: [FrontofficeSponsorsComponent, ReactiveFormsModule, CommonModule],
      providers: [
        { provide: SponsorService, useValue: sponsorSvc },
        { provide: AuthService, useValue: authSvc }
      ]
    }).compileComponents();
    const fixture = TestBed.createComponent(FrontofficeSponsorsComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.availableTargets).toEqual([]);
  });

  // --- Form validation ---
  it('form should be invalid when empty', async () => {
    const comp = await setup();
    expect(comp.sponsorForm.invalid).toBeTruthy();
  });

  it('amount should be invalid when 0', async () => {
    const comp = await setup();
    comp.sponsorForm.patchValue({ targetId: '1|TEAM', amount: 0, startDate: '2026-01-01', endDate: '2026-02-01' });
    expect(comp.sponsorForm.get('amount')!.invalid).toBeTruthy();
  });

  it('should set endBeforeStart error when end <= start', async () => {
    const comp = await setup();
    comp.sponsorForm.patchValue({ targetId: '1|TEAM', amount: 500, startDate: '2026-03-10', endDate: '2026-03-05' });
    expect(comp.sponsorForm.hasError('endBeforeStart')).toBeTruthy();
  });

  it('should be valid with correct values', async () => {
    const comp = await setup();
    comp.sponsorForm.patchValue({ targetId: '1|TEAM', amount: 500, startDate: '2026-03-01', endDate: '2026-03-10' });
    expect(comp.sponsorForm.valid).toBeTruthy();
  });

  it('description should fail maxLength 500', async () => {
    const comp = await setup();
    comp.sponsorForm.patchValue({ description: 'a'.repeat(501) });
    expect(comp.sponsorForm.get('description')!.invalid).toBeTruthy();
  });

  // --- isInvalid ---
  it('isInvalid returns true after touch on empty required field', async () => {
    const comp = await setup();
    comp.sponsorForm.get('targetId')!.markAsTouched();
    expect(comp.isInvalid('targetId')).toBeTruthy();
  });

  it('isInvalid returns false for untouched field', async () => {
    const comp = await setup();
    expect(comp.isInvalid('targetId')).toBeFalsy();
  });

  // --- Benefits ---
  it('should add benefit on check', async () => {
    const comp = await setup();
    comp.onBenefitChange('LOGO_PLACEMENT', { target: { checked: true } } as any);
    expect(comp.isBenefitSelected('LOGO_PLACEMENT')).toBeTruthy();
  });

  it('should remove benefit on uncheck', async () => {
    const comp = await setup();
    comp.sponsorForm.get('benefits')!.setValue(['LOGO_PLACEMENT']);
    comp.onBenefitChange('LOGO_PLACEMENT', { target: { checked: false } } as any);
    expect(comp.isBenefitSelected('LOGO_PLACEMENT')).toBeFalsy();
  });

  // --- File upload ---
  it('should reject file over 5MB', async () => {
    const comp = await setup();
    const bigFile = new File(['x'.repeat(6 * 1024 * 1024)], 'big.pdf');
    comp.onFileSelected({ target: { files: [bigFile] } } as any);
    expect(comp.fileError).toBe('File must be under 5MB');
    expect(comp.paymentProofFile).toBeNull();
  });

  it('should accept valid file under 5MB', async () => {
    const comp = await setup();
    const file = new File(['data'], 'proof.pdf');
    comp.onFileSelected({ target: { files: [file] } } as any);
    expect(comp.paymentProofFile).toBe(file);
    expect(comp.fileError).toBe('');
  });

  // --- getTargetsByType ---
  it('should filter targets by type', async () => {
    const comp = await setup();
    comp.availableTargets = [
      { id: 1, name: 'Team A', type: 'TEAM' },
      { id: 2, name: 'Venue B', type: 'VENUE' }
    ];
    expect(comp.getTargetsByType('TEAM').length).toBe(1);
    expect(comp.getTargetsByType('EVENT').length).toBe(0);
  });

  // --- submitSponsorship ---
  it('should not submit when form is invalid', async () => {
    const comp = await setup();
    comp.submitSponsorship();
    expect(sponsorSvc.submitSponsorship).not.toHaveBeenCalled();
  });

  it('should submit with correct TEAM payload', async () => {
    const comp = await setup(true);
    sponsorSvc.submitSponsorship.and.returnValue(of({ ...mockSponsorship, id: 10 }));
    sponsorSvc.getMySponsorships.and.returnValue(of([]));
    comp.sponsorForm.patchValue({ targetId: '1|TEAM', amount: 500, startDate: '2026-03-01', endDate: '2026-03-10' });
    comp.submitSponsorship();
    const payload = (sponsorSvc.submitSponsorship.calls.mostRecent().args as any)[0];
    expect(payload.team).toEqual({ id: 1 });
    expect(payload.amount).toBe(500);
  });

  it('should upload payment proof after submit', async () => {
    const comp = await setup(true);
    const created = { ...mockSponsorship, id: 10 };
    sponsorSvc.submitSponsorship.and.returnValue(of(created));
    sponsorSvc.uploadPaymentProofFile.and.returnValue(of(created));
    sponsorSvc.getMySponsorships.and.returnValue(of([]));
    comp.sponsorForm.patchValue({ targetId: '1|TEAM', amount: 500, startDate: '2026-03-01', endDate: '2026-03-10' });
    const file = new File(['data'], 'proof.pdf');
    comp.paymentProofFile = file;
    comp.submitSponsorship();
    expect(sponsorSvc.uploadPaymentProofFile).toHaveBeenCalledWith(10, file);
  });

  it('should set formError on submit failure', async () => {
    const comp = await setup(true);
    sponsorSvc.submitSponsorship.and.returnValue(throwError(() => new Error('fail')));
    comp.sponsorForm.patchValue({ targetId: '1|TEAM', amount: 500, startDate: '2026-03-01', endDate: '2026-03-10' });
    comp.submitSponsorship();
    expect(comp.formError).toBe('Failed to submit sponsorship');
  });

  // --- approve / reject ---
  it('should reload pending after approve', async () => {
    const comp = await setup(false, true);
    sponsorSvc.approveSponsorship.and.returnValue(of({} as any));
    sponsorSvc.getPendingSponsorships.and.returnValue(of([]));
    comp.approveSponsorship(7);
    expect(sponsorSvc.approveSponsorship).toHaveBeenCalledWith(7);
  });

  it('should reload pending after reject', async () => {
    const comp = await setup(false, true);
    sponsorSvc.rejectSponsorship.and.returnValue(of({} as any));
    sponsorSvc.getPendingSponsorships.and.returnValue(of([]));
    comp.rejectSponsorship(7);
    expect(sponsorSvc.rejectSponsorship).toHaveBeenCalledWith(7);
  });

  // --- getStatusClass ---
  it('should return correct status classes', async () => {
    const comp = await setup();
    expect(comp.getStatusClass(SponsorshipStatus.PENDING)).toContain('yellow');
    expect(comp.getStatusClass(SponsorshipStatus.ACTIVE)).toContain('green');
    expect(comp.getStatusClass(SponsorshipStatus.REJECTED)).toContain('red');
  });

  // --- getLogoSrc ---
  it('should return empty for null/empty logo', async () => {
    const comp = await setup();
    expect(comp.getLogoSrc('')).toBe('');
    expect(comp.getLogoSrc(null)).toBe('');
  });

  it('should return https URL as-is', async () => {
    const comp = await setup();
    expect(comp.getLogoSrc('https://cdn.example.com/logo.png')).toBe('https://cdn.example.com/logo.png');
  });

  it('should prefix /uploads/ with apiOrigin + /SpringSecurity', async () => {
    const comp = await setup();
    expect(comp.getLogoSrc('/uploads/logo.png')).toContain('/SpringSecurity/uploads/logo.png');
  });

  // --- prefillAndOpen ---
  it('should reset form and open modal', async () => {
    const comp = await setup(true);
    comp.sponsorForm.patchValue({ amount: 999 });
    comp.prefillAndOpen(mockSponsor);
    expect(comp.showSponsorshipForm).toBeTruthy();
    expect(comp.sponsorForm.get('amount')!.value).toBeNull();
    expect(comp.paymentProofFile).toBeNull();
  });
});
