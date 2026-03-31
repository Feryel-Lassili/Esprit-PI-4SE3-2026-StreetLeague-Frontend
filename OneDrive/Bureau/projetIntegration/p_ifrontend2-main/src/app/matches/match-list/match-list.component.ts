import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

export interface Match {
  id?: number;
  homeTeam: string;
  awayTeam: string;
  date: string;
  score: string;
  location: string;
}

@Component({
  selector: 'app-match-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.scss']
})
export class MatchListComponent implements OnInit {
  matches: Match[] = [];
  showForm = false;
  isEditing = false;
  current: Match = { homeTeam: '', awayTeam: '', date: '', score: '', location: '' };

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.get<Match[]>('/api/matches').subscribe((data: Match[]) => this.matches = data);
  }

  openAdd() {
    this.current = { homeTeam: '', awayTeam: '', date: '', score: '', location: '' };
    this.isEditing = false;
    this.showForm = true;
  }

  openEdit(m: Match) {
    this.current = { ...m };
    this.isEditing = true;
    this.showForm = true;
  }

  save() {
    if (this.isEditing) {
      this.api.put(`/api/matches/${this.current.id}`, this.current).subscribe(() => { this.load(); this.showForm = false; });
    } else {
      this.api.post('/api/matches', this.current).subscribe(() => { this.load(); this.showForm = false; });
    }
  }

  delete(id: number) {
    if (confirm('Supprimer ce match ?')) {
      this.api.delete(`/api/matches/${id}`).subscribe(() => this.load());
    }
  }

  cancel() { this.showForm = false; }
}