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
    .page { 
      min-height: 100vh; 
      background: linear-gradient(135deg, #0D6EFD 0%, #FF6B00 100%); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      padding: 20px; 
      position: relative;
      overflow: hidden;
    }
    .page::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0.1;
      background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.15) 10px, rgba(255,255,255,.15) 20px);
      pointer-events: none;
    }

    .container { width: 100%; max-width: 420px; }

    .logo-wrap { text-align: center; margin-bottom: 24px; }
    .logo-box { 
      display: inline-flex; 
      align-items: center; 
      justify-content: center; 
      width: 80px; 
      height: 80px; 
      background: white; 
      border-radius: 20px; 
      margin-bottom: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    }
    .logo-box img { height: 55px; width: 55px; object-fit: contain; }

    h1 { 
      font-size: 28px; 
      font-weight: 700; 
      color: white; 
      margin: 0 0 8px 0; 
      text-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .subtitle { 
      font-size: 15px; 
      color: rgba(255,255,255,0.9); 
      margin: 0; 
    }

    .card { 
      background: white; 
      border-radius: 28px; 
      box-shadow: 0 20px 60px rgba(0,0,0,0.15); 
      overflow: hidden;
    }

    .header {
      background: linear-gradient(to right, #0D6EFD, #FF6B00);
      padding: 32px 32px 24px;
      text-align: center;
    }

    .alert-error { 
      margin: 0 32px 16px; 
      padding: 14px 18px; 
      background: #fff2f2; 
      border: 1px solid #ffcdd2; 
      border-radius: 14px; 
      color: #c62828; 
      font-size: 14px; 
    }
    .alert-success { 
      margin: 0 32px 16px; 
      padding: 14px 18px; 
      background: #f1f8e9; 
      border: 1px solid #c5e1a5; 
      border-radius: 14px; 
      color: #2e7d32; 
      font-size: 14px; 
    }

    .content { padding: 32px; }

    .tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      background: #f5f5f7;
      padding: 6px;
      border-radius: 16px;
      margin-bottom: 24px;
    }
    .tab-btn {
      padding: 12px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn.active {
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      color: #1d1d1f;
    }

    .field { margin-bottom: 20px; }
    label { 
      display: block; 
      font-size: 13px; 
      font-weight: 600; 
      color: #6e6e73; 
      margin-bottom: 8px; 
      text-transform: uppercase; 
      letter-spacing: 0.03em;
    }
    input, select { 
      width: 100%; 
      padding: 14px 16px; 
      border: 1.5px solid #e0e0e5; 
      border-radius: 14px; 
      background: #fafafa; 
      font-size: 15px; 
      color: #1d1d1f; 
      outline: none; 
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus, select:focus { 
      border-color: #0D6EFD; 
      box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
    }

    .pass-wrap { position: relative; }
    .pass-wrap input { padding-right: 52px; }
    .eye-btn { 
      position: absolute; 
      right: 16px; 
      top: 50%; 
      transform: translateY(-50%); 
      background: none; 
      border: none; 
      cursor: pointer; 
      font-size: 18px; 
      color: #6e6e73; 
    }

    .btn-primary { 
      width: 100%; 
      padding: 16px; 
      background: linear-gradient(to right, #0D6EFD, #FF6B00); 
      color: white; 
      border: none; 
      border-radius: 14px; 
      font-size: 16px; 
      font-weight: 700; 
      cursor: pointer; 
      margin-top: 8px; 
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .btn-primary:hover { 
      transform: translateY(-1px);
      box-shadow: 0 10px 25px rgba(13, 110, 253, 0.3);
    }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

    .toggle-text { 
      text-align: center; 
      font-size: 14.5px; 
      color: rgba(255,255,255,0.85); 
      margin-top: 28px; 
    }
    .btn-toggle { 
      background: none; 
      border: none; 
      color: white; 
      font-weight: 700; 
      font-size: 14.5px; 
      cursor: pointer; 
      text-decoration: underline;
    }

    .icon-input {
      position: relative;
    }
    .icon-input input, .icon-input select {
      padding-left: 48px;
    }
    .icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 18px;
      color: #8e8e93;
      pointer-events: none;
    }
  `],
  template: `
    <div class="page">
      <div class="container">

        <div class="logo-wrap">
          <div class="logo-box">
            <img src="/logo.jpg" alt="StreetLeague">
          </div>
          <h1>StreetLeague</h1>
          <p class="subtitle">{{ isSignUp ? 'Join the game today' : 'Welcome back to the league' }}</p>
        </div>

        <div class="card">
          <!-- Tabs -->
          <div class="tabs">
            <button 
              class="tab-btn" 
              [class.active]="!isSignUp"
              (click)="isSignUp = false">
              🔑 Login
            </button>
            <button 
              class="tab-btn" 
              [class.active]="isSignUp"
              (click)="isSignUp = true">
              👤 Sign Up
            </button>
          </div>

          <div class="content">
            <div *ngIf="errorMessage" class="alert-error">{{ errorMessage }}</div>
            <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

            <form (ngSubmit)="handleSubmit()" class="space-y-5">

              <!-- Full Name -->
              <div *ngIf="isSignUp" class="field">
                <label>Full Name</label>
                <input [(ngModel)]="fullName" name="fullName" type="text" placeholder="John Doe" required>
              </div>

              <!-- Email -->
              <div class="field icon-input">
                <label>Email</label>
                <span class="icon">✉️</span>
                <input [(ngModel)]="email" name="email" type="email" placeholder="name@example.com" required>
              </div>

              <!-- Role -->
              <div *ngIf="isSignUp" class="field icon-input">
                <label>Role</label>
                <span class="icon">👥</span>
                <select [(ngModel)]="selectedRole" name="role" required>
                  <option value="">Select your role</option>
                  <option [value]="Role.ADMIN">Admin</option>
                  <option [value]="Role.PLAYER">Player</option>
                  <option [value]="Role.COACH">Coach</option>
                  <option [value]="Role.REFEREE">Referee</option>
                  <option [value]="Role.HEALTH_PROFESSIONAL">Health Professional</option>
                  <option [value]="Role.SPONSOR">Sponsor</option>
                  <option [value]="Role.VENUE_OWNER">Venue Owner</option>
                </select>
              </div>

              <!-- Player fields -->
              <div *ngIf="isSignUp && selectedRole === Role.PLAYER" class="field">
                <label>Date of Birth</label>
                <input [(ngModel)]="dateOfBirth" name="dateOfBirth" type="date">
              </div>

              <!-- Health Professional / Coach / Referee fields -->
              <div *ngIf="isSignUp && (selectedRole === Role.HEALTH_PROFESSIONAL || selectedRole === Role.REFEREE || selectedRole === Role.COACH)" class="space-y-5">
                <div class="field">
                  <label>Certificate</label>
                  <input [(ngModel)]="certificate" name="certificate" type="text" placeholder="Certificate name">
                </div>
                <div class="field">
                  <label>License Number</label>
                  <input [(ngModel)]="licenseNumber" name="licenseNumber" type="text" placeholder="License number">
                </div>
                <div class="field">
                  <label>Specialty</label>
                  <input [(ngModel)]="specialty" name="specialty" type="text" placeholder="Your specialty">
                </div>
                <div class="field">
                  <label>Experience (Years)</label>
                  <input [(ngModel)]="experienceYears" name="experienceYears" type="number" placeholder="Years of experience">
                </div>
              </div>

              <!-- Sponsor fields -->
              <div *ngIf="isSignUp && selectedRole === Role.SPONSOR" class="space-y-5">
                <div class="field">
                  <label>Company Name</label>
                  <input [(ngModel)]="companyName" name="companyName" type="text" placeholder="Company name">
                </div>
                <div class="field">
                  <label>Company Logo</label>
                  <div class="space-y-3">
                    <div *ngIf="logo" class="bg-gray-50 border border-gray-200 rounded-2xl p-3">
                      <p class="text-xs text-gray-500 mb-2">Preview</p>
                      <img [src]="logo" alt="Logo preview" class="h-20 w-20 rounded-2xl object-cover border">
                    </div>
                    <div class="flex gap-3">
                      <label class="cursor-pointer flex-1 text-center bg-white border-2 border-gray-200 hover:border-[#0D6EFD] text-gray-700 py-3 rounded-2xl font-medium text-sm transition-colors">
                        {{ isLogoUploading ? 'Uploading...' : 'Upload Image' }}
                        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" [disabled]="isLogoUploading" (change)="onSponsorLogoFileSelected($event)">
                      </label>
                      <button *ngIf="logo" type="button" (click)="clearSponsorLogo()" class="px-5 text-red-600 hover:text-red-700 font-medium">
                        Remove
                      </button>
                    </div>
                    <input [(ngModel)]="logo" name="logo" type="text" placeholder="Or paste image URL" class="w-full">
                  </div>
                </div>
                <div class="field">
                  <label>Contact Email</label>
                  <input [(ngModel)]="contactEmail" name="contactEmail" type="email" placeholder="contact@company.com">
                </div>
                <div class="field">
                  <label>Budget</label>
                  <input [(ngModel)]="budget" name="budget" type="number" placeholder="Budget amount">
                </div>
              </div>

              <!-- Venue Owner fields -->
              <div *ngIf="isSignUp && selectedRole === Role.VENUE_OWNER" class="space-y-5">
                <div class="field">
                  <label>Company Name</label>
                  <input [(ngModel)]="companyName" name="companyName" type="text" placeholder="Company name">
                </div>
                <div class="field">
                  <label>Phone</label>
                  <input [(ngModel)]="phone" name="phone" type="tel" placeholder="+216 XX XXX XXX">
                </div>
              </div>

              <!-- Password -->
              <div class="field">
                <label>Password</label>
                <div class="pass-wrap">
                  <input [(ngModel)]="password" name="password" 
                         [type]="showPassword ? 'text' : 'password'" 
                         placeholder="••••••••" 
                         required minlength="6">
                  <button type="button" class="eye-btn" (click)="showPassword = !showPassword">
                    {{ showPassword ? '🙈' : '👁️' }}
                  </button>
                </div>
              </div>

              <button type="submit" class="btn-primary" [disabled]="loading || isLogoUploading">
                {{ loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In') }}
              </button>

            </form>
          </div>
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

  // Role-specific fields
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
  isLogoUploading = false;

  private readonly allowedLogoMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private cdr: ChangeDetectorRef
  ) {}

  handleSubmit() {
    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    if (this.isSignUp && this.isLogoUploading) {
      this.loading = false;
      this.errorMessage = 'Please wait until logo upload finishes.';
      this.cdr.detectChanges();
      return;
    }

    if (this.isSignUp) {
      const registerData: RegisterRequest = {
        fullName: this.fullName,
        email: this.email,
        password: this.password,
        role: this.selectedRole as Role
      };

      // Add role-specific data
      if (this.selectedRole === Role.PLAYER && this.dateOfBirth) {
        registerData.dateOfBirth = this.dateOfBirth;
      }
      if ([Role.HEALTH_PROFESSIONAL, Role.REFEREE, Role.COACH].includes(this.selectedRole as Role)) {
        if (this.certificate) registerData.certificate = this.certificate;
        if (this.licenseNumber) registerData.licenseNumber = this.licenseNumber;
        if (this.specialty) registerData.specialty = this.specialty;
        if (this.experienceYears !== null) registerData.experienceYears = this.experienceYears;
      }
      if (this.selectedRole === Role.SPONSOR) {
        if (this.companyName) registerData.companyName = this.companyName;
        if (this.logo) registerData.logo = this.logo;
        if (this.contactEmail) registerData.contactEmail = this.contactEmail;
        if (this.budget !== null) registerData.budget = this.budget;
      }
      if (this.selectedRole === Role.VENUE_OWNER) {
        if (this.companyName) registerData.companyName = this.companyName;
        if (this.phone) registerData.phone = this.phone;
      }

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
          this.errorMessage = error.status === 0 
            ? 'Cannot connect to server.' 
            : (typeof error.error === 'string' ? error.error : error.error?.message || 'Registration failed');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.authService.login(this.email, this.password).subscribe({
        next: (response) => {
          this.loading = false;
          const role = response.role.replace('ROLE_', '');
          if (role === 'ADMIN' || role === 'VENUE_OWNER') {
            this.router.navigate(['/backoffice']);
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.status === 401 
            ? 'Invalid email or password.' 
            : 'Login failed. Please try again.';
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
    this.fullName = '';
    this.email = '';
    this.password = '';
    this.selectedRole = '';
    this.dateOfBirth = '';
    this.certificate = '';
    this.licenseNumber = '';
    this.specialty = '';
    this.experienceYears = null;
    this.companyName = '';
    this.logo = '';
    this.contactEmail = '';
    this.budget = null;
    this.phone = '';
  }

  // Sponsor Logo Upload Methods
  onSponsorLogoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!this.allowedLogoMimeTypes.includes(file.type)) {
      this.errorMessage = 'Invalid format. Only PNG, JPG, WEBP, GIF allowed.';
      this.cdr.detectChanges();
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.errorMessage = 'Logo must be smaller than 2MB.';
      this.cdr.detectChanges();
      return;
    }

    this.isLogoUploading = true;
    this.authService.uploadSponsorLogoFile(file).subscribe({
      next: (res) => {
        this.logo = this.extractLogoUrl(res);
        this.isLogoUploading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to upload logo. Please try again.';
        this.isLogoUploading = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearSponsorLogo(): void {
    this.logo = '';
    this.cdr.detectChanges();
  }

  private extractLogoUrl(response: any): string {
    if (!response) return '';
    if (typeof response === 'string') return response;
    return response.imageUrl || response.logoUrl || response.url || '';
  }
}