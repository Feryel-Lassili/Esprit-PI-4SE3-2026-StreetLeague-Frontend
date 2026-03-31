import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CarpoolingService } from '../../services/carpooling.service';
import { CarpoolingDTO } from '../../models/carpooling.model';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-trip-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trip-details.component.html'
})
export class TripDetailsComponent implements OnInit {
  trip: CarpoolingDTO | null = null;
  loading = true;
  error: string | null = null;

  constructor(private svc: CarpoolingService, private route: ActivatedRoute, private router: Router, private authService: AuthService) {}

  get isJoined(): boolean {
    if (!this.trip || !this.trip.participantEmails) return false;
    const myEmail = this.authService.getCurrentUser()?.email;
    return myEmail ? this.trip.participantEmails.includes(myEmail) : false;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getById(id).subscribe({
      next: d => { this.trip = d; this.loading = false; },
      error: e => { this.error = e?.error?.message || 'Failed to load trip.'; this.loading = false; }
    });
  }

  join(): void {
    if (!this.trip) return;
    this.svc.join(this.trip.id).subscribe({ next: d => this.trip = d, error: e => alert(e?.error?.message || 'Join failed.') });
  }

  leave(): void {
    if (!this.trip) return;
    this.svc.leave(this.trip.id).subscribe({ next: d => this.trip = d, error: e => alert(e?.error?.message || 'Leave failed.') });
  }

  goBack(): void { this.router.navigate(['/carpooling']); }
}
