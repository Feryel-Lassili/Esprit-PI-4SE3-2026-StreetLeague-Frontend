import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminCarpoolingService } from '../../services/admin-carpooling.service';
import { DriverWithCarsAndCarpoolingsDTO } from '../../../../frontoffice/carpooling/models/carpooling.model';

@Component({
  selector: 'app-admin-driver-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-driver-details.component.html'
})
export class AdminDriverDetailsComponent implements OnInit {
  driver: DriverWithCarsAndCarpoolingsDTO | null = null;
  loading = true;
  error: string | null = null;

  constructor(private svc: AdminCarpoolingService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.loadDriver();
  }

  loadDriver(): void {
    const id = Number(this.route.snapshot.paramMap.get('driverId'));
    this.loading = true;
    this.svc.getDriver(id).subscribe({
      next: d => { this.driver = d; this.loading = false; },
      error: e => { this.error = e?.error?.message || 'Failed to load driver.'; this.loading = false; }
    });
  }

  deleteCar(carId: number): void {
    if (!confirm('Are you sure you want to delete this car? All associated trips will also be removed.')) return;
    this.svc.deleteCar(carId).subscribe({
      next: () => this.loadDriver(),
      error: e => alert(e?.error?.message || 'Failed to delete car.')
    });
  }

  deleteTrip(tripId: number): void {
    if (!confirm('Are you sure you want to delete this carpooling trip?')) return;
    this.svc.deleteCarpooling(tripId).subscribe({
      next: () => this.loadDriver(),
      error: e => alert(e?.error?.message || 'Failed to delete trip.')
    });
  }

  goBack(): void { this.router.navigate(['/backoffice/carpooling-management/drivers']); }
}
