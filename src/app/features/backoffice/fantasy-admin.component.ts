import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { VirtualTeamService, VirtualTeamResponse } from '../../core/services/virtual-team.service';
import { PredictionService, PredictionResponse } from '../../core/services/prediction.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface FantasyStats {
  totalPointsThisWeek: number;
  mostPredictedPlayer: string;
  bestPrediction: { username: string; points: number } | null;
  activeTeams: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  email: string;
  walletPoints: number;
}

@Component({
  selector: 'bo-fantasy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fg-page">

      <!-- Header -->
      <div class="fg-header">
        <div class="fg-header-left">
          <div class="fg-icon">🎮</div>
          <div>
            <h1 class="fg-title">Fantasy Game</h1>
            <p class="fg-sub">Manage virtual teams and resolve weekly predictions</p>
          </div>
        </div>
        <button class="fg-refresh-btn" (click)="load()">
          <span [class.fg-spin]="loadingTeams || loadingPred || loadingStats">↻</span> Refresh
        </button>
      </div>

      <!-- ── Global Stats KPIs ── -->
      <div class="fg-section-label">📊 This Week's Highlights</div>
      <div class="fg-kpis fg-kpis-stats" style="margin-bottom:12px">
        <div class="fg-kpi fg-kpi-stat">
          <div class="fg-kpi-icon" style="background:#e8f5e9;font-size:22px">💰</div>
          <div>
            <div class="fg-kpi-val" style="color:#2e7d32">
              {{ loadingStats ? '…' : (stats ? '+' + stats.totalPointsThisWeek.toFixed(1) : '—') }}
            </div>
            <div class="fg-kpi-lbl">Points Distributed</div>
            <div class="fg-kpi-sub">current week</div>
          </div>
        </div>
        <div class="fg-kpi fg-kpi-stat">
          <div class="fg-kpi-icon" style="background:#fff3e0;font-size:22px">⭐</div>
          <div>
            <div class="fg-kpi-val" style="color:#e65100;font-size:16px;line-height:1.3">
              {{ loadingStats ? '…' : (stats ? stats.mostPredictedPlayer : '—') }}
            </div>
            <div class="fg-kpi-lbl">Most Predicted Player</div>
            <div class="fg-kpi-sub">all time</div>
          </div>
        </div>
        <div class="fg-kpi fg-kpi-stat">
          <div class="fg-kpi-icon" style="background:#e8f0fe;font-size:22px">🏅</div>
          <div>
            <div class="fg-kpi-val" style="color:#185fa5;font-size:16px;line-height:1.3">
              {{ loadingStats ? '…' : (stats?.bestPrediction ? stats!.bestPrediction!.username : '—') }}
            </div>
            <div class="fg-kpi-lbl">Best Prediction</div>
            <div class="fg-kpi-sub">
              {{ stats?.bestPrediction ? '+' + stats!.bestPrediction!.points.toFixed(1) + ' pts this week' : 'no resolved predictions' }}
            </div>
          </div>
        </div>
        <div class="fg-kpi fg-kpi-stat">
          <div class="fg-kpi-icon" style="background:#f3e5f5;font-size:22px">🎮</div>
          <div>
            <div class="fg-kpi-val" style="color:#6a1b9a">
              {{ loadingStats ? '…' : (stats ? stats.activeTeams : '—') }}
            </div>
            <div class="fg-kpi-lbl">Active Teams</div>
            <div class="fg-kpi-sub">total registered</div>
          </div>
        </div>
      </div>

      <!-- ── Standard KPIs ── -->
      <div class="fg-kpis" style="margin-bottom:24px">
        <div class="fg-kpi">
          <div class="fg-kpi-icon" style="background:#f5f5f7">🎮</div>
          <div><div class="fg-kpi-val">{{ teams.length }}</div><div class="fg-kpi-lbl">Virtual Teams</div></div>
        </div>
        <div class="fg-kpi">
          <div class="fg-kpi-icon" style="background:#fffde7">⏳</div>
          <div><div class="fg-kpi-val" style="color:#f57f17">{{ pending.length }}</div><div class="fg-kpi-lbl">Pending</div></div>
        </div>
        <div class="fg-kpi">
          <div class="fg-kpi-icon" style="background:#f1f8e9">✅</div>
          <div><div class="fg-kpi-val" style="color:#2e7d32">{{ resolvedCount }}</div><div class="fg-kpi-lbl">Resolved</div></div>
        </div>
        <div class="fg-kpi">
          <div class="fg-kpi-icon" style="background:#e8f0fe">⭐</div>
          <div><div class="fg-kpi-val" style="color:#185fa5">{{ totalPoints() }}</div><div class="fg-kpi-lbl">Total Earned Pts</div></div>
        </div>
      </div>

      <!-- ── Virtual Teams ── -->
      <div class="fg-section-title">🏆 Virtual Teams</div>

      <div *ngIf="loadingTeams" class="fg-state">
        <div class="fg-spinner"></div><p>Loading teams…</p>
      </div>
      <div *ngIf="errorTeams && !loadingTeams" class="fg-alert fg-alert-err">⚠️ {{ errorTeams }}</div>

      <div *ngIf="!loadingTeams && teams.length > 0" class="fg-card" style="margin-bottom:24px">
        <div class="fg-table-wrap">
          <table class="fg-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Team Name</th>
                <th>Sport</th>
                <th style="text-align:center">Players</th>
                <th style="text-align:right">Earned Pts</th>
                <th style="text-align:right">Week Pts</th>
                <th style="text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of teams">
                <td class="fg-id">{{ t.id }}</td>
                <td>
                  <div class="fg-team-cell">
                    <div class="fg-team-av">{{ (t.name || '?')[0].toUpperCase() }}</div>
                    <span class="fg-team-name">{{ t.name || 'Team #' + t.id }}</span>
                  </div>
                </td>
                <td><span class="fg-sport-badge" [class]="'fg-sport-'+(t.sportType ? t.sportType.toLowerCase() : '')">{{ sportIcon(t.sportType) }} {{ t.sportType }}</span></td>
                <td style="text-align:center"><span class="fg-badge">{{ t.playerIds ? t.playerIds.length : 0 }}</span></td>
                <td style="text-align:right"><strong>{{ t.earnedPoints || 0 }}</strong></td>
                <td style="text-align:right"><strong style="color:#185fa5">{{ t.weekPoints || 0 }}</strong></td>
                <td style="text-align:right">
                  <button class="fg-del-btn" [disabled]="deletingId === t.id" (click)="deleteTeam(t)">
                    {{ deletingId === t.id ? '…' : '🗑' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="fg-card-footer">{{ teams.length }} virtual team{{ teams.length !== 1 ? 's' : '' }}</div>
      </div>

      <div *ngIf="!loadingTeams && !errorTeams && teams.length === 0" class="fg-state" style="padding:32px">
        <p style="color:#6e6e73">No virtual teams yet.</p>
      </div>

      <!-- ── Predictions ── -->
      <div class="fg-section-title" style="display:flex;align-items:center;justify-content:space-between">
        <span>🎯 Predictions</span>
        <div style="display:flex;gap:6px">
          <button class="fg-tab" [class.fg-tab-active]="predTab==='all'"     (click)="predTab='all'">All ({{ allPred.length }})</button>
          <button class="fg-tab" [class.fg-tab-active]="predTab==='pending'" (click)="predTab='pending'">⏳ Pending ({{ pending.length }})</button>
          <button class="fg-tab" [class.fg-tab-active]="predTab==='resolved'" (click)="predTab='resolved'">✅ Resolved ({{ resolvedPred.length }})</button>
        </div>
      </div>

      <div *ngIf="loadingPred" class="fg-state"><div class="fg-spinner"></div><p>Loading predictions…</p></div>
      <div *ngIf="errorPred && !loadingPred" class="fg-alert fg-alert-err">⚠️ {{ errorPred }}</div>

      <div *ngIf="!loadingPred && visiblePred.length > 0" class="fg-card">
        <div class="fg-table-wrap">
          <table class="fg-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>Week</th>
                <th>Captain</th>
                <th>Goal Predictions</th>
                <th>Status</th>
                <th>Pts</th>
                <th style="text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of visiblePred">
                <td class="fg-id">{{ p.id }}</td>
                <td><span class="fg-badge">Team #{{ p.virtualTeamId }}</span></td>
                <td style="white-space:nowrap">W{{ p.weekNumber }} / {{ p.weekYear }}</td>
                <td>
                  <span *ngIf="captainOf(p) as c" class="fg-captain-chip">👑 {{ c.playerName }}</span>
                  <span *ngIf="!captainOf(p)" style="color:#aeaeb2;font-size:12px">—</span>
                </td>
                <td>
                  <div class="fg-goal-chips">
                    <span *ngFor="let pp of goalPredictors(p)" class="fg-goal-chip">⚽ {{ pp.playerName }}</span>
                    <span *ngIf="goalPredictors(p).length === 0" style="color:#aeaeb2;font-size:12px">None</span>
                  </div>
                </td>
                <td>
                  <span *ngIf="p.status==='PENDING'"  class="fg-status-pending">⏳ Pending</span>
                  <span *ngIf="p.status==='RESOLVED'" class="fg-status-resolved">✅ Resolved</span>
                </td>
                <td style="font-weight:700" [style.color]="p.totalPointsEarned > 0 ? '#2e7d32' : p.totalPointsEarned < 0 ? '#c62828' : '#aeaeb2'">
                  {{ p.status==='RESOLVED' ? ((p.totalPointsEarned > 0 ? '+' : '') + p.totalPointsEarned.toFixed(1)) : '—' }}
                </td>
                <td style="text-align:right">
                  <button *ngIf="p.status==='PENDING'" class="fg-resolve-btn" [disabled]="resolvingId === p.id" (click)="resolve(p)">
                    {{ resolvingId === p.id ? 'Resolving…' : '✓ Resolve' }}
                  </button>
                  <span *ngIf="p.status==='RESOLVED'" style="color:#aeaeb2;font-size:12px">Done</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="fg-card-footer">{{ visiblePred.length }} prediction{{ visiblePred.length !== 1 ? 's' : '' }}</div>
      </div>

      <div *ngIf="!loadingPred && !errorPred && visiblePred.length === 0" class="fg-state" style="padding:32px">
        <p style="color:#6e6e73">{{ predTab==='pending' ? '✅ No pending predictions.' : 'No predictions yet.' }}</p>
      </div>

      <!-- ── Match Results ── -->
      <div class="fg-section-title" style="margin-top:32px">
        ⚽ Submit Match Results
        <span style="font-size:11px;font-weight:400;color:#6e6e73;margin-left:8px">auto-resolves predictions for that week</span>
      </div>

      <div class="fg-card" style="padding:20px">

        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;align-items:flex-end">
          <div>
            <div class="mr-label">Sport</div>
            <select class="mr-select" [(ngModel)]="mrSport" (change)="mrLoadPlayers()">
              <option value="FOOTBALL">⚽ Football</option>
              <option value="BASKETBALL">🏀 Basketball</option>
              <option value="TENNIS">🎾 Tennis</option>
            </select>
          </div>
          <div>
            <div class="mr-label">Week #</div>
            <input class="mr-input" type="number" [(ngModel)]="mrWeek" min="1" max="53" style="width:80px">
          </div>
          <div>
            <div class="mr-label">Year</div>
            <input class="mr-input" type="number" [(ngModel)]="mrYear" style="width:90px">
          </div>
          <button class="fg-refresh-btn" (click)="mrLoadPlayers()" [disabled]="mrLoadingPlayers">
            {{ mrLoadingPlayers ? 'Loading…' : '🔄 Load Players' }}
          </button>
        </div>

        <div *ngIf="mrLoadingPlayers" style="color:#6e6e73;font-size:13px;padding:12px 0">Loading players…</div>

        <div *ngIf="mrPlayers.length > 0">
          <table class="fg-table" style="margin-bottom:16px">
            <thead>
              <tr>
                <th>Player</th>
                <ng-container *ngIf="mrSport==='FOOTBALL'">
                  <th style="text-align:center">Goals ⚽</th>
                  <th style="text-align:center">Yellow 🟨</th>
                  <th style="text-align:center">Red 🟥</th>
                </ng-container>
                <ng-container *ngIf="mrSport==='BASKETBALL'">
                  <th style="text-align:center">Points 🏀</th>
                </ng-container>
                <ng-container *ngIf="mrSport==='TENNIS'">
                  <th style="text-align:center">Won? 🎾</th>
                </ng-container>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of mrPlayers">
                <td style="font-weight:600;font-size:13px">{{ p.fullName }}</td>
                <ng-container *ngIf="mrSport==='FOOTBALL'">
                  <td style="text-align:center"><input class="mr-stat" type="number" min="0" [(ngModel)]="mrStats[p.id].goals"></td>
                  <td style="text-align:center"><input class="mr-stat" type="number" min="0" [(ngModel)]="mrStats[p.id].yellow"></td>
                  <td style="text-align:center"><input class="mr-stat" type="number" min="0" [(ngModel)]="mrStats[p.id].red"></td>
                </ng-container>
                <ng-container *ngIf="mrSport==='BASKETBALL'">
                  <td style="text-align:center"><input class="mr-stat" type="number" min="0" [(ngModel)]="mrStats[p.id].bpts"></td>
                </ng-container>
                <ng-container *ngIf="mrSport==='TENNIS'">
                  <td style="text-align:center">
                    <input type="checkbox" [(ngModel)]="mrStats[p.id].win" style="width:18px;height:18px;cursor:pointer">
                  </td>
                </ng-container>
              </tr>
            </tbody>
          </table>

          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <button class="fg-resolve-btn" style="padding:10px 24px;font-size:14px"
                    [disabled]="mrSubmitting" (click)="submitMatchResult()">
              {{ mrSubmitting ? 'Submitting…' : '🚀 Submit & Auto-Resolve Predictions' }}
            </button>
            <span *ngIf="mrResultMsg" [style.color]="mrResultOk ? '#2e7d32' : '#c62828'" style="font-size:13px;font-weight:600">
              {{ mrResultMsg }}
            </span>
          </div>
        </div>

        <div *ngIf="!mrLoadingPlayers && mrPlayers.length === 0 && mrLoaded" class="fg-state" style="padding:20px">
          <p style="color:#6e6e73">No {{ mrSport | lowercase }} players found.</p>
        </div>
      </div>

      <!-- ── Leaderboard ── -->
      <div class="fg-section-title" style="margin-top:32px">
        🏆 Fantasy Leaderboard
        <span style="font-size:11px;font-weight:400;color:#6e6e73;margin-left:8px">ranked by wallet points</span>
      </div>

      <div *ngIf="loadingLeaderboard" class="fg-state"><div class="fg-spinner"></div><p>Loading leaderboard…</p></div>

      <div *ngIf="!loadingLeaderboard && leaderboard.length > 0" class="fg-card" style="margin-bottom:32px">
        <div class="fg-table-wrap">
          <table class="fg-table">
            <thead>
              <tr>
                <th style="text-align:center;width:60px">Rank</th>
                <th>Username</th>
                <th>Email</th>
                <th style="text-align:right">Wallet Points</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let e of leaderboard"
                  [class.lb-gold]="e.rank === 1"
                  [class.lb-silver]="e.rank === 2"
                  [class.lb-bronze]="e.rank === 3">
                <td style="text-align:center;font-weight:700;font-size:18px">
                  <span *ngIf="e.rank === 1">🥇</span>
                  <span *ngIf="e.rank === 2">🥈</span>
                  <span *ngIf="e.rank === 3">🥉</span>
                  <span *ngIf="e.rank > 3" class="fg-id">#{{ e.rank }}</span>
                </td>
                <td>
                  <div class="fg-team-cell">
                    <div class="fg-team-av" [style.background]="rankColor(e.rank)">
                      {{ (e.username || '?')[0].toUpperCase() }}
                    </div>
                    <span class="fg-team-name">{{ e.username }}</span>
                  </div>
                </td>
                <td style="color:#6e6e73;font-size:13px">{{ e.email }}</td>
                <td style="text-align:right">
                  <span class="lb-pts" [class.lb-pts-top]="e.rank <= 3">
                    {{ e.walletPoints | number }} pts
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="fg-card-footer">{{ leaderboard.length }} players ranked</div>
      </div>

      <div *ngIf="!loadingLeaderboard && leaderboard.length === 0" class="fg-state" style="padding:32px">
        <p style="color:#6e6e73">No wallet data yet.</p>
      </div>

      <!-- Toast -->
      <div *ngIf="toast" class="fg-toast" [class.ok]="toastType==='ok'" [class.err]="toastType==='err'">
        {{ toastType === 'ok' ? '✓' : '⚠' }} {{ toast }}
      </div>
    </div>
  `,
  styles: [`
    .fg-page { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#1d1d1f; }
    .fg-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
    .fg-header-left { display:flex; align-items:center; gap:14px; }
    .fg-icon { width:48px; height:48px; background:#000; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
    .fg-title { font-size:22px; font-weight:700; margin:0 0 3px; }
    .fg-sub { font-size:13px; color:#6e6e73; margin:0; }
    .fg-refresh-btn { display:flex; align-items:center; gap:6px; background:#fff; border:1px solid #e0e0e5; border-radius:10px; padding:9px 16px; font-size:13px; cursor:pointer; font-weight:500; }
    .fg-refresh-btn:hover { background:#f5f5f7; }
    .fg-spin { display:inline-block; animation:fgspin .7s linear infinite; }
    @keyframes fgspin { to { transform:rotate(360deg); } }

    /* ── Section label ── */
    .fg-section-label { font-size:11px; font-weight:700; color:#aeaeb2; text-transform:uppercase; letter-spacing:.08em; margin-bottom:8px; }

    /* ── KPIs ── */
    .fg-kpis { display:flex; gap:12px; flex-wrap:wrap; }
    .fg-kpi { background:#fff; border:1px solid #e0e0e5; border-radius:14px; padding:16px 20px; display:flex; align-items:center; gap:14px; min-width:130px; flex:1; }
    .fg-kpi-stat { min-width:160px; }
    .fg-kpi-icon { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
    .fg-kpi-val { font-size:24px; font-weight:700; color:#1d1d1f; line-height:1; margin-bottom:2px; }
    .fg-kpi-lbl { font-size:11px; color:#6e6e73; font-weight:500; text-transform:uppercase; letter-spacing:.04em; }
    .fg-kpi-sub { font-size:11px; color:#aeaeb2; margin-top:2px; }

    .fg-section-title { font-size:14px; font-weight:700; color:#1d1d1f; text-transform:uppercase; letter-spacing:.06em; margin-bottom:12px; padding-bottom:8px; border-bottom:2px solid #f0f0f0; }
    .fg-state { display:flex; flex-direction:column; align-items:center; padding:40px 20px; color:#6e6e73; text-align:center; gap:8px; }
    .fg-spinner { width:32px; height:32px; border:3px solid #e0e0e5; border-top-color:#000; border-radius:50%; animation:fgspin .8s linear infinite; }
    .fg-alert { border-radius:10px; padding:12px 16px; font-size:13px; font-weight:500; margin-bottom:16px; }
    .fg-alert-err { background:#fff2f2; border:1px solid #ffcdd2; color:#c62828; }
    .fg-card { background:#fff; border:1px solid #e0e0e5; border-radius:16px; overflow:hidden; }
    .fg-card-footer { padding:10px 20px; border-top:1px solid #f0f0f0; font-size:12px; color:#aeaeb2; }
    .fg-table-wrap { overflow-x:auto; }
    .fg-table { width:100%; border-collapse:collapse; }
    .fg-table th { text-align:left; font-size:11px; font-weight:600; color:#6e6e73; text-transform:uppercase; letter-spacing:.06em; padding:12px 16px; background:#fafafa; border-bottom:1px solid #e8e8e8; }
    .fg-table td { padding:12px 16px; border-bottom:1px solid #f5f5f7; vertical-align:middle; }
    .fg-table tbody tr:last-child td { border-bottom:none; }
    .fg-table tbody tr:hover { background:#fafafa; }
    .fg-id { font-size:11px; font-weight:600; color:#c0c0c5; }
    .fg-team-cell { display:flex; align-items:center; gap:10px; }
    .fg-team-av { width:32px; height:32px; border-radius:8px; background:#1d1d1f; color:#fff; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
    .fg-team-name { font-weight:600; font-size:13px; }
    .fg-sport-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
    .fg-sport-football  { background:#f1f8e9; color:#2e7d32; }
    .fg-sport-basketball { background:#fff3e0; color:#e65100; }
    .fg-sport-tennis     { background:#e8f0fe; color:#1565c0; }
    .fg-badge { background:#f0f0f5; color:#1d1d1f; font-size:12px; font-weight:700; padding:3px 10px; border-radius:20px; }
    .fg-status-pending  { background:#fffde7; color:#f57f17;  font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; white-space:nowrap; }
    .fg-status-resolved { background:#f1f8e9; color:#2e7d32;  font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; white-space:nowrap; }
    .fg-captain-chip    { background:#fff8e1; color:#f57f17;  font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; white-space:nowrap; }
    .fg-goal-chips      { display:flex; flex-wrap:wrap; gap:4px; }
    .fg-goal-chip       { background:#e8f5e9; color:#2e7d32;  font-size:11px; font-weight:600; padding:2px 8px; border-radius:20px; white-space:nowrap; }
    .fg-tab             { padding:5px 12px; border:1px solid #e0e0e5; border-radius:8px; background:white; font-size:12px; font-weight:600; color:#6e6e73; cursor:pointer; }
    .fg-tab:hover       { background:#f5f5f7; }
    .fg-tab.fg-tab-active { background:#1d1d1f; color:white; border-color:#1d1d1f; }
    .mr-label  { font-size:11px; font-weight:700; color:#6e6e73; text-transform:uppercase; margin-bottom:4px; }
    .mr-select { padding:8px 12px; border:1.5px solid #e0e0e5; border-radius:8px; font-size:13px; outline:none; background:white; }
    .mr-input  { padding:8px 10px; border:1.5px solid #e0e0e5; border-radius:8px; font-size:13px; outline:none; }
    .mr-stat   { width:60px; padding:5px 8px; border:1.5px solid #e0e0e5; border-radius:6px; font-size:13px; text-align:center; outline:none; }
    .mr-stat:focus, .mr-select:focus, .mr-input:focus { border-color:#1d1d1f; }
    .fg-del-btn { padding:5px 12px; border:1px solid #e0e0e5; border-radius:8px; font-size:12px; cursor:pointer; background:#fff; transition:all .15s; }
    .fg-del-btn:hover:not(:disabled) { background:#fff2f2; border-color:#ffcdd2; color:#c62828; }
    .fg-del-btn:disabled { opacity:.4; cursor:not-allowed; }
    .fg-resolve-btn { padding:6px 14px; background:#1d4ed8; color:#fff; border:none; border-radius:8px; font-size:12px; font-weight:600; cursor:pointer; transition:background .15s; white-space:nowrap; }
    .fg-resolve-btn:hover:not(:disabled) { background:#1e40af; }
    .fg-resolve-btn:disabled { opacity:.4; cursor:not-allowed; }

    /* ── Leaderboard ── */
    .lb-gold   { background:linear-gradient(90deg,#fffde7 0%,#fff 100%); }
    .lb-silver { background:linear-gradient(90deg,#f5f5f5 0%,#fff 100%); }
    .lb-bronze { background:linear-gradient(90deg,#fff3e0 0%,#fff 100%); }
    .lb-pts { background:#f0f0f5; color:#1d1d1f; font-size:12px; font-weight:700; padding:4px 12px; border-radius:20px; }
    .lb-pts-top { background:#1d1d1f; color:#fff; }

    .fg-toast { position:fixed; bottom:28px; right:28px; display:flex; align-items:center; gap:8px; padding:12px 20px; border-radius:12px; font-size:13px; font-weight:600; z-index:9999; box-shadow:0 4px 20px rgba(0,0,0,.15); animation:fgslide .25s ease; }
    @keyframes fgslide { from { transform:translateY(12px); opacity:0; } to { transform:translateY(0); opacity:1; } }
    .fg-toast.ok { background:#1d1d1f; color:#fff; }
    .fg-toast.err { background:#c62828; color:#fff; }
  `]
})
export class BackofficeFantasyComponent implements OnInit {
  teams: VirtualTeamResponse[] = [];
  allPred: PredictionResponse[] = [];
  loadingTeams = true;
  loadingPred  = true;
  errorTeams: string | null = null;
  errorPred:  string | null = null;
  resolvingId: number | null = null;
  deletingId:  number | null = null;
  toast: string | null = null;
  toastType: 'ok' | 'err' = 'ok';
  predTab: 'all' | 'pending' | 'resolved' = 'pending';

  // Stats
  stats: FantasyStats | null = null;
  loadingStats = true;

  // Leaderboard
  leaderboard: LeaderboardEntry[] = [];
  loadingLeaderboard = true;

  get pending():      PredictionResponse[] { return this.allPred.filter(p => p.status === 'PENDING');  }
  get resolvedPred(): PredictionResponse[] { return this.allPred.filter(p => p.status === 'RESOLVED'); }
  get resolvedCount(): number              { return this.resolvedPred.length; }
  get visiblePred():  PredictionResponse[] {
    if (this.predTab === 'pending')  return this.pending;
    if (this.predTab === 'resolved') return this.resolvedPred;
    return this.allPred;
  }

  captainOf(p: PredictionResponse) {
    return p.playerPredictions?.find(pp => pp.isCaptain) ?? null;
  }
  goalPredictors(p: PredictionResponse) {
    return p.playerPredictions?.filter(pp => pp.predictGoal) ?? [];
  }

  rankColor(rank: number): string {
    if (rank === 1) return '#f59e0b';
    if (rank === 2) return '#9ca3af';
    if (rank === 3) return '#cd7c2e';
    return '#1d1d1f';
  }

  // ── Match Results ─────────────────────────────────────────────────────────
  mrSport = 'FOOTBALL';
  mrWeek  = (() => { const d = new Date(); const j = new Date(Date.UTC(d.getFullYear(),0,1)); return Math.ceil((((d.getTime()-j.getTime())/86400000)+j.getUTCDay()+1)/7); })();
  mrYear  = new Date().getFullYear();
  mrPlayers:    any[] = [];
  mrStats:      Record<number, { goals: number; yellow: number; red: number; bpts: number; win: boolean }> = {};
  mrLoadingPlayers = false;
  mrSubmitting  = false;
  mrResultMsg   = '';
  mrResultOk    = false;
  mrLoaded      = false;

  constructor(
    private teamSvc: VirtualTeamService,
    private predSvc: PredictionService,
    private http:    HttpClient,
    private auth:    AuthService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loadingTeams = true; this.errorTeams = null;
    this.teamSvc.getAllTeams().subscribe({
      next: d => { this.teams = d; this.loadingTeams = false; },
      error: e => { this.errorTeams = e?.error?.message || 'Failed to load teams.'; this.loadingTeams = false; }
    });

    this.loadingPred = true; this.errorPred = null;
    this.predSvc.getAllPredictions().subscribe({
      next: d => { this.allPred = d; this.loadingPred = false; },
      error: e => { this.errorPred = e?.error?.message || 'Failed to load predictions.'; this.loadingPred = false; }
    });

    this.loadStats();
    this.loadLeaderboard();
  }

  private loadStats(): void {
    this.loadingStats = true;
    const token = this.auth.getToken() || localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<FantasyStats>(`${environment.baseUrl}/predictions/admin/stats`, { headers }).subscribe({
      next: s => { this.stats = s; this.loadingStats = false; },
      error: () => { this.loadingStats = false; }
    });
  }

  private loadLeaderboard(): void {
    this.loadingLeaderboard = true;
    const token = this.auth.getToken() || localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<LeaderboardEntry[]>(`${environment.baseUrl}/predictions/admin/leaderboard`, { headers }).subscribe({
      next: d => { this.leaderboard = d; this.loadingLeaderboard = false; },
      error: () => { this.loadingLeaderboard = false; }
    });
  }

  totalPoints(): number { return this.teams.reduce((s, t) => s + (t.earnedPoints || 0), 0); }

  sportIcon(sport: string): string {
    return { FOOTBALL: '⚽', BASKETBALL: '🏀', TENNIS: '🎾' }[sport] || '🏆';
  }

  resolve(p: PredictionResponse): void {
    this.resolvingId = p.id;
    this.predSvc.resolvePrediction(p.id).subscribe({
      next: resolved => {
        this.allPred = this.allPred.map(x => x.id === p.id ? resolved : x);
        this.resolvingId = null;
        this.showToast('Prediction resolved', 'ok');
        this.loadStats();
        this.loadLeaderboard();
      },
      error: e => { this.resolvingId = null; this.showToast(e?.error?.message || 'Failed to resolve', 'err'); }
    });
  }

  deleteTeam(t: VirtualTeamResponse): void {
    if (!confirm(`Delete virtual team "${t.name || '#' + t.id}"?`)) return;
    this.deletingId = t.id;
    this.teamSvc.deleteTeam(t.id).subscribe({
      next: () => { this.teams = this.teams.filter(x => x.id !== t.id); this.deletingId = null; this.showToast('Team deleted', 'ok'); },
      error: e => { this.deletingId = null; this.showToast(e?.error?.message || 'Failed to delete', 'err'); }
    });
  }

  mrLoadPlayers(): void {
    this.mrLoadingPlayers = true;
    this.mrLoaded = false;
    this.mrPlayers = [];
    this.mrStats = {};
    const token = this.auth.getToken() || localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get<any[]>(`${environment.baseUrl}/api/teams/players`, { headers }).subscribe({
      next: players => {
        const sport = this.mrSport;
        this.mrPlayers = players.filter(p => !p.sportType || p.sportType === sport);
        for (const p of this.mrPlayers) {
          this.mrStats[p.id] = { goals: 0, yellow: 0, red: 0, bpts: 0, win: false };
        }
        this.mrLoadingPlayers = false;
        this.mrLoaded = true;
      },
      error: () => { this.mrLoadingPlayers = false; this.mrLoaded = true; }
    });
  }

  submitMatchResult(): void {
    if (!this.mrPlayers.length) return;
    this.mrSubmitting = true;
    this.mrResultMsg  = '';
    const token = this.auth.getToken() || localStorage.getItem('token') || '';
    const headers = { Authorization: `Bearer ${token}` };
    const payload = {
      weekNumber: this.mrWeek,
      weekYear:   this.mrYear,
      playerStats: this.mrPlayers
        .filter(p => {
          const s = this.mrStats[p.id];
          return s && (s.goals > 0 || s.yellow > 0 || s.red > 0 || s.bpts > 0 || s.win);
        })
        .map(p => ({
          playerId:         p.id,
          playerName:       p.fullName || p.username || p.email,
          sportType:        this.mrSport,
          goalsScored:      this.mrStats[p.id]?.goals   ?? 0,
          yellowCards:      this.mrStats[p.id]?.yellow  ?? 0,
          redCards:         this.mrStats[p.id]?.red     ?? 0,
          basketballPoints: this.mrStats[p.id]?.bpts    ?? 0,
          tennisWin:        this.mrStats[p.id]?.win     ?? false,
        }))
    };
    this.http.post<any>(`${environment.baseUrl}/matches/results`, payload, { headers }).subscribe({
      next: res => {
        this.mrSubmitting = false;
        this.mrResultOk   = true;
        this.mrResultMsg  = `✅ Week ${res.weekNumber}: ${res.statsRecorded} stats saved, ${res.predictionsResolved} predictions resolved`;
        this.showToast('Match results submitted!', 'ok');
        this.load();
      },
      error: () => {
        this.mrSubmitting = false;
        this.mrResultOk   = false;
        this.mrResultMsg  = '❌ Submission failed.';
      }
    });
  }

  private showToast(msg: string, type: 'ok' | 'err'): void {
    this.toast = msg; this.toastType = type;
    setTimeout(() => this.toast = null, 3500);
  }
}
