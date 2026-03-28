import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VenueService } from '../../services/venue.service';
import { VenueDTO } from '../../models/venue.model';

@Component({
  selector: 'app-venue-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './venue-details.component.html'
})
export class VenueDetailsComponent implements OnInit {
  venue: VenueDTO | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private venueService: VenueService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.venueService.getVenueDetails(id).subscribe({
      next: data => { this.venue = data; this.loading = false; },
      error: err => {
        this.error = err?.error?.message || 'Failed to load venue details.';
        this.loading = false;
      }
    });
  }

  editVenue(): void {
    if (this.venue) this.router.navigate(['/venue/update', this.venue.id]);
  }
}
