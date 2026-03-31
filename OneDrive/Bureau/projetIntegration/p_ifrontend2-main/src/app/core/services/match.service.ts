import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class MatchService {

  constructor(private api: ApiService) {}

  getAll() {
    return this.api.get('matches');
  }

  create(match: any, eventId?: number, tournamentId?: number) {
    return this.api.post(
      `matches?eventId=${eventId ?? ''}&tournamentId=${tournamentId ?? ''}`,
      match
    );
  }

  join(matchId: number, playerId: number) {
    return this.api.post(
      `matches/join?matchId=${matchId}&playerId=${playerId}`,
      {}
    );
  }

  leave(matchId: number, playerId: number) {
    return this.api.post(
      `matches/leave?matchId=${matchId}&playerId=${playerId}`,
      {}
    );
  }

   delete(matchId: number) {
    return this.api.delete(`matches/${matchId}`);
  }
}