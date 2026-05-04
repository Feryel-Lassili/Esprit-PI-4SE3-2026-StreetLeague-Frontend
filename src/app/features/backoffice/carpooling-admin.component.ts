import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminCarpoolingService } from './carpooling-management/services/admin-carpooling.service';
import { DriverWithCarsAndCarpoolingsDTO, CarWithCarpoolingsDTO, CarpoolingWithParticipantsDTO } from '../frontoffice/carpooling/models/carpooling.model';

interface FlatTrip {
  tripId: number;
  departure: string;
  arrival: string;
  date: string;
  time: string;
  participantCount: number;
  carModel: string;
  carId: number;
  driverUsername: string;
  driverEmail: string;
  driverId: number;
}

@Component({
  selector: 'bo-carpooling',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cp-page">

      <!-- Header -->
      <div class="cp-header">
        <div class="cp-header-left">
          <div class="cp-icon">🚌</div>
          <div>
            <h1 class="cp-title">Carpooling Management</h1>
            <p class="cp-sub">Monitor all carpooling trips and drivers</p>
          </div>
        </div>
        <button class="cp-refresh-btn" (click)="load()">
          <span [class.cp-spin]="loading">↻</span> Refresh
        </button>
      </div>

      <!-- KPIs -->
      <div class="cp-kpis">
        <div class="cp-kpi">
          <div class="cp-kpi-icon" style="background:#f5f5f7">🚌</div>
          <div><div class="cp-kpi-val">{{ trips.length }}</div><div class="cp-kpi-lbl">Total Trips</div></div>
        </div>
        <div class="cp-kpi">
          <div class="cp-kpi-icon" style="background:#e8f0fe">👤</div>
          <div><div class="cp-kpi-val" style="color:#185fa5">{{ drivers.length }}</div><div class="cp-kpi-lbl">Drivers</div></div>
        </div>
        <div class="cp-kpi">
          <div class="cp-kpi-icon" style="background:#f1f8e9">👥</div>
          <div><div class="cp-kpi-val" style="color:#2e7d32">{{ totalParticipants() }}</div><div class="cp-kpi-lbl">Participants</div></div>
        </div>
        <div class="cp-kpi">
          <div class="cp-kpi-icon" style="background:#fffde7">🚗</div>
          <div><div class="cp-kpi-val" style="color:#f57f17">{{ totalCars() }}</div><div class="cp-kpi-lbl">Cars</div></div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="cp-toolbar">
        <div class="cp-search-wrap">
          <span>🔍</span>
          <input class="cp-search-input" type="text" placeholder="Search by driver, location or car…"
            [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()">
          <button *ngIf="searchQuery" class="cp-clear-btn" (click)="searchQuery=''; applyFilters()">✕</button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="cp-state">
        <div class="cp-spinner"></div><p>Loading carpooling trips…</p>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="cp-alert cp-alert-err">
        <span>⚠️ {{ error }}</span><button (click)="load()">Retry</button>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && !error && filtered.length === 0" class="cp-state">
        <div style="font-size:56px;margin-bottom:12px">🚌</div>
        <h3 style="color:#1d1d1f;margin:0 0 6px">No trips found</h3>
        <p style="color:#6e6e73;margin:0">Try a different search.</p>
      </div>

      <!-- Table -->
      <div *ngIf="!loading && !error && filtered.length > 0" class="cp-card">
        <div class="cp-card-header">
          <span class="cp-card-title">{{ filtered.length }} trip{{ filtered.length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="cp-table-wrap">
          <table class="cp-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Route</th>
                <th>Date & Time</th>
                <th>Car</th>
                <th>Driver</th>
                <th style="text-align:center">Participants</th>
                <th style="text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of filtered">
                <td class="cp-id">{{ t.tripId }}</td>
                <td>
                  <div class="cp-route">
                    <span class="cp-loc cp-from">📍 {{ t.departure }}</span>
                    <span class="cp-arrow">→</span>
                    <span class="cp-loc cp-to">🏁 {{ t.arrival }}</span>
                  </div>
                </td>
                <td>
                  <div style="font-size:13px;font-weight:500;color:#1d1d1f">{{ t.date | date:'dd MMM yyyy' }}</div>
                  <div style="font-size:11px;color:#6e6e73;margin-top:2px">{{ t.time }}</div>
                </td>
                <td>
                  <span class="cp-car-badge">🚗 {{ t.carModel }}</span>
                </td>
                <td>
                  <div class="cp-driver-cell">
                    <div class="cp-driver-av">{{ (t.driverUsername || '?')[0].toUpperCase() }}</div>
                    <div>
                      <div style="font-size:13px;font-weight:600;color:#1d1d1f">{{ t.driverUsername }}</div>
                      <div style="font-size:11px;color:#aeaeb2">{{ t.driverEmail }}</div>
                    </div>
                  </div>
                </td>
                <td style="text-align:center">
                  <span class="cp-badge">{{ t.participantCount }}</span>
                </td>
                <td style="text-align:right">
                  <button class="cp-del-btn" [disabled]="actionId === t.tripId" (click)="confirmDelete(t)">🗑</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="cp-card-footer">Showing {{ filtered.length }} of {{ trips.length }} trips</div>
      </div>

      <!-- Delete Modal -->
      <div *ngIf="deleteTarget" class="cp-overlay" (click)="cancelDelete()">
        <div class="cp-modal" (click)="$event.stopPropagation()">
          <div style="text-align:center;margin-bottom:16px">
            <div style="width:56px;height:56px;background:#fff2f2;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 12px">🗑</div>
            <h2 style="font-size:18px;font-weight:700;margin:0 0 8px">Delete Trip</h2>
            <p style="font-size:14px;color:#1d1d1f;margin:0 0 6px">
              Delete trip <strong>{{ deleteTarget.departure }} → {{ deleteTarget.arrival }}</strong>?
            </p>
            <p style="font-size:12px;color:#c62828;margin:0 0 20px">All participants will be removed from this trip.</p>
          </div>
          <div *ngIf="deleteError" class="cp-alert cp-alert-err" style="margin-bottom:14px">{{ deleteError }}</div>
          <div style="display:flex;gap:10px">
            <button style="flex:1;background:#c62828;color:#fff;border:none;border-radius:12px;padding:12px;font-size:14px;font-weight:600;cursor:pointer"
              [disabled]="deleting" (click)="doDelete()">{{ deleting ? 'Deleting…' : 'Yes, Delete' }}</button>
            <button style="flex:1;background:#f5f5f7;color:#1d1d1f;border:none;border-radius:12px;padding:12px;font-size:14px;font-weight:600;cursor:pointer"
              (click)="cancelDelete()">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div *ngIf="toast" class="cp-toast" [class.ok]="toastType==='ok'" [class.err]="toastType==='err'">
        {{ toastType === 'ok' ? '✓' : '⚠' }} {{ toast }}
      </div>
    </div>
  `,
  styles: [`
    .cp-page { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#1d1d1f; }
    .cp-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .cp-header-left { display:flex; align-items:center; gap:14px; }
    .cp-icon { width:48px; height:48px; background:#000; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
    .cp-title { font-size:22px; font-weight:700; color:#1d1d1f; margin:0 0 3px; }
    .cp-sub { font-size:13px; color:#6e6e73; margin:0; }
    .cp-refresh-btn { display:flex; align-items:center; gap:6px; background:#fff; border:1px solid #e0e0e5; border-radius:10px; padding:9px 16px; font-size:13px; cursor:pointer; font-weight:500; }
    .cp-refresh-btn:hover { background:#f5f5f7; }
    .cp-spin { display:inline-block; animation:cpspin .7s linear infinite; }
    @keyframes cpspin { to { transform:rotate(360deg); } }
    .cp-kpis { display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
    .cp-kpi { background:#fff; border:1px solid #e0e0e5; border-radius:14px; padding:16px 20px; display:flex; align-items:center; gap:14px; min-width:130px; flex:1; }
    .cp-kpi-icon { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
    .cp-kpi-val { font-size:24px; font-weight:700; color:#1d1d1f; line-height:1; margin-bottom:4px; }
    .cp-kpi-lbl { font-size:11px; color:#6e6e73; font-weight:500; text-transform:uppercase; letter-spacing:.04em; }
    .cp-toolbar { margin-bottom:16px; }
    .cp-search-wrap { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #e0e0e5; border-radius:12px; padding:9px 14px; max-width:400px; }
    .cp-search-wrap:focus-within { border-color:#000; }
    .cp-search-input { border:none; outline:none; font-size:13px; color:#1d1d1f; background:transparent; width:100%; }
    .cp-clear-btn { background:none; border:none; cursor:pointer; color:#aeaeb2; font-size:12px; padding:0; }
    .cp-state { display:flex; flex-direction:column; align-items:center; padding:80px 20px; color:#6e6e73; text-align:center; gap:10px; }
    .cp-spinner { width:36px; height:36px; border:3px solid #e0e0e5; border-top-color:#000; border-radius:50%; animation:cpspin .8s linear infinite; margin-bottom:4px; }
    .cp-alert { border-radius:10px; padding:12px 16px; font-size:13px; font-weight:500; display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:16px; }
    .cp-alert-err { background:#fff2f2; border:1px solid #ffcdd2; color:#c62828; }
    .cp-alert button { background:#c62828; color:#fff; border:none; padding:5px 12px; border-radius:6px; font-size:12px; cursor:pointer; }
    .cp-card { background:#fff; border:1px solid #e0e0e5; border-radius:16px; overflow:hidden; }
    .cp-card-header { padding:14px 20px; border-bottom:1px solid #f0f0f0; }
    .cp-card-title { font-size:14px; font-weight:600; color:#1d1d1f; }
    .cp-card-footer { padding:10px 20px; border-top:1px solid #f0f0f0; font-size:12px; color:#aeaeb2; }
    .cp-table-wrap { overflow-x:auto; }
    .cp-table { width:100%; border-collapse:collapse; }
    .cp-table th { text-align:left; font-size:11px; font-weight:600; color:#6e6e73; text-transform:uppercase; letter-spacing:.06em; padding:12px 16px; background:#fafafa; border-bottom:1px solid #e8e8e8; }
    .cp-table td { padding:12px 16px; border-bottom:1px solid #f5f5f7; vertical-align:middle; }
    .cp-table tbody tr:last-child td { border-bottom:none; }
    .cp-table tbody tr:hover { background:#fafafa; }
    .cp-id { font-size:11px; font-weight:600; color:#c0c0c5; }
    .cp-route { display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
    .cp-loc { font-size:12px; font-weight:500; }
    .cp-from { color:#185fa5; }
    .cp-to { color:#2e7d32; }
    .cp-arrow { color:#aeaeb2; font-size:12px; }
    .cp-car-badge { background:#f5f5f7; color:#1d1d1f; font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; }
    .cp-driver-cell { display:flex; align-items:center; gap:10px; }
    .cp-driver-av { width:32px; height:32px; border-radius:50%; background:#e8f0fe; color:#185fa5; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .cp-badge { background:#f0f0f5; color:#1d1d1f; font-size:12px; font-weight:700; padding:3px 10px; border-radius:20px; }
    .cp-del-btn { padding:5px 12px; border:1px solid #e0e0e5; border-radius:8px; font-size:12px; cursor:pointer; background:#fff; transition:all .15s; }
    .cp-del-btn:hover:not(:disabled) { background:#fff2f2; border-color:#ffcdd2; color:#c62828; }
    .cp-del-btn:disabled { opacity:.4; cursor:not-allowed; }
    .cp-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(2px); }
    .cp-modal { background:#fff; border-radius:20px; width:400px; max-width:95vw; padding:28px 24px; box-shadow:0 24px 60px rgba(0,0,0,.2); }
    .cp-toast { position:fixed; bottom:28px; right:28px; display:flex; align-items:center; gap:8px; padding:12px 20px; border-radius:12px; font-size:13px; font-weight:600; z-index:9999; box-shadow:0 4px 20px rgba(0,0,0,.15); animation:cpslide .25s ease; }
    @keyframes cpslide { from { transform:translateY(12px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    .cp-toast.ok { background:#1d1d1f; color:#fff; }
    .cp-toast.err { background:#c62828; color:#fff; }
  `]
})
export class BackofficeCarpoolingComponent implements OnInit {
  drivers: DriverWithCarsAndCarpoolingsDTO[] = [];
  trips: FlatTrip[] = [];
  filtered: FlatTrip[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';
  actionId: number | null = null;
  deleteTarget: FlatTrip | null = null;
  deleting = false;
  deleteError: string | null = null;
  toast: string | null = null;
  toastType: 'ok' | 'err' = 'ok';

  constructor(private adminSvc: AdminCarpoolingService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = null;
    this.adminSvc.getAllDrivers().subscribe({
      next: drivers => {
        this.drivers = drivers;
        this.trips = this.flatten(drivers);
        this.applyFilters();
        this.loading = false;
      },
      error: e => { this.error = e?.error?.message || 'Failed to load carpooling data.'; this.loading = false; }
    });
  }

  private flatten(drivers: DriverWithCarsAndCarpoolingsDTO[]): FlatTrip[] {
    const result: FlatTrip[] = [];
    for (const d of drivers) {
      for (const car of (d.cars || [])) {
        for (const trip of (car.carpoolings || [])) {
          result.push({
            tripId: trip.carpoolingId,
            departure: trip.departureLocation,
            arrival: trip.arrivalLocation,
            date: trip.date,
            time: trip.departureTime,
            participantCount: trip.participantCount,
            carModel: car.model,
            carId: car.carId,
            driverUsername: d.driverUsername,
            driverEmail: d.driverEmail,
            driverId: d.driverId
          });
        }
      }
    }
    return result;
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filtered = !q ? [...this.trips] : this.trips.filter(t =>
      (t.driverUsername || '').toLowerCase().includes(q) ||
      (t.departure || '').toLowerCase().includes(q) ||
      (t.arrival || '').toLowerCase().includes(q) ||
      (t.carModel || '').toLowerCase().includes(q)
    );
  }

  totalParticipants(): number { return this.trips.reduce((s, t) => s + (t.participantCount || 0), 0); }
  totalCars(): number { return this.drivers.reduce((s, d) => s + (d.cars?.length || 0), 0); }

  confirmDelete(t: FlatTrip): void { this.deleteTarget = t; this.deleteError = null; }
  cancelDelete(): void { this.deleteTarget = null; this.deleteError = null; }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.deleting = true; this.deleteError = null;
    this.adminSvc.deleteCarpooling(this.deleteTarget.tripId).subscribe({
      next: () => {
        this.trips = this.trips.filter(t => t.tripId !== this.deleteTarget!.tripId);
        this.applyFilters(); this.cancelDelete(); this.deleting = false;
        this.showToast('Trip deleted', 'ok');
      },
      error: e => { this.deleteError = e?.error?.message || 'Failed to delete.'; this.deleting = false; }
    });
  }

  private showToast(msg: string, type: 'ok' | 'err'): void {
    this.toast = msg; this.toastType = type;
    setTimeout(() => this.toast = null, 3500);
  }
}
