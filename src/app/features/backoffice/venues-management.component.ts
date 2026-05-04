import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VenueService } from '../frontoffice/venue/services/venue.service';
import { VenueDTO } from '../frontoffice/venue/models/venue.model';

@Component({
  selector: 'bo-venues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="vm-page">

      <!-- Header -->
      <div class="vm-header">
        <div class="vm-header-left">
          <div class="vm-icon">🏟️</div>
          <div>
            <h1 class="vm-title">Venues Management</h1>
            <p class="vm-sub">Manage and verify all sport venues</p>
          </div>
        </div>
        <button class="vm-refresh-btn" (click)="load()">
          <span [class.vm-spin]="loading">↻</span> Refresh
        </button>
      </div>

      <!-- KPIs -->
      <div class="vm-kpis">
        <div class="vm-kpi">
          <div class="vm-kpi-icon" style="background:#f5f5f7">🏟️</div>
          <div><div class="vm-kpi-val">{{ venues.length }}</div><div class="vm-kpi-lbl">Total</div></div>
        </div>
        <div class="vm-kpi">
          <div class="vm-kpi-icon" style="background:#f1f8e9">✅</div>
          <div><div class="vm-kpi-val" style="color:#2e7d32">{{ countVerified() }}</div><div class="vm-kpi-lbl">Verified</div></div>
        </div>
        <div class="vm-kpi">
          <div class="vm-kpi-icon" style="background:#fffde7">⏳</div>
          <div><div class="vm-kpi-val" style="color:#f57f17">{{ venues.length - countVerified() }}</div><div class="vm-kpi-lbl">Pending</div></div>
        </div>
        <div class="vm-kpi">
          <div class="vm-kpi-icon" style="background:#e8f0fe">💰</div>
          <div><div class="vm-kpi-val" style="color:#185fa5">{{ avgPrice() }}</div><div class="vm-kpi-lbl">Avg TND/hr</div></div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="vm-toolbar">
        <div class="vm-search-wrap">
          <span>🔍</span>
          <input class="vm-search-input" type="text" placeholder="Search by name, address or owner…"
            [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()">
          <button *ngIf="searchQuery" class="vm-clear-btn" (click)="searchQuery=''; applyFilters()">✕</button>
        </div>
        <div class="vm-filter-tabs">
          <button class="vm-tab" [class.active]="filterVerified === null" (click)="filterVerified = null; applyFilters()">All</button>
          <button class="vm-tab" [class.active]="filterVerified === true" (click)="filterVerified = true; applyFilters()">✅ Verified</button>
          <button class="vm-tab" [class.active]="filterVerified === false" (click)="filterVerified = false; applyFilters()">⏳ Pending</button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="vm-state">
        <div class="vm-spinner"></div><p>Loading venues…</p>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="vm-alert vm-alert-err">
        <span>⚠️ {{ error }}</span><button (click)="load()">Retry</button>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && !error && filtered.length === 0" class="vm-state">
        <div style="font-size:56px;margin-bottom:12px">🏟️</div>
        <h3 style="color:#1d1d1f;margin:0 0 6px">No venues found</h3>
        <p style="color:#6e6e73;margin:0">Try a different search or filter.</p>
      </div>

      <!-- Table -->
      <div *ngIf="!loading && !error && filtered.length > 0" class="vm-card">
        <div class="vm-card-header">
          <span class="vm-card-title">{{ filtered.length }} venue{{ filtered.length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="vm-table-wrap">
          <table class="vm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Venue</th>
                <th>Sport</th>
                <th style="text-align:right">Price/hr</th>
                <th style="text-align:center">Capacity</th>
                <th>Owner</th>
                <th style="text-align:center">Status</th>
                <th style="text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let v of filtered">
                <td class="vm-id">{{ v.id }}</td>
                <td>
                  <div class="vm-venue-cell">
                    <div class="vm-avatar" [style.backgroundImage]="v.photoUrl ? 'url('+v.photoUrl+')' : ''">
                      {{ !v.photoUrl ? (v.name || '?')[0].toUpperCase() : '' }}
                    </div>
                    <div>
                      <div class="vm-venue-name">{{ v.name }}</div>
                      <div class="vm-venue-addr">📍 {{ v.address }}</div>
                    </div>
                  </div>
                </td>
                <td><span class="vm-sport-badge">{{ v.sportType || '—' }}</span></td>
                <td style="text-align:right"><strong>{{ v.pricePerHour }}</strong> <span style="font-size:11px;color:#6e6e73">TND</span></td>
                <td style="text-align:center"><span class="vm-cap">{{ v.capacity }}</span></td>
                <td style="font-size:13px;color:#1d1d1f">{{ v.ownerName || '—' }}</td>
                <td style="text-align:center">
                  <span class="vm-status-badge" [class.verified]="v.verified" [class.pending]="!v.verified">
                    {{ v.verified ? '✅ Verified' : '⏳ Pending' }}
                  </span>
                </td>
                <td style="text-align:right">
                  <button *ngIf="!v.verified" class="vm-action-btn vm-action-verify"
                    [disabled]="actionId === v.id" (click)="verify(v)">
                    {{ actionId === v.id ? '…' : '✓ Verify' }}
                  </button>
                  <button *ngIf="v.verified" class="vm-action-btn vm-action-unverify"
                    [disabled]="actionId === v.id" (click)="unverify(v)">
                    {{ actionId === v.id ? '…' : '✕ Unverify' }}
                  </button>
                  <button class="vm-action-btn vm-action-del" [disabled]="actionId === v.id" (click)="confirmDelete(v)">🗑</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="vm-card-footer">Showing {{ filtered.length }} of {{ venues.length }} venues</div>
      </div>

      <!-- Delete Modal -->
      <div *ngIf="deleteTarget" class="vm-overlay" (click)="cancelDelete()">
        <div class="vm-modal" (click)="$event.stopPropagation()">
          <div style="text-align:center;margin-bottom:16px">
            <div style="width:56px;height:56px;background:#fff2f2;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 12px">🗑</div>
            <h2 style="font-size:18px;font-weight:700;margin:0 0 8px">Delete Venue</h2>
            <p style="font-size:14px;color:#1d1d1f;margin:0 0 6px">Delete <strong>{{ deleteTarget.name }}</strong>?</p>
            <p style="font-size:12px;color:#c62828;margin:0 0 20px">This cannot be undone.</p>
          </div>
          <div *ngIf="deleteError" class="vm-alert vm-alert-err" style="margin-bottom:14px">{{ deleteError }}</div>
          <div style="display:flex;gap:10px">
            <button style="flex:1;background:#c62828;color:#fff;border:none;border-radius:12px;padding:12px;font-size:14px;font-weight:600;cursor:pointer"
              [disabled]="deleting" (click)="doDelete()">{{ deleting ? 'Deleting…' : 'Yes, Delete' }}</button>
            <button style="flex:1;background:#f5f5f7;color:#1d1d1f;border:none;border-radius:12px;padding:12px;font-size:14px;font-weight:600;cursor:pointer"
              (click)="cancelDelete()">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div *ngIf="toast" class="vm-toast" [class.ok]="toastType==='ok'" [class.err]="toastType==='err'">
        {{ toastType === 'ok' ? '✓' : '⚠' }} {{ toast }}
      </div>
    </div>
  `,
  styles: [`
    .vm-page { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#1d1d1f; }
    .vm-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .vm-header-left { display:flex; align-items:center; gap:14px; }
    .vm-icon { width:48px; height:48px; background:#000; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
    .vm-title { font-size:22px; font-weight:700; color:#1d1d1f; margin:0 0 3px; }
    .vm-sub { font-size:13px; color:#6e6e73; margin:0; }
    .vm-refresh-btn { display:flex; align-items:center; gap:6px; background:#fff; border:1px solid #e0e0e5; border-radius:10px; padding:9px 16px; font-size:13px; cursor:pointer; font-weight:500; }
    .vm-refresh-btn:hover { background:#f5f5f7; }
    .vm-spin { display:inline-block; animation:vmspin .7s linear infinite; }
    @keyframes vmspin { to { transform:rotate(360deg); } }
    .vm-kpis { display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
    .vm-kpi { background:#fff; border:1px solid #e0e0e5; border-radius:14px; padding:16px 20px; display:flex; align-items:center; gap:14px; min-width:130px; flex:1; }
    .vm-kpi-icon { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
    .vm-kpi-val { font-size:24px; font-weight:700; color:#1d1d1f; line-height:1; margin-bottom:4px; }
    .vm-kpi-lbl { font-size:11px; color:#6e6e73; font-weight:500; text-transform:uppercase; letter-spacing:.04em; }
    .vm-toolbar { display:flex; align-items:center; gap:14px; margin-bottom:16px; flex-wrap:wrap; }
    .vm-search-wrap { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #e0e0e5; border-radius:12px; padding:9px 14px; min-width:240px; flex:1; }
    .vm-search-wrap:focus-within { border-color:#000; }
    .vm-search-input { border:none; outline:none; font-size:13px; color:#1d1d1f; background:transparent; width:100%; }
    .vm-clear-btn { background:none; border:none; cursor:pointer; color:#aeaeb2; font-size:12px; padding:0; }
    .vm-filter-tabs { display:flex; gap:6px; }
    .vm-tab { background:#fff; border:1px solid #e0e0e5; border-radius:20px; padding:6px 14px; font-size:12px; color:#6e6e73; cursor:pointer; font-weight:500; transition:all .15s; }
    .vm-tab:hover { border-color:#000; color:#1d1d1f; }
    .vm-tab.active { background:#000; border-color:#000; color:#fff; }
    .vm-state { display:flex; flex-direction:column; align-items:center; padding:80px 20px; color:#6e6e73; text-align:center; gap:10px; }
    .vm-spinner { width:36px; height:36px; border:3px solid #e0e0e5; border-top-color:#000; border-radius:50%; animation:vmspin .8s linear infinite; margin-bottom:4px; }
    .vm-alert { border-radius:10px; padding:12px 16px; font-size:13px; font-weight:500; display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:16px; }
    .vm-alert-err { background:#fff2f2; border:1px solid #ffcdd2; color:#c62828; }
    .vm-alert button { background:#c62828; color:#fff; border:none; padding:5px 12px; border-radius:6px; font-size:12px; cursor:pointer; }
    .vm-card { background:#fff; border:1px solid #e0e0e5; border-radius:16px; overflow:hidden; }
    .vm-card-header { padding:14px 20px; border-bottom:1px solid #f0f0f0; display:flex; align-items:center; justify-content:space-between; }
    .vm-card-title { font-size:14px; font-weight:600; color:#1d1d1f; }
    .vm-card-footer { padding:10px 20px; border-top:1px solid #f0f0f0; font-size:12px; color:#aeaeb2; }
    .vm-table-wrap { overflow-x:auto; }
    .vm-table { width:100%; border-collapse:collapse; }
    .vm-table th { text-align:left; font-size:11px; font-weight:600; color:#6e6e73; text-transform:uppercase; letter-spacing:.06em; padding:12px 16px; background:#fafafa; border-bottom:1px solid #e8e8e8; }
    .vm-table td { padding:12px 16px; border-bottom:1px solid #f5f5f7; vertical-align:middle; }
    .vm-table tbody tr:last-child td { border-bottom:none; }
    .vm-table tbody tr:hover { background:#fafafa; }
    .vm-id { font-size:11px; font-weight:600; color:#c0c0c5; }
    .vm-venue-cell { display:flex; align-items:center; gap:12px; }
    .vm-avatar { width:40px; height:40px; border-radius:10px; background:#1d1d1f; color:#fff; font-size:16px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; background-size:cover; background-position:center; }
    .vm-venue-name { font-weight:600; font-size:14px; color:#1d1d1f; }
    .vm-venue-addr { font-size:11px; color:#aeaeb2; margin-top:2px; }
    .vm-sport-badge { background:#e8f0fe; color:#185fa5; font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; }
    .vm-cap { background:#f0f0f5; color:#1d1d1f; font-size:12px; font-weight:700; padding:3px 10px; border-radius:20px; }
    .vm-status-badge { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap; }
    .vm-status-badge.verified { background:#f1f8e9; color:#2e7d32; }
    .vm-status-badge.pending { background:#fffde7; color:#f57f17; }
    .vm-action-btn { padding:5px 12px; border:1px solid #e0e0e5; border-radius:8px; font-size:12px; cursor:pointer; background:#fff; font-weight:500; transition:all .15s; margin-left:4px; }
    .vm-action-btn:disabled { opacity:.4; cursor:not-allowed; }
    .vm-action-verify:hover:not(:disabled) { background:#2e7d32; border-color:#2e7d32; color:#fff; }
    .vm-action-unverify:hover:not(:disabled) { background:#f57f17; border-color:#f57f17; color:#fff; }
    .vm-action-del:hover:not(:disabled) { background:#fff2f2; border-color:#ffcdd2; color:#c62828; }
    .vm-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(2px); }
    .vm-modal { background:#fff; border-radius:20px; width:400px; max-width:95vw; padding:28px 24px; box-shadow:0 24px 60px rgba(0,0,0,.2); }
    .vm-toast { position:fixed; bottom:28px; right:28px; display:flex; align-items:center; gap:8px; padding:12px 20px; border-radius:12px; font-size:13px; font-weight:600; z-index:9999; box-shadow:0 4px 20px rgba(0,0,0,.15); animation:vmslide .25s ease; }
    @keyframes vmslide { from { transform:translateY(12px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    .vm-toast.ok { background:#1d1d1f; color:#fff; }
    .vm-toast.err { background:#c62828; color:#fff; }
  `]
})
export class BackofficeVenuesComponent implements OnInit {
  venues: VenueDTO[] = [];
  filtered: VenueDTO[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';
  filterVerified: boolean | null = null;
  actionId: number | null = null;
  deleteTarget: VenueDTO | null = null;
  deleting = false;
  deleteError: string | null = null;
  toast: string | null = null;
  toastType: 'ok' | 'err' = 'ok';

  constructor(private venueService: VenueService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = null;
    this.venueService.getAllVenuesAdmin().subscribe({
      next: d => { this.venues = d; this.applyFilters(); this.loading = false; },
      error: e => { this.error = e?.error?.message || 'Failed to load venues.'; this.loading = false; }
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filtered = this.venues.filter(v => {
      const matchSearch = !q || (v.name || '').toLowerCase().includes(q)
        || (v.address || '').toLowerCase().includes(q)
        || (v.ownerName || '').toLowerCase().includes(q);
      const matchVerified = this.filterVerified === null || v.verified === this.filterVerified;
      return matchSearch && matchVerified;
    });
  }

  countVerified(): number { return this.venues.filter(v => v.verified).length; }
  avgPrice(): string {
    if (!this.venues.length) return '0';
    return (this.venues.reduce((s, v) => s + (v.pricePerHour || 0), 0) / this.venues.length).toFixed(0);
  }

  verify(v: VenueDTO): void {
    this.actionId = v.id;
    this.venueService.verifyVenue(v.id).subscribe({
      next: () => { v.verified = true; this.applyFilters(); this.actionId = null; this.showToast('Venue verified', 'ok'); },
      error: e => { this.actionId = null; this.showToast(e?.error?.message || 'Failed to verify', 'err'); }
    });
  }

  unverify(v: VenueDTO): void {
    this.actionId = v.id;
    this.venueService.unverifyVenue(v.id).subscribe({
      next: () => { v.verified = false; this.applyFilters(); this.actionId = null; this.showToast('Venue unverified', 'ok'); },
      error: e => { this.actionId = null; this.showToast(e?.error?.message || 'Failed to unverify', 'err'); }
    });
  }

  confirmDelete(v: VenueDTO): void { this.deleteTarget = v; this.deleteError = null; }
  cancelDelete(): void { this.deleteTarget = null; this.deleteError = null; }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.deleting = true; this.deleteError = null;
    this.venueService.deleteVenue(this.deleteTarget.id).subscribe({
      next: () => {
        this.venues = this.venues.filter(v => v.id !== this.deleteTarget!.id);
        this.applyFilters(); this.cancelDelete(); this.deleting = false;
        this.showToast('Venue deleted', 'ok');
      },
      error: e => { this.deleteError = e?.error?.message || 'Failed to delete.'; this.deleting = false; }
    });
  }

  private showToast(msg: string, type: 'ok' | 'err'): void {
    this.toast = msg; this.toastType = type;
    setTimeout(() => this.toast = null, 3500);
  }
}
