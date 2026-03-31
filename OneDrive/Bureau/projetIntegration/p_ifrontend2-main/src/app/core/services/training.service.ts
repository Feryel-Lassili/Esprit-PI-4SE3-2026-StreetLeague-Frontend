import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class TrainingService {

  constructor(private api: ApiService) {}

  getAll() {
    return this.api.get('trainings');
  }

  create(training: any, eventId?: number, coachId?: number) {
    return this.api.post(
      `trainings?eventId=${eventId ?? ''}&coachId=${coachId ?? ''}`,
      training
    );
  }

  join(trainingId: number, playerId: number) {
    return this.api.post(
      `trainings/join?trainingId=${trainingId}&playerId=${playerId}`,
      {}
    );
  }

  leave(trainingId: number, playerId: number) {
    return this.api.post(
      `trainings/leave?trainingId=${trainingId}&playerId=${playerId}`,
      {}
    );
  }
}