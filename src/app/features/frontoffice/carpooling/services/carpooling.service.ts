import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CarpoolingDTO } from '../models/carpooling.model';

@Injectable({ providedIn: 'root' })
export class CarpoolingService {
  private readonly BASE = `${environment.baseUrl}/carpoolings`;

  constructor(private http: HttpClient) {}

  create(dto: Partial<CarpoolingDTO>): Observable<CarpoolingDTO> {
    return this.http.post<CarpoolingDTO>(`${this.BASE}/create`, dto);
  }

  getAll(): Observable<CarpoolingDTO[]> {
    return this.http.get<CarpoolingDTO[]>(`${this.BASE}/all`);
  }

  getMyTrips(): Observable<CarpoolingDTO[]> {
    return this.http.get<CarpoolingDTO[]>(`${this.BASE}/my-trips`);
  }

  getMyJoined(): Observable<CarpoolingDTO[]> {
    return this.http.get<CarpoolingDTO[]>(`${this.BASE}/my-joined`);
  }

  getById(id: number): Observable<CarpoolingDTO> {
    return this.http.get<CarpoolingDTO>(`${this.BASE}/details/${id}`);
  }

  join(id: number): Observable<CarpoolingDTO> {
    return this.http.put<CarpoolingDTO>(`${this.BASE}/${id}/join`, {});
  }

  leave(id: number): Observable<CarpoolingDTO> {
    return this.http.put<CarpoolingDTO>(`${this.BASE}/${id}/leave`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}/delete`);
  }
}
