import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PredictionDto {
  virtualTeamId: number;
  captainPlayerId: number;
  players: PlayerPredictionEntryDto[];
}

export interface PlayerPredictionEntryDto {
  playerId: number;
  playerName: string;
  playerPosition: string;
  playerRating: number;
}

export interface PredictionResponse {
  id: number;
  virtualTeamId: number;
  weekNumber: number;
  weekYear: number;
  captainPlayerId: number;
  status: 'PENDING' | 'RESOLVED';
  totalPointsEarned: number;
  createdAt: string;
  playerPredictions: PlayerPredictionResponse[];
}

export interface PlayerPredictionResponse {
  id: number;
  playerId: number;
  playerName: string;
  playerPosition: string;
  playerRating: number;
  isCaptain: boolean;
  goalsScored: number;
  yellowCards: number;
  redCards: number;
  basketballPoints: number;
  tennisWin: boolean;
  result: 'PENDING' | 'CORRECT' | 'PARTIAL' | 'WRONG';
  pointsEarned: number;
}

@Injectable({ providedIn: 'root' })
export class PredictionService {
  private base = 'http://localhost:8089/SpringSecurity/predictions';

  constructor(private http: HttpClient) {}

  submit(dto: PredictionDto): Observable<PredictionResponse> {
    return this.http.post<PredictionResponse>(`${this.base}/submit`, dto);
  }

  getCurrent(virtualTeamId: number): Observable<PredictionResponse> {
    return this.http.get<PredictionResponse>(`${this.base}/current/${virtualTeamId}`);
  }

  getHistory(virtualTeamId: number): Observable<PredictionResponse[]> {
    return this.http.get<PredictionResponse[]>(`${this.base}/history/${virtualTeamId}`);
  }
}