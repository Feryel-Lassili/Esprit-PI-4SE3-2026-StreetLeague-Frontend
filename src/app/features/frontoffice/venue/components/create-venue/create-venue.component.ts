import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VenueService } from '../../services/venue.service';

@Component({
  selector: 'app-create-venue',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-venue.component.html'
})
export class CreateVenueComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;

  sportTypes = [
    { label: 'Football', value: 'FOOTBALL' },
    { label: 'Basketball', value: 'BASKETBALL' },
    { label: 'Tennis', value: 'TENNIS' },
    { label: 'Volleyball', value: 'VOLLEYBALL' },
    { label: 'Handball', value: 'HANDBALL' }
  ];

  constructor(private fb: FormBuilder, private venueService: VenueService, private router: Router) {
    this.form = this.fb.group({
      name:         ['', [Validators.required, Validators.minLength(3)]],
      address:      ['', [Validators.required]],
      pricePerHour: [null, [Validators.required, Validators.min(1)]],
      capacity:     [null, [Validators.required, Validators.min(1)]],
      sportType:    ['', [Validators.required]]
    });
  }

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error = null;
    
    console.log('Sending venue payload:', this.form.value);

    this.venueService.createVenue(this.form.value).subscribe({
      next: (response) => {
        console.log('Venue created successfully:', response);
        this.success = true;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/venue/my-venues']), 1500);
      },
      error: err => {
        console.error('API Error during venue creation:', err);
        if (err.status === 403) {
          this.error = 'Accès refusé : vous devez être connecté en tant que propriétaire de salle pour créer un venue.';
        } else {
          const detailedError = err?.error?.message || err?.message || JSON.stringify(err?.error) || 'Unknown backend error';
          this.error = `HTTP ${err.status}: ${detailedError}`;
        }
        this.loading = false;
      }
    });
  }
}
