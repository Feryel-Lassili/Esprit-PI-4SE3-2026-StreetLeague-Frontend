import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminVenueService } from '../../services/admin-venue.service';
import { VenueOwnerWithVenuesDTO } from '../../models/venue-owner.model';

@Component({
  selector: 'app-owners-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owners-list.component.html'
})
export class OwnersListComponent implements OnInit {
  owners: VenueOwnerWithVenuesDTO[] = [];
  loading = true;
  error: string | null = null;
  actionLoading: number | null = null;

  constructor(private adminVenueService: AdminVenueService, private router: Router) {}

  ngOnInit(): void {
    this.loadOwners();
  }

  loadOwners(): void {
    this.loading = true;
    this.error = null;
    this.adminVenueService.getAllOwnersWithVenues().subscribe({
      next: data => { this.owners = data; this.loading = false; },
      error: err => {
        this.error = err?.error?.message || 'Failed to load owners.';
        this.loading = false;
      }
    });
  }

  verifyOwner(ownerId: number): void {
    this.actionLoading = ownerId;
    this.adminVenueService.verifyOwner(ownerId).subscribe({
      next: () => { this.actionLoading = null; this.loadOwners(); },
      error: err => { this.actionLoading = null; alert(err?.error?.message || 'Action failed.'); }
    });
  }

  unverifyOwner(ownerId: number): void {
    this.actionLoading = ownerId;
    this.adminVenueService.unverifyOwner(ownerId).subscribe({
      next: () => { this.actionLoading = null; this.loadOwners(); },
      error: err => { this.actionLoading = null; alert(err?.error?.message || 'Action failed.'); }
    });
  }

  deleteOwner(ownerId: number): void {
    if (!confirm('Are you sure you want to delete this owner and all their venues?')) return;
    this.actionLoading = ownerId;
    this.adminVenueService.deleteOwner(ownerId).subscribe({
      next: () => { this.actionLoading = null; this.loadOwners(); },
      error: err => { this.actionLoading = null; alert(err?.error?.message || 'Delete failed.'); }
    });
  }

  viewOwner(ownerId: number): void {
    this.router.navigate(['/backoffice/venue-management/owners', ownerId]);
  }
}
