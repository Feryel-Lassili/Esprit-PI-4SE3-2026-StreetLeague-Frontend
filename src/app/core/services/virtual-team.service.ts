import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type SportType = 'FOOTBALL' | 'BASKETBALL' | 'TENNIS';

export interface VirtualTeamDto {
  sportType: SportType;
  name?: string;
  userId: number;
  playerIds: number[];
  earnedPoints?: number;
  weekPoints?: number;
}

export interface VirtualTeamResponse {
  id: number;
  name: string;
  sportType: SportType;
  earnedPoints: number;
  weekPoints: number;
  userId: number;
  playerIds: number[]; // ← AJOUTÉ
}

@Injectable({ providedIn: 'root' })
export class VirtualTeamService {

  private readonly BASE = 'http://localhost:8089/SpringSecurity/virtual-teams';

  constructor(private http: HttpClient) {}

  createTeam(dto: VirtualTeamDto): Observable<VirtualTeamResponse> {
    return this.http.post<VirtualTeamResponse>(this.BASE, dto);
  }

  updateTeam(id: number, dto: VirtualTeamDto): Observable<VirtualTeamResponse> {
    return this.http.put<VirtualTeamResponse>(`${this.BASE}/${id}`, dto);
  }

  deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }

  getTeam(id: number): Observable<VirtualTeamResponse> {
    return this.http.get<VirtualTeamResponse>(`${this.BASE}/${id}`);
  }

  getAllTeams(): Observable<VirtualTeamResponse[]> {
    return this.http.get<VirtualTeamResponse[]>(this.BASE);
  }

  getTeamsByUser(userId: number): Observable<VirtualTeamResponse[]> {
    return this.http.get<VirtualTeamResponse[]>(`${this.BASE}/user/${userId}`);
  }
}