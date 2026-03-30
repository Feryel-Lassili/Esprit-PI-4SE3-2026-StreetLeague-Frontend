import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VenueService } from '../../services/venue.service';

declare const L: any;

@Component({
  selector: 'app-create-venue',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './create-venue.component.html',
  styleUrls: ['./create-venue.component.scss']
})
export class CreateVenueComponent implements AfterViewInit {
  form: FormGroup;
  loading = false;
  error: string | null = null;
  success = false;

  sportTypes = [
    { label: '⚽ Football',   value: 'FOOTBALL' },
    { label: '🏀 Basketball', value: 'BASKETBALL' },
    { label: '🎾 Tennis',     value: 'TENNIS' },
    { label: '🏐 Volleyball', value: 'VOLLEYBALL' },
    { label: '🤾 Handball',   value: 'HANDBALL' }
  ];

  // Map / address
  mapSearch  = '';
  mapResults: any[] = [];
  private map: any;
  private marker: any;

  // Photo
  photoPreview: string | null = null;
  private photoFile: File | null = null;
  private createdVenueId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private venueService: VenueService,
    private router: Router,
    private zone: NgZone
  ) {
    this.form = this.fb.group({
      name:         ['', [Validators.required, Validators.minLength(3)]],
      address:      ['', [Validators.required]],
      pricePerHour: [null, [Validators.required, Validators.min(1)]],
      capacity:     [null, [Validators.required, Validators.min(1)]],
      sportType:    ['', [Validators.required]]
    });
  }

  get f() { return this.form.controls; }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 300);
  }

  private initMap(): void {
    if (typeof L === 'undefined') return;
    this.map = L.map('create-venue-map').setView([36.8065, 10.1815], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      this.zone.run(() => {
        this.placeMarker(e.latlng.lat, e.latlng.lng);
        this.reverseGeocode(e.latlng.lat, e.latlng.lng);
      });
    });
  }

  searchAddress(event?: any): void {
    if (event) event.preventDefault();
    if (!this.mapSearch.trim()) return;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.mapSearch)}&limit=5`)
      .then(r => r.json())
      .then(data => {
        this.zone.run(() => { this.mapResults = data; });
      });
  }

  pickAddress(result: any): void {
    this.mapResults = [];
    this.mapSearch  = result.display_name;
    this.form.patchValue({ address: result.display_name });
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    this.placeMarker(lat, lon);
    this.map.setView([lat, lon], 15);
  }

  private placeMarker(lat: number, lng: number): void {
    if (this.marker) this.map.removeLayer(this.marker);
    this.marker = L.marker([lat, lng]).addTo(this.map);
  }

  private reverseGeocode(lat: number, lng: number): void {
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(r => r.json())
      .then(data => {
        this.zone.run(() => {
          if (data?.display_name) {
            this.form.patchValue({ address: data.display_name });
            this.mapSearch = data.display_name;
          }
        });
      });
  }

  // Photo
  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.photoFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.photoPreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  removePhoto(): void { this.photoPreview = null; this.photoFile = null; }

  // Submit
  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true;
    this.error   = null;

    this.venueService.createVenue(this.form.value).subscribe({
      next: (venue) => {
        this.createdVenueId = venue.id;
        if (this.photoFile && venue.id) {
          this.venueService.uploadVenuePhoto(venue.id, this.photoFile).subscribe({
            next: ()  => { this.finishCreate(); },
            error: () => { this.finishCreate(); } // photo failed, venue still created
          });
        } else {
          this.finishCreate();
        }
      },
      error: err => {
        this.error   = err?.error?.message || `HTTP ${err.status}: error`;
        this.loading = false;
      }
    });
  }

  private finishCreate(): void {
    this.success = true;
    this.loading = false;
    setTimeout(() => this.router.navigate(['/venue/my-venues']), 1500);
  }
}
