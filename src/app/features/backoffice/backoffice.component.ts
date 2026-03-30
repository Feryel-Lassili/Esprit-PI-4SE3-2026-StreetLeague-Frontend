import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BackofficeShopComponent } from './shop-management.component';
import { BackofficeOrdersComponent } from './orders-management.component';
import { BackofficeSponsorComponent } from './sponsor-management.component';
import { MerchandiseAdminComponent } from './merchandise-admin.component';

@Component({
  selector: 'app-backoffice',
  standalone: true,
    imports: [CommonModule, BackofficeShopComponent, BackofficeOrdersComponent, BackofficeSponsorComponent, MerchandiseAdminComponent],
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
  `],
  template: `
    <div class="layout">

      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="!sidebarOpen">

        <div class="sidebar-header">
          <div class="logo-box"><img src="logo.jpg" style="width:28px;height:28px;border-radius:6px;object-fit:cover;"></div>
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
                <div style="font-size:15px; font-weight:600; color:#1d1d1f; margin-bottom:4px;">{{ v.name }}</div>
                <div style="font-size:12px; color:#6e6e73; margin-bottom:12px;">📍 {{ v.location }}</div>
                <div style="display:flex; gap:6px; margin-bottom:12px; flex-wrap:wrap;">
                  <span class="pill pill-blue" *ngFor="let s of v.sports">{{ s }}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                  <span style="font-size:13px; font-weight:600; color:#1d1d1f;">{{ v.pricePerHour }} TND/hr</span>
                  <span class="pill pill-green">{{ v.status }}</span>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="action-btn" style="flex:1;">Edit</button>
                  <button class="action-btn" style="flex:1;">View</button>
                </div>
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

          <!-- MERCHANDISE ADMIN -->
          <bo-merchandise-admin *ngIf="currentScreen === 'merchandise'"></bo-merchandise-admin>

          <!-- SHOP -->
          <bo-shop *ngIf="currentScreen === 'shop'"></bo-shop>

          <!-- ORDERS -->
          <bo-orders *ngIf="currentScreen === 'orders'"></bo-orders>
          <!-- SPONSORS -->
          <bo-sponsors *ngIf="currentScreen === 'sponsors'"></bo-sponsors>

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

        </div>
      </main>
    </div>
  `
})
export class BackofficeComponent {
  sidebarOpen = true;
  userRole: 'admin' | 'venue-allocator' = 'admin';
  currentScreen = 'dashboard';

  adminMenu = [
    {
      section: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: '▣' },
      ]
    },
    {
      section: 'Management',
      items: [
        { id: 'users', label: 'Users & Teams', icon: '👥' },
        { id: 'venues', label: 'Venues', icon: '📍' },
        { id: 'orders', label: 'Orders', icon: '📦' },
        { id: 'merchandise', label: 'Player Merch', icon: '🏅' },
        { id: 'health', label: 'Health', icon: '🏥' },
        { id: 'shop', label: 'Shop', icon: '🛍️' },
        { id: 'sponsors', label: 'Sponsors', icon: '💰' },
      ]
    },
    {
      section: 'Features',
      items: [
        { id: 'fantasy', label: 'Fantasy Game', icon: '🎮' },
        { id: 'community', label: 'Community (AI)', icon: '💬' },
      ]
    }
  ];

  allocatorMenu = [
    {
      section: 'Overview',
      items: [
        { id: 'allocator', label: 'Dashboard', icon: '▣' },
        { id: 'venues', label: 'My Venues', icon: '📍' },
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

  venues = [
    { name: 'Arena Sports Complex', location: 'Downtown, Tunis', sports: ['Football', 'Basketball'], pricePerHour: 50, status: 'Active', bookingsToday: 5 },
    { name: 'City Stadium', location: 'North District', sports: ['Football'], pricePerHour: 40, status: 'Active', bookingsToday: 3 },
    { name: 'Green Park', location: 'South Tunis', sports: ['Tennis', 'Volleyball'], pricePerHour: 30, status: 'Active', bookingsToday: 2 }
  ];

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

  constructor(private route: ActivatedRoute, public authService: AuthService) {
    this.route.queryParams.subscribe(params => {
      if (params['role'] === 'venue-allocator') {
        this.userRole = 'venue-allocator';
        this.currentScreen = 'allocator';
      }
    });
  }
}