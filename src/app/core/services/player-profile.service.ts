import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlayerProfileDto {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  sportType: string;
  level: string;
  avgRating: number;
  fantasyPoints: number;
  goalsScored: number;
  assists: number;
  matchesPlayed: number;
}

@Injectable({ providedIn: 'root' })
export class PlayerProfileService {
  private base = 'http://localhost:8089/SpringSecurity/player-profiles';

  constructor(private http: HttpClient) {}

  getBySport(sport: string): Observable<PlayerProfileDto[]> {
    return this.http.get<PlayerProfileDto[]>(`${this.base}/sport/${sport}`);
  }
}