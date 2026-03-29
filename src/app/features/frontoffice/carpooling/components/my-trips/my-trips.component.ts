import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarpoolingService } from '../../services/carpooling.service';
import { CarpoolingDTO } from '../../models/carpooling.model';

@Component({
  selector: 'app-my-trips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-trips.component.html'
})
export class MyTripsComponent implements OnInit {
  trips: CarpoolingDTO[] = [];
  loading = true;
  error: string | null = null;

  constructor(private svc: CarpoolingService, private router: Router) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = null;
    this.svc.getMyTrips().subscribe({
      next: d => { this.trips = d; this.loading = false; },
      error: e => { this.error = e?.error?.message || 'Failed to load.'; this.loading = false; }
    });
  }

  deleteTrip(id: number): void {
    if (!confirm('Delete this trip?')) return;
    this.svc.delete(id).subscribe({ next: () => this.load(), error: e => alert(e?.error?.message || 'Delete failed.') });
  }

  details(id: number): void { this.router.navigate(['/carpooling/details', id]); }
  createNew(): void { this.router.navigate(['/carpooling/create']); }
}
