import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VenueService } from '../../services/venue.service';
import { VenueDTO } from '../../models/venue.model';

@Component({
  selector: 'app-my-venues',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-venues.component.html'
})
export class MyVenuesComponent implements OnInit {
  venues: VenueDTO[] = [];
  loading = true;
  error: string | null = null;

  constructor(private venueService: VenueService, private router: Router) {}

  ngOnInit(): void {
    this.loadVenues();
  }

  loadVenues(): void {
    this.loading = true;
    this.error = null;
    this.venueService.getMyVenues().subscribe({
      next: data => { this.venues = data; this.loading = false; },
      error: err => {
        this.error = err?.error?.message || 'Failed to load venues.';
        this.loading = false;
      }
    });
  }

  deleteVenue(id: number): void {
    if (!confirm('Are you sure you want to delete this venue?')) return;
    this.venueService.deleteVenue(id).subscribe({
      next: () => this.loadVenues(),
      error: err => alert(err?.error?.message || 'Delete failed.')
    });
  }

  viewDetails(id: number): void {
    this.router.navigate(['/venue/details', id]);
  }

  editVenue(id: number): void {
    this.router.navigate(['/venue/update', id]);
  }
}
