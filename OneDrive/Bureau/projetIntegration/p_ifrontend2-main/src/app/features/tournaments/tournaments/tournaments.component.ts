import { Component, OnInit } from '@angular/core';
import { TournamentService } from '../../../core/services/tournament.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-tournaments',
  standalone: true,
  templateUrl: './tournaments.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./tournaments.component.scss']
})
export class TournamentsComponent implements OnInit {

  tournaments: any[] = [];

  newTournament = {
    name: '',
    phase: '',
    numberOfTeams: 2,
    prize: 0
  };

  constructor(
    private tournamentService: TournamentService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.tournamentService.getAll().subscribe((res: any) => {
      this.tournaments = res;
    });
  }

  create() {
    this.tournamentService.create(this.newTournament).subscribe(() => {
      this.load();
    });
  }
}
