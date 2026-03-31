import { Component, OnInit } from '@angular/core';

// 🔥 AJOUTER CES IMPORTS
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-events',
  standalone: true,
  templateUrl: './events.component.html',

  // ✔ maintenant ça marche
  imports: [CommonModule, FormsModule],

  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {

  events: any[] = [];

  newEvent = {
    title: '',
    location: '',
    description: '',
    date: new Date().toISOString()
  };

  constructor(
    private eventService: EventService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents() {
    this.eventService.getAll().subscribe((res: any) => {
      this.events = res;
    });
  }

  createEvent() {
    this.eventService.create(this.newEvent).subscribe(() => {
      this.loadEvents();
    });
  }
}