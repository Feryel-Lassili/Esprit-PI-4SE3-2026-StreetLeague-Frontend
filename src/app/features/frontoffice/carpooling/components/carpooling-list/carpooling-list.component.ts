import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarpoolingService } from '../../services/carpooling.service';
import { CarpoolingDTO } from '../../models/carpooling.model';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-carpooling-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carpooling-list.component.html'
})
export class CarpoolingListComponent implements OnInit {
  trips: CarpoolingDTO[] = [];
  filtered: CarpoolingDTO[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';

  constructor(private carpoolingService: CarpoolingService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void { this.loadTrips(); }

  loadTrips(): void {
    this.loading = true; this.error = null;
    this.carpoolingService.getAll().subscribe({
      next: data => { this.trips = data; this.filtered = [...data]; this.loading = false; },
      error: err => { this.error = err?.error?.message || 'Failed to load trips.'; this.loading = false; }
    });
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase();
    this.filtered = this.trips.filter(t =>
      (t.departureLocation && t.departureLocation.toLowerCase().includes(q)) || 
      (t.arrivalLocation && t.arrivalLocation.toLowerCase().includes(q)) || 
      t.driverUsername.toLowerCase().includes(q) || 
      t.carModel.toLowerCase().includes(q)
    );
  }

  isJoined(trip: CarpoolingDTO): boolean {
    if (!trip || !trip.participantEmails) return false;
    const myEmail = this.authService.getCurrentUser()?.email;
    return myEmail ? trip.participantEmails.includes(myEmail) : false;
  }

  joinTrip(id: number): void {
    this.carpoolingService.join(id).subscribe({
      next: () => this.loadTrips(),
      error: err => alert(err?.error?.message || 'Join failed.')
    });
  }

  viewDetails(id: number): void {
    this.router.navigate(['/carpooling/details', id]);
  }
}
