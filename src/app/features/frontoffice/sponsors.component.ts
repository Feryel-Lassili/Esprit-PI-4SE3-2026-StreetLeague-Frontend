import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { SponsorService } from '../../core/services/sponsor.service';
import { AuthService } from '../../core/services/auth.service';
import { AvailableTarget, SponsorProfile, Sponsorship, SponsorshipStatus, TargetType } from '../../core/models/sponsor.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'fo-sponsors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 py-8">

      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-4xl font-black text-gray-900">💰 Sponsorships</h1>
          <p class="text-gray-600 mt-1">Connect with sponsors and manage partnerships</p>
        </div>
        <button *ngIf="isSponsor"
                (click)="showSponsorshipForm = !showSponsorshipForm"
                class="bg-gradient-to-r from-[#0D6EFD] to-[#FF6B00] text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2">
          ➕ New Sponsorship
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-8 bg-white rounded-2xl shadow p-2 w-fit">
        <button (click)="activeTab = 'sponsors'"
                [class]="activeTab === 'sponsors' ? 'bg-[#0D6EFD] text-white shadow' : 'text-gray-600 hover:text-gray-900'"
                class="px-6 py-2.5 rounded-xl font-semibold transition-all">
          🏢 All Sponsors
        </button>
        <button *ngIf="isSponsor"
                (click)="activeTab = 'my-sponsorships'; loadMySponsorships()"
                [class]="activeTab === 'my-sponsorships' ? 'bg-[#0D6EFD] text-white shadow' : 'text-gray-600 hover:text-gray-900'"
                class="px-6 py-2.5 rounded-xl font-semibold transition-all">
          📋 My Sponsorships
        </button>
        <button *ngIf="isAdmin"
                (click)="activeTab = 'pending'; loadPendingSponsorships()"
                [class]="activeTab === 'pending' ? 'bg-[#FF6B00] text-white shadow' : 'text-gray-600 hover:text-gray-900'"
                class="px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2">
          ⏳ Pending
          <span *ngIf="pendingSponsorships.length > 0"
                class="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {{ pendingSponsorships.length }}
          </span>
        </button>
      </div>

      <!-- Submit Form Modal -->
      <div *ngIf="showSponsorshipForm && isSponsor"
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4"
           (click)="showSponsorshipForm = false">
        <div class="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-black text-gray-900">🤝 New Sponsorship Request</h2>
            <button (click)="showSponsorshipForm = false" class="text-2xl text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form [formGroup]="sponsorForm" (ngSubmit)="submitSponsorship()" class="space-y-5">

            <!-- Target Selection -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Sponsorship Target *</label>
              <select formControlName="targetId"
                      class="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                      [class.border-red-400]="isInvalid('targetId')"
                      [class.border-gray-200]="!isInvalid('targetId')">
                <option value="">— Select a target —</option>
                <ng-container *ngFor="let type of targetTypes">
                  <optgroup *ngIf="getTargetsByType(type).length > 0" [label]="type">
                    <option *ngFor="let t of getTargetsByType(type)" [value]="t.id + '|' + t.type">
                      {{ t.name }}
                    </option>
                  </optgroup>
                </ng-container>
              </select>
              <p *ngIf="isInvalid('targetId')" class="text-red-500 text-xs mt-1">Please select a target</p>
            </div>

            <!-- Amount -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Amount ($) *</label>
              <input formControlName="amount" type="number" min="1" placeholder="e.g. 5000"
                     class="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                     [class.border-red-400]="isInvalid('amount')"
                     [class.border-gray-200]="!isInvalid('amount')">
              <p *ngIf="isInvalid('amount')" class="text-red-500 text-xs mt-1">Enter a valid amount (min $1)</p>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Start Date *</label>
                <input formControlName="startDate" type="date"
                       class="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                       [class.border-red-400]="isInvalid('startDate')"
                       [class.border-gray-200]="!isInvalid('startDate')">
                <p *ngIf="isInvalid('startDate')" class="text-red-500 text-xs mt-1">Required</p>
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">End Date *</label>
                <input formControlName="endDate" type="date"
                       class="w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors"
                       [class.border-red-400]="isInvalid('endDate') || sponsorForm.hasError('endBeforeStart')"
                       [class.border-gray-200]="!isInvalid('endDate') && !sponsorForm.hasError('endBeforeStart')">
                <p *ngIf="sponsorForm.hasError('endBeforeStart')" class="text-red-500 text-xs mt-1">End date must be after start date</p>
                <p *ngIf="isInvalid('endDate') && !sponsorForm.hasError('endBeforeStart')" class="text-red-500 text-xs mt-1">Required</p>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea formControlName="description" rows="3"
                        placeholder="Describe the purpose and goals of this sponsorship..."
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0D6EFD] focus:outline-none resize-none"
                        [class.border-red-400]="isInvalid('description')"></textarea>
              <div class="flex justify-between mt-1">
                <p *ngIf="isInvalid('description')" class="text-red-500 text-xs">Max 500 characters</p>
                <p class="text-xs text-gray-400 ml-auto">{{ sponsorForm.get('description')?.value?.length || 0 }}/500</p>
              </div>
            </div>

            <!-- Benefits Checkboxes -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-3">Expected Benefits</label>
              <div class="grid grid-cols-2 gap-2">
                <label *ngFor="let b of benefitOptions" class="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" [value]="b.value"
                         (change)="onBenefitChange(b.value, $event)"
                         [checked]="isBenefitSelected(b.value)"
                         class="w-4 h-4 accent-[#0D6EFD] cursor-pointer">
                  <span class="text-sm text-gray-700 group-hover:text-gray-900">{{ b.label }}</span>
                </label>
              </div>
            </div>

            <!-- Payment Proof Upload -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Payment Proof</label>
              <div class="border-2 border-dashed rounded-xl p-4 text-center transition-colors"
                   [class.border-[#0D6EFD]]="paymentProofFile"
                   [class.border-gray-300]="!paymentProofFile">
                <input #fileInput type="file" accept="image/*,.pdf" class="hidden"
                       (change)="onFileSelected($event)">
                <div *ngIf="!paymentProofFile" (click)="fileInput.click()" class="cursor-pointer">
                  <div class="text-3xl mb-2">📎</div>
                  <p class="text-sm text-gray-500">Click to upload payment proof</p>
                  <p class="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 5MB</p>
                </div>
                <div *ngIf="paymentProofFile" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl">✅</span>
                    <div class="text-left">
                      <p class="text-sm font-bold text-gray-800">{{ paymentProofFile.name }}</p>
                      <p class="text-xs text-gray-500">{{ (paymentProofFile.size / 1024).toFixed(1) }} KB</p>
                    </div>
                  </div>
                  <button type="button" (click)="paymentProofFile = null"
                          class="text-red-400 hover:text-red-600 text-lg font-bold">✕</button>
                </div>
              </div>
              <p *ngIf="fileError" class="text-red-500 text-xs mt-1">{{ fileError }}</p>
            </div>

            <p *ngIf="formError" class="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl">{{ formError }}</p>

            <div class="flex gap-3 pt-2">
              <button type="submit" [disabled]="isSubmitting"
                      class="flex-1 bg-gradient-to-r from-[#32CD32] to-[#228B22] text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50">
                {{ isSubmitting ? '⏳ Submitting...' : '✓ Submit Sponsorship' }}
              </button>
              <button type="button" (click)="showSponsorshipForm = false"
                      class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- All Sponsors -->
      <div *ngIf="activeTab === 'sponsors'">
        <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let i of [1,2,3,4,5,6]" class="bg-white rounded-3xl shadow p-6 animate-pulse">
            <div class="flex gap-4 mb-4">
              <div class="w-16 h-16 bg-gray-200 rounded-xl"></div>
              <div class="flex-1">
                <div class="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div class="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            </div>
            <div class="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>

        <div *ngIf="!loading && sponsors.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">🏢</div>
          <p class="text-gray-500 text-lg">No sponsors yet</p>
        </div>

        <div *ngIf="!loading && sponsors.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let sponsor of sponsors"
               class="bg-white rounded-3xl shadow hover:shadow-2xl transition-all p-6 group">
            <div class="flex items-start gap-4 mb-5">
              <div class="w-16 h-16 bg-gradient-to-br from-[#FFD60A] to-[#FF6B00] rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                <img *ngIf="getLogoSrc(sponsor.logo) as logoSrc; else allSponsorsFallbackLogo"
                     [src]="logoSrc"
                     alt="Sponsor logo"
                     class="w-full h-full rounded-2xl object-cover">
                <ng-template #allSponsorsFallbackLogo>🏢</ng-template>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-black text-gray-900 text-lg truncate">{{ sponsor.companyName }}</h3>
                <p class="text-sm text-gray-500 truncate">{{ sponsor.contactEmail }}</p>
              </div>
            </div>

            <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p class="text-xs text-gray-500 font-medium">Available Budget</p>
                <p class="text-2xl font-black text-[#32CD32]">\${{ sponsor.budget.toLocaleString() }}</p>
              </div>
              <div class="text-3xl">💵</div>
            </div>

            <button *ngIf="isSponsor"
                    (click)="prefillAndOpen(sponsor)"
                    class="w-full mt-4 py-2.5 border-2 border-[#0D6EFD] text-[#0D6EFD] rounded-xl font-bold hover:bg-[#0D6EFD] hover:text-white transition-all text-sm">
              Request Partnership
            </button>
          </div>
        </div>
      </div>

      <!-- My Sponsorships -->
      <div *ngIf="activeTab === 'my-sponsorships'">
        <div *ngIf="loading" class="text-center py-12 text-gray-500">⏳ Loading...</div>

        <div *ngIf="!loading && mySponsorships.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">📋</div>
          <p class="text-gray-500 text-lg">No sponsorships yet</p>
          <button (click)="showSponsorshipForm = true"
                  class="mt-4 bg-[#0D6EFD] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0b5ed7] transition-all">
            Submit Your First Sponsorship
          </button>
        </div>

        <div *ngIf="!loading && mySponsorships.length > 0" class="space-y-4">
          <div *ngFor="let s of mySponsorships"
               class="bg-white rounded-3xl shadow hover:shadow-lg transition-all p-6">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3 flex-wrap">
                  <span class="text-lg font-black text-gray-900">Sponsorship #{{ s.id }}</span>
                  <span [class]="getStatusClass(s.status)"
                        class="px-3 py-1 rounded-full text-xs font-bold">
                    {{ s.status }}
                  </span>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div class="bg-gray-50 rounded-xl p-3">
                    <p class="text-gray-500 text-xs">Amount</p>
                    <p class="font-black text-[#0D6EFD] text-lg">\${{ s.amount.toLocaleString() }}</p>
                  </div>
                  <div class="bg-gray-50 rounded-xl p-3">
                    <p class="text-gray-500 text-xs">Start Date</p>
                    <p class="font-bold text-gray-800">{{ s.startDate | date:'mediumDate' }}</p>
                  </div>
                  <div class="bg-gray-50 rounded-xl p-3">
                    <p class="text-gray-500 text-xs">End Date</p>
                    <p class="font-bold text-gray-800">{{ s.endDate | date:'mediumDate' }}</p>
                  </div>
                </div>
                <a *ngIf="s.paymentProof" [href]="s.paymentProof" target="_blank"
                   class="inline-flex items-center gap-1 mt-3 text-xs font-bold text-[#0D6EFD] hover:underline">
                  📎 View Payment Proof
                </a>
              </div>
              <button *ngIf="s.status === 'PENDING' || s.status === 'ACTIVE'"
                      (click)="cancelSponsorship(s.id!)"
                      class="flex-shrink-0 px-4 py-2 border-2 border-red-300 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-all text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending (Admin) -->
      <div *ngIf="activeTab === 'pending' && isAdmin">
        <div *ngIf="loading" class="text-center py-12 text-gray-500">⏳ Loading...</div>

        <div *ngIf="!loading && pendingSponsorships.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">✅</div>
          <p class="text-gray-500 text-lg">No pending requests</p>
        </div>

        <div *ngIf="!loading && pendingSponsorships.length > 0" class="space-y-4">
          <div *ngFor="let s of pendingSponsorships"
               class="bg-white rounded-3xl shadow hover:shadow-lg transition-all p-6">
            <div class="flex items-start justify-between gap-4 flex-wrap">
              <div class="flex items-start gap-4">
                <div class="w-14 h-14 bg-gradient-to-br from-[#FFD60A] to-[#FF6B00] rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                  <img *ngIf="getLogoSrc(s.sponsorLogo) as src; else foFallback" [src]="src" class="w-full h-full object-cover">
                  <ng-template #foFallback>🏢</ng-template>
                </div>
                <div>
                  <h3 class="font-black text-gray-900 text-lg">{{ s.companyName ?? s.targetName ?? '—' }}</h3>
                  <p class="text-sm text-gray-500">{{ s.targetType ?? '' }}</p>
                  <div class="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>📅 {{ s.startDate | date:'mediumDate' }} → {{ s.endDate | date:'mediumDate' }}</span>
                  </div>
                  <p *ngIf="s.description" class="text-sm text-gray-500 mt-1">{{ s.description }}</p>
                  <a *ngIf="s.paymentProof" [href]="s.paymentProof" target="_blank"
                     class="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#0D6EFD] hover:underline">
                    📎 View Payment Proof
                  </a>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-right">
                  <p class="text-xs text-gray-500">Amount</p>
                  <p class="text-3xl font-black text-[#0D6EFD]">\${{ s.amount.toLocaleString() }}</p>
                </div>
                <div class="flex flex-col gap-2">
                  <button (click)="approveSponsorship(s.id!)"
                          class="bg-[#32CD32] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#228B22] transition-all flex items-center gap-2">
                    ✓ Approve
                  </button>
                  <button (click)="rejectSponsorship(s.id!)"
                          class="bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 transition-all flex items-center gap-2">
                    ✕ Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="error" class="mt-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl">{{ error }}</div>
    </div>
  `
})
export class FrontofficeSponsorsComponent implements OnInit {
  sponsors: SponsorProfile[] = [];
  mySponsorships: Sponsorship[] = [];
  pendingSponsorships: Sponsorship[] = [];
  availableTargets: AvailableTarget[] = [];

  activeTab = 'sponsors';
  showSponsorshipForm = false;
  loading = false;
  error = '';
  formError = '';
  fileError = '';
  isSubmitting = false;
  paymentProofFile: File | null = null;
  private readonly apiBaseUrl = environment.baseUrl;
  private readonly apiOrigin = new URL(environment.baseUrl).origin;

  isSponsor = false;
  isAdmin = false;

  sponsorForm!: FormGroup;

  readonly benefitOptions = [
    { value: 'LOGO_PLACEMENT', label: '🎨 Logo Placement' },
    { value: 'SOCIAL_MEDIA', label: '📱 Social Media Mentions' },
    { value: 'BANNER_ADS', label: '🏳️ Banner Ads' },
    { value: 'VIP_ACCESS', label: '🎟️ VIP Access' },
    { value: 'JERSEY_BRANDING', label: '👕 Jersey Branding' },
    { value: 'ANNOUNCEMENTS', label: '📢 Public Announcements' },
  ];

  readonly targetTypes: TargetType[] = ['TEAM', 'EVENT', 'VENUE', 'TOURNAMENT'];

  constructor(
    private sponsorService: SponsorService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isSponsor = this.authService.hasRole('SPONSOR');
    this.isAdmin = this.authService.hasRole('ADMIN');
    this.buildForm();
    this.loadSponsors();
    if (this.isSponsor) this.loadAvailableTargets();
    if (this.isAdmin) this.loadPendingSponsorships();
  }

  private buildForm() {
    this.sponsorForm = this.fb.group({
      targetId: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      description: ['', Validators.maxLength(500)],
      benefits: [[]]
    }, { validators: this.endAfterStartValidator });
  }

  private endAfterStartValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    return start && end && end <= start ? { endBeforeStart: true } : null;
  }

  loadAvailableTargets() {
    this.sponsorService.getAvailableTargets().subscribe({
      next: (data: any) => {
        const arr = Array.isArray(data) ? data : (data?.targets ?? []);
        this.availableTargets = arr;
        this.cdr.detectChanges();
      },
      error: () => { this.availableTargets = []; }
    });
  }

  getTargetsByType(type: TargetType): AvailableTarget[] {
    return this.availableTargets.filter(t => t.type?.toUpperCase() === type);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.sponsorForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onBenefitChange(value: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const current: string[] = this.sponsorForm.get('benefits')!.value;
    const updated = checked ? [...current, value] : current.filter(v => v !== value);
    this.sponsorForm.get('benefits')!.setValue(updated);
  }

  isBenefitSelected(value: string): boolean {
    return (this.sponsorForm.get('benefits')!.value as string[]).includes(value);
  }

  onFileSelected(event: Event) {
    this.fileError = '';
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { this.fileError = 'File must be under 5MB'; return; }
    this.paymentProofFile = file;
  }

  loadSponsors() {
    this.loading = true;
    this.sponsorService.getAllSponsors().subscribe({
      next: (data: SponsorProfile[]) => { this.sponsors = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load sponsors'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadMySponsorships() {
    this.loading = true;
    this.sponsorService.getMySponsorships().subscribe({
      next: (data: Sponsorship[]) => { this.mySponsorships = Array.isArray(data) ? data : []; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load sponsorships'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadPendingSponsorships() {
    this.loading = true;
    this.sponsorService.getPendingSponsorships().subscribe({
      next: (data: Sponsorship[]) => { this.pendingSponsorships = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.pendingSponsorships = []; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  prefillAndOpen(sponsor: SponsorProfile) {
    this.sponsorForm.reset({ benefits: [] });
    this.paymentProofFile = null;
    this.formError = '';
    this.fileError = '';
    this.showSponsorshipForm = true;
  }

  submitSponsorship() {
    this.sponsorForm.markAllAsTouched();
    if (this.sponsorForm.invalid) return;
    this.formError = '';
    this.isSubmitting = true;

    const { targetId, amount, startDate, endDate, description, benefits } = this.sponsorForm.value;
    const [id, type] = (targetId as string).split('|');
    const request: any = { amount, startDate, endDate };
    if (description?.trim()) request.description = description.trim();
    if (benefits?.length) request.expectedBenefits = benefits;
    if (type === 'TEAM') request.team = { id: +id };
    else if (type === 'EVENT') request.event = { id: +id };
    else if (type === 'VENUE') request.venue = { id: +id };
    else if (type === 'TOURNAMENT') request.tournament = { id: +id };
    console.log('[submitSponsorship] payload:', JSON.stringify(request));

    this.sponsorService.submitSponsorship(request).subscribe({
      next: (created: Sponsorship) => {
        if (this.paymentProofFile && created.id) {
          this.sponsorService.uploadPaymentProofFile(created.id, this.paymentProofFile).subscribe({
            next: () => this.onSubmitSuccess(),
            error: () => this.onSubmitSuccess() // non-blocking
          });
        } else {
          this.onSubmitSuccess();
        }
      },
      error: () => { this.isSubmitting = false; this.formError = 'Failed to submit sponsorship'; this.cdr.detectChanges(); }
    });
  }

  private onSubmitSuccess() {
    this.isSubmitting = false;
    this.showSponsorshipForm = false;
    this.paymentProofFile = null;
    this.sponsorForm.reset({ benefits: [] });
    this.activeTab = 'my-sponsorships';
    this.loadMySponsorships();
  }

  approveSponsorship(id: number) {
    this.sponsorService.approveSponsorship(id).subscribe({
      next: () => this.loadPendingSponsorships(),
      error: () => this.error = 'Failed to approve'
    });
  }

  rejectSponsorship(id: number) {
    this.sponsorService.rejectSponsorship(id).subscribe({
      next: () => this.loadPendingSponsorships(),
      error: () => this.error = 'Failed to reject'
    });
  }

  cancelSponsorship(id: number) {
    if (!confirm('Cancel this sponsorship?')) return;
    this.sponsorService.cancelSponsorship(id).subscribe({
      next: () => this.loadMySponsorships(),
      error: () => this.error = 'Failed to cancel'
    });
  }

  getStatusClass(status: SponsorshipStatus): string {
    const classes: Record<SponsorshipStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      ACTIVE: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700'
    };
    return classes[status];
  }

  getLogoSrc(logo?: string | null): string {
    const value = (logo ?? '').trim();
    if (!value || value === '🏢') return '';
    if (value.startsWith('data:image')) return value;
    if (/^https?:\/\//i.test(value)) return value;
    if (/^localhost:/i.test(value)) return `http://${value}`;
    if (/^lhost:/i.test(value)) return `http://localhost:${value.substring('lhost:'.length)}`;
    if (value.startsWith('/SpringSecurity/')) return `${this.apiOrigin}${value}`;
    if (value.startsWith('/uploads/')) return `${this.apiOrigin}/SpringSecurity${value}`;
    if (value.startsWith('uploads/')) return `${this.apiOrigin}/SpringSecurity/${value}`;
    if (value.startsWith('/')) return `${this.apiOrigin}${value}`;
    return `${this.apiBaseUrl}/${value.replace(/^\/+/, '')}`;
  }
}
