import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { SponsorService } from '../../../core/services/sponsor.service';
import { environment } from '../../../../environments/environment';
import {
  CoachProfile,
  PlayerProfile,
  SponsorProfile
} from '../../../core/models/sponsor.model';

@Component({
  selector: 'fo-profile',
  standalone: false,
  template: `
    <div class="max-w-4xl mx-auto">
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h1 class="text-3xl font-black text-gray-900 mb-6">👤 My Profile</h1>
        
        <div *ngIf="loading" class="text-center py-8 text-gray-500">Loading profile...</div>
        <div *ngIf="error" class="bg-red-50 text-red-600 p-4 rounded-xl mb-4">{{error}}</div>
        
        <div *ngIf="profile" class="space-y-6">
          <div class="border-b border-gray-200 pb-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">User Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-600">Username</label>
                <p class="text-lg font-semibold text-gray-900">{{profile.user.username}}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Email</label>
                <p class="text-lg font-semibold text-gray-900">{{profile.user.email}}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Role</label>
                <p class="text-lg font-semibold text-[#0D6EFD]">{{profile.user.role}}</p>
              </div>
              <div *ngIf="profile.user.phone">
                <label class="text-sm font-medium text-gray-600">Phone</label>
                <p class="text-lg font-semibold text-gray-900">{{profile.user.phone}}</p>
              </div>
            </div>
          </div>

          <div *ngIf="isSponsor && sponsorProfile" class="border-b border-gray-200 pb-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Sponsor Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-600">Company Name</label>
                <p class="text-lg font-semibold text-gray-900">{{sponsorProfile.companyName}}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Contact Email</label>
                <p class="text-lg font-semibold text-gray-900">{{sponsorProfile.contactEmail}}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Budget</label>
                <p class="text-2xl font-black text-[#32CD32]">\${{sponsorProfile.budget}}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Logo</label>
                <div class="w-16 h-16 bg-gradient-to-br from-[#FFD60A] to-[#FF6B00] rounded-2xl flex items-center justify-center text-3xl">
                  <img *ngIf="getLogoSrc(sponsorProfile.logo) as logoSrc; else profileFallbackLogo"
                       [src]="logoSrc"
                       alt="Sponsor logo"
                       class="w-full h-full rounded-2xl object-cover">
                  <ng-template #profileFallbackLogo>🏢</ng-template>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="isCoach && coachProfile" class="border-b border-gray-200 pb-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Coach Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-600">Certificate</label>
                <p class="text-lg font-semibold text-gray-900">{{coachProfile.certificate}}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Specialty</label>
                <p class="text-lg font-semibold text-gray-900">{{coachProfile.specialty}}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Experience</label>
                <p class="text-lg font-semibold text-gray-900">{{coachProfile.experienceYears}} years</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Verified</label>
                <p class="text-lg font-semibold" [class.text-green-600]="coachProfile.verified" [class.text-gray-400]="!coachProfile.verified">
                  {{coachProfile.verified ? '✓ Verified' : '✗ Not Verified'}}
                </p>
              </div>
            </div>
          </div>

          <div *ngIf="isPlayer && playerProfile" class="border-b border-gray-200 pb-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Player Details</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-600">Date of Birth</label>
                <p class="text-lg font-semibold text-gray-900">{{playerProfile.dateOfBirth | date}}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-600">Level</label>
                <p class="text-lg font-semibold text-[#0D6EFD]">{{playerProfile.level}}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  profile: any = null;
  sponsorProfile: SponsorProfile | null = null;
  coachProfile: CoachProfile | null = null;
  playerProfile: PlayerProfile | null = null;
  
  loading = false;
  error = '';
  
  isSponsor = false;
  isCoach = false;
  isPlayer = false;
  private readonly apiBaseUrl = environment.baseUrl;
  private readonly apiOrigin = new URL(environment.baseUrl).origin;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private sponsorService: SponsorService
  ) {}

  ngOnInit() {
    this.isSponsor = this.authService.hasRole('SPONSOR');
    this.isCoach = this.authService.hasRole('COACH');
    this.isPlayer = this.authService.hasRole('PLAYER');
    
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.error = '';
    
    if (this.isSponsor) {
      this.sponsorService.getMyProfile().subscribe({
        next: (data: any) => {
        },
        error: (err: any) => {
          this.error = 'Failed to load profile';
          this.loading = false;
        }
      });
    } else if (this.isCoach) {
      this.profileService.getCoachProfile().subscribe({
        next: (data: any) => {
          this.profile = data;
          this.coachProfile = data;
          this.loading = false;
        },
        error: (err: any) => {
          this.error = 'Failed to load profile';
          this.loading = false;
        }
      });
    } else if (this.isPlayer) {
      this.profileService.getPlayerProfile().subscribe({
        next: (data: any) => {
          this.profile = data;
          this.playerProfile = data;
          this.loading = false;
        },
        error: (err: any) => {
          this.error = 'Failed to load profile';
          this.loading = false;
        }
      });
    }
  }

  getLogoSrc(logo?: string | null): string {
    const value = (logo ?? '').trim();
    if (!value || value === '🏢') return '';
    if (value.startsWith('data:image')) return value;
    if (/^https?:\/\//i.test(value)) return value;
    if (/^localhost:/i.test(value)) return `http://${value}`;
    if (/^lhost:/i.test(value)) return `http://localhost:${value.substring('lhost:'.length)}`;
    if (value.startsWith('/SpringSecurity/')) return `${this.apiOrigin}${value}`;
    if (value.startsWith('/uploads/')) return `${this.apiOrigin}/SpringSecurity${value}`;
    if (value.startsWith('uploads/')) return `${this.apiOrigin}/SpringSecurity/${value}`;
    if (value.startsWith('/')) return `${this.apiOrigin}${value}`;
    return `${this.apiBaseUrl}/${value.replace(/^\/+/, '')}`;
  }
}
