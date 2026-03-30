import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TeamService } from '../../core/services/team.service';
import { AdminVenueService } from './venue-management/services/admin-venue.service';
import { VenueDTO } from '../frontoffice/venue/models/venue.model';
import { VenueService } from '../frontoffice/venue/services/venue.service';

@Component({
  selector: 'app-backoffice',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink],
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
    .up { color: #2e7d32; }
    .down { color: #c62828; }
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
    .pill-green { background: #f1f8e9; color: #2e7d32; }
    .pill-yellow { background: #fffde7; color: #f57f17; }
    .pill-blue { background: #e8f0fe; color: #185fa5; }
    .pill-red { background: #fff2f2; color: #c62828; }
    .action-btn { background: none; border: 1px solid #e0e0e5; border-radius: 6px; padding: 4px 10px; font-size: 12px; color: #1d1d1f; cursor: pointer; margin-right: 4px; }
    .action-btn:hover { background: #f5f5f7; }
    .coming-soon { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; color: #6e6e73; }
    .coming-soon .icon { font-size: 48px; margin-bottom: 16px; }
    .coming-soon h2 { font-size: 20px; font-weight: 600; color: #1d1d1f; margin-bottom: 8px; }
    .switch-btn { background: none; border: 1px solid #e0e0e5; border-radius: 8px; padding: 6px 12px; font-size: 12px; color: #6e6e73; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .switch-btn:hover { background: #f5f5f7; }
    /* Teams admin */
    .teams-topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
    .teams-search { border:1px solid #e0e0e5; border-radius:8px; padding:8px 12px; font-size:13px; width:240px; outline:none; }
    .btn-primary { background:#000; color:#fff; border:none; border-radius:8px; padding:8px 16px; font-size:13px; font-weight:500; cursor:pointer; }
    .btn-primary:hover { opacity:.85; }
    .btn-danger { background:#c62828; color:#fff; border:none; border-radius:6px; padding:4px 10px; font-size:12px; cursor:pointer; }
    .btn-danger:hover { opacity:.85; }
    .team-logo-cell { width:36px; height:36px; border-radius:8px; background:#f5f5f7; display:flex; align-items:center; justify-content:center; font-size:18px; overflow:hidden; }
    .team-logo-cell img { width:100%; height:100%; object-fit:cover; border-radius:8px; }
    .players-avatars { display:flex; gap:4px; flex-wrap:wrap; }
    .p-av { width:26px; height:26px; border-radius:50%; background:#e8f0fe; color:#185fa5; font-size:10px; font-weight:700; display:flex; align-items:center; justify-content:center; }
    .p-more { font-size:11px; color:#6e6e73; align-self:center; }
    /* Modal */
    .modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:100; display:flex; align-items:center; justify-content:center; }
    .modal-box { background:#fff; border-radius:16px; padding:28px; width:520px; max-width:95vw; max-height:90vh; overflow-y:auto; }
    .modal-title { font-size:16px; font-weight:700; color:#1d1d1f; margin-bottom:20px; }
    .form-row { margin-bottom:14px; }
    .form-label { font-size:12px; font-weight:600; color:#6e6e73; text-transform:uppercase; letter-spacing:.04em; display:block; margin-bottom:6px; }
    .form-input { width:100%; border:1px solid #e0e0e5; border-radius:8px; padding:9px 12px; font-size:13px; outline:none; }
    .form-input:focus { border-color:#000; }
    .form-select { width:100%; border:1px solid #e0e0e5; border-radius:8px; padding:9px 12px; font-size:13px; outline:none; background:#fff; }
    .logo-preview-box { width:72px; height:72px; border-radius:10px; background:#f5f5f7; display:flex; align-items:center; justify-content:center; font-size:30px; overflow:hidden; margin-bottom:8px; }
    .logo-preview-box img { width:100%; height:100%; object-fit:cover; border-radius:10px; }
    .file-btn { border:1px dashed #e0e0e5; border-radius:8px; padding:8px 14px; font-size:12px; cursor:pointer; color:#6e6e73; background:#fafafa; display:inline-block; position:relative; overflow:hidden; }
    .file-btn input { position:absolute; inset:0; opacity:0; cursor:pointer; }
    .modal-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; }
    .btn-cancel-modal { background:none; border:1px solid #e0e0e5; border-radius:8px; padding:8px 16px; font-size:13px; cursor:pointer; color:#1d1d1f; }
    .player-pick { display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:8px; cursor:pointer; border:1px solid #e0e0e5; margin-bottom:6px; transition:all .15s; }
    .player-pick:hover { border-color:#000; background:#f5f5f7; }
    .player-pick.selected { border-color:#000; background:#000; color:#fff; }
    .player-pick.selected .pp-email { color:#aeaeb2; }
    .pp-name { font-size:13px; font-weight:500; }
    .pp-email { font-size:11px; color:#6e6e73; }
    .player-search { border:1px solid #e0e0e5; border-radius:8px; padding:8px 12px; font-size:13px; width:100%; outline:none; margin-bottom:10px; }
    .players-list-box { max-height:200px; overflow-y:auto; }
    .error-msg { color:#c62828; font-size:12px; margin-top:8px; }
    .spinner-sm { width:16px; height:16px; border:2px solid #e0e0e5; border-top-color:#000; border-radius:50%; animation:spin .6s linear infinite; display:inline-block; vertical-align:middle; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .detail-panel { background:#fff; border-radius:12px; border:1px solid #e0e0e5; padding:20px; margin-top:16px; }
    .player-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #f5f5f7; }
    .player-row:last-child { border-bottom:none; }
    .cap-tag { font-size:10px; font-weight:700; background:#fffde7; color:#f57f17; padding:2px 7px; border-radius:10px; }
    /* Reservations admin */
    .tabs { display:flex; gap:2px; background:#f5f5f7; border-radius:10px; padding:3px; margin-bottom:20px; width:fit-content; }
    .tab-btn { padding:7px 18px; border:none; background:none; border-radius:8px; font-size:13px; font-weight:500; color:#6e6e73; cursor:pointer; transition:all .15s; }
    .tab-btn.active { background:#fff; color:#1d1d1f; box-shadow:0 1px 3px rgba(0,0,0,.1); }
    .btn-confirm { background:#2e7d32; color:#fff; border:none; border-radius:6px; padding:4px 10px; font-size:12px; cursor:pointer; margin-right:4px; }
    .btn-confirm:hover { opacity:.85; }
    .btn-verify { background:#185fa5; color:#fff; border:none; border-radius:6px; padding:4px 10px; font-size:12px; cursor:pointer; margin-right:4px; }
    .btn-verify:hover { opacity:.85; }
    .btn-unverify { background:#6e6e73; color:#fff; border:none; border-radius:6px; padding:4px 10px; font-size:12px; cursor:pointer; }
    .btn-unverify:hover { opacity:.85; }
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
            <ng-container *ngFor="let item of section.items">
              <!-- Router-based nav items -->
              <a *ngIf="item.route" class="nav-item" [routerLink]="item.route"
                [class.active]="currentScreen === item.id"
                style="text-decoration:none;"
                (click)="currentScreen = item.id">
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-label" *ngIf="sidebarOpen">{{ item.label }}</span>
              </a>
              <!-- Screen-based nav items -->
              <button *ngIf="!item.route" class="nav-item"
                [class.active]="currentScreen === item.id"
                (click)="currentScreen = item.id; router.navigate(['/backoffice'])">
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-label" *ngIf="sidebarOpen">{{ item.label }}</span>
              </button>
            </ng-container>
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
          <button class="switch-btn" *ngIf="userRole === 'admin'" (click)="switchRole()" style="margin: 4px 0; width:100%;">
            <span>🔄</span><span *ngIf="sidebarOpen">Switch to Allocator</span>
          </button>
          <button class="switch-btn" *ngIf="userRole === 'venue-allocator'" (click)="switchRole()" style="margin: 4px 0; width:100%;">
            <span>🔄</span><span *ngIf="sidebarOpen">Switch to Admin</span>
          </button>
          <button class="logout-btn" (click)="authService.logout()">
            <span>🚪</span><span *ngIf="sidebarOpen">Sign Out</span>
          </button>
        </div>

      </aside>

      <!-- Main -->
      <main class="main">

        <!-- Topbar -->
        <div class="topbar">
          <span class="page-title">{{ getTitle() }}</span>
          <span class="badge-danger" *ngIf="currentScreen === 'community'">7 reports</span>
        </div>

        <div class="content">

          <!-- Router outlet for child pages (venue-management etc.) -->
          <router-outlet></router-outlet>

          <ng-container *ngIf="!isChildRoute">

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


          <!-- USERS & TEAMS -->
          <div *ngIf="currentScreen === 'users'">
            <div class="card">
              <table class="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let u of users">
                    <td>
                      <div style="font-weight:500;">{{ u.name }}</div>
                      <div style="font-size:12px; color:#6e6e73;">{{ u.email }}</div>
                    </td>
                    <td><span class="pill pill-blue">{{ u.role }}</span></td>
                    <td><span class="pill" [class.pill-green]="u.status === 'Active'" [class.pill-yellow]="u.status === 'Pending'">{{ u.status }}</span></td>
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

          <!-- COMMUNITY AI REPORTS -->
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
                <thead>
                  <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
                </thead>
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

          <!-- FANTASY GAME -->
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
                    <td><span class="pill" [class.pill-green]="l.status === 'Active'" [class.pill-yellow]="l.status === 'Upcoming'">{{ l.status }}</span></td>
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
                    <td><span class="pill" [class.pill-green]="s.status === 'Active'" [class.pill-yellow]="s.status === 'Pending'" [class.pill-red]="s.status === 'Rejected'">{{ s.status }}</span></td>
                    <td style="color:#6e6e73; font-size:12px;">{{ s.contact }}</td>
                    <td><button class="action-btn">Review</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- ═══ TEAMS ADMIN ═══ -->
          <div *ngIf="currentScreen === 'teams'">

            <div class="teams-topbar">
              <input class="teams-search" type="text" placeholder="Search teams..." [(ngModel)]="teamSearch"/>
              <button class="btn-primary" (click)="openCreateTeam()">+ New team</button>
            </div>

            <div *ngIf="teamsLoading" style="text-align:center;padding:40px;color:#6e6e73;">
              <span class="spinner-sm"></span> Loading…
            </div>
            <div *ngIf="teamsError" style="color:#c62828;padding:16px;">⚠️ {{ teamsError }}</div>

            <div class="card" *ngIf="!teamsLoading && !teamsError">
              <table class="table">
                <thead>
                  <tr>
                    <th>Logo</th>
                    <th>Name</th>
                    <th>Sport</th>
                    <th>Captain</th>
                    <th>Players</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let t of filteredTeams">
                    <td>
                      <div class="team-logo-cell">
                        <img *ngIf="t.logo" [src]="t.logo" [alt]="t.name" (error)="$any($event.target).style.display='none'"/>
                        <span *ngIf="!t.logo">{{ sportEmoji(t.type) }}</span>
                      </div>
                    </td>
                    <td style="font-weight:500;">{{ t.name }}</td>
                    <td><span class="pill pill-blue">{{ t.type || '—' }}</span></td>
                    <td style="font-size:12px;color:#6e6e73;">{{ getCaptainName(t) }}</td>
                    <td>
                      <div class="players-avatars">
                        <div class="p-av" *ngFor="let p of (t.players||[]) | slice:0:4">{{ pInit(p) }}</div>
                        <span class="p-more" *ngIf="(t.players?.length||0) > 4">+{{ (t.players?.length||0)-4 }}</span>
                        <span style="font-size:11px;color:#aeaeb2;" *ngIf="!t.players?.length">—</span>
                      </div>
                    </td>
                    <td>
                      <button class="action-btn" (click)="viewTeam(t)">👁 View</button>
                      <button class="action-btn" (click)="openEditTeam(t)">✏️ Edit</button>
                      <button class="action-btn" style="color:#c62828;border-color:#fecaca;" (click)="deleteTeamAdmin(t)">🗑</button>
                    </td>
                  </tr>
                  <tr *ngIf="filteredTeams.length === 0">
                    <td colspan="6" style="text-align:center;color:#aeaeb2;padding:32px;">No teams found</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Detail panel -->
            <div class="detail-panel" *ngIf="viewedTeam">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                <div style="font-size:15px;font-weight:700;">{{ viewedTeam.name }} — Players ({{ viewedTeam.players?.length || 0 }})</div>
                <button class="action-btn" (click)="viewedTeam=null">✕ Close</button>
              </div>
              <div *ngIf="!viewedTeam.players?.length" style="color:#aeaeb2;font-size:13px;">No players yet.</div>
              <div class="player-row" *ngFor="let p of viewedTeam.players">
                <div class="p-av" style="width:34px;height:34px;font-size:13px;">{{ pInit(p) }}</div>
                <div style="flex:1;">
                  <div style="font-size:13px;font-weight:500;">{{ p.fullName || p.username || p.email }}</div>
                  <div style="font-size:11px;color:#6e6e73;">{{ p.email }}</div>
                </div>
                <span class="cap-tag" *ngIf="p.id === viewedTeam.captainId">👑 Captain</span>
                <button class="action-btn" *ngIf="p.id !== viewedTeam.captainId" (click)="adminTransferCaptain(viewedTeam, p)">👑 Make captain</button>
                <button class="action-btn" style="color:#c62828;" *ngIf="p.id !== viewedTeam.captainId" (click)="adminRemovePlayer(viewedTeam, p)">Remove</button>
              </div>
            </div>

          </div>

          <!-- RESERVATIONS ADMIN -->
          <div *ngIf="currentScreen === 'reservations'">

            <div class="tabs">
              <button class="tab-btn" [class.active]="resTab === 'reservations'" (click)="resTab = 'reservations'">📅 Reservations</button>
              <button class="tab-btn" [class.active]="resTab === 'venues'" (click)="resTab = 'venues'">🏟️ Venues</button>
            </div>

            <!-- Reservations tab -->
            <div *ngIf="resTab === 'reservations'">
              <div *ngIf="resLoading" style="text-align:center;padding:40px;color:#6e6e73;"><span class="spinner-sm"></span> Loading…</div>
              <div *ngIf="resError" style="color:#c62828;padding:16px;">⚠️ {{ resError }}</div>
              <div class="card" *ngIf="!resLoading && !resError">
                <div class="card-title">All Reservations ({{ adminReservations.length }})</div>
                <table class="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Venue</th>
                      <th>Player</th>
                      <th>Date</th>
                      <th>Duration</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let r of adminReservations">
                      <td style="color:#aeaeb2;font-size:12px;">{{ r.id }}</td>
                      <td>
                        <div style="font-weight:500;">{{ r.venueName }}</div>
                        <div style="font-size:11px;color:#6e6e73;">{{ r.venueAddress }}</div>
                      </td>
                      <td style="font-size:12px;color:#6e6e73;">{{ r.userName }}</td>
                      <td style="font-size:12px;color:#6e6e73;">{{ r.date | date:'short' }}</td>
                      <td style="font-size:12px;">{{ r.duration }}h</td>
                      <td style="font-weight:500;">{{ r.price }} TND</td>
                      <td>
                        <span class="pill"
                          [class.pill-yellow]="r.status === 'PENDING'"
                          [class.pill-green]="r.status === 'CONFIRMED' || r.status === 'COMPLETED'"
                          [class.pill-red]="r.status === 'CANCELLED'">{{ r.status }}</span>
                      </td>
                      <td>
                        <button class="btn-confirm" *ngIf="r.status === 'PENDING'" (click)="confirmRes(r.id)">✓ Confirm</button>
                        <button class="btn-danger" *ngIf="r.status === 'PENDING' || r.status === 'CONFIRMED'" (click)="cancelRes(r.id)">✕ Cancel</button>
                      </td>
                    </tr>
                    <tr *ngIf="adminReservations.length === 0">
                      <td colspan="8" style="text-align:center;color:#aeaeb2;padding:32px;">No reservations found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Venues tab -->
            <div *ngIf="resTab === 'venues'">
              <div *ngIf="venuesResLoading" style="text-align:center;padding:40px;color:#6e6e73;"><span class="spinner-sm"></span> Loading…</div>
              <div class="card" *ngIf="!venuesResLoading">
                <div class="card-title">All Venues ({{ adminVenuesList.length }})</div>
                <table class="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Address</th>
                      <th>Sport</th>
                      <th>Owner</th>
                      <th>Price/h</th>
                      <th>Verified</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let v of adminVenuesList">
                      <td style="font-weight:500;">{{ v.name }}</td>
                      <td style="font-size:12px;color:#6e6e73;">{{ v.address }}</td>
                      <td><span class="pill pill-blue">{{ v.sportType }}</span></td>
                      <td style="font-size:12px;color:#6e6e73;">{{ v.ownerName || '—' }}</td>
                      <td style="font-weight:500;">{{ v.pricePerHour }} TND</td>
                      <td>
                        <span class="pill" [class.pill-green]="v.verified" [class.pill-yellow]="!v.verified">
                          {{ v.verified ? '✓ Verified' : '⏳ Pending' }}
                        </span>
                      </td>
                      <td>
                        <button class="btn-verify" *ngIf="!v.verified" (click)="verifyAdminVenue(v)">✓ Verify</button>
                        <button class="btn-unverify" *ngIf="v.verified" (click)="unverifyAdminVenue(v)">✕ Unverify</button>
                      </td>
                    </tr>
                    <tr *ngIf="adminVenuesList.length === 0">
                      <td colspan="7" style="text-align:center;color:#aeaeb2;padding:32px;">No venues found</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- VENUE ALLOCATOR DASHBOARD -->
          <div *ngIf="userRole === 'venue-allocator' && currentScreen === 'allocator'">
            <div class="grid-3" style="margin-bottom:24px;">
              <div class="card">
                <div class="stat-label">Today's bookings</div>
                <div class="stat-value">12</div>
              </div>
              <div class="card">
                <div class="stat-label">Today's revenue</div>
                <div class="stat-value">1,240 TND</div>
              </div>
              <div class="card">
                <div class="stat-label">Active venues</div>
                <div class="stat-value">5</div>
              </div>
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
                    <td><span class="pill" [class.pill-green]="r.status === 'Confirmed'" [class.pill-yellow]="r.status === 'Pending'">{{ r.status }}</span></td>
                    <td>
                      <button class="action-btn" *ngIf="r.status === 'Pending'">✓</button>
                      <button class="action-btn" *ngIf="r.status === 'Pending'">✕</button>
                      <button class="action-btn">View</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          </ng-container>

        </div>
      </main>
    </div>

    <!-- ═══ TEAM CREATE / EDIT MODAL ═══ -->
    <div class="modal-bg" *ngIf="showTeamModal" (click)="showTeamModal=false">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <div class="modal-title">{{ editingTeam ? '✏️ Edit Team' : '🏆 New Team' }}</div>

        <!-- Logo -->
        <div class="form-row">
          <label class="form-label">Logo</label>
          <div class="logo-preview-box">
            <img *ngIf="tForm.logo" [src]="tForm.logo"/>
            <span *ngIf="!tForm.logo">{{ sportEmoji(tForm.type) || '🏆' }}</span>
          </div>
          <label class="file-btn">
            📁 Choose image
            <input type="file" accept="image/*" (change)="onAdminLogo($event)"/>
          </label>
          <button *ngIf="tForm.logo" (click)="tForm.logo=''" style="background:none;border:none;color:#c62828;font-size:12px;cursor:pointer;margin-left:8px;">Remove</button>
        </div>

        <!-- Name -->
        <div class="form-row">
          <label class="form-label">Team name *</label>
          <input class="form-input" type="text" placeholder="e.g. Thunder Hawks" [(ngModel)]="tForm.name"/>
        </div>

        <!-- Sport -->
        <div class="form-row">
          <label class="form-label">Sport *</label>
          <select class="form-select" [(ngModel)]="tForm.type">
            <option value="">— Choose sport —</option>
            <option value="FOOTBALL">⚽ Football</option>
            <option value="BASKETBALL">🏀 Basketball</option>
            <option value="TENNIS">🎾 Tennis</option>
            <option value="VOLLEYBALL">🏐 Volleyball</option>
            <option value="HANDBALL">🤾 Handball</option>
          </select>
        </div>

        <!-- Captain (only on create) -->
        <div class="form-row" *ngIf="!editingTeam">
          <label class="form-label">Captain / member *</label>
          <input class="player-search" type="text" placeholder="Search player by name or email…" [(ngModel)]="captainSearch"/>
          <div class="players-list-box">
            <div *ngIf="playersLoading" style="padding:8px;color:#6e6e73;font-size:12px;"><span class="spinner-sm"></span> Loading…</div>
            <div class="player-pick"
              *ngFor="let p of filteredAvailablePlayers"
              [class.selected]="tForm.captainId === p.id"
              (click)="tForm.captainId = p.id">
              <div class="p-av">{{ pInit(p) }}</div>
              <div>
                <div class="pp-name">{{ p.fullName || p.username || p.email }}</div>
                <div class="pp-email">{{ p.email }}</div>
              </div>
              <span style="margin-left:auto;font-size:16px;" *ngIf="tForm.captainId === p.id">✓</span>
            </div>
            <div *ngIf="!playersLoading && filteredAvailablePlayers.length === 0" style="color:#aeaeb2;font-size:12px;padding:8px;">No players found</div>
          </div>
        </div>

        <div class="error-msg" *ngIf="tError">⚠️ {{ tError }}</div>

        <div class="modal-actions">
          <button class="btn-cancel-modal" (click)="showTeamModal=false">Cancel</button>
          <button class="btn-primary" (click)="saveTeamAdmin()" [disabled]="tLoading">
            <span class="spinner-sm" *ngIf="tLoading"></span>
            {{ tLoading ? '' : (editingTeam ? 'Update' : 'Create team') }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class BackofficeComponent implements OnInit {
  sidebarOpen = true;
  userRole: 'admin' | 'venue-allocator' = 'admin';
  currentScreen = 'dashboard';

  get isChildRoute(): boolean {
    const url = this.router.url.split('?')[0];
    return url.includes('/venue-management') || url.includes('/carpooling-management');
  }

  // ── Teams admin ────────────────────────────────────────────────────────────
  allAdminTeams: any[] = [];
  teamsLoading = false;
  teamsError = '';
  teamSearch = '';
  viewedTeam: any = null;

  get filteredTeams(): any[] {
    const q = this.teamSearch.toLowerCase();
    return this.allAdminTeams.filter(t => t.name?.toLowerCase().includes(q));
  }

  // Modal state
  showTeamModal = false;
  editingTeam: any = null;
  tForm: any = { name: '', type: '', logo: '', captainId: null };
  tError = '';
  tLoading = false;

  // Players for captain picker
  allPlayers: any[] = [];
  playersLoading = false;
  captainSearch = '';

  get filteredAvailablePlayers(): any[] {
    const q = this.captainSearch.toLowerCase();
    return this.allPlayers.filter(p =>
      (p.fullName || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q)
    );
  }

  adminMenu = [
    {
      section: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '▣', route: null },
      ]
    },
    {
      section: 'Management',
      items: [
        { id: 'users',        label: 'Users',        icon: '👤', route: null },
        { id: 'teams',        label: 'Teams',        icon: '🏆', route: null },
        { id: 'reservations', label: 'Reservations', icon: '📅', route: null },
        { id: 'owners',   label: 'Venue Owners', icon: '🏟️', route: '/backoffice/venue-management/owners' },
        { id: 'venues',   label: 'Venues',       icon: '📍', route: '/backoffice/venue-management/venues' },
        { id: 'drivers',  label: 'Driver List',  icon: '🚗', route: '/backoffice/carpooling-management/drivers' },
        { id: 'health',   label: 'Health',       icon: '🏥', route: null },
        { id: 'shop',     label: 'Shop',         icon: '🛍️', route: null },
      ]
    },
    {
      section: 'Features',
      items: [
        { id: 'fantasy',       label: 'Fantasy Game',   icon: '🎮', route: null },
        { id: 'community',     label: 'Community (AI)', icon: '💬', route: null },
        { id: 'sponsorships',  label: 'Sponsors',        icon: '💰', route: null },
      ]
    }
  ];

  allocatorMenu = [
    {
      section: 'Overview',
      items: [
        { id: 'allocator', label: 'Dashboard', icon: '▣', route: null },
        { id: 'venues', label: 'My Venues', icon: '📍', route: null },
      ]
    }
  ];

  getCurrentMenu() {
    return this.userRole === 'admin' ? this.adminMenu : this.allocatorMenu;
  }

  getTitle() {
    const all = [...this.adminMenu, ...this.allocatorMenu].flatMap(s => s.items);
    return all.find(i => i.id === this.currentScreen)?.label || 'Dashboard';
  }

  switchRole() {
    this.userRole = this.userRole === 'admin' ? 'venue-allocator' : 'admin';
    this.currentScreen = this.userRole === 'admin' ? 'dashboard' : 'allocator';
  }

  kpis = [
    { label: 'Active users', value: '12,487', change: '+12.5%', trend: 'up' },
    { label: 'Bookings today', value: '248', change: '+8.2%', trend: 'up' },
    { label: 'Revenue (MTD)', value: '$45,230', change: '+15.8%', trend: 'up' },
    { label: 'Pending sponsors', value: '18', change: '-3.1%', trend: 'down' }
  ];

  bookingsData = [
    { label: 'Mon', value: 65 }, { label: 'Tue', value: 78 },
    { label: 'Wed', value: 45 }, { label: 'Thu', value: 89 },
    { label: 'Fri', value: 92 }, { label: 'Sat', value: 67 }, { label: 'Sun', value: 85 }
  ];

  topSports = [
    { sport: 'Football', icon: '⚽', bookings: 1245 },
    { sport: 'Basketball', icon: '🏀', bookings: 987 },
    { sport: 'Volleyball', icon: '🏐', bookings: 654 },
    { sport: 'Tennis', icon: '🎾', bookings: 432 }
  ];

  recentActivities = [
    { user: 'Alex Johnson', action: 'Booked venue', time: '2 min ago' },
    { user: 'Sarah Mitchell', action: 'Created new team', time: '15 min ago' },
    { user: 'Mike Chen', action: 'Purchased equipment', time: '32 min ago' },
    { user: 'Emma Wilson', action: 'Joined tournament', time: '1 hour ago' }
  ];

  venues: any[] = [];

  users = [
    { name: 'Alex Johnson', email: 'alex@mail.com', role: 'PLAYER', status: 'Active', joined: '2025-01-10' },
    { name: 'Sarah Mitchell', email: 'sarah@mail.com', role: 'COACH', status: 'Active', joined: '2025-02-05' },
    { name: 'Mike Chen', email: 'mike@mail.com', role: 'REFEREE', status: 'Pending', joined: '2025-03-01' }
  ];

  communityReports = [
    { user: 'user123', type: 'Hate speech', content: 'Reported comment content...', severity: 'High' },
    { user: 'player99', type: 'Spam', content: 'Repeated spam message...', severity: 'Medium' },
    { user: 'coach77', type: 'Harassment', content: 'Offensive message to player...', severity: 'High' }
  ];

  products = [
    { name: 'Football Jersey', category: 'Apparel', price: 45, stock: 23 },
    { name: 'Training Shoes', category: 'Footwear', price: 120, stock: 8 },
    { name: 'Water Bottle', category: 'Accessories', price: 15, stock: 0 }
  ];

  healthPros = [
    { name: 'Dr. Ahmed Ben Ali', specialty: 'Sports Medicine', status: 'Active' },
    { name: 'Dr. Leila Mansour', specialty: 'Physiotherapy', status: 'Active' }
  ];

  pendingCerts = [
    { name: 'Karim Dridi', cert: 'FIFA Referee License' },
    { name: 'Nour Belhaj', cert: 'UEFA Coaching Badge' }
  ];

  fantasyStats = [
    { label: 'Active leagues', value: '24' },
    { label: 'Total players', value: '1,840' },
    { label: 'Prize pool', value: '12,500 TND' },
    { label: 'Matches today', value: '8' }
  ];

  fantasyLeagues = [
    { name: 'Spring Championship', players: 120, prize: 2000, status: 'Active' },
    { name: 'Summer Cup', players: 64, prize: 1000, status: 'Upcoming' },
    { name: 'Pro League', players: 200, prize: 5000, status: 'Active' }
  ];

  sponsors = [
    { company: 'SportsPro TN', budget: 50000, status: 'Active', contact: 'contact@sportspro.tn' },
    { company: 'FitGear', budget: 20000, status: 'Pending', contact: 'info@fitgear.com' },
    { company: 'NutriMax', budget: 15000, status: 'Rejected', contact: 'hello@nutrimax.tn' }
  ];

  reservations = [
    { id: 'BK001', venueName: 'Arena Sports Complex', customerName: 'John Doe', date: '2026-02-15', totalPrice: 100, status: 'Confirmed' },
    { id: 'BK002', venueName: 'City Stadium', customerName: 'Jane Smith', date: '2026-02-16', totalPrice: 80, status: 'Pending' }
  ];

  // ── Reservations admin ─────────────────────────────────────────────────────
  resTab: 'reservations' | 'venues' = 'reservations';
  adminReservations: any[] = [];
  resLoading = false;
  resError = '';
  adminVenuesList: any[] = [];
  venuesResLoading = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public authService: AuthService,
    private teamService: TeamService,
    private adminVenueService: AdminVenueService,
    private venueService: VenueService
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['role'] === 'venue-allocator') {
        this.userRole = 'venue-allocator';
        this.currentScreen = 'allocator';
      }
    });
  }

  ngOnInit(): void {
    this.loadTeams();
    this.loadVenues();
    this.loadAdminReservations();
    this.loadAdminVenues();
    // Sync sidebar active item from current URL
    const url = this.router.url.split('?')[0];
    const allItems = [...this.adminMenu, ...this.allocatorMenu].flatMap(s => s.items);
    const matched = allItems.find((i: any) => i.route && url.startsWith(i.route));
    if (matched) this.currentScreen = matched.id;
  }

  // ── Teams: load ────────────────────────────────────────────────────────────

  loadTeams(): void {
    this.teamsLoading = true;
    this.teamsError = '';
    this.teamService.getAllTeams().subscribe({
      next: data => { this.allAdminTeams = data; this.teamsLoading = false; },
      error: () => { this.teamsError = 'Failed to load teams.'; this.teamsLoading = false; }
    });
  }

  // ── Teams: helpers ─────────────────────────────────────────────────────────

  sportEmoji(type?: string): string {
    const m: Record<string, string> = { FOOTBALL: '⚽', BASKETBALL: '🏀', TENNIS: '🎾', VOLLEYBALL: '🏐', HANDBALL: '🤾' };
    return m[type || ''] || '🏆';
  }

  pInit(p: any): string {
    return (p.fullName || p.username || p.email || '?')[0].toUpperCase();
  }

  getCaptainName(team: any): string {
    if (!team.captainId || !team.players?.length) return '—';
    const cap = team.players.find((p: any) => p.id === team.captainId);
    return cap ? (cap.fullName || cap.username || cap.email) : '—';
  }

  // ── Teams: view detail ────────────────────────────────────────────────────

  viewTeam(team: any): void {
    this.viewedTeam = this.viewedTeam?.id === team.id ? null : team;
  }

  // ── Teams: create ─────────────────────────────────────────────────────────

  openCreateTeam(): void {
    this.editingTeam = null;
    this.tForm = { name: '', type: '', logo: '', captainId: null };
    this.tError = '';
    this.captainSearch = '';
    this.showTeamModal = true;
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.playersLoading = true;
    this.teamService.getAllPlayers().subscribe({
      next: data => { this.allPlayers = data; this.playersLoading = false; },
      error: () => { this.playersLoading = false; }
    });
  }

  onAdminLogo(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { this.tForm.logo = reader.result as string; };
    reader.readAsDataURL(file);
  }

  // ── Teams: edit ───────────────────────────────────────────────────────────

  openEditTeam(team: any): void {
    this.editingTeam = team;
    this.tForm = { name: team.name, type: team.type || '', logo: team.logo || '', captainId: team.captainId };
    this.tError = '';
    this.showTeamModal = true;
  }

  // ── Teams: save (create or update) ────────────────────────────────────────

  saveTeamAdmin(): void {
    if (!this.tForm.name.trim()) { this.tError = 'Name is required.'; return; }
    if (!this.tForm.type) { this.tError = 'Please select a sport.'; return; }
    if (!this.editingTeam && !this.tForm.captainId) { this.tError = 'Please select a captain.'; return; }

    this.tLoading = true;
    this.tError = '';

    const obs = this.editingTeam
      ? this.teamService.updateTeam(this.editingTeam.id, { name: this.tForm.name, type: this.tForm.type, logo: this.tForm.logo })
      : this.teamService.createTeam({ name: this.tForm.name, type: this.tForm.type, logo: this.tForm.logo, captainId: this.tForm.captainId });

    obs.subscribe({
      next: () => {
        this.tLoading = false;
        this.showTeamModal = false;
        this.viewedTeam = null;
        this.loadTeams();
      },
      error: err => {
        this.tError = err?.error?.message || 'Operation failed.';
        this.tLoading = false;
      }
    });
  }

  // ── Teams: delete ─────────────────────────────────────────────────────────

  deleteTeamAdmin(team: any): void {
    if (!confirm(`Delete team "${team.name}"? This cannot be undone.`)) return;
    this.teamService.deleteTeam(team.id).subscribe({
      next: () => {
        if (this.viewedTeam?.id === team.id) this.viewedTeam = null;
        this.loadTeams();
      },
      error: () => alert('Failed to delete team.')
    });
  }

  // ── Teams: transfer captain ───────────────────────────────────────────────

  adminTransferCaptain(team: any, player: any): void {
    if (!confirm(`Make "${player.fullName || player.email}" the new captain?`)) return;
    this.teamService.transferCaptain(team.id, player.id).subscribe({
      next: updated => {
        const idx = this.allAdminTeams.findIndex(t => t.id === team.id);
        if (idx >= 0) this.allAdminTeams[idx] = updated;
        this.viewedTeam = updated;
      },
      error: () => alert('Failed to transfer captain.')
    });
  }

  // ── Teams: remove player ──────────────────────────────────────────────────

  adminRemovePlayer(team: any, player: any): void {
    if (!confirm(`Remove "${player.fullName || player.email}" from the team?`)) return;
    this.teamService.removePlayer(team.id, player.id).subscribe({
      next: () => {
        this.viewedTeam = {
          ...team,
          players: team.players.filter((p: any) => p.id !== player.id)
        };
        const idx = this.allAdminTeams.findIndex(t => t.id === team.id);
        if (idx >= 0) this.allAdminTeams[idx] = this.viewedTeam;
      },
      error: () => alert('Failed to remove player.')
    });
  }

  loadAdminReservations(): void {
    this.resLoading = true;
    this.resError = '';
    this.venueService.getAllReservations().subscribe({
      next: data => { this.adminReservations = data; this.resLoading = false; },
      error: () => { this.resError = 'Failed to load reservations.'; this.resLoading = false; }
    });
  }

  loadAdminVenues(): void {
    this.venuesResLoading = true;
    this.venueService.getAllVenuesAdmin().subscribe({
      next: data => { this.adminVenuesList = data; this.venuesResLoading = false; },
      error: () => { this.venuesResLoading = false; }
    });
  }

  confirmRes(id: number): void {
    this.venueService.confirmReservation(id).subscribe({
      next: () => this.loadAdminReservations(),
      error: () => alert('Failed to confirm reservation.')
    });
  }

  cancelRes(id: number): void {
    if (!confirm('Cancel this reservation?')) return;
    this.venueService.adminCancelReservation(id).subscribe({
      next: () => this.loadAdminReservations(),
      error: () => alert('Failed to cancel reservation.')
    });
  }

  verifyAdminVenue(venue: any): void {
    this.venueService.verifyVenue(venue.id).subscribe({
      next: () => { venue.verified = true; },
      error: () => alert('Failed to verify venue.')
    });
  }

  unverifyAdminVenue(venue: any): void {
    if (!confirm(`Unverify "${venue.name}"?`)) return;
    this.venueService.unverifyVenue(venue.id).subscribe({
      next: () => { venue.verified = false; },
      error: () => alert('Failed to unverify venue.')
    });
  }

  loadVenues(): void {
    this.adminVenueService.getAllVenues().subscribe({
      next: (data: VenueDTO[]) => {
        this.venues = data.map(v => ({
          id: v.id,
          name: v.name,
          location: v.address,
          sports: [v.sportType],
          pricePerHour: v.pricePerHour,
          status: 'Active',
          bookingsToday: v.capacity
        }));
      },
      error: (err) => console.error('Error fetching venues', err)
    });
  }
}