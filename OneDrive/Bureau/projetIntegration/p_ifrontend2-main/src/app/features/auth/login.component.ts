import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Role, RegisterRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styles: [`
    * { box-sizing: border-box; }
    .page { min-height: 100vh; background: #f5f5f7; display: flex; align-items: center; justify-content: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; }
    .container { width: 100%; max-width: 400px; }
    .logo-wrap { text-align: center; margin-bottom: 32px; }
    .logo-box { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; background: #000; border-radius: 18px; margin-bottom: 16px; }
    .logo-box span { color: white; font-size: 24px; font-weight: 700; }
    h1 { font-size: 24px; font-weight: 600; color: #1d1d1f; margin: 0 0 4px 0; }
    .subtitle { font-size: 14px; color: #6e6e73; margin: 0; }
    .card { background: white; border-radius: 20px; border: 1px solid #e0e0e5; padding: 32px; }
    .alert-error { margin-bottom: 16px; padding: 12px 16px; background: #fff2f2; border: 1px solid #ffcdd2; border-radius: 12px; color: #c62828; font-size: 14px; }
    .alert-success { margin-bottom: 16px; padding: 12px 16px; background: #f1f8e9; border: 1px solid #c5e1a5; border-radius: 12px; color: #2e7d32; font-size: 14px; }
    .field { margin-bottom: 16px; }
    .field-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    label { display: block; font-size: 11px; font-weight: 600; color: #6e6e73; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
    input, select { width: 100%; padding: 12px 16px; border: 1.5px solid #e0e0e5; border-radius: 12px; background: #fafafa; font-size: 15px; color: #1d1d1f; outline: none; transition: border-color 0.2s; }
    input:focus, select:focus { border-color: #000; }
    .pass-wrap { position: relative; }
    .pass-wrap input { padding-right: 48px; }
    .eye-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 16px; color: #6e6e73; }
    .forgot { font-size: 13px; color: #0071e3; text-decoration: none; }
    .btn-primary { width: 100%; padding: 14px; background: #000; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: 8px; transition: background 0.2s; }
    .btn-primary:hover { background: #333; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
    .divider-line { flex: 1; height: 1px; background: #e0e0e5; }
    .divider-text { font-size: 12px; color: #aeaeb2; }
    .social-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .btn-social { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 11px; border: 1.5px solid #e0e0e5; border-radius: 12px; background: white; font-size: 14px; color: #1d1d1f; cursor: pointer; }
    .toggle-text { text-align: center; font-size: 14px; color: #6e6e73; margin-top: 24px; }
    .btn-toggle { background: none; border: none; color: #000; font-weight: 600; font-size: 14px; cursor: pointer; text-decoration: underline; margin-left: 4px; }
  `],
  template: `
    <div class="page">
      <div class="container">

        <div class="logo-wrap">
          <div class="logo-box"><span>S</span></div>
          <h1>{{ isSignUp ? 'Create account' : 'Sign in' }}</h1>
          <p class="subtitle">{{ isSignUp ? 'Join StreetLeague today' : 'to continue to StreetLeague' }}</p>
        </div>

        <div class="card">
          <div *ngIf="errorMessage" class="alert-error">{{ errorMessage }}</div>
          <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

          <div *ngIf="isSignUp" class="field">
            <label>Full Name</label>
            <input [(ngModel)]="fullName" name="fullName" type="text" placeholder="John Doe">
          </div>

          <div class="field">
            <label>Email</label>
            <input [(ngModel)]="email" name="email" type="email" placeholder="name@example.com">
          </div>

          <div *ngIf="isSignUp" class="field">
            <label>Role</label>
            <select [(ngModel)]="selectedRole" name="role">
              <option value="">Select a role</option>
              <option [value]="Role.ADMIN">Admin</option>
              <option [value]="Role.PLAYER">Player</option>
              <option [value]="Role.COACH">Coach</option>
              <option [value]="Role.REFEREE">Referee</option>
              <option [value]="Role.HEALTH_PROFESSIONAL">Health Professional</option>
              <option [value]="Role.SPONSOR">Sponsor</option>
              <option [value]="Role.VENUE_OWNER">Venue Owner</option>
            </select>
          </div>

          <div class="field">
            <div class="field-row">
              <label style="margin:0">Password</label>
              <a *ngIf="!isSignUp" href="#" class="forgot">Forgot password?</a>
            </div>
            <div class="pass-wrap">
              <input [(ngModel)]="password" name="password" [type]="showPassword ? 'text' : 'password'" placeholder="••••••••">
              <button type="button" class="eye-btn" (click)="showPassword = !showPassword">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <button class="btn-primary" (click)="handleSubmit()" [disabled]="loading">
            {{ loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In') }}
          </button>

          
        </div>

        <p class="toggle-text">
          {{ isSignUp ? 'Already have an account?' : "Don't have an account?" }}
          <button class="btn-toggle" (click)="toggleMode()">
            {{ isSignUp ? 'Sign in' : 'Sign up' }}
          </button>
        </p>

      </div>
    </div>
  `
})
export class LoginComponent {
  isSignUp = false;
  showPassword = false;
  email = '';
  password = '';
  fullName = '';
  selectedRole: Role | '' = '';
  loading = false;
  errorMessage = '';
  successMessage = '';
  Role = Role;
  dateOfBirth = '';
  certificate = '';
  licenseNumber = '';
  specialty = '';
  experienceYears: number | null = null;
  companyName = '';
  logo = '';
  contactEmail = '';
  budget: number | null = null;
  phone = '';

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  handleSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    if (this.isSignUp) {
      const registerData: RegisterRequest = {
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        role: this.selectedRole as Role
      };
      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.successMessage = response;
          this.loading = false;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.isSignUp = false;
            this.successMessage = '';
            this.resetForm();
            this.cdr.detectChanges();
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.status === 0 ? 'Cannot connect to server.' : (error.error || error.message || 'Registration failed');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.authService.login(this.email, this.password).subscribe({
        next: (response) => {
          this.loading = false;
          const role = response.role.replace('ROLE_', '');
          if (role === 'ADMIN' || role === 'VENUE_OWNER') this.router.navigate(['/backoffice']);
          else this.router.navigate(['/']);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.status === 401 ? 'Invalid email or password.' : 'Login failed. Please try again.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  toggleMode() {
    this.isSignUp = !this.isSignUp;
    this.errorMessage = '';
    this.successMessage = '';
    this.resetForm();
  }

  resetForm() {
    this.fullName = ''; this.email = ''; this.password = ''; this.selectedRole = '';
    this.dateOfBirth = ''; this.certificate = ''; this.licenseNumber = '';
    this.specialty = ''; this.experienceYears = null; this.companyName = '';
    this.logo = ''; this.contactEmail = ''; this.budget = null; this.phone = '';
  }
}