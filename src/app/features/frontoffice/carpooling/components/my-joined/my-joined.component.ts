import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarpoolingService } from '../../services/carpooling.service';
import { CarpoolingDTO } from '../../models/carpooling.model';

@Component({
  selector: 'app-my-joined',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-joined.component.html'
})
export class MyJoinedComponent implements OnInit {
  trips: CarpoolingDTO[] = [];
  loading = true;
  error: string | null = null;

  constructor(private svc: CarpoolingService, private router: Router) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = null;
    this.svc.getMyJoined().subscribe({
      next: d => { this.trips = d; this.loading = false; },
      error: e => { this.error = e?.error?.message || 'Failed to load.'; this.loading = false; }
    });
  }

  leaveTrip(id: number): void {
    if (!confirm('Leave this trip?')) return;
    this.svc.leave(id).subscribe({ next: () => this.load(), error: e => alert(e?.error?.message || 'Leave failed.') });
  }

  details(id: number): void { this.router.navigate(['/carpooling/details', id]); }
}
