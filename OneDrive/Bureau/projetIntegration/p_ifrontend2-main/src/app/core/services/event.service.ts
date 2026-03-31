import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class EventService {

  constructor(private api: ApiService) {}

  getAll() {
    return this.api.get('events');
  }

  create(event: any) {
    return this.api.post('events', event);
  }
}