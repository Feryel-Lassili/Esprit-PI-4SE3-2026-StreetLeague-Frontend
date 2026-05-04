import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService } from '../frontoffice/carpooling/services/car.service';
import { CarDTO } from '../frontoffice/carpooling/models/carpooling.model';

@Component({
  selector: 'bo-cars',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="cm-page">

      <!-- Header -->
      <div class="cm-header">
        <div class="cm-header-left">
          <div class="cm-icon">🚗</div>
          <div>
            <h1 class="cm-title">Cars Management</h1>
            <p class="cm-sub">Monitor all registered vehicles</p>
          </div>
        </div>
        <button class="cm-refresh-btn" (click)="load()">
          <span [class.cm-spin]="loading">↻</span> Refresh
        </button>
      </div>

      <!-- KPIs -->
      <div class="cm-kpis">
        <div class="cm-kpi">
          <div class="cm-kpi-icon" style="background:#f5f5f7">🚗</div>
          <div><div class="cm-kpi-val">{{ cars.length }}</div><div class="cm-kpi-lbl">Total Cars</div></div>
        </div>
        <div class="cm-kpi">
          <div class="cm-kpi-icon" style="background:#e8f0fe">💺</div>
          <div><div class="cm-kpi-val" style="color:#185fa5">{{ totalSeats() }}</div><div class="cm-kpi-lbl">Total Seats</div></div>
        </div>
        <div class="cm-kpi">
          <div class="cm-kpi-icon" style="background:#f1f8e9">✅</div>
          <div><div class="cm-kpi-val" style="color:#2e7d32">{{ totalAvailable() }}</div><div class="cm-kpi-lbl">Available Seats</div></div>
        </div>
        <div class="cm-kpi">
          <div class="cm-kpi-icon" style="background:#fce4ec">👤</div>
          <div><div class="cm-kpi-val" style="color:#c62828">{{ uniqueDrivers() }}</div><div class="cm-kpi-lbl">Drivers</div></div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="cm-toolbar">
        <div class="cm-search-wrap">
          <span>🔍</span>
          <input class="cm-search-input" type="text" placeholder="Search by model, plate or driver…"
            [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()">
          <button *ngIf="searchQuery" class="cm-clear-btn" (click)="searchQuery=''; applyFilters()">✕</button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="cm-state">
        <div class="cm-spinner"></div><p>Loading cars…</p>
      </div>

      <!-- Error -->
      <div *ngIf="error && !loading" class="cm-alert cm-alert-err">
        <span>⚠️ {{ error }}</span><button (click)="load()">Retry</button>
      </div>

      <!-- Empty -->
      <div *ngIf="!loading && !error && filtered.length === 0" class="cm-state">
        <div style="font-size:56px;margin-bottom:12px">🚗</div>
        <h3 style="color:#1d1d1f;margin:0 0 6px">No cars found</h3>
        <p style="color:#6e6e73;margin:0">Try a different search.</p>
      </div>

      <!-- Table -->
      <div *ngIf="!loading && !error && filtered.length > 0" class="cm-card">
        <div class="cm-card-header">
          <span class="cm-card-title">{{ filtered.length }} car{{ filtered.length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="cm-table-wrap">
          <table class="cm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Model</th>
                <th>Plate</th>
                <th style="text-align:center">Seats</th>
                <th style="text-align:center">Available</th>
                <th>Driver</th>
                <th style="text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of filtered">
                <td class="cm-id">{{ c.id }}</td>
                <td>
                  <div class="cm-car-cell">
                    <div class="cm-car-avatar">🚗</div>
                    <div class="cm-car-model">{{ c.model }}</div>
                  </div>
                </td>
                <td><span class="cm-plate">{{ c.plateNumber }}</span></td>
                <td style="text-align:center"><span class="cm-badge">{{ c.seats }}</span></td>
                <td style="text-align:center">
                  <span class="cm-badge" [style.color]="c.availableSeats > 0 ? '#2e7d32' : '#c62828'">
                    {{ c.availableSeats }}
                  </span>
                </td>
                <td>
                  <div class="cm-driver-cell">
                    <div class="cm-driver-avatar">{{ (c.driverUsername || '?')[0].toUpperCase() }}</div>
                    <div>
                      <div style="font-size:13px;font-weight:600;color:#1d1d1f">{{ c.driverUsername }}</div>
                      <div style="font-size:11px;color:#aeaeb2">{{ c.driverEmail }}</div>
                    </div>
                  </div>
                </td>
                <td style="text-align:right">
                  <button class="cm-del-btn" [disabled]="actionId === c.id" (click)="confirmDelete(c)">
                    🗑
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="cm-card-footer">Showing {{ filtered.length }} of {{ cars.length }} cars</div>
      </div>

      <!-- Delete Modal -->
      <div *ngIf="deleteTarget" class="cm-overlay" (click)="cancelDelete()">
        <div class="cm-modal" (click)="$event.stopPropagation()">
          <div style="text-align:center;margin-bottom:16px">
            <div style="width:56px;height:56px;background:#fff2f2;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 12px">🗑</div>
            <h2 style="font-size:18px;font-weight:700;margin:0 0 8px">Delete Car</h2>
            <p style="font-size:14px;color:#1d1d1f;margin:0 0 6px">Delete <strong>{{ deleteTarget.model }}</strong> ({{ deleteTarget.plateNumber }})?</p>
            <p style="font-size:12px;color:#c62828;margin:0 0 20px">All associated carpooling trips will also be removed.</p>
          </div>
          <div *ngIf="deleteError" class="cm-alert cm-alert-err" style="margin-bottom:14px">{{ deleteError }}</div>
          <div style="display:flex;gap:10px">
            <button style="flex:1;background:#c62828;color:#fff;border:none;border-radius:12px;padding:12px;font-size:14px;font-weight:600;cursor:pointer"
              [disabled]="deleting" (click)="doDelete()">{{ deleting ? 'Deleting…' : 'Yes, Delete' }}</button>
            <button style="flex:1;background:#f5f5f7;color:#1d1d1f;border:none;border-radius:12px;padding:12px;font-size:14px;font-weight:600;cursor:pointer"
              (click)="cancelDelete()">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div *ngIf="toast" class="cm-toast" [class.ok]="toastType==='ok'" [class.err]="toastType==='err'">
        {{ toastType === 'ok' ? '✓' : '⚠' }} {{ toast }}
      </div>
    </div>
  `,
  styles: [`
    .cm-page { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#1d1d1f; }
    .cm-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .cm-header-left { display:flex; align-items:center; gap:14px; }
    .cm-icon { width:48px; height:48px; background:#000; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
    .cm-title { font-size:22px; font-weight:700; color:#1d1d1f; margin:0 0 3px; }
    .cm-sub { font-size:13px; color:#6e6e73; margin:0; }
    .cm-refresh-btn { display:flex; align-items:center; gap:6px; background:#fff; border:1px solid #e0e0e5; border-radius:10px; padding:9px 16px; font-size:13px; cursor:pointer; font-weight:500; }
    .cm-refresh-btn:hover { background:#f5f5f7; }
    .cm-spin { display:inline-block; animation:cmspin .7s linear infinite; }
    @keyframes cmspin { to { transform:rotate(360deg); } }
    .cm-kpis { display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
    .cm-kpi { background:#fff; border:1px solid #e0e0e5; border-radius:14px; padding:16px 20px; display:flex; align-items:center; gap:14px; min-width:130px; flex:1; }
    .cm-kpi-icon { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
    .cm-kpi-val { font-size:24px; font-weight:700; color:#1d1d1f; line-height:1; margin-bottom:4px; }
    .cm-kpi-lbl { font-size:11px; color:#6e6e73; font-weight:500; text-transform:uppercase; letter-spacing:.04em; }
    .cm-toolbar { margin-bottom:16px; }
    .cm-search-wrap { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #e0e0e5; border-radius:12px; padding:9px 14px; max-width:400px; }
    .cm-search-wrap:focus-within { border-color:#000; }
    .cm-search-input { border:none; outline:none; font-size:13px; color:#1d1d1f; background:transparent; width:100%; }
    .cm-clear-btn { background:none; border:none; cursor:pointer; color:#aeaeb2; font-size:12px; padding:0; }
    .cm-state { display:flex; flex-direction:column; align-items:center; padding:80px 20px; color:#6e6e73; text-align:center; gap:10px; }
    .cm-spinner { width:36px; height:36px; border:3px solid #e0e0e5; border-top-color:#000; border-radius:50%; animation:cmspin .8s linear infinite; margin-bottom:4px; }
    .cm-alert { border-radius:10px; padding:12px 16px; font-size:13px; font-weight:500; display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:16px; }
    .cm-alert-err { background:#fff2f2; border:1px solid #ffcdd2; color:#c62828; }
    .cm-alert button { background:#c62828; color:#fff; border:none; padding:5px 12px; border-radius:6px; font-size:12px; cursor:pointer; }
    .cm-card { background:#fff; border:1px solid #e0e0e5; border-radius:16px; overflow:hidden; }
    .cm-card-header { padding:14px 20px; border-bottom:1px solid #f0f0f0; }
    .cm-card-title { font-size:14px; font-weight:600; color:#1d1d1f; }
    .cm-card-footer { padding:10px 20px; border-top:1px solid #f0f0f0; font-size:12px; color:#aeaeb2; }
    .cm-table-wrap { overflow-x:auto; }
    .cm-table { width:100%; border-collapse:collapse; }
    .cm-table th { text-align:left; font-size:11px; font-weight:600; color:#6e6e73; text-transform:uppercase; letter-spacing:.06em; padding:12px 16px; background:#fafafa; border-bottom:1px solid #e8e8e8; }
    .cm-table td { padding:12px 16px; border-bottom:1px solid #f5f5f7; vertical-align:middle; }
    .cm-table tbody tr:last-child td { border-bottom:none; }
    .cm-table tbody tr:hover { background:#fafafa; }
    .cm-id { font-size:11px; font-weight:600; color:#c0c0c5; }
    .cm-car-cell { display:flex; align-items:center; gap:10px; }
    .cm-car-avatar { width:36px; height:36px; border-radius:10px; background:#f5f5f7; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
    .cm-car-model { font-weight:600; font-size:14px; color:#1d1d1f; }
    .cm-plate { background:#1d1d1f; color:#fff; font-size:11px; font-weight:700; padding:3px 10px; border-radius:6px; letter-spacing:.05em; font-family:monospace; }
    .cm-badge { background:#f0f0f5; color:#1d1d1f; font-size:12px; font-weight:700; padding:3px 10px; border-radius:20px; }
    .cm-driver-cell { display:flex; align-items:center; gap:10px; }
    .cm-driver-avatar { width:32px; height:32px; border-radius:50%; background:#e8f0fe; color:#185fa5; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .cm-del-btn { padding:5px 12px; border:1px solid #e0e0e5; border-radius:8px; font-size:12px; cursor:pointer; background:#fff; transition:all .15s; }
    .cm-del-btn:hover:not(:disabled) { background:#fff2f2; border-color:#ffcdd2; color:#c62828; }
    .cm-del-btn:disabled { opacity:.4; cursor:not-allowed; }
    .cm-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(2px); }
    .cm-modal { background:#fff; border-radius:20px; width:400px; max-width:95vw; padding:28px 24px; box-shadow:0 24px 60px rgba(0,0,0,.2); }
    .cm-toast { position:fixed; bottom:28px; right:28px; display:flex; align-items:center; gap:8px; padding:12px 20px; border-radius:12px; font-size:13px; font-weight:600; z-index:9999; box-shadow:0 4px 20px rgba(0,0,0,.15); animation:cmslide .25s ease; }
    @keyframes cmslide { from { transform:translateY(12px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    .cm-toast.ok { background:#1d1d1f; color:#fff; }
    .cm-toast.err { background:#c62828; color:#fff; }
  `]
})
export class BackofficeCarsComponent implements OnInit {
  cars: CarDTO[] = [];
  filtered: CarDTO[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';
  actionId: number | null = null;
  deleteTarget: CarDTO | null = null;
  deleting = false;
  deleteError: string | null = null;
  toast: string | null = null;
  toastType: 'ok' | 'err' = 'ok';

  constructor(private carService: CarService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = null;
    this.carService.getAllCars().subscribe({
      next: d => { this.cars = d; this.applyFilters(); this.loading = false; },
      error: e => { this.error = e?.error?.message || 'Failed to load cars.'; this.loading = false; }
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filtered = !q ? [...this.cars] : this.cars.filter(c =>
      (c.model || '').toLowerCase().includes(q) ||
      (c.plateNumber || '').toLowerCase().includes(q) ||
      (c.driverUsername || '').toLowerCase().includes(q)
    );
  }

  totalSeats(): number { return this.cars.reduce((s, c) => s + (c.seats || 0), 0); }
  totalAvailable(): number { return this.cars.reduce((s, c) => s + (c.availableSeats || 0), 0); }
  uniqueDrivers(): number { return new Set(this.cars.map(c => c.driverEmail)).size; }

  confirmDelete(c: CarDTO): void { this.deleteTarget = c; this.deleteError = null; }
  cancelDelete(): void { this.deleteTarget = null; this.deleteError = null; }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.deleting = true; this.deleteError = null;
    this.carService.deleteCar(this.deleteTarget.id).subscribe({
      next: () => {
        this.cars = this.cars.filter(c => c.id !== this.deleteTarget!.id);
        this.applyFilters(); this.cancelDelete(); this.deleting = false;
        this.showToast('Car deleted', 'ok');
      },
      error: e => { this.deleteError = e?.error?.message || 'Failed to delete.'; this.deleting = false; }
    });
  }

  private showToast(msg: string, type: 'ok' | 'err'): void {
    this.toast = msg; this.toastType = type;
    setTimeout(() => this.toast = null, 3500);
  }
}
