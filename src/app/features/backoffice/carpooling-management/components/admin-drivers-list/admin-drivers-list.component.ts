import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminCarpoolingService } from '../../services/admin-carpooling.service';
import { DriverWithCarsAndCarpoolingsDTO } from '../../../../frontoffice/carpooling/models/carpooling.model';

@Component({
  selector: 'app-admin-drivers-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-drivers-list.component.html'
})
export class AdminDriversListComponent implements OnInit {
  drivers: DriverWithCarsAndCarpoolingsDTO[] = [];
  filtered: DriverWithCarsAndCarpoolingsDTO[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';

  constructor(private svc: AdminCarpoolingService, private router: Router) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true; this.error = null;
    this.svc.getAllDrivers().subscribe({
      next: d => { this.drivers = d; this.filtered = [...d]; this.loading = false; },
      error: e => { this.error = e?.error?.message || 'Failed to load drivers.'; this.loading = false; }
    });
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase();
    this.filtered = this.drivers.filter(d =>
      d.driverUsername.toLowerCase().includes(q) || d.driverEmail.toLowerCase().includes(q)
    );
  }

  viewDriver(id: number): void { this.router.navigate(['/backoffice/carpooling-management/drivers', id]); }

  totalCars(d: DriverWithCarsAndCarpoolingsDTO): number { return d.cars?.length || 0; }
  totalTrips(d: DriverWithCarsAndCarpoolingsDTO): number { return d.cars?.reduce((sum, c) => sum + (c.carpoolings?.length || 0), 0) || 0; }
}
