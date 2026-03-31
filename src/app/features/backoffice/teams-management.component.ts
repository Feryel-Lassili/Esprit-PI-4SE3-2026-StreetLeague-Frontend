import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../core/services/team.service';

type SportFilter = 'ALL' | 'FOOTBALL' | 'BASKETBALL' | 'TENNIS' | 'VOLLEYBALL' | 'HANDBALL';

@Component({
  selector: 'bo-teams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="tm-page">

      <!-- ── Page Header ── -->
      <div class="tm-page-header">
        <div class="tm-page-header-left">
          <div class="tm-page-icon">⚽</div>
          <div>
            <h1 class="tm-page-title">Teams Management</h1>
            <p class="tm-page-sub">Manage all registered teams and their rosters</p>
          </div>
        </div>
        <button class="tm-refresh-btn" (click)="load()" title="Refresh">
          <span [class.tm-spin]="loading">↻</span> Refresh
        </button>
      </div>

      <!-- ── KPI Cards ── -->
      <div class="tm-kpis">
        <div class="tm-kpi">
          <div class="tm-kpi-icon" style="background:#f5f5f7;">🏆</div>
          <div>
            <div class="tm-kpi-val">{{ teams.length }}</div>
            <div class="tm-kpi-lbl">Total Teams</div>
          </div>
        </div>
        <div class="tm-kpi" *ngFor="let s of sportStats">
          <div class="tm-kpi-icon" [style.background]="sportBg(s.sport)">{{ sportIcon(s.sport) }}</div>
          <div>
            <div class="tm-kpi-val" [style.color]="sportColor(s.sport)">{{ s.count }}</div>
            <div class="tm-kpi-lbl">{{ s.sport | titlecase }}</div>
          </div>
        </div>
      </div>

      <!-- ── Toolbar ── -->
      <div class="tm-toolbar">
        <div class="tm-search-wrap">
          <span class="tm-search-icon">🔍</span>
          <input class="tm-search-input" type="text" placeholder="Search by team name or captain…"
            [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()">
          <button *ngIf="searchQuery" class="tm-clear-btn" (click)="searchQuery=''; applyFilters()">✕</button>
        </div>
        <div class="tm-sport-tabs">
          <button class="tm-sport-tab" *ngFor="let s of sportOptions"
            [class.active]="sportFilter === s.value"
            (click)="sportFilter = s.value; applyFilters()">
            {{ s.icon }} {{ s.label }}
          </button>
        </div>
      </div>

      <!-- ── Loading / Error / Empty ── -->
      <div *ngIf="loading" class="tm-state">
        <div class="tm-spinner"></div>
        <p>Loading teams…</p>
      </div>
      <div *ngIf="error && !loading" class="tm-alert tm-alert-err">
        <span>⚠️ {{ error }}</span>
        <button (click)="load()">Retry</button>
      </div>
      <div *ngIf="!loading && !error && filtered.length === 0" class="tm-state">
        <div style="font-size:56px;margin-bottom:12px;">👥</div>
        <h3 style="color:#1d1d1f;margin:0 0 6px;">No teams found</h3>
        <p style="color:#6e6e73;margin:0;">Try a different search or sport filter.</p>
      </div>

      <!-- ── Table ── -->
      <div *ngIf="!loading && !error && filtered.length > 0" class="tm-card">
        <div class="tm-card-header">
          <span class="tm-card-title">{{ filtered.length }} team{{ filtered.length !== 1 ? 's' : '' }}</span>
        </div>
        <div class="tm-table-wrap">
          <table class="tm-table">
            <thead>
              <tr>
                <th style="width:44px">#</th>
                <th>Team</th>
                <th>Sport</th>
                <th>Captain</th>
                <th style="width:80px;text-align:center">Players</th>
                <th style="width:140px;text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of filtered">
                <td class="tm-id-cell">{{ t.id }}</td>
                <td>
                  <div class="tm-team-cell">
                    <div class="tm-team-avatar" [style.background]="sportColor(t.sportType)">
                      {{ (t.name || '?')[0].toUpperCase() }}
                    </div>
                    <div>
                      <div class="tm-team-name">{{ t.name }}</div>
                      <div class="tm-team-id">ID #{{ t.id }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="tm-sport-badge" [style.background]="sportBg(t.sportType)" [style.color]="sportColor(t.sportType)">
                    {{ sportIcon(t.sportType) }} {{ t.sportType }}
                  </span>
                </td>
                <td>
                  <div *ngIf="t.captainUsername" class="tm-captain-cell">
                    <div class="tm-crown">👑</div>
                    <span>{{ t.captainUsername }}</span>
                  </div>
                  <span *ngIf="!t.captainUsername" class="tm-dash">—</span>
                </td>
                <td style="text-align:center">
                  <span class="tm-count">{{ t.players?.length || 0 }}</span>
                </td>
                <td style="text-align:right">
                  <button class="tm-action-btn tm-action-view" (click)="openTeam(t)">
                    👁 Manage
                  </button>
                  <button class="tm-action-btn tm-action-del" (click)="confirmDelete(t)">
                    🗑
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="tm-card-footer">Showing {{ filtered.length }} of {{ teams.length }} teams</div>
      </div>

      <!-- ══════════════════════════════════════════
           Team Detail / Manage Modal
      ══════════════════════════════════════════ -->
      <div *ngIf="selectedTeam" class="tm-overlay" (click)="closeModal()">
        <div class="tm-modal" (click)="$event.stopPropagation()">

          <!-- Modal header -->
          <div class="tm-modal-top" [style.background]="sportColor(selectedTeam.sportType)">
            <div class="tm-modal-avatar">{{ (selectedTeam.name || '?')[0].toUpperCase() }}</div>
            <div class="tm-modal-heading">
              <h2 class="tm-modal-name">{{ selectedTeam.name }}</h2>
              <span class="tm-modal-sport">{{ sportIcon(selectedTeam.sportType) }} {{ selectedTeam.sportType }}</span>
            </div>
            <button class="tm-modal-close" (click)="closeModal()">✕</button>
          </div>

          <!-- Stats bar -->
          <div class="tm-modal-stats">
            <div class="tm-mstat">
              <div class="tm-mstat-val">{{ selectedTeam.players?.length || 0 }}</div>
              <div class="tm-mstat-lbl">Players</div>
            </div>
            <div class="tm-mstat-divider"></div>
            <div class="tm-mstat">
              <div class="tm-mstat-val">{{ selectedTeam.captainUsername || '—' }}</div>
              <div class="tm-mstat-lbl">Captain</div>
            </div>
            <div class="tm-mstat-divider"></div>
            <div class="tm-mstat">
              <div class="tm-mstat-val">{{ selectedTeam.sportType }}</div>
              <div class="tm-mstat-lbl">Sport</div>
            </div>
          </div>

          <!-- Players section -->
          <div class="tm-modal-body">
            <div class="tm-section-header">
              <span class="tm-section-title">Roster</span>
              <span class="tm-section-hint">Click "Make Captain" to transfer the role</span>
            </div>

            <div *ngIf="!selectedTeam.players || selectedTeam.players.length === 0" class="tm-empty-players">
              <span style="font-size:32px">👤</span>
              <p>No players in this team yet.</p>
            </div>

            <div class="tm-roster">
              <div class="tm-roster-row" *ngFor="let p of selectedTeam.players"
                [class.is-captain]="p.id === selectedTeam.captainId">
                <div class="tm-roster-avatar" [class.captain-avatar]="p.id === selectedTeam.captainId">
                  {{ (p.username || p.email || '?')[0].toUpperCase() }}
                </div>
                <div class="tm-roster-info">
                  <div class="tm-roster-name">{{ p.username || p.email }}</div>
                  <div class="tm-roster-email">{{ p.email }}</div>
                </div>
                <div class="tm-roster-right">
                  <span *ngIf="p.id === selectedTeam.captainId" class="tm-captain-tag">
                    👑 Captain
                  </span>
                  <button *ngIf="p.id !== selectedTeam.captainId"
                    class="tm-make-captain-btn"
                    [disabled]="transferringCaptain"
                    (click)="transferCaptain(selectedTeam, p)">
                    {{ transferringCaptain && transferTarget?.id === p.id ? '…' : '👑 Make Captain' }}
                  </button>
                </div>
              </div>
            </div>

            <div *ngIf="captainError" class="tm-alert tm-alert-err" style="margin-top:12px;">{{ captainError }}</div>
          </div>

        </div>
      </div>

      <!-- ══════════════════════════════════════════
           Delete Confirm Modal
      ══════════════════════════════════════════ -->
      <div *ngIf="deleteTarget" class="tm-overlay" (click)="cancelDelete()">
        <div class="tm-modal tm-modal-sm" (click)="$event.stopPropagation()" style="padding:28px 24px;">
          <div class="tm-del-header">
            <div class="tm-del-icon">🗑</div>
            <h2 class="tm-del-title">Delete Team</h2>
          </div>
          <p class="tm-del-msg">
            Are you sure you want to permanently delete <strong>{{ deleteTarget.name }}</strong>?
          </p>
          <p class="tm-del-warn">This will remove all players and data. This cannot be undone.</p>
          <div *ngIf="deleteError" class="tm-alert tm-alert-err" style="margin-bottom:14px;">{{ deleteError }}</div>
          <div class="tm-del-actions">
            <button class="tm-btn-del-confirm" [disabled]="deleting" (click)="doDelete()">
              {{ deleting ? 'Deleting…' : 'Yes, Delete' }}
            </button>
            <button class="tm-btn-del-cancel" (click)="cancelDelete()">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <div *ngIf="toast" class="tm-toast" [class.ok]="toastType==='ok'" [class.err]="toastType==='err'">
        <span>{{ toastType === 'ok' ? '✓' : '⚠' }}</span> {{ toast }}
      </div>

    </div>
  `,
  styles: [`
    /* ── Base ── */
    .tm-page { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#1d1d1f; }

    /* ── Page Header ── */
    .tm-page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .tm-page-header-left { display:flex; align-items:center; gap:14px; }
    .tm-page-icon { width:48px; height:48px; background:#000; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
    .tm-page-title { font-size:22px; font-weight:700; color:#1d1d1f; margin:0 0 3px; }
    .tm-page-sub { font-size:13px; color:#6e6e73; margin:0; }
    .tm-refresh-btn { display:flex; align-items:center; gap:6px; background:#fff; border:1px solid #e0e0e5; border-radius:10px; padding:9px 16px; font-size:13px; color:#1d1d1f; cursor:pointer; font-weight:500; transition:background .15s; }
    .tm-refresh-btn:hover { background:#f5f5f7; }
    .tm-spin { display:inline-block; animation:tmspin .7s linear infinite; }
    @keyframes tmspin { to { transform:rotate(360deg); } }

    /* ── KPI Strip ── */
    .tm-kpis { display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
    .tm-kpi { background:#fff; border:1px solid #e0e0e5; border-radius:14px; padding:16px 20px; display:flex; align-items:center; gap:14px; min-width:130px; flex:1; }
    .tm-kpi-icon { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
    .tm-kpi-val { font-size:24px; font-weight:700; color:#1d1d1f; line-height:1; margin-bottom:4px; }
    .tm-kpi-lbl { font-size:11px; color:#6e6e73; font-weight:500; text-transform:uppercase; letter-spacing:.04em; }

    /* ── Toolbar ── */
    .tm-toolbar { display:flex; align-items:center; gap:14px; margin-bottom:16px; flex-wrap:wrap; }
    .tm-search-wrap { display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #e0e0e5; border-radius:12px; padding:9px 14px; min-width:240px; flex:1; transition:border-color .15s; }
    .tm-search-wrap:focus-within { border-color:#000; }
    .tm-search-icon { font-size:13px; color:#aeaeb2; flex-shrink:0; }
    .tm-search-input { border:none; outline:none; font-size:13px; color:#1d1d1f; background:transparent; width:100%; }
    .tm-clear-btn { background:none; border:none; cursor:pointer; color:#aeaeb2; font-size:12px; padding:0; }
    .tm-sport-tabs { display:flex; gap:6px; flex-wrap:wrap; }
    .tm-sport-tab { background:#fff; border:1px solid #e0e0e5; border-radius:20px; padding:6px 14px; font-size:12px; color:#6e6e73; cursor:pointer; white-space:nowrap; transition:all .15s; font-weight:500; }
    .tm-sport-tab:hover { border-color:#000; color:#1d1d1f; }
    .tm-sport-tab.active { background:#000; border-color:#000; color:#fff; }

    /* ── State: loading / error / empty ── */
    .tm-state { display:flex; flex-direction:column; align-items:center; padding:80px 20px; color:#6e6e73; text-align:center; gap:10px; }
    .tm-spinner { width:36px; height:36px; border:3px solid #e0e0e5; border-top-color:#000; border-radius:50%; animation:tmspin .8s linear infinite; margin-bottom:4px; }
    .tm-alert { border-radius:10px; padding:12px 16px; font-size:13px; font-weight:500; display:flex; align-items:center; justify-content:space-between; gap:10px; }
    .tm-alert-err { background:#fff2f2; border:1px solid #ffcdd2; color:#c62828; }
    .tm-alert button { background:#c62828; color:#fff; border:none; padding:5px 12px; border-radius:6px; font-size:12px; cursor:pointer; }

    /* ── Main Card ── */
    .tm-card { background:#fff; border:1px solid #e0e0e5; border-radius:16px; overflow:hidden; }
    .tm-card-header { padding:14px 20px; border-bottom:1px solid #f0f0f0; display:flex; align-items:center; justify-content:space-between; }
    .tm-card-title { font-size:14px; font-weight:600; color:#1d1d1f; }
    .tm-card-footer { padding:10px 20px; border-top:1px solid #f0f0f0; font-size:12px; color:#aeaeb2; }
    .tm-table-wrap { overflow-x:auto; }
    .tm-table { width:100%; border-collapse:collapse; }
    .tm-table th { text-align:left; font-size:11px; font-weight:600; color:#6e6e73; text-transform:uppercase; letter-spacing:.06em; padding:12px 16px; background:#fafafa; border-bottom:1px solid #e8e8e8; }
    .tm-table td { padding:14px 16px; border-bottom:1px solid #f5f5f7; vertical-align:middle; }
    .tm-table tbody tr:last-child td { border-bottom:none; }
    .tm-table tbody tr { transition:background .1s; }
    .tm-table tbody tr:hover { background:#fafafa; }
    .tm-id-cell { font-size:11px; font-weight:600; color:#c0c0c5; }
    .tm-team-cell { display:flex; align-items:center; gap:12px; }
    .tm-team-avatar { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:700; color:#fff; flex-shrink:0; }
    .tm-team-name { font-weight:600; font-size:14px; color:#1d1d1f; }
    .tm-team-id { font-size:11px; color:#aeaeb2; margin-top:2px; }
    .tm-sport-badge { display:inline-flex; align-items:center; gap:4px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; }
    .tm-captain-cell { display:flex; align-items:center; gap:6px; font-size:13px; }
    .tm-crown { font-size:14px; }
    .tm-dash { color:#aeaeb2; font-size:13px; }
    .tm-count { background:#f0f0f5; color:#1d1d1f; font-size:13px; font-weight:700; padding:3px 12px; border-radius:20px; }
    .tm-action-btn { padding:6px 12px; border:1px solid #e0e0e5; border-radius:8px; font-size:12px; cursor:pointer; background:#fff; transition:all .15s; font-weight:500; }
    .tm-action-view { margin-right:6px; }
    .tm-action-view:hover { background:#000; border-color:#000; color:#fff; }
    .tm-action-del:hover { background:#fff2f2; border-color:#ffcdd2; color:#c62828; }

    /* ── Modal Overlay ── */
    .tm-overlay { position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(2px); }

    /* ── Team Detail Modal ── */
    .tm-modal { background:#fff; border-radius:20px; width:500px; max-width:95vw; max-height:88vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 24px 60px rgba(0,0,0,.2); }
    .tm-modal-sm { width:400px; }
    .tm-modal-top { display:flex; align-items:center; gap:14px; padding:20px 24px; position:relative; flex-shrink:0; }
    .tm-modal-avatar { width:48px; height:48px; border-radius:14px; background:rgba(255,255,255,.25); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:700; color:#fff; flex-shrink:0; }
    .tm-modal-heading { flex:1; }
    .tm-modal-name { font-size:18px; font-weight:700; color:#fff; margin:0 0 4px; }
    .tm-modal-sport { font-size:12px; color:rgba(255,255,255,.8); font-weight:500; }
    .tm-modal-close { background:rgba(255,255,255,.2); border:none; border-radius:8px; width:32px; height:32px; cursor:pointer; font-size:14px; color:#fff; display:flex; align-items:center; justify-content:center; transition:background .15s; }
    .tm-modal-close:hover { background:rgba(255,255,255,.35); }
    .tm-modal-stats { display:flex; align-items:center; padding:16px 24px; border-bottom:1px solid #f0f0f0; background:#fafafa; flex-shrink:0; }
    .tm-mstat { flex:1; text-align:center; }
    .tm-mstat-val { font-size:14px; font-weight:700; color:#1d1d1f; margin-bottom:3px; }
    .tm-mstat-lbl { font-size:11px; color:#6e6e73; text-transform:uppercase; letter-spacing:.05em; }
    .tm-mstat-divider { width:1px; height:32px; background:#e0e0e5; }
    .tm-modal-body { flex:1; overflow-y:auto; padding:20px 24px; }
    .tm-section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
    .tm-section-title { font-size:13px; font-weight:700; color:#1d1d1f; text-transform:uppercase; letter-spacing:.06em; }
    .tm-section-hint { font-size:11px; color:#aeaeb2; }
    .tm-empty-players { display:flex; flex-direction:column; align-items:center; padding:32px; color:#6e6e73; gap:8px; text-align:center; }

    /* ── Roster ── */
    .tm-roster { display:flex; flex-direction:column; gap:8px; }
    .tm-roster-row { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; border:1px solid #f0f0f0; background:#fff; transition:border-color .15s; }
    .tm-roster-row:hover { border-color:#e0e0e5; background:#fafafa; }
    .tm-roster-row.is-captain { border-color:#fde68a; background:#fffdf0; }
    .tm-roster-avatar { width:36px; height:36px; border-radius:50%; background:#e8f0fe; color:#185fa5; font-size:14px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .captain-avatar { background:#fef3c7; color:#d97706; }
    .tm-roster-info { flex:1; min-width:0; }
    .tm-roster-name { font-size:13px; font-weight:600; color:#1d1d1f; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .tm-roster-email { font-size:11px; color:#6e6e73; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .tm-roster-right { flex-shrink:0; }
    .tm-captain-tag { display:inline-flex; align-items:center; gap:4px; background:#fef3c7; color:#d97706; font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; }
    .tm-make-captain-btn { background:#fff; border:1px solid #e0e0e5; border-radius:8px; padding:5px 12px; font-size:12px; font-weight:500; color:#6e6e73; cursor:pointer; transition:all .15s; white-space:nowrap; }
    .tm-make-captain-btn:hover:not(:disabled) { background:#000; border-color:#000; color:#fff; }
    .tm-make-captain-btn:disabled { opacity:.4; cursor:not-allowed; }

    /* ── Delete Modal ── */
    .tm-del-header { display:flex; flex-direction:column; align-items:center; text-align:center; margin-bottom:16px; gap:10px; }
    .tm-del-icon { width:56px; height:56px; background:#fff2f2; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:26px; }
    .tm-del-title { font-size:18px; font-weight:700; color:#1d1d1f; margin:0; }
    .tm-del-msg { font-size:14px; color:#1d1d1f; text-align:center; margin:0 0 8px; }
    .tm-del-warn { font-size:12px; color:#c62828; text-align:center; margin:0 0 20px; }
    .tm-del-actions { display:flex; gap:10px; }
    .tm-btn-del-confirm { flex:1; background:#c62828; color:#fff; border:none; border-radius:12px; padding:12px; font-size:14px; font-weight:600; cursor:pointer; transition:background .15s; }
    .tm-btn-del-confirm:hover:not(:disabled) { background:#b71c1c; }
    .tm-btn-del-confirm:disabled { opacity:.5; cursor:not-allowed; }
    .tm-btn-del-cancel { flex:1; background:#f5f5f7; color:#1d1d1f; border:none; border-radius:12px; padding:12px; font-size:14px; font-weight:600; cursor:pointer; transition:background .15s; }
    .tm-btn-del-cancel:hover { background:#e8e8ea; }
    .tm-modal-sm .tm-modal-body-pad { padding:20px 24px; }

    /* ── Toast ── */
    .tm-toast { position:fixed; bottom:28px; right:28px; display:flex; align-items:center; gap:8px; padding:12px 20px; border-radius:12px; font-size:13px; font-weight:600; z-index:9999; box-shadow:0 4px 20px rgba(0,0,0,.15); animation:tmslide .25s ease; }
    @keyframes tmslide { from { transform:translateY(12px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    .tm-toast.ok { background:#1d1d1f; color:#fff; }
    .tm-toast.err { background:#c62828; color:#fff; }
  `]
})
export class BackofficeTeamsComponent implements OnInit {
  teams: any[] = [];
  filtered: any[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';
  sportFilter: SportFilter = 'ALL';

  selectedTeam: any = null;
  transferringCaptain = false;
  transferTarget: any = null;
  captainError: string | null = null;

  deleteTarget: any = null;
  deleting = false;
  deleteError: string | null = null;

  toast: string | null = null;
  toastType: 'ok' | 'err' = 'ok';

  readonly sportOptions = [
    { value: 'ALL',        label: 'All',        icon: '🏆' },
    { value: 'FOOTBALL',   label: 'Football',   icon: '⚽' },
    { value: 'BASKETBALL', label: 'Basketball', icon: '🏀' },
    { value: 'TENNIS',     label: 'Tennis',     icon: '🎾' },
    { value: 'VOLLEYBALL', label: 'Volleyball', icon: '🏐' },
    { value: 'HANDBALL',   label: 'Handball',   icon: '🤾' },
  ] as const;

  get sportStats() {
    const counts: Record<string, number> = {};
    for (const t of this.teams) {
      counts[t.sportType] = (counts[t.sportType] || 0) + 1;
    }
    return Object.entries(counts).map(([sport, count]) => ({ sport, count }));
  }

  constructor(private teamService: TeamService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = null;
    this.teamService.getAllTeams().subscribe({
      next: data => { this.teams = data; this.applyFilters(); this.loading = false; },
      error: e => { this.error = e?.error?.message || 'Failed to load teams.'; this.loading = false; }
    });
  }

  applyFilters(): void {
    const q = this.searchQuery.toLowerCase();
    this.filtered = this.teams.filter(t => {
      const matchSport = this.sportFilter === 'ALL' || t.sportType === this.sportFilter;
      const matchSearch = !q
        || (t.name || '').toLowerCase().includes(q)
        || (t.captainUsername || '').toLowerCase().includes(q);
      return matchSport && matchSearch;
    });
  }

  openTeam(team: any): void {
    this.selectedTeam = team;
    this.captainError = null;
    this.transferringCaptain = false;
    this.transferTarget = null;
  }

  closeModal(): void { this.selectedTeam = null; }

  transferCaptain(team: any, newCaptain: any): void {
    this.transferringCaptain = true;
    this.transferTarget = newCaptain;
    this.captainError = null;
    this.teamService.transferCaptain(team.id, newCaptain.id).subscribe({
      next: () => {
        // Update local state
        team.captainId = newCaptain.id;
        team.captainUsername = newCaptain.username || newCaptain.email;
        // Also update in the main teams array
        const t = this.teams.find(x => x.id === team.id);
        if (t) { t.captainId = newCaptain.id; t.captainUsername = newCaptain.username || newCaptain.email; }
        this.applyFilters();
        this.transferringCaptain = false;
        this.transferTarget = null;
        this.showToast(`👑 ${newCaptain.username || newCaptain.email} is now captain`, 'ok');
      },
      error: e => {
        this.captainError = e?.error?.message || 'Failed to transfer captain role.';
        this.transferringCaptain = false;
        this.transferTarget = null;
      }
    });
  }

  confirmDelete(team: any): void { this.deleteTarget = team; this.deleteError = null; }
  cancelDelete(): void { this.deleteTarget = null; this.deleteError = null; }

  doDelete(): void {
    if (!this.deleteTarget) return;
    this.deleting = true; this.deleteError = null;
    this.teamService.deleteTeam(this.deleteTarget.id).subscribe({
      next: () => {
        this.teams = this.teams.filter(t => t.id !== this.deleteTarget!.id);
        this.applyFilters();
        this.cancelDelete();
        this.deleting = false;
        this.showToast('Team deleted', 'ok');
      },
      error: e => {
        this.deleteError = e?.error?.message || 'Failed to delete team.';
        this.deleting = false;
      }
    });
  }

  sportIcon(sport: string): string {
    const m: Record<string, string> = { FOOTBALL:'⚽', BASKETBALL:'🏀', TENNIS:'🎾', VOLLEYBALL:'🏐', HANDBALL:'🤾' };
    return m[sport] || '🏆';
  }

  sportColor(sport: string): string {
    const m: Record<string, string> = { FOOTBALL:'#2e7d32', BASKETBALL:'#e65100', TENNIS:'#1565c0', VOLLEYBALL:'#6a1b9a', HANDBALL:'#c62828' };
    return m[sport] || '#374151';
  }

  sportBg(sport: string): string {
    const m: Record<string, string> = { FOOTBALL:'#f1f8e9', BASKETBALL:'#fff3e0', TENNIS:'#e8f0fe', VOLLEYBALL:'#ede9fe', HANDBALL:'#fff2f2' };
    return m[sport] || '#f5f5f7';
  }

  private showToast(msg: string, type: 'ok' | 'err'): void {
    this.toast = msg; this.toastType = type;
    setTimeout(() => this.toast = null, 3500);
  }
}
