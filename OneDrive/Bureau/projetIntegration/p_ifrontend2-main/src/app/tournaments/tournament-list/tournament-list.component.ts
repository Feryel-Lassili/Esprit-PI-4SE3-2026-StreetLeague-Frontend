import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

export interface Tournament {
  id?: number;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  maxTeams: number;
}

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tournament-list.component.html',
  styleUrls: ['./tournament-list.component.scss']
})
export class TournamentListComponent implements OnInit {
  tournaments: Tournament[] = [];
  showForm = false;
  isEditing = false;
  current: Tournament = { name: '', startDate: '', endDate: '', location: '', maxTeams: 8 };

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.get<Tournament[]>('/api/tournaments').subscribe((data: Tournament[]) => this.tournaments = data);
  }

  openAdd() {
    this.current = { name: '', startDate: '', endDate: '', location: '', maxTeams: 8 };
    this.isEditing = false;
    this.showForm = true;
  }

  openEdit(t: Tournament) {
    this.current = { ...t };
    this.isEditing = true;
    this.showForm = true;
  }

  save() {
    if (this.isEditing) {
      this.api.put(`/api/tournaments/${this.current.id}`, this.current).subscribe(() => { this.load(); this.showForm = false; });
    } else {
      this.api.post('/api/tournaments', this.current).subscribe(() => { this.load(); this.showForm = false; });
    }
  }

  delete(id: number) {
    if (confirm('Supprimer ce tournoi ?')) {
      this.api.delete(`/api/tournaments/${id}`).subscribe(() => this.load());
    }
  }

  cancel() { this.showForm = false; }
}
