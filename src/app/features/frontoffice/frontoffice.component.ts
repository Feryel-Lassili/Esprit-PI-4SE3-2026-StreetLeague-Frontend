import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-frontoffice',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
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
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; cursor: pointer; border: none; background: none; width: 100%; text-align: left; transition: background 0.15s; text-decoration: none; }
    .nav-item:hover { background: #f5f5f7; }
    .nav-item.active { background: #000; }
    .nav-item.active .nav-label { color: white; }
    .nav-icon { font-size: 15px; min-width: 20px; text-align: center; }
    .nav-label { font-size: 13px; color: #1d1d1f; white-space: nowrap; overflow: hidden; }
    .sidebar-footer { padding: 12px 8px; border-top: 1px solid #e0e0e5; }
    .user-info { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; margin-bottom: 4px; }
    .avatar { min-width: 28px; width: 28px; height: 28px; border-radius: 50%; background: #e8f0fe; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: #185fa5; }
    .user-details { overflow: hidden; }
    .user-name { font-size: 12px; font-weight: 500; color: #1d1d1f; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { font-size: 11px; color: #6e6e73; }
    .logout-btn { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; cursor: pointer; border: none; background: none; width: 100%; color: #c62828; font-size: 13px; transition: background 0.15s; }
    .logout-btn:hover { background: #fff2f2; }
    .main { flex: 1; overflow: auto; }
    .topbar { height: 60px; background: white; border-bottom: 1px solid #e0e0e5; display: flex; align-items: center; padding: 0 24px; position: sticky; top: 0; z-index: 10; }
    .page-title { font-size: 16px; font-weight: 600; color: #1d1d1f; }
    .content { padding: 24px; }
  `],
  template: `
    <div class="layout">

      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="!sidebarOpen">

        <div class="sidebar-header">
          <div class="logo-box"><span>S</span></div>
          <span class="logo-text" *ngIf="sidebarOpen">StreetLeague</span>
          <button class="toggle-btn" (click)="sidebarOpen = !sidebarOpen">☰</button>
        </div>

        <nav class="nav">
          <div *ngFor="let section of menu">
            <div class="nav-section" *ngIf="sidebarOpen">{{ section.section }}</div>
            <a class="nav-item"
              *ngFor="let item of section.items"
              [routerLink]="item.path"
              [class.active]="currentPath === item.path"
              (click)="currentPath = item.path">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label" *ngIf="sidebarOpen">{{ item.label }}</span>
            </a>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info" *ngIf="sidebarOpen">
            <div class="avatar">{{ userInitial }}</div>
            <div class="user-details">
              <div class="user-name">{{ userEmail }}</div>
              <div class="user-role">{{ userRole }}</div>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">
            <span class="nav-icon">🚪</span>
            <span *ngIf="sidebarOpen">Sign Out</span>
          </button>
        </div>

      </aside>

      <!-- Main -->
      <main class="main">
        <div class="topbar">
          <span class="page-title">{{ getTitle() }}</span>
        </div>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </main>

    </div>
  `
})
export class FrontofficeComponent {
  sidebarOpen = true;
  currentPath = '/home';

  get menu() {
    const role = this.authService.getUserRole()?.replace('ROLE_', '') || '';
    const isVenueOwner = role === 'VENUE_OWNER';

    const sections: { section: string; items: { path: string; label: string; icon: string }[] }[] = [
      {
        section: 'Main',
        items: [
          { path: '/home',    label: 'Home',    icon: '🏠' },
          { path: '/explore', label: 'Explore', icon: '🔍' },
        ]
      }
    ];

    // Venue section — only for VENUE_OWNER
    if (isVenueOwner) {
      sections.push({
        section: 'My Venue',
        items: [
          { path: '/venue/my-venues', label: 'My Venues',    icon: '🏟️' },
          { path: '/venue/create',    label: 'Create Venue', icon: '➕' },
        ]
      });
    }

    sections.push(
      {
        section: 'Carpooling',
        items: [
          { path: '/carpooling',           label: 'Browse Trips', icon: '🛣️' },
          { path: '/carpooling/create',    label: 'Create Trip',  icon: '➕' },
          { path: '/carpooling/my-trips',  label: 'My Trips',     icon: '🚗' },
          { path: '/carpooling/my-joined', label: 'Joined Trips', icon: '🎒' },
          { path: '/cars',                 label: 'My Cars',      icon: '🔧' },
        ]
      },
      {
        section: 'More',
        items: [
          { path: '/shop',    label: 'Shop',    icon: '🛍️' },
          { path: '/wallet',  label: 'Wallet',  icon: '💳' },
          { path: '/profile', label: 'Profile', icon: '👤' },
        ]
      }
    );

    return sections;
  }

  get userEmail(): string {
    return this.authService.getCurrentUser()?.email || 'user@street.com';
  }

  get userInitial(): string {
    return this.userEmail[0].toUpperCase();
  }

  get userRole(): string {
    return this.authService.getUserRole()?.replace('ROLE_', '') || 'PLAYER';
  }

  getTitle(): string {
    const all = this.menu.flatMap(s => s.items);
    return all.find(i => i.path === this.currentPath)?.label || 'Home';
  }

  constructor(private authService: AuthService, private router: Router) {
    this.currentPath = this.router.url || '/home';
  }

  logout() { this.authService.logout(); }
}