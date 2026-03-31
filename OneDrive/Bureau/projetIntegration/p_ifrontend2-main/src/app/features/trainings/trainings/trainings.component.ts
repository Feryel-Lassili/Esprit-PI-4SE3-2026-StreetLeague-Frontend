import { Component, OnInit } from '@angular/core';
import { TrainingService } from '../../../core/services/training.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';  
import { FormsModule } from '@angular/forms';    
@Component({
  selector: 'app-trainings',
  standalone: true,
  templateUrl: './trainings.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./trainings.component.scss']
})
export class TrainingsComponent implements OnInit {

  trainings: any[] = [];
  playerId = 1;

  newTraining = {
    title: '',
    location: '',
    description: '',
    maxParticipants: 5,
    date: new Date().toISOString()
  };

  constructor(
    private trainingService: TrainingService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTrainings();
  }

  loadTrainings() {
    this.trainingService.getAll().subscribe((res: any) => {
      this.trainings = res;
    });
  }

  createTraining() {
    this.trainingService.create(this.newTraining, undefined, 3).subscribe(() => {
      this.loadTrainings();
    });
  }

  join(id: number) {
    this.trainingService.join(id, this.playerId).subscribe();
  }

  leave(id: number) {
    this.trainingService.leave(id, this.playerId).subscribe();
  }
}