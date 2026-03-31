import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VenueService } from '../../services/venue.service';

@Component({
  selector: 'app-update-venue',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './update-venue.component.html'
})
export class UpdateVenueComponent implements OnInit {
  form: FormGroup;
  venueId!: number;
  loading = true;
  saving = false;
  error: string | null = null;
  success = false;

  sportTypes = [
    { label: 'Football', value: 'FOOTBALL' },
    { label: 'Basketball', value: 'BASKETBALL' },
    { label: 'Tennis', value: 'TENNIS' },
    { label: 'Volleyball', value: 'VOLLEYBALL' },
    { label: 'Handball', value: 'HANDBALL' }
  ];

  constructor(
    private fb: FormBuilder,
    private venueService: VenueService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name:         ['', [Validators.required, Validators.minLength(3)]],
      address:      ['', [Validators.required]],
      pricePerHour: [null, [Validators.required, Validators.min(1)]],
      capacity:     [null, [Validators.required, Validators.min(1)]],
      sportType:    ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.venueId = Number(this.route.snapshot.paramMap.get('id'));
    this.venueService.getVenueDetails(this.venueId).subscribe({
      next: venue => {
        this.form.patchValue(venue);
        this.loading = false;
      },
      error: err => {
        this.error = err?.error?.message || 'Failed to load venue.';
        this.loading = false;
      }
    });
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    this.error = null;
    this.venueService.updateVenue(this.venueId, this.form.value).subscribe({
      next: () => {
        this.success = true;
        this.saving = false;
        setTimeout(() => this.router.navigate(['/venue/my-venues']), 1500);
      },
      error: err => {
        this.error = err?.error?.message || 'Failed to update venue.';
        this.saving = false;
      }
    });
  }
}
