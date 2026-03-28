import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { VenueOwnerWithVenuesDTO } from '../models/venue-owner.model';
import { VenueDTO } from '../../../frontoffice/venue/models/venue.model';

@Injectable({
  providedIn: 'root'
})
export class AdminVenueService {
  private readonly OWNERS_URL = `${environment.baseUrl}/api/admin/owners`;
  private readonly VENUES_URL = `${environment.baseUrl}/api/admin/venues`;

  constructor(private http: HttpClient) {}

  getAllVenues(): Observable<VenueDTO[]> {
    return this.http.get<VenueDTO[]>(this.VENUES_URL);
  }

  getAllOwnersWithVenues(): Observable<VenueOwnerWithVenuesDTO[]> {
    return this.http.get<VenueOwnerWithVenuesDTO[]>(this.OWNERS_URL);
  }

  getOwnerWithVenues(ownerId: number): Observable<VenueOwnerWithVenuesDTO> {
    return this.http.get<VenueOwnerWithVenuesDTO>(`${this.OWNERS_URL}/${ownerId}`);
  }

  verifyOwner(ownerId: number): Observable<void> {
    return this.http.put<void>(`${this.OWNERS_URL}/${ownerId}/verify`, {});
  }

  unverifyOwner(ownerId: number): Observable<void> {
    return this.http.put<void>(`${this.OWNERS_URL}/${ownerId}/unverify`, {});
  }

  deleteOwner(ownerId: number): Observable<void> {
    return this.http.delete<void>(`${this.OWNERS_URL}/${ownerId}/delete`);
  }

  createVenueForOwner(ownerId: number, venue: Partial<VenueDTO>): Observable<VenueDTO> {
    return this.http.post<VenueDTO>(`${this.VENUES_URL}/owner/${ownerId}`, venue);
  }

  updateVenue(venueId: number, ownerId: number, venue: Partial<VenueDTO>): Observable<VenueDTO> {
    return this.http.put<VenueDTO>(`${this.VENUES_URL}/${venueId}/owner/${ownerId}`, venue);
  }

  deleteVenue(venueId: number, ownerId: number): Observable<void> {
    return this.http.delete<void>(`${this.VENUES_URL}/${venueId}/owner/${ownerId}`);
  }
}
