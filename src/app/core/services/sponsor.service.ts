import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AvailableTarget, SponsorProfile, Sponsorship, SponsorshipSubmitRequest, SponsorshipStats } from '../models/sponsor.model';

@Injectable({
  providedIn: 'root'
})
export class SponsorService {
  private readonly API_URL = `${environment.baseUrl}`;

  constructor(private http: HttpClient) {}

  // Sponsors
  getAllSponsors(): Observable<SponsorProfile[]> {
    return this.http.get<SponsorProfile[]>(`${this.API_URL}/sponsors`);
  }

  getMyProfile(): Observable<SponsorProfile> {
    return this.http.get<SponsorProfile>(`${this.API_URL}/sponsors/my-profile`);
  }

  updateProfile(profile: Partial<SponsorProfile>): Observable<SponsorProfile> {
    const profileData = {
      companyName: profile.companyName,
      logo: profile.logo,
      contactEmail: profile.contactEmail,
      budget: profile.budget
    };
    return this.http.put<SponsorProfile>(`${this.API_URL}/sponsors/update`, profileData);
  }

  deleteSponsor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/sponsors/admin/${id}`);
  }

  // Sponsorships - Public
  getSponsorship(id: number): Observable<Sponsorship> {
    return this.http.get<Sponsorship>(`${this.API_URL}/sponsorships/${id}`);
  }

  getSponsorshipsByTeam(teamId: number): Observable<Sponsorship[]> {
    return this.http.get<Sponsorship[]>(`${this.API_URL}/sponsorships/team/${teamId}`);
  }

  getSponsorshipsByEvent(eventId: number): Observable<Sponsorship[]> {
    return this.http.get<Sponsorship[]>(`${this.API_URL}/sponsorships/event/${eventId}`);
  }

  getSponsorshipsByVenue(venueId: number): Observable<Sponsorship[]> {
    return this.http.get<Sponsorship[]>(`${this.API_URL}/sponsorships/venue/${venueId}`);
  }

  getPendingSponsorships(): Observable<Sponsorship[]> {
    return this.http.get<Sponsorship[]>(`${this.API_URL}/sponsorships/pending`);
  }

  getActiveSponsorships(): Observable<Sponsorship[]> {
    return this.http.get<Sponsorship[]>(`${this.API_URL}/sponsorships/active`);
  }

  getAllSponsorships(): Observable<Sponsorship[]> {
    return this.http.get<Sponsorship[]>(`${this.API_URL}/sponsorships/admin/all`);
  }

  // Sponsorships - Sponsor Role
  submitSponsorship(request: SponsorshipSubmitRequest): Observable<Sponsorship> {
    return this.http.post<Sponsorship>(`${this.API_URL}/sponsorships/submit`, request);
  }

  getMySponsorships(): Observable<Sponsorship[]> {
    return this.http.get<Sponsorship[]>(`${this.API_URL}/sponsorships/my-sponsorships`);
  }

  renewSponsorship(id: number, months: number): Observable<Sponsorship> {
    return this.http.put<Sponsorship>(`${this.API_URL}/sponsorships/${id}/renew?months=${months}`, null);
  }

  uploadPaymentProof(id: number, proofUrl: string): Observable<Sponsorship> {
    return this.http.post<Sponsorship>(`${this.API_URL}/sponsorships/${id}/payment-proof?proofUrl=${proofUrl}`, null);
  }

  uploadPaymentProofFile(id: number, file: File): Observable<Sponsorship> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<Sponsorship>(`${this.API_URL}/sponsorships/${id}/payment-proof-file`, fd);
  }

  getAvailableTargets(): Observable<AvailableTarget[]> {
    return this.http.get<AvailableTarget[]>(`${this.API_URL}/sponsorships/available-targets`);
  }

  cancelSponsorship(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/sponsorships/${id}/cancel`);
  }

  // Sponsorships - Admin Role
  getAdminStats(): Observable<SponsorshipStats> {
    return this.http.get<SponsorshipStats>(`${this.API_URL}/sponsorships/admin/stats`);
  }

  approveSponsorship(id: number): Observable<Sponsorship> {
    return this.http.put<Sponsorship>(`${this.API_URL}/sponsorships/admin/${id}/approve`, null);
  }

  rejectSponsorship(id: number): Observable<Sponsorship> {
    return this.http.put<Sponsorship>(`${this.API_URL}/sponsorships/admin/${id}/reject`, null);
  }

  updateSponsorship(id: number, sponsorship: Partial<Sponsorship>): Observable<Sponsorship> {
    return this.http.put<Sponsorship>(`${this.API_URL}/sponsorships/admin/${id}`, sponsorship);
  }

  deleteSponsorship(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/sponsorships/admin/${id}`);
  }
}
