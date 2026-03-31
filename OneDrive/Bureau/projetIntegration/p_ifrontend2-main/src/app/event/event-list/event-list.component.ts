import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

export interface Event {
  id?: number;
  name: string;
  description: string;
  date: string;
  location: string;
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent implements OnInit {
  events: Event[] = [];
  showForm = false;
  isEditing = false;
  current: Event = { name: '', description: '', date: '', location: '' };

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.get<Event[]>('/api/events').subscribe((data: Event[]) => this.events = data);
  }

  openAdd() {
    this.current = { name: '', description: '', date: '', location: '' };
    this.isEditing = false;
    this.showForm = true;
  }

  openEdit(e: Event) {
    this.current = { ...e };
    this.isEditing = true;
    this.showForm = true;
  }

  save() {
    if (this.isEditing) {
      this.api.put(`/api/events/${this.current.id}`, this.current).subscribe(() => { this.load(); this.showForm = false; });
    } else {
      this.api.post('/api/events', this.current).subscribe(() => { this.load(); this.showForm = false; });
    }
  }

  delete(id: number) {
    if (confirm('Supprimer cet événement ?')) {
      this.api.delete(`/api/events/${id}`).subscribe(() => this.load());
    }
  }

  cancel() { this.showForm = false; }
}
