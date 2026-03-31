import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

export interface Training {
  id?: number;
  title: string;
  coach: string;
  date: string;
  duration: number;
  location: string;
}

@Component({
  selector: 'app-training-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './training-list.component.html',
  styleUrls: ['./training-list.component.scss']
})
export class TrainingListComponent implements OnInit {
  trainings: Training[] = [];
  showForm = false;
  isEditing = false;
  current: Training = { title: '', coach: '', date: '', duration: 60, location: '' };

  constructor(private api: ApiService) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.get<Training[]>('/api/trainings').subscribe((data: Training[]) => this.trainings = data);
  }

  openAdd() {
    this.current = { title: '', coach: '', date: '', duration: 60, location: '' };
    this.isEditing = false;
    this.showForm = true;
  }

  openEdit(t: Training) {
    this.current = { ...t };
    this.isEditing = true;
    this.showForm = true;
  }

  save() {
    if (this.isEditing) {
      this.api.put(`/api/trainings/${this.current.id}`, this.current).subscribe(() => { this.load(); this.showForm = false; });
    } else {
      this.api.post('/api/trainings', this.current).subscribe(() => { this.load(); this.showForm = false; });
    }
  }

  delete(id: number) {
    if (confirm('Supprimer cet entraînement ?')) {
      this.api.delete(`/api/trainings/${id}`).subscribe(() => this.load());
    }
  }

  cancel() { this.showForm = false; }
}