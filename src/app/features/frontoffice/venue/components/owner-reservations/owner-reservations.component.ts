import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VenueService } from '../../services/venue.service';
import { VenueDTO, ReservationDTO } from '../../models/venue.model';

@Component({
  selector: 'app-owner-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-reservations.component.html',
  styleUrls: ['./owner-reservations.component.scss']
})
export class OwnerReservationsComponent implements OnInit {

  tab: 'reservations' | 'blocks' = 'reservations';

  reservations: ReservationDTO[] = [];
  loading = false;

  myVenues: VenueDTO[] = [];
  venueFilter = 'ALL';

  blocks: ReservationDTO[] = [];
  blocksLoading = false;

  blockForm: { venueId: number | null; start: string; duration: number; reason: string } = {
    venueId: null, start: '', duration: 2, reason: ''
  };
  blockError = '';
  blockLoading = false;

  toastVisible = false;
  toastMsg = '';
  toastColor = '#16a34a';

  constructor(private venueService: VenueService) {}

  ngOnInit(): void {
    this.loadReservations();
    this.loadMyVenues();
    this.loadBlocks();
  }

  loadReservations(): void {
    this.loading = true;
    this.venueService.getOwnerReservations().subscribe({
      next: data => { this.reservations = data; this.loading = false; },
      error: ()   => { this.loading = false; }
    });
  }

  loadMyVenues(): void {
    this.venueService.getMyVenues().subscribe({
      next: data => { this.myVenues = data; },
      error: () => {}
    });
  }

  loadBlocks(): void {
    this.blocksLoading = true;
    this.venueService.getOwnerBlocks().subscribe({
      next: data => { this.blocks = data; this.blocksLoading = false; },
      error: ()   => { this.blocksLoading = false; }
    });
  }

  get filteredReservations(): ReservationDTO[] {
    if (this.venueFilter === 'ALL') return this.reservations;
    return this.reservations.filter(r => r.venueId?.toString() === this.venueFilter);
  }

  countByStatus(status: string): number {
    return this.reservations.filter(r => r.status === status).length;
  }

  totalRevenue(): number {
    return this.reservations
      .filter(r => r.status === 'CONFIRMED' || r.status === 'COMPLETED')
      .reduce((s, r) => s + (r.price || 0), 0);
  }

  confirmReservation(r: ReservationDTO): void {
    this.venueService.ownerConfirmReservation(r.id).subscribe({
      next: () => { r.status = 'CONFIRMED'; this.showToast('✅ Reservation confirmed', '#2e7d32'); },
      error: err => this.showToast('❌ ' + (err?.error?.message || 'Error'), '#c62828')
    });
  }

  cancelReservation(r: ReservationDTO): void {
    if (!confirm('Cancel this reservation? The slot will become available again.')) return;
    this.venueService.ownerCancelReservation(r.id).subscribe({
      next: () => { r.status = 'CANCELLED'; this.showToast('Reservation cancelled', '#6b7280'); },
      error: err => this.showToast('❌ ' + (err?.error?.message || 'Error'), '#c62828')
    });
  }

  addBlock(): void {
    if (!this.blockForm.venueId) { this.blockError = 'Please select a venue.'; return; }
    if (!this.blockForm.start)   { this.blockError = 'Please pick a start date/time.'; return; }
    this.blockError = '';
    this.blockLoading = true;
    const iso = this.blockForm.start.replace('T', 'T') + ':00';
    this.venueService.blockPeriod(
      this.blockForm.venueId,
      iso,
      this.blockForm.duration,
      this.blockForm.reason
    ).subscribe({
      next: b => {
        this.blocks.unshift(b);
        this.blockLoading = false;
        this.blockForm = { venueId: null, start: '', duration: 2, reason: '' };
        this.showToast('🚫 Period blocked', '#6a1b9a');
      },
      error: err => {
        this.blockError = err?.error?.message || 'Failed to block period.';
        this.blockLoading = false;
      }
    });
  }

  deleteBlock(b: ReservationDTO): void {
    if (!confirm('Remove this blocked period?')) return;
    this.venueService.removeBlock(b.id).subscribe({
      next: () => {
        this.blocks = this.blocks.filter(x => x.id !== b.id);
        this.showToast('Block removed', '#6b7280');
      },
      error: () => this.showToast('Failed to remove block', '#c62828')
    });
  }

  showToast(msg: string, color: string): void {
    this.toastMsg = msg; this.toastColor = color; this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3500);
  }
}
