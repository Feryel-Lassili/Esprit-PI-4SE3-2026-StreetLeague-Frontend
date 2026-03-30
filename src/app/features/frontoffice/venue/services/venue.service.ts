import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { VenueDTO, ReservationDTO } from '../models/venue.model';

@Injectable({ providedIn: 'root' })
export class VenueService {
  private readonly BASE = `${environment.baseUrl}/venue`;
  private readonly RES  = `${environment.baseUrl}/reservations`;

  constructor(private http: HttpClient) {}

  // ── Venue Owner ──────────────────────────────────────────────────────────
  getMyVenues(): Observable<VenueDTO[]> {
    return this.http.get<VenueDTO[]>(`${this.BASE}/my-venues`);
  }
  getVenueDetails(id: number): Observable<VenueDTO> {
    return this.http.get<VenueDTO>(`${this.BASE}/details/${id}`);
  }
  createVenue(venue: Partial<VenueDTO>): Observable<VenueDTO> {
    return this.http.post<VenueDTO>(`${this.BASE}/create`, venue);
  }
  updateVenue(id: number, venue: Partial<VenueDTO>): Observable<VenueDTO> {
    return this.http.put<VenueDTO>(`${this.BASE}/update/${id}`, venue);
  }
  deleteVenue(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/delete/${id}`);
  }

  // ── Public (player) ──────────────────────────────────────────────────────
  getVerifiedVenues(): Observable<VenueDTO[]> {
    return this.http.get<VenueDTO[]>(`${this.RES}/venues`);
  }
  getAllVenues(): Observable<VenueDTO[]> {
    return this.http.get<VenueDTO[]>(`${this.BASE}/all`);
  }
  getVenueReservations(venueId: number): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(`${this.RES}/venue/${venueId}`);
  }

  // ── Venue Owner reservations ─────────────────────────────────────────────
  getOwnerReservations(): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(`${this.RES}/owner/my`);
  }
  ownerConfirmReservation(id: number): Observable<void> {
    return this.http.put<void>(`${this.RES}/owner/${id}/confirm`, {});
  }
  ownerCancelReservation(id: number): Observable<void> {
    return this.http.put<void>(`${this.RES}/owner/${id}/cancel`, {});
  }
  blockPeriod(venueId: number, start: string, duration: number, reason: string): Observable<ReservationDTO> {
    return this.http.post<ReservationDTO>(`${this.RES}/owner/block`, { venueId, start, duration, reason });
  }
  removeBlock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.RES}/owner/block/${id}`);
  }
  getOwnerBlocks(): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(`${this.RES}/owner/blocks`);
  }
  uploadVenuePhoto(venueId: number, file: File): Observable<{ photoUrl: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ photoUrl: string }>(`${this.BASE}/${venueId}/upload-photo`, fd);
  }

  // ── Reservations (player) ────────────────────────────────────────────────
  book(venueId: number, date: string, duration: number): Observable<ReservationDTO> {
    return this.http.post<ReservationDTO>(`${this.RES}/book`, { venueId, date, duration });
  }
  getMyReservations(): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(`${this.RES}/my`);
  }
  cancelMyReservation(id: number): Observable<void> {
    return this.http.put<void>(`${this.RES}/${id}/cancel`, {});
  }

  // ── Admin reservations ───────────────────────────────────────────────────
  getAllReservations(): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(`${this.RES}/admin/all`);
  }
  confirmReservation(id: number): Observable<void> {
    return this.http.put<void>(`${this.RES}/admin/${id}/confirm`, {});
  }
  adminCancelReservation(id: number): Observable<void> {
    return this.http.put<void>(`${this.RES}/admin/${id}/cancel`, {});
  }
  verifyVenue(id: number): Observable<void> {
    return this.http.put<void>(`${this.RES}/admin/venues/${id}/verify`, {});
  }
  unverifyVenue(id: number): Observable<void> {
    return this.http.put<void>(`${this.RES}/admin/venues/${id}/unverify`, {});
  }

  // ── Admin venues (all) ───────────────────────────────────────────────────
  getAllVenuesAdmin(): Observable<VenueDTO[]> {
    return this.http.get<VenueDTO[]>(`${environment.baseUrl}/api/admin/venues`);
  }
}
