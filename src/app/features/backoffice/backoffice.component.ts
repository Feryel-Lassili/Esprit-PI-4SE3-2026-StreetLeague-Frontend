import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

interface WalletAdmin {
  id: number;
  points: number;
  userId: number;
  username: string;
  email: string;
  role: string;
  phone: string;
}

@Component({
  selector: 'app-backoffice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .layout { display: flex; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f7; }
    .sidebar { width: 240px; background: white; border-right: 1px solid #e0e0e5; display: flex; flex-direction: column; transition: width 0.2s; overflow: hidden; }
    .sidebar.collapsed { width: 60px; }
    .sidebar-header { padding: 16px; border-bottom: 1px solid #e0e0e5; display: flex; align-items: center; gap: 10px; min-height: 60px; }
    .logo-box { min-width: 28px; width: 28px; height: 28px; background: #000; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
    .logo-box span { color: white; font-weight: 700; font-size: 13px; }
    .logo-text { font-size: 14px; font-weight: 600; color: #1d1d1f; white-space: nowrap; overflow: hidden; }
    .toggle-btn { margin-left: auto; background: none; border: none; cursor: pointer; color: #6e6e73; font-size: 16px; padding: 4px; min-width: 24px; }
    .nav { flex: 1; padding: 8px; overflow-y: auto; overflow-x: hidden; }
    .nav-section { font-size: 10px; font-weight: 600; color: #aeaeb2; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 8px 4px; white-space: nowrap; overflow: hidden; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; cursor: pointer; border: none; background: none; width: 100%; text-align: left; transition: background 0.15s; }
    .nav-item:hover { background: #f5f5f7; }
    .nav-item.active { background: #000; }
    .nav-item.active .nav-label { color: white; }
    .nav-icon { font-size: 15px; min-width: 20px; text-align: center; }
    .nav-label { font-size: 13px; color: #1d1d1f; white-space: nowrap; overflow: hidden; }
    .sidebar-footer { padding: 12px 8px; border-top: 1px solid #e0e0e5; }
    .user-info { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; }
    .avatar { min-width: 28px; width: 28px; height: 28px; border-radius: 50%; background: #e8f0fe; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #185fa5; }
    .user-details { overflow: hidden; }
    .user-name { font-size: 12px; font-weight: 500; color: #1d1d1f; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { font-size: 11px; color: #6e6e73; }
    .logout-btn { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; cursor: pointer; border: none; background: none; width: 100%; color: #c62828; font-size: 13px; transition: background 0.15s; }
    .logout-btn:hover { background: #fff2f2; }
    .switch-btn { background: none; border: 1px solid #e0e0e5; border-radius: 8px; padding: 6px 12px; font-size: 12px; color: #6e6e73; cursor: pointer; display: flex; align-items: center; gap: 6px; margin: 4px 0; width: 100%; }
    .switch-btn:hover { background: #f5f5f7; }
    .main { flex: 1; overflow: auto; }
    .topbar { height: 60px; background: white; border-bottom: 1px solid #e0e0e5; display: flex; align-items: center; padding: 0 24px; gap: 12px; position: sticky; top: 0; z-index: 10; }
    .page-title { font-size: 16px; font-weight: 600; color: #1d1d1f; }
    .badge-danger { background: #fff2f2; color: #c62828; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
    .content { padding: 24px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .card { background: white; border-radius: 12px; border: 1px solid #e0e0e5; padding: 20px; }
    .stat-label { font-size: 12px; color: #6e6e73; margin-bottom: 6px; }
    .stat-value { font-size: 24px; font-weight: 600; color: #1d1d1f; }
    .stat-change { font-size: 12px; margin-top: 4px; }
    .up { color: #2e7d32; } .down { color: #c62828; }
    .card-title { font-size: 15px; font-weight: 600; color: #1d1d1f; margin-bottom: 16px; }
    .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 120px; }
    .bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; justify-content: flex-end; }
    .bar { width: 100%; background: #000; border-radius: 4px 4px 0 0; transition: opacity 0.2s; }
    .bar:hover { opacity: 0.7; }
    .bar-label { font-size: 10px; color: #6e6e73; }
    .progress-item { margin-bottom: 12px; }
    .progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .progress-name { font-size: 13px; color: #1d1d1f; }
    .progress-count { font-size: 12px; color: #6e6e73; }
    .progress-bar { height: 4px; background: #f5f5f7; border-radius: 2px; }
    .progress-fill { height: 100%; background: #000; border-radius: 2px; }
    .activity-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f5f5f7; }
    .activity-item:last-child { border-bottom: none; }
    .activity-left { display: flex; align-items: center; gap: 10px; }
    .activity-avatar { width: 32px; height: 32px; border-radius: 50%; background: #f5f5f7; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #1d1d1f; }
    .activity-name { font-size: 13px; font-weight: 500; color: #1d1d1f; }
    .activity-action { font-size: 12px; color: #6e6e73; }
    .activity-time { font-size: 12px; color: #aeaeb2; }
    .table { width: 100%; border-collapse: collapse; }
    .table th { text-align: left; font-size: 11px; font-weight: 600; color: #6e6e73; text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 12px; border-bottom: 1px solid #e0e0e5; }
    .table td { padding: 12px; font-size: 13px; color: #1d1d1f; border-bottom: 1px solid #f5f5f7; }
    .pill { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .pill-green  { background: #f1f8e9; color: #2e7d32; }
    .pill-yellow { background: #fffde7; color: #f57f17; }
    .pill-blue   { background: #e8f0fe; color: #185fa5; }
    .pill-red    { background: #fff2f2; color: #c62828; }
    .pill-purple { background: #ede9fe; color: #7c3aed; }
    .pill-gray   { background: #f5f5f7; color: #6e6e73; }
    .action-btn { background: none; border: 1px solid #e0e0e5; border-radius: 6px; padding: 4px 10px; font-size: 12px; color: #1d1d1f; cursor: pointer; margin-right: 4px; }
    .action-btn:hover { background: #f5f5f7; }
    .coming-soon { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; color: #6e6e73; }

    /* ── Wallet admin styles ── */
    .w-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .w-page-sub { font-size: 13px; color: #6e6e73; margin: 4px 0 0; }
    .export-btn { background: #000; color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .2s; }
    .export-btn:hover { background: #333; }
    .kpi-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
    .kpi-card { background: white; border: 1px solid #e0e0e5; border-radius: 12px; padding: 18px; position: relative; }
    .kpi-trend { font-size: 11px; font-weight: 600; position: absolute; top: 14px; right: 14px; }
    .kpi-trend.green { color: #2e7d32; } .kpi-trend.red { color: #c62828; }
    .kpi-value { font-size: 28px; font-weight: 700; letter-spacing: -1px; margin: 20px 0 4px; color: #1d1d1f; }
    .kpi-label { font-size: 12px; color: #6e6e73; }
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
    .chart-card { background: white; border: 1px solid #e0e0e5; border-radius: 12px; padding: 18px; }
    .chart-title { font-size: 13px; font-weight: 600; margin: 0 0 16px; color: #1d1d1f; }
    .w-bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 140px; }
    .w-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; }
    .w-bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
    .w-bar { width: 100%; background: #000; border-radius: 4px 4px 0 0; min-height: 4px; transition: opacity .2s; }
    .w-bar:hover { opacity: .7; }
    .w-bar-label { font-size: 10px; color: #aeaeb2; }
    .dist-list { display: flex; flex-direction: column; gap: 12px; }
    .dist-top { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .dist-label { font-size: 12px; font-weight: 500; color: #1d1d1f; }
    .dist-count { font-size: 12px; font-weight: 700; color: #1d1d1f; }
    .dist-bar-bg { height: 4px; background: #f5f5f7; border-radius: 99px; overflow: hidden; }
    .dist-bar { height: 100%; border-radius: 99px; transition: width .5s; }
    .dist-bar--black  { background: #000; }
    .dist-bar--gray   { background: #6e6e73; }
    .dist-bar--light  { background: #aeaeb2; }
    .dist-bar--red    { background: #c62828; }
    .table-card { background: white; border: 1px solid #e0e0e5; border-radius: 12px; overflow: hidden; }
    .table-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid #f5f5f7; gap: 12px; flex-wrap: wrap; }
    .w-search-wrap { display: flex; align-items: center; gap: 8px; background: #f5f5f7; border: 1px solid #e0e0e5; border-radius: 10px; padding: 8px 12px; flex: 1; min-width: 180px; }
    .w-search-input { border: none; background: transparent; outline: none; font-size: 13px; color: #1d1d1f; width: 100%; }
    .toolbar-right { display: flex; gap: 8px; }
    .filter-select { border: 1px solid #e0e0e5; border-radius: 8px; padding: 7px 12px; font-size: 12px; color: #1d1d1f; background: white; outline: none; cursor: pointer; }
    .table-wrap { overflow-x: auto; }
    .w-table { width: 100%; border-collapse: collapse; }
    .w-table th { text-align: left; font-size: 11px; font-weight: 600; color: #6e6e73; text-transform: uppercase; letter-spacing: .05em; padding: 10px 14px; border-bottom: 1px solid #e0e0e5; background: #f5f5f7; }
    .w-table td { padding: 12px 14px; font-size: 13px; color: #1d1d1f; border-bottom: 1px solid #f5f5f7; }
    .w-table tr:last-child td { border-bottom: none; }
    .w-table tr:hover td { background: #fafafa; }
    .loading-cell { text-align: center; color: #aeaeb2; padding: 32px; font-size: 13px; }
    .id-cell { color: #aeaeb2; font-size: 11px; font-weight: 600; }
    .user-cell { display: flex; align-items: center; gap: 10px; }
    .w-avatar { width: 32px; height: 32px; border-radius: 50%; background: #000; color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .w-user-info { display: flex; flex-direction: column; }
    .w-username { font-weight: 600; font-size: 13px; color: #1d1d1f; }
    .w-user-id { font-size: 11px; color: #aeaeb2; }
    .muted { color: #6e6e73; }
    .points-val { font-weight: 700; }
    .points-val.green { color: #2e7d32; }
    .status-active { background: #f1f8e9; color: #2e7d32; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .status-empty  { background: #f5f5f7; color: #aeaeb2; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .action-btns { display: flex; gap: 6px; }
    .act-btn { width: 30px; height: 30px; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; transition: opacity .2s; }
    .act-btn:hover { opacity: .75; }
    .act-btn--edit   { background: #e8f0fe; }
    .act-btn--delete { background: #fff2f2; }
    .table-footer { padding: 10px 18px; font-size: 12px; color: #aeaeb2; border-top: 1px solid #f5f5f7; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; border-radius: 16px; padding: 24px; width: 420px; max-width: 90vw; }
    .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .modal-header h3 { font-size: 15px; font-weight: 600; margin: 0; color: #1d1d1f; }
    .modal-close { background: #f5f5f7; border: none; border-radius: 6px; width: 28px; height: 28px; cursor: pointer; font-size: 13px; }
    .modal-info-grid { background: #f5f5f7; border-radius: 10px; padding: 14px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px; }
    .modal-info-row { display: flex; align-items: center; justify-content: space-between; }
    .modal-info-label { font-size: 11px; color: #aeaeb2; font-weight: 500; }
    .modal-info-val { font-size: 13px; font-weight: 600; color: #1d1d1f; }
    .current-pts { font-size: 20px; font-weight: 700; color: #000; }
    .modal-field label { font-size: 11px; font-weight: 600; color: #6e6e73; text-transform: uppercase; letter-spacing: .05em; display: block; margin-bottom: 6px; }
    .modal-input { width: 100%; border: 1.5px solid #e0e0e5; border-radius: 10px; padding: 10px 14px; font-size: 14px; outline: none; background: #fafafa; color: #1d1d1f; }
    .modal-input:focus { border-color: #000; background: white; }
    .modal-footer { display: flex; gap: 10px; margin-top: 20px; }
    .btn-primary { background: #000; color: #fff; border: none; border-radius: 10px; padding: 11px 22px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .2s; }
    .btn-primary:hover:not(:disabled) { background: #333; }
    .btn-primary:disabled { opacity: .4; cursor: not-allowed; }
    .btn-ghost { background: transparent; color: #6e6e73; border: 1px solid #e0e0e5; border-radius: 10px; padding: 11px 18px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-ghost:hover { background: #f5f5f7; }
    .w-alert { padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 500; margin-bottom: 14px; }
    .w-alert-error { background: #fff2f2; border: 1px solid #ffcdd2; color: #c62828; }
    .w-alert-ok    { background: #f1f8e9; border: 1px solid #c5e1a5; color: #2e7d32; }
  `],
  template: `
    <div class="layout">

      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="!sidebarOpen">
        <div class="sidebar-header">
          <div class="logo-box"><span>S</span></div>
          <span class="logo-text" *ngIf="sidebarOpen">
            {{ userRole === 'admin' ? 'Admin Panel' : 'Venue Allocator' }}
          </span>
          <button class="toggle-btn" (click)="sidebarOpen = !sidebarOpen">☰</button>
        </div>

        <nav class="nav">
          <div *ngFor="let section of getCurrentMenu()">
            <div class="nav-section" *ngIf="sidebarOpen">{{ section.section }}</div>
            <button class="nav-item" *ngFor="let item of section.items"
              [class.active]="currentScreen === item.id"
              (click)="currentScreen = item.id">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label" *ngIf="sidebarOpen">{{ item.label }}</span>
            </button>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info" *ngIf="sidebarOpen">
            <div class="avatar">A</div>
            <div class="user-details">
              <div class="user-name">Administrator</div>
              <div class="user-role">{{ userRole }}</div>
            </div>
          </div>
          <button class="switch-btn" *ngIf="userRole === 'admin'" (click)="switchRole()">
            <span>🔄</span><span *ngIf="sidebarOpen">Switch to Allocator</span>
          </button>
          <button class="switch-btn" *ngIf="userRole === 'venue-allocator'" (click)="switchRole()">
            <span>🔄</span><span *ngIf="sidebarOpen">Switch to Admin</span>
          </button>
          <button class="logout-btn" (click)="authService.logout()">
            <span>🚪</span><span *ngIf="sidebarOpen">Sign Out</span>
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="main">
        <div class="topbar">
          <span class="page-title">{{ getTitle() }}</span>
          <span class="badge-danger" *ngIf="currentScreen === 'community'">7 reports</span>
        </div>

        <div class="content">

          <!-- DASHBOARD -->
          <div *ngIf="currentScreen === 'dashboard'">
            <div class="grid-4">
              <div class="card" *ngFor="let kpi of kpis">
                <div class="stat-label">{{ kpi.label }}</div>
                <div class="stat-value">{{ kpi.value }}</div>
                <div class="stat-change" [class.up]="kpi.trend === 'up'" [class.down]="kpi.trend === 'down'">
                  {{ kpi.trend === 'up' ? '▲' : '▼' }} {{ kpi.change }}
                </div>
              </div>
            </div>
            <div class="grid-2">
              <div class="card">
                <div class="card-title">Bookings this week</div>
                <div class="bar-chart">
                  <div class="bar-wrap" *ngFor="let day of bookingsData">
                    <div class="bar" [style.height.%]="day.value"></div>
                    <div class="bar-label">{{ day.label }}</div>
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="card-title">Top sports</div>
                <div class="progress-item" *ngFor="let sport of topSports">
                  <div class="progress-header">
                    <span class="progress-name">{{ sport.icon }} {{ sport.sport }}</span>
                    <span class="progress-count">{{ sport.bookings }}</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="sport.bookings / 12.45"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card-title">Recent activity</div>
              <div class="activity-item" *ngFor="let a of recentActivities">
                <div class="activity-left">
                  <div class="activity-avatar">{{ a.user[0] }}</div>
                  <div>
                    <div class="activity-name">{{ a.user }}</div>
                    <div class="activity-action">{{ a.action }}</div>
                  </div>
                </div>
                <div class="activity-time">{{ a.time }}</div>
              </div>
            </div>
          </div>

          <!-- VENUES -->
          <div *ngIf="currentScreen === 'venues'">
            <div class="grid-3">
              <div class="card" *ngFor="let v of venues">
                <div style="font-size:15px; font-weight:600; margin-bottom:4px;">{{ v.name }}</div>
                <div style="font-size:12px; color:#6e6e73; margin-bottom:12px;">📍 {{ v.location }}</div>
                <div style="display:flex; gap:6px; margin-bottom:12px; flex-wrap:wrap;">
                  <span class="pill pill-blue" *ngFor="let s of v.sports">{{ s }}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                  <span style="font-size:13px; font-weight:600;">{{ v.pricePerHour }} TND/hr</span>
                  <span class="pill pill-green">{{ v.status }}</span>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="action-btn" style="flex:1;">Edit</button>
                  <button class="action-btn" style="flex:1;">View</button>
                </div>
              </div>
            </div>
          </div>

          <!-- USERS -->
          <div *ngIf="currentScreen === 'users'">
            <div class="card">
              <table class="table">
                <thead>
                  <tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let u of users">
                    <td>
                      <div style="font-weight:500;">{{ u.name }}</div>
                      <div style="font-size:12px; color:#6e6e73;">{{ u.email }}</div>
                    </td>
                    <td><span class="pill pill-blue">{{ u.role }}</span></td>
                    <td><span class="pill" [class.pill-green]="u.status==='Active'" [class.pill-yellow]="u.status==='Pending'">{{ u.status }}</span></td>
                    <td style="color:#6e6e73;">{{ u.joined }}</td>
                    <td>
                      <button class="action-btn">View</button>
                      <button class="action-btn">Ban</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- COMMUNITY -->
          <div *ngIf="currentScreen === 'community'">
            <div class="card">
              <div class="card-title">AI-flagged reports</div>
              <div class="activity-item" *ngFor="let r of communityReports">
                <div class="activity-left">
                  <div class="activity-avatar" style="background:#fff2f2; color:#c62828;">⚠</div>
                  <div>
                    <div class="activity-name">{{ r.user }} — {{ r.type }}</div>
                    <div class="activity-action">"{{ r.content }}"</div>
                  </div>
                </div>
                <div style="display:flex; gap:6px; align-items:center;">
                  <span class="pill pill-red" style="font-size:10px;">{{ r.severity }}</span>
                  <button class="action-btn">Review</button>
                  <button class="action-btn">Dismiss</button>
                </div>
              </div>
            </div>
          </div>

          <!-- SHOP -->
          <div *ngIf="currentScreen === 'shop'">
            <div class="card">
              <table class="table">
                <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                <tbody>
                  <tr *ngFor="let p of products">
                    <td style="font-weight:500;">{{ p.name }}</td>
                    <td><span class="pill pill-blue">{{ p.category }}</span></td>
                    <td>{{ p.price }} TND</td>
                    <td><span class="pill" [class.pill-green]="p.stock > 10" [class.pill-yellow]="p.stock <= 10 && p.stock > 0" [class.pill-red]="p.stock === 0">{{ p.stock }} left</span></td>
                    <td>
                      <button class="action-btn">Edit</button>
                      <button class="action-btn">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- HEALTH -->
          <div *ngIf="currentScreen === 'health'">
            <div class="grid-2">
              <div class="card">
                <div class="card-title">Health professionals</div>
                <div class="activity-item" *ngFor="let h of healthPros">
                  <div class="activity-left">
                    <div class="activity-avatar">{{ h.name[0] }}</div>
                    <div>
                      <div class="activity-name">{{ h.name }}</div>
                      <div class="activity-action">{{ h.specialty }}</div>
                    </div>
                  </div>
                  <span class="pill pill-green">{{ h.status }}</span>
                </div>
              </div>
              <div class="card">
                <div class="card-title">Pending certifications</div>
                <div class="activity-item" *ngFor="let c of pendingCerts">
                  <div class="activity-left">
                    <div class="activity-avatar" style="background:#fffde7; color:#f57f17;">📋</div>
                    <div>
                      <div class="activity-name">{{ c.name }}</div>
                      <div class="activity-action">{{ c.cert }}</div>
                    </div>
                  </div>
                  <div style="display:flex; gap:4px;">
                    <button class="action-btn">✓</button>
                    <button class="action-btn">✕</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- FANTASY -->
          <div *ngIf="currentScreen === 'fantasy'">
            <div class="grid-4" style="margin-bottom:24px;">
              <div class="card" *ngFor="let s of fantasyStats">
                <div class="stat-label">{{ s.label }}</div>
                <div class="stat-value">{{ s.value }}</div>
              </div>
            </div>
            <div class="card">
              <div class="card-title">Active leagues</div>
              <table class="table">
                <thead><tr><th>League</th><th>Players</th><th>Prize</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  <tr *ngFor="let l of fantasyLeagues">
                    <td style="font-weight:500;">{{ l.name }}</td>
                    <td>{{ l.players }}</td>
                    <td>{{ l.prize }} TND</td>
                    <td><span class="pill" [class.pill-green]="l.status==='Active'" [class.pill-yellow]="l.status==='Upcoming'">{{ l.status }}</span></td>
                    <td><button class="action-btn">Manage</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- SPONSORS -->
          <div *ngIf="currentScreen === 'sponsorships'">
            <div class="card">
              <table class="table">
                <thead><tr><th>Company</th><th>Budget</th><th>Status</th><th>Contact</th><th>Actions</th></tr></thead>
                <tbody>
                  <tr *ngFor="let s of sponsors">
                    <td style="font-weight:500;">{{ s.company }}</td>
                    <td>{{ s.budget }} TND</td>
                    <td><span class="pill" [class.pill-green]="s.status==='Active'" [class.pill-yellow]="s.status==='Pending'" [class.pill-red]="s.status==='Rejected'">{{ s.status }}</span></td>
                    <td style="color:#6e6e73; font-size:12px;">{{ s.contact }}</td>
                    <td><button class="action-btn">Review</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- VENUE ALLOCATOR -->
          <div *ngIf="userRole === 'venue-allocator' && currentScreen === 'allocator'">
            <div class="grid-3" style="margin-bottom:24px;">
              <div class="card"><div class="stat-label">Today's bookings</div><div class="stat-value">12</div></div>
              <div class="card"><div class="stat-label">Today's revenue</div><div class="stat-value">1,240 TND</div></div>
              <div class="card"><div class="stat-label">Active venues</div><div class="stat-value">5</div></div>
            </div>
            <div class="card">
              <div class="card-title">Reservations</div>
              <table class="table">
                <thead><tr><th>ID</th><th>Venue</th><th>Customer</th><th>Date</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  <tr *ngFor="let r of reservations">
                    <td style="color:#6e6e73;">{{ r.id }}</td>
                    <td>{{ r.venueName }}</td>
                    <td>{{ r.customerName }}</td>
                    <td style="color:#6e6e73;">{{ r.date }}</td>
                    <td style="font-weight:500;">{{ r.totalPrice }} TND</td>
                    <td><span class="pill" [class.pill-green]="r.status==='Confirmed'" [class.pill-yellow]="r.status==='Pending'">{{ r.status }}</span></td>
                    <td>
                      <button class="action-btn" *ngIf="r.status==='Pending'">✓</button>
                      <button class="action-btn" *ngIf="r.status==='Pending'">✕</button>
                      <button class="action-btn">View</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ══════════════════════════════
               WALLET ADMIN
          ══════════════════════════════ -->
          <div *ngIf="currentScreen === 'wallet'">

            <div class="w-page-header">
              <div>
                <div class="card-title" style="font-size:18px; margin:0;">💳 Payments &amp; Wallet</div>
                <p class="w-page-sub">Monitor transactions and manage user wallets</p>
              </div>
              <button class="export-btn" (click)="exportWallets()">⬇ Export CSV</button>
            </div>

            <div *ngIf="walletError"   class="w-alert w-alert-error">⚠ {{ walletError }}</div>
            <div *ngIf="walletSuccess" class="w-alert w-alert-ok">✓ {{ walletSuccess }}</div>

            <!-- KPIs -->
            <div class="kpi-row">
              <div class="kpi-card">
                <div class="kpi-trend green">📈 +18.2%</div>
                <div class="kpi-value">{{ totalPoints.toLocaleString() }}</div>
                <div class="kpi-label">Total Points in System</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-trend green">📈 +12.5%</div>
                <div class="kpi-value">{{ wallets.length }}</div>
                <div class="kpi-label">Active Wallets</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-trend green">📈 +5.3%</div>
                <div class="kpi-value">{{ activeWalletCount }}</div>
                <div class="kpi-label">Active Balances</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-trend red">📉 -8.1%</div>
                <div class="kpi-value">{{ zeroBalanceCount }}</div>
                <div class="kpi-label">Zero Balance Wallets</div>
              </div>
            </div>

            <!-- Charts -->
            <div class="charts-row">
              <div class="chart-card">
                <div class="chart-title">Points Overview (Last 7 Days)</div>
                <div class="w-bar-chart">
                  <div *ngFor="let d of walletChartData" class="w-bar-col">
                    <div class="w-bar-wrap">
                      <div class="w-bar" [style.height.%]="d.pct"></div>
                    </div>
                    <span class="w-bar-label">{{ d.label }}</span>
                  </div>
                </div>
              </div>
              <div class="chart-card">
                <div class="chart-title">Points Distribution</div>
                <div class="dist-list">
                  <div *ngFor="let d of walletDistribution" class="dist-row">
                    <div class="dist-top">
                      <span class="dist-label">{{ d.label }}</span>
                      <span class="dist-count">{{ d.count }}</span>
                    </div>
                    <div class="dist-bar-bg">
                      <div class="dist-bar" [class]="'dist-bar--'+d.color" [style.width.%]="d.pct"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Table -->
            <div class="table-card">
              <div class="table-toolbar">
                <div class="w-search-wrap">
                  <span>🔍</span>
                  <input class="w-search-input" [(ngModel)]="walletSearch"
                    placeholder="Search by name, email, ID…" />
                </div>
                <div class="toolbar-right">
                  <select class="filter-select" [(ngModel)]="walletRoleFilter">
                    <option value="ALL">All Roles</option>
                    <option value="PLAYER">Player</option>
                    <option value="COACH">Coach</option>
                    <option value="SPONSOR">Sponsor</option>
                    <option value="HEALTH_PROFESSIONAL">Health Pro</option>
                    <option value="REFEREE">Referee</option>
                    <option value="VENUE_OWNER">Venue Owner</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <select class="filter-select" [(ngModel)]="walletBalanceFilter">
                    <option value="ALL">All Balances</option>
                    <option value="HIGH">High (500+)</option>
                    <option value="MED">Medium (100–499)</option>
                    <option value="LOW">Low (1–99)</option>
                    <option value="ZERO">Empty (0)</option>
                  </select>
                </div>
              </div>

              <div class="table-wrap">
                <table class="w-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>User</th><th>Email</th><th>Phone</th>
                      <th>Role</th><th>Points</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngIf="walletLoading">
                      <td colspan="8" class="loading-cell">Loading wallets…</td>
                    </tr>
                    <tr *ngIf="!walletLoading && filteredWallets.length === 0">
                      <td colspan="8" class="loading-cell">No wallets found</td>
                    </tr>
                    <tr *ngFor="let w of filteredWallets">
                      <td class="id-cell">#{{ w.id }}</td>
                      <td>
                        <div class="user-cell">
                          <div class="w-avatar">{{ (w.username || '?')[0].toUpperCase() }}</div>
                          <div class="w-user-info">
                            <span class="w-username">{{ w.username || 'Unknown' }}</span>
                            <span class="w-user-id">ID: {{ w.userId }}</span>
                          </div>
                        </div>
                      </td>
                      <td class="muted">{{ w.email || '—' }}</td>
                      <td class="muted">{{ w.phone || '—' }}</td>
                      <td>
                        <span class="pill" [class]="roleClass(w.role)">{{ roleLabel(w.role) }}</span>
                      </td>
                      <td>
                        <span class="points-val" [class.green]="w.points > 0">{{ w.points }} pts</span>
                      </td>
                      <td>
                        <span [class]="w.points > 0 ? 'status-active' : 'status-empty'">
                          {{ w.points > 0 ? 'Active' : 'Empty' }}
                        </span>
                      </td>
                      <td>
                        <div class="action-btns">
                          <button class="act-btn act-btn--edit"   (click)="openEditWallet(w)" title="Edit">✏️</button>
                          <button class="act-btn act-btn--delete" (click)="deleteWallet(w.id)" title="Delete">🗑</button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="table-footer">
                Showing {{ filteredWallets.length }} of {{ wallets.length }} wallets
              </div>
            </div>

            <!-- Edit Modal -->
            <div *ngIf="editingWallet" class="modal-overlay" (click)="closeEditWallet()">
              <div class="modal" (click)="$event.stopPropagation()">
                <div class="modal-header">
                  <h3>Edit Wallet — {{ editingWallet.username }}</h3>
                  <button class="modal-close" (click)="closeEditWallet()">✕</button>
                </div>
                <div class="modal-info-grid">
                  <div class="modal-info-row">
                    <span class="modal-info-label">Email</span>
                    <span class="modal-info-val">{{ editingWallet.email }}</span>
                  </div>
                  <div class="modal-info-row">
                    <span class="modal-info-label">Role</span>
                    <span class="pill" [class]="roleClass(editingWallet.role)">{{ roleLabel(editingWallet.role) }}</span>
                  </div>
                  <div class="modal-info-row">
                    <span class="modal-info-label">Current Points</span>
                    <span class="current-pts">{{ editingWallet.points }} pts</span>
                  </div>
                </div>
                <div class="modal-field">
                  <label>New Points Value</label>
                  <input type="number" [(ngModel)]="newWalletPoints" class="modal-input"
                    min="0" placeholder="Enter new points value" />
                </div>
                <div class="modal-footer">
                  <button class="btn-primary" (click)="saveWalletPoints()" [disabled]="walletSaving">
                    {{ walletSaving ? 'Saving…' : 'Save Changes' }}
                  </button>
                  <button class="btn-ghost" (click)="closeEditWallet()">Cancel</button>
                </div>
              </div>
            </div>

          </div>
          <!-- END WALLET ADMIN -->

        </div>
      </main>
    </div>
  `
})
export class BackofficeComponent implements OnInit {
  sidebarOpen = true;
  userRole: 'admin' | 'venue-allocator' = 'admin';
  currentScreen = 'dashboard';

  // ── Wallet admin state ────────────────────────────────────
  wallets: WalletAdmin[] = [];
  walletLoading  = false;
  walletSaving   = false;
  walletError    = '';
  walletSuccess  = '';
  walletSearch   = '';
  walletRoleFilter    = 'ALL';
  walletBalanceFilter = 'ALL';
  editingWallet: WalletAdmin | null = null;
  newWalletPoints: number | null = null;

  private walletBase = `${environment.baseUrl}/wallet/admin`;

  walletChartData = [
    { label: 'Mon', pct: 65 }, { label: 'Tue', pct: 78 },
    { label: 'Wed', pct: 45 }, { label: 'Thu', pct: 89 },
    { label: 'Fri', pct: 92 }, { label: 'Sat', pct: 67 },
    { label: 'Sun', pct: 85 },
  ];

  // ── Menus ─────────────────────────────────────────────────
  adminMenu = [
    { section: 'Overview',    items: [{ id: 'dashboard', label: 'Dashboard', icon: '▣' }] },
    { section: 'Management',  items: [
        { id: 'users',    label: 'Users & Teams', icon: '👥' },
        { id: 'venues',   label: 'Venues',        icon: '📍' },
        { id: 'health',   label: 'Health',        icon: '🏥' },
        { id: 'shop',     label: 'Shop',          icon: '🛍️' },
        { id: 'wallet',   label: 'Wallet',        icon: '💳' },
    ]},
    { section: 'Features', items: [
        { id: 'fantasy',      label: 'Fantasy Game', icon: '🎮' },
        { id: 'community',    label: 'Community (AI)', icon: '💬' },
        { id: 'sponsorships', label: 'Sponsors',     icon: '💰' },
    ]}
  ];

  allocatorMenu = [
    { section: 'Overview', items: [
        { id: 'allocator', label: 'Dashboard', icon: '▣' },
        { id: 'venues',    label: 'My Venues', icon: '📍' },
    ]}
  ];

  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['role'] === 'venue-allocator') {
        this.userRole = 'venue-allocator';
        this.currentScreen = 'allocator';
      }
    });
  }

  // ── Navigation ────────────────────────────────────────────
  getCurrentMenu() { return this.userRole === 'admin' ? this.adminMenu : this.allocatorMenu; }

  getTitle(): string {
    const all = [...this.adminMenu, ...this.allocatorMenu].flatMap(s => s.items);
    return all.find(i => i.id === this.currentScreen)?.label || 'Dashboard';
  }

  switchRole() {
    this.userRole = this.userRole === 'admin' ? 'venue-allocator' : 'admin';
    this.currentScreen = this.userRole === 'admin' ? 'dashboard' : 'allocator';
  }

  // ── Wallet: load on screen change ─────────────────────────
  ngDoCheck() {
    if (this.currentScreen === 'wallet' && !this.walletLoading && this.wallets.length === 0) {
      this.loadWallets();
    }
  }

  loadWallets() {
    this.walletLoading = true;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
    this.http.get<WalletAdmin[]>(`${this.walletBase}/all`, { headers }).subscribe({
      next:  w  => { this.wallets = w; this.walletLoading = false; },
      error: () => { this.walletError = 'Failed to load wallets'; this.walletLoading = false; }
    });
  }

  // ── Wallet computed ───────────────────────────────────────
  get totalPoints(): number  { return this.wallets.reduce((s, w) => s + (w.points ?? 0), 0); }
  get activeWalletCount(): number { return this.wallets.filter(w => w.points > 0).length; }
  get zeroBalanceCount(): number  { return this.wallets.filter(w => w.points === 0).length; }

  get walletDistribution() {
    const total = this.wallets.length || 1;
    const high  = this.wallets.filter(w => w.points >= 500).length;
    const med   = this.wallets.filter(w => w.points >= 100 && w.points < 500).length;
    const low   = this.wallets.filter(w => w.points > 0 && w.points < 100).length;
    const zero  = this.wallets.filter(w => w.points === 0).length;
    return [
      { label: 'High (500+)',   count: high, pct: (high / total) * 100, color: 'black' },
      { label: 'Medium (100–499)', count: med, pct: (med  / total) * 100, color: 'gray'  },
      { label: 'Low (1–99)',    count: low,  pct: (low  / total) * 100, color: 'light' },
      { label: 'Empty (0 pts)',  count: zero, pct: (zero / total) * 100, color: 'red'   },
    ];
  }

  get filteredWallets(): WalletAdmin[] {
    return this.wallets.filter(w => {
      const q = this.walletSearch.toLowerCase();
      const matchSearch = !q
        || w.username?.toLowerCase().includes(q)
        || w.email?.toLowerCase().includes(q)
        || String(w.userId).includes(q)
        || String(w.id).includes(q);
      const matchRole    = this.walletRoleFilter === 'ALL' || w.role === this.walletRoleFilter;
      const matchBalance =
        this.walletBalanceFilter === 'ALL'  ? true :
        this.walletBalanceFilter === 'HIGH' ? w.points >= 500 :
        this.walletBalanceFilter === 'MED'  ? w.points >= 100 && w.points < 500 :
        this.walletBalanceFilter === 'LOW'  ? w.points > 0 && w.points < 100 :
        this.walletBalanceFilter === 'ZERO' ? w.points === 0 : true;
      return matchSearch && matchRole && matchBalance;
    });
  }

  roleClass(role: string): string {
    const map: { [key: string]: string } = {
      'PLAYER': 'pill pill-blue', 'COACH': 'pill pill-yellow',
      'HEALTH_PROFESSIONAL': 'pill pill-green', 'SPONSOR': 'pill pill-purple',
      'REFEREE': 'pill pill-red', 'VENUE_OWNER': 'pill pill-blue', 'ADMIN': 'pill pill-gray'
    };
    return map[role] || 'pill pill-gray';
  }

  roleLabel(role: string): string {
    const map: { [key: string]: string } = {
      'PLAYER': '⚽ Player', 'COACH': '🏋️ Coach',
      'HEALTH_PROFESSIONAL': '🩺 Health Pro', 'SPONSOR': '💰 Sponsor',
      'REFEREE': '🟡 Referee', 'VENUE_OWNER': '🏟️ Venue Owner', 'ADMIN': '🔧 Admin'
    };
    return map[role] || role;
  }

  openEditWallet(w: WalletAdmin) { this.editingWallet = w; this.newWalletPoints = w.points; }
  closeEditWallet()              { this.editingWallet = null; this.newWalletPoints = null; }

  saveWalletPoints() {
    if (!this.editingWallet || this.newWalletPoints === null) return;
    this.walletSaving = true;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
    this.http.put<any>(
      `${this.walletBase}/${this.editingWallet.id}/points?points=${this.newWalletPoints}`,
      {}, { headers }
    ).subscribe({
      next: () => {
        const idx = this.wallets.findIndex(w => w.id === this.editingWallet!.id);
        if (idx !== -1) this.wallets[idx] = { ...this.wallets[idx], points: this.newWalletPoints! };
        this.walletSuccess = 'Points updated successfully!';
        this.walletSaving  = false;
        this.closeEditWallet();
      },
      error: () => { this.walletError = 'Failed to update points'; this.walletSaving = false; }
    });
  }

  deleteWallet(id: number) {
    if (!confirm('Delete this wallet?')) return;
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
    this.http.delete(`${this.walletBase}/${id}`, { headers }).subscribe({
      next:  () => { this.wallets = this.wallets.filter(w => w.id !== id); this.walletSuccess = 'Wallet deleted!'; },
      error: () => { this.walletError = 'Failed to delete wallet'; }
    });
  }

  exportWallets() {
    const rows = ['ID,UserID,Username,Email,Role,Phone,Points'];
    this.wallets.forEach(w => rows.push(`${w.id},${w.userId},${w.username},${w.email},${w.role},${w.phone||''},${w.points}`));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'wallets-report.csv';
    a.click();
  }

  // ── Static data ───────────────────────────────────────────
  kpis = [
    { label: 'Active users',     value: '12,487', change: '+12.5%', trend: 'up'   },
    { label: 'Bookings today',   value: '248',    change: '+8.2%',  trend: 'up'   },
    { label: 'Revenue (MTD)',    value: '$45,230', change: '+15.8%', trend: 'up'  },
    { label: 'Pending sponsors', value: '18',     change: '-3.1%',  trend: 'down' }
  ];
  bookingsData = [
    { label: 'Mon', value: 65 }, { label: 'Tue', value: 78 }, { label: 'Wed', value: 45 },
    { label: 'Thu', value: 89 }, { label: 'Fri', value: 92 }, { label: 'Sat', value: 67 }, { label: 'Sun', value: 85 }
  ];
  topSports = [
    { sport: 'Football',   icon: '⚽', bookings: 1245 }, { sport: 'Basketball', icon: '🏀', bookings: 987 },
    { sport: 'Volleyball', icon: '🏐', bookings: 654  }, { sport: 'Tennis',     icon: '🎾', bookings: 432 }
  ];
  recentActivities = [
    { user: 'Alex Johnson',   action: 'Booked venue',      time: '2 min ago'   },
    { user: 'Sarah Mitchell', action: 'Created new team',  time: '15 min ago'  },
    { user: 'Mike Chen',      action: 'Purchased equipment', time: '32 min ago' },
    { user: 'Emma Wilson',    action: 'Joined tournament', time: '1 hour ago'  }
  ];
  venues = [
    { name: 'Arena Sports Complex', location: 'Downtown, Tunis',  sports: ['Football','Basketball'], pricePerHour: 50, status: 'Active' },
    { name: 'City Stadium',         location: 'North District',   sports: ['Football'],               pricePerHour: 40, status: 'Active' },
    { name: 'Green Park',           location: 'South Tunis',      sports: ['Tennis','Volleyball'],    pricePerHour: 30, status: 'Active' }
  ];
  users = [
    { name: 'Alex Johnson',   email: 'alex@mail.com',   role: 'PLAYER',  status: 'Active',  joined: '2025-01-10' },
    { name: 'Sarah Mitchell', email: 'sarah@mail.com',  role: 'COACH',   status: 'Active',  joined: '2025-02-05' },
    { name: 'Mike Chen',      email: 'mike@mail.com',   role: 'REFEREE', status: 'Pending', joined: '2025-03-01' }
  ];
  communityReports = [
    { user: 'user123',   type: 'Hate speech',  content: 'Reported comment content…', severity: 'High'   },
    { user: 'player99',  type: 'Spam',         content: 'Repeated spam message…',    severity: 'Medium' },
    { user: 'coach77',   type: 'Harassment',   content: 'Offensive message…',        severity: 'High'   }
  ];
  products = [
    { name: 'Football Jersey', category: 'Apparel',     price: 45,  stock: 23 },
    { name: 'Training Shoes',  category: 'Footwear',    price: 120, stock: 8  },
    { name: 'Water Bottle',    category: 'Accessories', price: 15,  stock: 0  }
  ];
  healthPros = [
    { name: 'Dr. Ahmed Ben Ali',   specialty: 'Sports Medicine',  status: 'Active' },
    { name: 'Dr. Leila Mansour',   specialty: 'Physiotherapy',    status: 'Active' }
  ];
  pendingCerts = [
    { name: 'Karim Dridi', cert: 'FIFA Referee License'  },
    { name: 'Nour Belhaj', cert: 'UEFA Coaching Badge'   }
  ];
  fantasyStats = [
    { label: 'Active leagues', value: '24' }, { label: 'Total players', value: '1,840' },
    { label: 'Prize pool',     value: '12,500 TND' }, { label: 'Matches today', value: '8' }
  ];
  fantasyLeagues = [
    { name: 'Spring Championship', players: 120, prize: 2000, status: 'Active'   },
    { name: 'Summer Cup',          players: 64,  prize: 1000, status: 'Upcoming' },
    { name: 'Pro League',          players: 200, prize: 5000, status: 'Active'   }
  ];
  sponsors = [
    { company: 'SportsPro TN', budget: 50000, status: 'Active',   contact: 'contact@sportspro.tn' },
    { company: 'FitGear',      budget: 20000, status: 'Pending',  contact: 'info@fitgear.com'     },
    { company: 'NutriMax',     budget: 15000, status: 'Rejected', contact: 'hello@nutrimax.tn'    }
  ];
  reservations = [
    { id: 'BK001', venueName: 'Arena Sports Complex', customerName: 'John Doe',   date: '2026-02-15', totalPrice: 100, status: 'Confirmed' },
    { id: 'BK002', venueName: 'City Stadium',          customerName: 'Jane Smith', date: '2026-02-16', totalPrice: 80,  status: 'Pending'   }
  ];
}