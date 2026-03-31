import { Component, OnInit } from '@angular/core';
import { MatchService } from '../../../core/services/match.service';
import { AuthService } from '../../../core/services/auth.service';
 import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-matches',
  standalone: true,
  templateUrl: './matches.component.html',
  imports: [CommonModule, FormsModule],
  styleUrls: ['./matches.component.scss']
})
export class MatchesComponent implements OnInit {

  matches: any[] = [];
  playerId = 1; // à remplacer par user réel plus tard

  constructor(
    private matchService: MatchService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadMatches();
  }

  loadMatches() {
    this.matchService.getAll().subscribe((res: any) => {
      this.matches = res;
    });
  }

  joinMatch(id: number) {
    this.matchService.join(id, this.playerId).subscribe();
  }

  leaveMatch(id: number) {
    this.matchService.leave(id, this.playerId).subscribe();
  }

  deleteMatch(id: number) {
    this.matchService.delete(id).subscribe(() => this.loadMatches());
  }
}
