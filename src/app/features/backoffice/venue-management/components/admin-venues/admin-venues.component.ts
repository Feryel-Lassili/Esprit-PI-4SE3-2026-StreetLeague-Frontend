import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminVenueService } from '../../services/admin-venue.service';
import { VenueOwnerWithVenuesDTO } from '../../models/venue-owner.model';
import { VenueDTO } from '../../../../frontoffice/venue/models/venue.model';

interface VenueCard {
  venue: VenueDTO;
  ownerUsername: string;
  ownerEmail: string;
  ownerPhone: string;
  companyName: string;
  ownerId: number;
}

@Component({
  selector: 'app-admin-venues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-venues.component.html'
})
export class AdminVenuesComponent implements OnInit {
  venueCards: VenueCard[] = [];
  filtered: VenueCard[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';

  sportEmojis: Record<string, string> = {
    FOOTBALL: '⚽',
    BASKETBALL: '🏀',
    VOLLEYBALL: '🏐',
    TENNIS: '🎾',
    HANDBALL: '🤾',
  };

  constructor(private adminVenueService: AdminVenueService, private router: Router) {}

  ngOnInit(): void {
    this.loadVenues();
  }

  loadVenues(): void {
    this.loading = true;
    this.error = null;
    this.adminVenueService.getAllOwnersWithVenues().subscribe({
      next: (owners: VenueOwnerWithVenuesDTO[]) => {
        this.venueCards = owners.flatMap(owner =>
          owner.venues.map(venue => ({
            venue,
            ownerUsername: owner.ownerUsername,
            ownerEmail: owner.ownerEmail,
            ownerPhone: owner.ownerPhone,
            companyName: owner.companyName,
            ownerId: owner.ownerId
          }))
        );
        this.filtered = [...this.venueCards];
        this.loading = false;
      },
      error: err => {
        this.error = err?.error?.message || 'Failed to load venues.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase();
    this.filtered = this.venueCards.filter(c =>
      c.venue.name.toLowerCase().includes(q) ||
      c.venue.address.toLowerCase().includes(q) ||
      c.ownerUsername.toLowerCase().includes(q) ||
      c.venue.sportType.toLowerCase().includes(q)
    );
  }

  sportEmoji(type: string): string {
    return this.sportEmojis[type] ?? '🏟️';
  }

  deleteVenue(venueId: number, ownerId: number): void {
    if (!confirm('Delete this venue?')) return;
    this.adminVenueService.deleteVenue(venueId, ownerId).subscribe({
      next: () => this.loadVenues(),
      error: err => alert(err?.error?.message || 'Delete failed.')
    });
  }

  editVenue(ownerId: number): void {
    this.router.navigate(['/backoffice/venue-management/owners', ownerId]);
  }
}
