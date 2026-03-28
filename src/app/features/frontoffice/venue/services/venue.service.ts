import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { VenueDTO } from '../models/venue.model';

@Injectable({
  providedIn: 'root'
})
export class VenueService {
  private readonly BASE_URL = `${environment.baseUrl}/venue`;

  constructor(private http: HttpClient) {}

  getMyVenues(): Observable<VenueDTO[]> {
    return this.http.get<VenueDTO[]>(`${this.BASE_URL}/my-venues`);
  }

  getVenueDetails(id: number): Observable<VenueDTO> {
    return this.http.get<VenueDTO>(`${this.BASE_URL}/details/${id}`);
  }

  createVenue(venue: Partial<VenueDTO>): Observable<VenueDTO> {
    return this.http.post<VenueDTO>(`${this.BASE_URL}/create`, venue);
  }

  updateVenue(id: number, venue: Partial<VenueDTO>): Observable<VenueDTO> {
    return this.http.put<VenueDTO>(`${this.BASE_URL}/update/${id}`, venue);
  }

  deleteVenue(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/delete/${id}`);
  }
}
