import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TournamentService {

  constructor(private api: ApiService) {}

  getAll() {
    return this.api.get('tournaments');
  }

  create(tournament: any) {
    return this.api.post('tournaments', tournament);
  }

  addMatch(tournamentId: number, matchId: number) {
    return this.api.post(
      `tournaments/${tournamentId}/match/${matchId}`,
      {}
    );
  }
}