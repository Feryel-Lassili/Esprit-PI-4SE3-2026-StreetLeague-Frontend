import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VenueService } from '../frontoffice/venue/services/venue.service';
import { ReservationDTO } from '../frontoffice/venue/models/venue.model';

type StatusFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'BLOCKED';

@Component({
  selector: 'bo-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="rv-page">

      <!-- ── Page Header ── -->
      <div class="rv-page-header">
        <div class="rv-page-header-left">
          <div class="rv-page-icon">📅</div>
          <div>
            <h1 class="rv-page-title">Reservations Management</h1>
            <p class="rv-page-sub">Monitor and manage all venue bookings system-wide</p>
          </div>
        </div>
        <button class="rv-refresh-btn" (click)="load()" title="Refresh">
          <span [class.rv-spin]="loading">↻</span> Refresh
        </button>
      </div>

      <!-- ── KPI Cards ── -->
      <div class="rv-kpis">
        <div class="rv-kpi rv-kpi--total">
          <div class="rv-kpi-icon">📊</div>
          <div>
            <div class="rv-kpi-val">{{ reservations.length }}</div>
            <div class="rv-kpi-lbl">Total</div>
          </div>
        </div>
        <div class="rv-kpi rv-kpi--pending">
          <div class="rv-kpi-icon">⏳</div>
          <div>
            <div class="rv-kpi-val">{{ countByStatus('PENDING') }}</div>
            <div class="rv-kpi-lbl">Pending</div>
          </div>
        </div>
        <div class="rv-kpi rv-kpi--confirmed">
          <div class="rv-kpi-icon">✅</div>
          <div>
            <div class="rv-kpi-val">{{ countByStatus('CONFIRMED') }}</div>
            <div class="rv-kpi-lbl">Confirmed</div>
          </div>
        </div>
        <div class="rv-kpi rv-kpi--completed">
          <div class="rv-kpi-icon">🏁</div>
          <div>
            <div class="rv-kpi-val">{{ countByStatus('COMPLETED') }}</div>
            <div class="rv-kpi-lbl">Completed</div>
          </div>
        </div>
        <div class="rv-kpi rv-kpi--cancelled">
          <div class="rv-kpi-icon">❌</div>
          <div>
            <div class="rv-kpi-val">{{ countByStatus('CANCELLED') }}</div>
            <div class="rv-kpi-lbl">Cancelled</div>
          </div>
        </div>
        <div class="rv-kpi rv-kpi--revenue">
          <div class="rv-kpi-icon">💰</div>
          <div>
            <div class="rv-kpi-val">{{ totalRevenue() }}</div>
            <div class="rv-kpi-lbl">Revenue (TND)</div>
          </div>
        </div>
      </div>

      <!-- ── Toolbar ── -->
      <div class="rv-toolbar">
        <div class="rv-search-wrap">
          <span class="rv-search-icon">🔍</span>
          <input class="rv-search-input" type="text"
            placeholder="Search venue or user…"
            [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()">
          <button *ngIf="searchQuery" class="rv-clear-btn" (click)="searchQuery=''; applyFilters()">✕</button>
        </div>
        <div class="rv-status-tabs">
          <button class="rv-tab"
            *ngFor="let s of statusOptions"
            [class.active]="statusFilter === s.value"
            [class]="'rv-tab rv-tab--' + s.value.toLowerCase() + (statusFilter === s.value ? ' active' : '')"
            (click)="statusFilter = s.value; applyFilters()">
            {{ s.icon }} {{ s.label }}
            <span class="rv-tab-count" *ngIf="s.value !== 'ALL'">{{ countByStatus(s.value) }}</span>
          </button>
        </div>
      </div>

      <!-- ── Loading ── -->
      <div *ngIf="loading" class="rv-state">
        <div class="rv-spinner"></div>
        <p>Loading reservations…</p>
      </div>

      <!-- ── Error ── -->
      <div *ngIf="error && !loading" class="rv-alert rv-alert--err">
        <span>⚠️ {{ error }}</span>
        <button (click)="load()">Retry</button>
      </div>

      <!-- ── Empty ── -->
      <div *ngIf="!loading && !error && filtered.length === 0" class="rv-state">
        <div style="font-size:56px;margin-bottom:12px;">📭</div>
        <h3 style="color:#1d1d1f;margin:0 0 6px;">No reservations found</h3>
        <p style="color:#6e6e73;margin:0;">Try a different search or status filter.</p>
      </div>

      <!-- ── Table ── -->
      <div *ngIf="!loading && !error && filtered.length > 0" class="rv-card">
        <div class="rv-card-header">
          <span class="rv-card-title">{{ filtered.length }} reservation{{ filtered.length !== 1 ? 's' : '' }}</span>
          <span class="rv-card-sub">{{ statusFilter !== 'ALL' ? statusFilter : 'all statuses' }}</span>
        </div>

        <div class="rv-table-wrap">
          <table class="rv-table">
            <thead>
              <tr>
                <th style="width:44px">#</th>
                <th>Venue</th>
                <th>User</th>
                <th>Date & Time</th>
                <th style="width:80px;text-align:center">Duration</th>
                <th style="width:100px;text-align:right">Price</th>
                <th style="width:110px;text-align:center">Status</th>
                <th style="width:150px;text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let r of filtered" [class]="'rv-row rv-row--' + r.status.toLowerCase()">
                <td class="rv-id">{{ r.id }}</td>

                <!-- Venue -->
                <td>
                  <div class="rv-venue-cell">
                    <div class="rv-v-avatar">{{ (r.venueName || '?')[0].toUpperCase() }}</div>
                    <div>
                      <div class="rv-vname">{{ r.venueName || '—' }}</div>
                      <div class="rv-vaddr">{{ r.venueAddress || '' }}</div>
                    </div>
                  </div>
                </td>

                <!-- User -->
                <td>
                  <div class="rv-user-cell">
                    <div class="rv-u-avatar">{{ (r.userName || '?')[0].toUpperCase() }}</div>
                    <span class="rv-uname">{{ r.userName || '—' }}</span>
                  </div>
                </td>

                <!-- Date -->
                <td>
                  <div class="rv-date-main">{{ r.date | date:'dd MMM yyyy' }}</div>
                  <div class="rv-date-time">{{ r.date | date:'HH:mm' }}</div>
                </td>

                <!-- Duration -->
                <td style="text-align:center">
                  <span class="rv-duration">{{ r.duration }}h</span>
                </td>

                <!-- Price -->
                <td style="text-align:right">
                  <span class="rv-price">{{ r.price }} <span class="rv-currency">TND</span></span>
                </td>

                <!-- Status -->
                <td style="text-align:center">
                  <span class="rv-status-badge" [class]="'rv-status--' + r.status.toLowerCase()">
                    {{ statusIcon(r.status) }} {{ r.status }}
                  </span>
                </td>

                <!-- Actions -->
                <td style="text-align:right">
                  <div class="rv-actions">
                    <button *ngIf="r.status === 'PENDING'"
                      class="rv-action-btn rv-action--confirm"
                      [disabled]="actionId === r.id"
                      (click)="confirm(r)">
                      {{ actionId === r.id ? '…' : '✓ Confirm' }}
                    </button>
                    <button *ngIf="r.status === 'PENDING' || r.status === 'CONFIRMED'"
                      class="rv-action-btn rv-action--cancel"
                      [disabled]="actionId === r.id"
                      (click)="cancel(r)">
                      {{ actionId === r.id ? '…' : '✕ Cancel' }}
                    </button>
                    <span *ngIf="r.status !== 'PENDING' && r.status !== 'CONFIRMED'" class="rv-no-action">—</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="rv-card-footer">
          Showing <strong>{{ filtered.length }}</strong> of <strong>{{ reservations.length }}</strong> reservations
          &nbsp;·&nbsp; Revenue shown: <strong>{{ totalRevenue() }} TND</strong>
        </div>
      </div>

      <!-- ── Toast ── -->
      <div *ngIf="toast" class="rv-toast" [class.ok]="toastType==='ok'" [class.err]="toastType==='err'">
        <span>{{ toastType === 'ok' ? '✓' : '⚠' }}</span> {{ toast }}
      </div>

    </div>
  `,
  styles: [`
    /* ── Base ── */
    .rv-page { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#1d1d1f; }

    /* ── Page Header ── */
    .rv-page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .rv-page-header-left { display:flex; align-items:center; gap:14px; }
    .rv-page-icon { width:48px; height:48px; background:#000; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
    .rv-page-title { font-size:22px; font-weight:700; color:#1d1d1f; margin:0 0 3px; }
    .rv-page-sub { font-size:13px; color:#6e6e73; margin:0; }
    .rv-refresh-btn { display:flex; align-items:center; gap:6px; background:#fff; border:1px solid #e0e0e5; border-radius:10px; padding:9px 16px; font-size:13px; color:#1d1d1f; cursor:pointer; font-weight:500; transition:background .15s; }
    .rv-refresh-btn:hover { background:#f5f5f7; }
    .rv-spin { display:inline-block; animation:rvspin .7s linear infinite; }
    @keyframes rvspin { to { transform:rotate(360deg); } }

    /* ── KPI Cards ── */
    .rv-kpis { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:12px; margin-bottom:20px; }
    .rv-kpi { background:#fff; border:1px solid #e0e0e5; border-radius:14px; padding:16px 18px; display:flex; align-items:center; gap:14px; transition:box-shadow .15s; }
    .rv-kpi:hover { box-shadow:0 2px 12px rgba(0,0,0,.07); }
    .rv-kpi-icon { font-size:22px; flex-shrink:0; }
    .rv-kpi-val { font-size:24px; font-weight:700; line-height:1; margin-bottom:4px; }
    .rv-kpi-lbl { font-size:11px; color:#6e6e73; font-weight:500; text-transform:uppercase; letter-spacing:.04em; }
    .rv-kpi--total    .rv-kpi-val { color:#1d1d1f; }
    .rv-kpi--pending  .rv-kpi-val { color:#d97706; }
    .rv-kpi--confirmed .rv-kpi-val { color:#185fa5; }
    .rv-kpi--completed .rv-kpi-val { color:#2e7d32; }
    .rv-kpi--cancelled .rv-kpi-val { color:#c62828; }
    .rv-kpi--revenue  .rv-kpi-val { color:#000; }
    .rv-kpi--pending  { border-left:3px solid #fcd34d; }
    .rv-kpi--confirmed { border-left:3px solid #93c5fd; }
    .rv-kpi--completed { border-left:3px solid #86efac; }
    .rv-kpi--cancelled { border-left:3px solid #fca5a5; }
    .rv-kpi--revenue  { border-left:3px solid #000; }

    /* ── Toolbar ── */
    .rv-toolbar { display:flex; align-items:center; gap:14px; margin-bottom:16px; flex-wrap:wrap; }
    .rv-search-wrap { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #e0e0e5; border-radius:12px; padding:9px 14px; min-width:240px; flex:1; transition:border-color .15s; }
    .rv-search-wrap:focus-within { border-color:#000; }
    .rv-search-icon { font-size:13px; color:#aeaeb2; flex-shrink:0; }
    .rv-search-input { border:none; outline:none; font-size:13px; color:#1d1d1f; background:transparent; width:100%; }
    .rv-clear-btn { background:none; border:none; cursor:pointer; color:#aeaeb2; font-size:12px; padding:0; }
    .rv-status-tabs { display:flex; gap:6px; flex-wrap:wrap; }
    .rv-tab { display:inline-flex; align-items:center; gap:5px; background:#fff; border:1px solid #e0e0e5; border-radius:20px; padding:6px 12px; font-size:12px; color:#6e6e73; cursor:pointer; white-space:nowrap; transition:all .15s; font-weight:500; }
    .rv-tab:hover { border-color:#1d1d1f; color:#1d1d1f; }
    .rv-tab.active { background:#1d1d1f; border-color:#1d1d1f; color:#fff; }
    .rv-tab-count { background:rgba(0,0,0,.12); color:inherit; font-size:10px; font-weight:700; padding:1px 6px; border-radius:20px; }
    .rv-tab.active .rv-tab-count { background:rgba(255,255,255,.2); }

    /* ── State ── */
    .rv-state { display:flex; flex-direction:column; align-items:center; padding:80px 20px; color:#6e6e73; text-align:center; gap:10px; }
    .rv-spinner { width:36px; height:36px; border:3px solid #e0e0e5; border-top-color:#000; border-radius:50%; animation:rvspin .8s linear infinite; margin-bottom:4px; }
    .rv-alert { border-radius:10px; padding:12px 16px; font-size:13px; font-weight:500; display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:16px; }
    .rv-alert--err { background:#fff2f2; border:1px solid #ffcdd2; color:#c62828; }
    .rv-alert button { background:#c62828; color:#fff; border:none; padding:5px 12px; border-radius:6px; font-size:12px; cursor:pointer; }

    /* ── Card + Table ── */
    .rv-card { background:#fff; border:1px solid #e0e0e5; border-radius:16px; overflow:hidden; }
    .rv-card-header { padding:14px 20px; border-bottom:1px solid #f0f0f0; display:flex; align-items:center; justify-content:space-between; background:#fafafa; }
    .rv-card-title { font-size:14px; font-weight:600; color:#1d1d1f; }
    .rv-card-sub { font-size:12px; color:#aeaeb2; text-transform:uppercase; letter-spacing:.04em; }
    .rv-card-footer { padding:12px 20px; border-top:1px solid #f0f0f0; font-size:12px; color:#6e6e73; background:#fafafa; }
    .rv-card-footer strong { color:#1d1d1f; }
    .rv-table-wrap { overflow-x:auto; }
    .rv-table { width:100%; border-collapse:collapse; }
    .rv-table th { text-align:left; font-size:11px; font-weight:600; color:#6e6e73; text-transform:uppercase; letter-spacing:.06em; padding:12px 16px; border-bottom:1px solid #e8e8e8; background:#fafafa; }
    .rv-table td { padding:14px 16px; border-bottom:1px solid #f5f5f7; vertical-align:middle; }
    .rv-table tbody tr:last-child td { border-bottom:none; }
    .rv-row { transition:background .1s; }
    .rv-row:hover { background:#fafafa; }
    .rv-row--pending { }
    .rv-id { font-size:11px; font-weight:600; color:#c0c0c5; }

    /* Venue cell */
    .rv-venue-cell { display:flex; align-items:center; gap:10px; }
    .rv-v-avatar { width:36px; height:36px; border-radius:10px; background:#1d1d1f; color:#fff; font-size:14px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .rv-vname { font-weight:600; font-size:13px; color:#1d1d1f; }
    .rv-vaddr { font-size:11px; color:#aeaeb2; margin-top:2px; }

    /* User cell */
    .rv-user-cell { display:flex; align-items:center; gap:8px; }
    .rv-u-avatar { width:30px; height:30px; border-radius:50%; background:#e8f0fe; color:#185fa5; font-size:12px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .rv-uname { font-size:13px; color:#1d1d1f; font-weight:500; }

    /* Date */
    .rv-date-main { font-size:13px; color:#1d1d1f; font-weight:500; }
    .rv-date-time { font-size:11px; color:#6e6e73; margin-top:2px; }

    /* Duration */
    .rv-duration { background:#f0f0f5; color:#1d1d1f; font-size:12px; font-weight:700; padding:3px 10px; border-radius:20px; }

    /* Price */
    .rv-price { font-size:14px; font-weight:700; color:#1d1d1f; }
    .rv-currency { font-size:11px; font-weight:500; color:#6e6e73; }

    /* Status badge */
    .rv-status-badge { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap; }
    .rv-status--pending   { background:#fef3c7; color:#d97706; }
    .rv-status--confirmed { background:#dbeafe; color:#1d4ed8; }
    .rv-status--cancelled { background:#fee2e2; color:#dc2626; }
    .rv-status--completed { background:#dcfce7; color:#16a34a; }
    .rv-status--blocked   { background:#f5f5f7; color:#6e6e73; }

    /* Actions */
    .rv-actions { display:flex; justify-content:flex-end; gap:6px; }
    .rv-action-btn { padding:6px 12px; border-radius:8px; font-size:12px; font-weight:500; cursor:pointer; border:1px solid transparent; transition:all .15s; white-space:nowrap; }
    .rv-action-btn:disabled { opacity:.4; cursor:not-allowed; }
    .rv-action--confirm { background:#dbeafe; color:#1d4ed8; border-color:#bfdbfe; }
    .rv-action--confirm:hover:not(:disabled) { background:#1d4ed8; color:#fff; border-color:#1d4ed8; }
    .rv-action--cancel  { background:#fee2e2; color:#dc2626; border-color:#fecaca; }
    .rv-action--cancel:hover:not(:disabled)  { background:#dc2626; color:#fff; border-color:#dc2626; }
    .rv-no-action { color:#aeaeb2; font-size:13px; }

    /* Toast */
    .rv-toast { position:fixed; bottom:28px; right:28px; display:flex; align-items:center; gap:8px; padding:12px 20px; border-radius:12px; font-size:13px; font-weight:600; z-index:9999; box-shadow:0 4px 20px rgba(0,0,0,.15); animation:rvslide .25s ease; }
    @keyframes rvslide { from { transform:translateY(12px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    .rv-toast.ok  { background:#1d1d1f; color:#fff; }
    .rv-toast.err { background:#dc2626; color:#fff; }
  `]
})
export class BackofficeReservationsComponent implements OnInit {
  reservations: ReservationDTO[] = [];
  filtered: ReservationDTO[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';
  statusFilter: StatusFilter = 'ALL';
  actionId: number | null = null;

  toast: string | null = null;
  toastType: 'ok' | 'err' = 'ok';

  readonly statusOptions: { value: StatusFilter; label: string; icon: string }[] = [
    { value: 'ALL',       label: 'All',       icon: '📋' },
    { value: 'PENDING',   label: 'Pending',   icon: '⏳' },
    { value: 'CONFIRMED', label: 'Confirmed', icon: '✅' },
    { value: 'COMPLETED', label: 'Completed', icon: '🏁' },
    { value: 'CANCELLED', label: 'Cancelled', icon: '❌' },
    { value: 'BLOCKED',   label: 'Blocked',   icon: '🚫' },
  ];

  constructor(private venueService: VenueService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = null;
    this.venueService.getAllReservations().subscribe({
      next: data => { this.reservations = data; this.applyFilters(); this.loading = false; },
      error: e => { this.error = e?.error?.message || 'Failed to load reservations.'; this.loading = false; }
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filtered = this.reservations.filter(r => {
      const matchStatus = this.statusFilter === 'ALL' || r.status === this.statusFilter;
      const matchSearch = !q
        || (r.venueName || '').toLowerCase().includes(q)
        || (r.userName  || '').toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }

  confirm(r: ReservationDTO): void {
    this.actionId = r.id;
    this.venueService.confirmReservation(r.id).subscribe({
      next: () => {
        r.status = 'CONFIRMED';
        this.applyFilters();
        this.actionId = null;
        this.showToast('Reservation confirmed', 'ok');
      },
      error: e => {
        this.actionId = null;
        this.showToast(e?.error?.message || 'Failed to confirm', 'err');
      }
    });
  }

  cancel(r: ReservationDTO): void {
    this.actionId = r.id;
    this.venueService.adminCancelReservation(r.id).subscribe({
      next: () => {
        r.status = 'CANCELLED';
        this.applyFilters();
        this.actionId = null;
        this.showToast('Reservation cancelled', 'ok');
      },
      error: e => {
        this.actionId = null;
        this.showToast(e?.error?.message || 'Failed to cancel', 'err');
      }
    });
  }

  countByStatus(status: string): number {
    return this.reservations.filter(r => r.status === status).length;
  }

  totalRevenue(): string {
    const total = this.reservations
      .filter(r => r.status === 'CONFIRMED' || r.status === 'COMPLETED')
      .reduce((sum, r) => sum + (r.price || 0), 0);
    return total.toLocaleString('fr-TN', { maximumFractionDigits: 2 });
  }

  statusIcon(status: string): string {
    const m: Record<string, string> = {
      PENDING: '⏳', CONFIRMED: '✅', COMPLETED: '🏁', CANCELLED: '❌', BLOCKED: '🚫'
    };
    return m[status] || '';
  }

  private showToast(msg: string, type: 'ok' | 'err'): void {
    this.toast = msg; this.toastType = type;
    setTimeout(() => this.toast = null, 3500);
  }
}