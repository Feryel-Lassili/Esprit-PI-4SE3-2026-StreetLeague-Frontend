import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CoachProfile,
  PlayerProfile,
  RefereeProfile,
  HealthProfessionalProfile,
  SponsorProfile,
  VenueOwnerProfile,
  AdminProfile
} from '../models/sponsor.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly API_URL = `${environment.baseUrl}`;

  constructor(private http: HttpClient) {}

  // Coach Profile
  getCoachProfile(): Observable<CoachProfile> {
    return this.http.get<CoachProfile>(`${this.API_URL}/coaches/my-profile`);
  }

  updateCoachProfile(profile: Partial<CoachProfile>): Observable<CoachProfile> {
    const data = {
      certificate: profile.certificate,
      experienceYears: profile.experienceYears,
      specialty: profile.specialty
    };
    return this.http.put<CoachProfile>(`${this.API_URL}/coaches/update`, data);
  }

  // Player Profile
  getPlayerProfile(): Observable<PlayerProfile> {
    return this.http.get<PlayerProfile>(`${this.API_URL}/players/my-profile`);
  }

  updatePlayerProfile(profile: Partial<PlayerProfile>): Observable<PlayerProfile> {
    const data = {
      dateOfBirth: profile.dateOfBirth,
      level: profile.level
    };
    return this.http.put<PlayerProfile>(`${this.API_URL}/players/update`, data);
  }

  // Referee Profile
  getRefereeProfile(): Observable<RefereeProfile> {
    return this.http.get<RefereeProfile>(`${this.API_URL}/referees/my-profile`);
  }

  updateRefereeProfile(profile: Partial<RefereeProfile>): Observable<RefereeProfile> {
    const data = {
      certificate: profile.certificate,
      experienceYears: profile.experienceYears,
      licenseNumber: profile.licenseNumber
    };
    return this.http.put<RefereeProfile>(`${this.API_URL}/referees/update`, data);
  }

  // Health Professional Profile
  getHealthProfessionalProfile(): Observable<HealthProfessionalProfile> {
    return this.http.get<HealthProfessionalProfile>(`${this.API_URL}/health-professionals/my-profile`);
  }

  updateHealthProfessionalProfile(profile: Partial<HealthProfessionalProfile>): Observable<HealthProfessionalProfile> {
    const data = {
      certificate: profile.certificate,
      specialty: profile.specialty,
      licenseNumber: profile.licenseNumber
    };
    return this.http.put<HealthProfessionalProfile>(`${this.API_URL}/health-professionals/update`, data);
  }

  // Venue Owner Profile
  getVenueOwnerProfile(): Observable<VenueOwnerProfile> {
    return this.http.get<VenueOwnerProfile>(`${this.API_URL}/venue-owners/my-profile`);
  }

  updateVenueOwnerProfile(profile: Partial<VenueOwnerProfile>): Observable<VenueOwnerProfile> {
    const data = {
      companyName: profile.companyName,
      phone: profile.phone
    };
    return this.http.put<VenueOwnerProfile>(`${this.API_URL}/venue-owners/update`, data);
  }

  // Admin Profile
  getAdminProfile(): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(`${this.API_URL}/admins/my-profile`);
  }
}
