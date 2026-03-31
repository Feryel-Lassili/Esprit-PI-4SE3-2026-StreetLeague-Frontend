import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminVenueService } from '../../services/admin-venue.service';
import { VenueOwnerWithVenuesDTO } from '../../models/venue-owner.model';
import { VenueDTO } from '../../../../frontoffice/venue/models/venue.model';

@Component({
  selector: 'app-owner-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './owner-details.component.html'
})
export class OwnerDetailsComponent implements OnInit {
  owner: VenueOwnerWithVenuesDTO | null = null;
  loading = true;
  error: string | null = null;
  actionLoading: number | null = null;

  // Inline edit modal state
  editingVenue: VenueDTO | null = null;
  isAdding = false;
  editForm: FormGroup;
  editSaving = false;
  editError: string | null = null;

  sportTypes = [
    { label: 'Football', value: 'FOOTBALL' },
    { label: 'Basketball', value: 'BASKETBALL' },
    { label: 'Tennis', value: 'TENNIS' },
    { label: 'Volleyball', value: 'VOLLEYBALL' },
    { label: 'Handball', value: 'HANDBALL' }
  ];

  constructor(
    private adminVenueService: AdminVenueService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      name:         ['', [Validators.required, Validators.minLength(3)]],
      address:      ['', [Validators.required]],
      pricePerHour: [null, [Validators.required, Validators.min(1)]],
      capacity:     [null, [Validators.required, Validators.min(1)]],
      sportType:    ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const ownerId = Number(this.route.snapshot.paramMap.get('ownerId'));
    this.loadOwner(ownerId);
  }

  loadOwner(ownerId: number): void {
    this.loading = true;
    this.adminVenueService.getOwnerWithVenues(ownerId).subscribe({
      next: data => { this.owner = data; this.loading = false; },
      error: err => {
        this.error = err?.error?.message || 'Failed to load owner details.';
        this.loading = false;
      }
    });
  }

  get ef() { return this.editForm.controls; }

  openEditVenue(venue: VenueDTO): void {
    this.editingVenue = venue;
    this.isAdding = false;
    this.editError = null;
    this.editForm.patchValue(venue);
  }

  openAddVenue(): void {
    this.editingVenue = null;
    this.isAdding = true;
    this.editError = null;
    this.editForm.reset();
  }

  closeEdit(): void {
    this.editingVenue = null;
    this.isAdding = false;
    this.editError = null;
    this.editForm.reset();
  }

  saveVenueEdit(): void {
    if (this.editForm.invalid) { this.editForm.markAllAsTouched(); return; }
    
    this.editSaving = true;
    this.editError = null;
    
    if (this.isAdding) {
      if (!this.owner) return;
      this.adminVenueService.createVenueForOwner(this.owner.ownerId, this.editForm.value).subscribe({
        next: () => {
          this.editSaving = false;
          this.closeEdit();
          this.loadOwner(this.owner!.ownerId);
        },
        error: err => {
          this.editError = err?.error?.message || 'Create failed.';
          this.editSaving = false;
        }
      });
    } else {
      if (!this.editingVenue) return;
      this.adminVenueService.updateVenue(this.editingVenue.id, this.owner!.ownerId, this.editForm.value).subscribe({
        next: () => {
          this.editSaving = false;
          this.closeEdit();
          this.loadOwner(this.owner!.ownerId);
        },
        error: err => {
          this.editError = err?.error?.message || 'Update failed.';
          this.editSaving = false;
        }
      });
    }
  }

  deleteVenue(venueId: number): void {
    if (!confirm('Delete this venue?')) return;
    this.actionLoading = venueId;
    this.adminVenueService.deleteVenue(venueId, this.owner!.ownerId).subscribe({
      next: () => {
        this.actionLoading = null;
        this.loadOwner(this.owner!.ownerId);
      },
      error: err => {
        this.actionLoading = null;
        alert(err?.error?.message || 'Delete failed.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/backoffice/venue-management/owners']);
  }
}
