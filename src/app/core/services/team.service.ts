import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private apiUrl = `${environment.baseUrl}/api/teams`;

  constructor(private http: HttpClient) {}

  // ── CRUD ──────────────────────────────────────────────────────────────────

  getAllTeams(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getTeamById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createTeam(payload: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  updateTeam(id: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload);
  }

  deleteTeam(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ── My teams ──────────────────────────────────────────────────────────────

  getMyTeams(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my/${userId}`);
  }

  // ── Join requests ─────────────────────────────────────────────────────────

  requestJoin(teamId: number, playerId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${teamId}/request/${playerId}`, {});
  }

  invitePlayer(teamId: number, playerId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${teamId}/invite/${playerId}`, {});
  }

  getPendingRequests(teamId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${teamId}/requests`);
  }

  getMyInvitations(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/invitations/${userId}`);
  }

  acceptRequest(requestId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/requests/${requestId}/accept`, {});
  }

  refuseRequest(requestId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/requests/${requestId}/refuse`, {});
  }

  // ── Captain management ────────────────────────────────────────────────────

  transferCaptain(teamId: number, newCaptainId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${teamId}/captain/${newCaptainId}`, {});
  }

  removePlayer(teamId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${teamId}/players/${userId}`);
  }

  // ── Players list ──────────────────────────────────────────────────────────

  getAllPlayers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/players`);
  }
}
