import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SponsorService } from '../../core/services/sponsor.service';
import { SponsorProfile, Sponsorship, SponsorshipStats, SponsorshipStatus } from '../../core/models/sponsor.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'bo-sponsors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-black text-gray-900">💰 Sponsorship Management</h1>
        <p class="text-gray-600 mt-1">Manage sponsors and sponsorship requests</p>
      </div>

      <!-- Stats -->
      <div *ngIf="stats" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-2xl shadow p-5 border-l-4 border-[#0D6EFD]">
          <p class="text-xs text-gray-500">Total Active</p>
          <p class="text-3xl font-black text-[#0D6EFD]">{{ stats.totalActive }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-5 border-l-4 border-yellow-400">
          <p class="text-xs text-gray-500">Pending</p>
          <p class="text-3xl font-black text-yellow-600">{{ stats.totalPending }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-5 border-l-4 border-[#32CD32]">
          <p class="text-xs text-gray-500">Revenue (MTD)</p>
          <p class="text-3xl font-black text-[#32CD32]">\${{ stats.totalAmountThisMonth.toLocaleString() }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-5 border-l-4 border-[#9D4EDD]">
          <p class="text-xs text-gray-500">Total Sponsors</p>
          <p class="text-3xl font-black text-[#9D4EDD]">{{ sponsors.length }}</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 bg-white rounded-2xl shadow p-2 w-fit">
        <button (click)="activeTab = 'sponsors'"
                [class]="activeTab === 'sponsors' ? 'bg-[#0D6EFD] text-white shadow' : 'text-gray-600 hover:text-gray-900'"
                class="px-5 py-2.5 rounded-xl font-semibold transition-all">
          🏢 Sponsors
        </button>
        <button (click)="activeTab = 'sponsorships'; loadAllSponsorships()"
                [class]="activeTab === 'sponsorships' ? 'bg-[#0D6EFD] text-white shadow' : 'text-gray-600 hover:text-gray-900'"
                class="px-5 py-2.5 rounded-xl font-semibold transition-all">
          ✅ Active Sponsorships
        </button>
        <button (click)="activeTab = 'pending'; loadPending()"
                [class]="activeTab === 'pending' ? 'bg-[#FF6B00] text-white shadow' : 'text-gray-600 hover:text-gray-900'"
                class="px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2">
          ⏳ Pending
          <span *ngIf="pendingSponsorships.length > 0"
                class="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {{ pendingSponsorships.length }}
          </span>
        </button>
      </div>

      <!-- Sponsors Tab -->
      <div *ngIf="activeTab === 'sponsors'" class="bg-white rounded-2xl shadow border border-gray-100">
        <div *ngIf="loading" class="p-12 text-center text-gray-500">⏳ Loading sponsors...</div>
        <div *ngIf="!loading && sponsors.length === 0" class="p-12 text-center">
          <div class="text-5xl mb-3">🏢</div>
          <p class="text-gray-500">No sponsors yet</p>
        </div>
        <div *ngIf="!loading && sponsors.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Company</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Contact</th>
                <th class="px-6 py-4 text-right text-sm font-bold text-gray-700">Budget</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of sponsors" class="border-t border-gray-100 hover:bg-gray-50 transition-all">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-[#FFD60A] to-[#FF6B00] rounded-xl flex items-center justify-center text-xl">
                      <img *ngIf="getLogoSrc(s.logo) as logoSrc; else sponsorFallbackLogo"
                           [src]="logoSrc"
                           alt="Sponsor logo"
                           class="w-full h-full rounded-xl object-cover">
                      <ng-template #sponsorFallbackLogo>🏢</ng-template>
                    </div>
                    <div>
                      <p class="font-bold text-gray-900">{{ s.companyName }}</p>
                      <p class="text-xs text-gray-400">ID: {{ s.id }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-gray-600 text-sm">{{ s.contactEmail }}</td>
                <td class="px-6 py-4 text-right">
                  <span class="text-xl font-black text-[#32CD32]">\${{ s.budget.toLocaleString() }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <button (click)="deleteSponsor(s.id)"
                          class="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all text-sm">
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- All Sponsorships Tab -->
      <div *ngIf="activeTab === 'sponsorships'">
        <!-- Filter -->
        <div class="bg-white rounded-2xl shadow p-4 mb-4 flex gap-3 items-center flex-wrap">
          <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilter()"
                  class="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#0D6EFD] focus:outline-none text-sm">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <span class="text-sm text-gray-500 ml-auto">{{ filteredSponsorships.length }} results</span>
        </div>

        <div *ngIf="loading" class="text-center py-12 text-gray-500">⏳ Loading...</div>
        <div *ngIf="!loading && filteredSponsorships.length === 0" class="text-center py-16">
          <div class="text-5xl mb-3">📭</div>
          <p class="text-gray-500">No sponsorships found</p>
        </div>

        <div *ngIf="!loading && filteredSponsorships.length > 0" class="bg-white rounded-2xl shadow border border-gray-100 overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Sponsor</th>
                <th class="px-6 py-4 text-right text-sm font-bold text-gray-700">Amount</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Period</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-gray-700">Status</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of filteredSponsorships" class="border-t border-gray-100 hover:bg-gray-50 transition-all">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-gradient-to-br from-[#FFD60A] to-[#FF6B00] rounded-xl flex items-center justify-center text-lg">🏢</div>
                    <div>
                      <p class="font-bold text-gray-900">{{ s.targetName ?? '—' }}</p>
                      <p class="text-xs text-gray-400">{{ s.targetType ?? '' }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-right font-black text-[#0D6EFD] text-lg">\${{ s.amount.toLocaleString() }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ s.startDate | date:'mediumDate' }} → {{ s.endDate | date:'mediumDate' }}
                </td>
                <td class="px-6 py-4 text-center">
                  <span [class]="getStatusClass(s.status)" class="px-3 py-1 rounded-full text-xs font-bold">
                    {{ s.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="flex gap-2 justify-center">
                    <button *ngIf="s.status === 'PENDING'" (click)="approveFromTable(s.id!)"
                            class="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-bold hover:bg-green-100 transition-all text-xs">
                      ✓ Approve
                    </button>
                    <button *ngIf="s.status === 'PENDING'" (click)="rejectFromTable(s.id!)"
                            class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition-all text-xs">
                      ✕ Reject
                    </button>
                    <button (click)="deleteSponsorship(s.id!)"
                            class="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg font-bold hover:bg-gray-100 transition-all text-xs">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pending Tab -->
      <div *ngIf="activeTab === 'pending'">
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
                  <img *ngIf="getLogoSrc(s.sponsorLogo) as src; else boFallback" [src]="src" class="w-full h-full object-cover">
                  <ng-template #boFallback>🏢</ng-template>
                </div>
                <div>
                  <h3 class="font-black text-gray-900 text-lg">{{ s.companyName ?? s.targetName ?? '—' }}</h3>
                  <p class="text-sm text-gray-500 mb-1">{{ s.targetType ?? '' }}</p>
                  <p class="text-sm text-gray-600">
                    📅 {{ s.startDate | date:'mediumDate' }} → {{ s.endDate | date:'mediumDate' }}
                  </p>
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
                  <button (click)="approve(s.id!)"
                          class="bg-[#32CD32] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#228B22] transition-all">
                    ✓ Approve
                  </button>
                  <button (click)="reject(s.id!)"
                          class="bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-600 transition-all">
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
export class BackofficeSponsorComponent implements OnInit {
  sponsors: SponsorProfile[] = [];
  allSponsorships: Sponsorship[] = [];
  filteredSponsorships: Sponsorship[] = [];
  pendingSponsorships: Sponsorship[] = [];
  stats: SponsorshipStats | null = null;

  activeTab = 'sponsors';
  filterStatus: SponsorshipStatus | '' = '';
  loading = false;
  error = '';
  private readonly apiBaseUrl = environment.baseUrl;
  private readonly apiOrigin = new URL(environment.baseUrl).origin;

  constructor(private sponsorService: SponsorService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loading = true;
    this.sponsorService.getAllSponsors().subscribe({
      next: (sponsors: SponsorProfile[]) => { this.sponsors = sponsors; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load sponsors'; this.loading = false; this.cdr.detectChanges(); }
    });
    this.sponsorService.getPendingSponsorships().subscribe({
      next: (pending: Sponsorship[]) => { this.pendingSponsorships = pending; this.cdr.detectChanges(); },
      error: () => {}
    });
    this.sponsorService.getAdminStats().subscribe({
      next: (stats: SponsorshipStats) => { this.stats = stats; this.cdr.detectChanges(); },
      error: () => {} // silently ignore 403 until backend is fixed
    });
  }

  loadAllSponsorships() {
    this.loading = true;
    this.sponsorService.getActiveSponsorships().subscribe({
      next: (data: Sponsorship[]) => {
        this.allSponsorships = Array.isArray(data) ? data : [];
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.error = 'Failed to load sponsorships'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  applyFilter() {
    this.filteredSponsorships = this.filterStatus
      ? this.allSponsorships.filter(s => s.status === this.filterStatus)
      : [...this.allSponsorships];
  }

  loadPending() {
    this.loading = true;
    this.sponsorService.getPendingSponsorships().subscribe({
      next: (data: Sponsorship[]) => { this.pendingSponsorships = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load pending'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  deleteSponsor(id: number) {
    if (!confirm('Delete this sponsor?')) return;
    this.sponsorService.deleteSponsor(id).subscribe({
      next: () => { this.sponsors = this.sponsors.filter(s => s.id !== id); this.cdr.detectChanges(); },
      error: () => this.error = 'Failed to delete sponsor'
    });
  }

  deleteSponsorship(id: number) {
    if (!confirm('Delete this sponsorship?')) return;
    this.sponsorService.deleteSponsorship(id).subscribe({
      next: () => { this.allSponsorships = this.allSponsorships.filter(s => s.id !== id); this.applyFilter(); this.cdr.detectChanges(); },
      error: () => this.error = 'Failed to delete sponsorship'
    });
  }

  approve(id: number) {
    this.sponsorService.approveSponsorship(id).subscribe({
      next: () => { this.loadPending(); this.refreshStats(); },
      error: () => this.error = 'Failed to approve'
    });
  }

  reject(id: number) {
    this.sponsorService.rejectSponsorship(id).subscribe({
      next: () => { this.loadPending(); this.refreshStats(); },
      error: () => this.error = 'Failed to reject'
    });
  }

  approveFromTable(id: number) {
    this.sponsorService.approveSponsorship(id).subscribe({
      next: () => { this.loadAllSponsorships(); this.loadPending(); this.refreshStats(); },
      error: () => this.error = 'Failed to approve'
    });
  }

  rejectFromTable(id: number) {
    this.sponsorService.rejectSponsorship(id).subscribe({
      next: () => { this.loadAllSponsorships(); this.loadPending(); this.refreshStats(); },
      error: () => this.error = 'Failed to reject'
    });
  }

  refreshStats() {
    this.sponsorService.getAdminStats().subscribe({
      next: (s: SponsorshipStats) => { this.stats = s; this.cdr.detectChanges(); },
      error: () => {}
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
