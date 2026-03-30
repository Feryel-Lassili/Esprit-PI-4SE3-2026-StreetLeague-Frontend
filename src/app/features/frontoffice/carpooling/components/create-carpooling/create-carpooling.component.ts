import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CarService } from '../../services/car.service';
import { CarpoolingService } from '../../services/carpooling.service';
import { CarDTO } from '../../models/carpooling.model';

declare const L: any;

function futureDateValidator(control: import('@angular/forms').AbstractControl): { [key: string]: boolean } | null {
  if (!control.value) return null;
  const selected = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected < today ? { pastDate: true } : null;
}

@Component({
  selector: 'app-create-carpooling',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './create-carpooling.component.html'
})
export class CreateCarpoolingComponent implements OnInit, AfterViewInit {
  form: FormGroup;
  cars: CarDTO[] = [];
  saving = false;
  error: string | null = null;
  loadingCars = true;
  readonly todayStr = new Date().toISOString().split('T')[0];

  // Map
  private map: any;
  private depMarker: any;
  private arrMarker: any;
  private routeLine: any;

  depSearch  = '';
  arrSearch  = '';
  depResults: any[] = [];
  arrResults: any[] = [];
  depLatLng: [number, number] | null = null;
  arrLatLng: [number, number] | null = null;

  constructor(
    private fb: FormBuilder,
    private carService: CarService,
    private carpoolingService: CarpoolingService,
    public router: Router,
    private zone: NgZone
  ) {
    this.form = this.fb.group({
      departureLocation: ['', [Validators.required]],
      arrivalLocation:   ['', [Validators.required]],
      date:              ['', [Validators.required, futureDateValidator]],
      departureTime:     ['', [Validators.required]],
      carId:             [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.carService.getMyCars().subscribe({
      next: d => { this.cars = d; this.loadingCars = false; },
      error: () => { this.loadingCars = false; }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 300);
  }

  get f() { return this.form.controls; }

  // ── Map ──────────────────────────────────────────────────────────────────────

  private initMap(): void {
    if (typeof L === 'undefined') return;
    this.map = L.map('create-trip-map').setView([36.8065, 10.1815], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  // Departure search
  searchDep(event?: any): void {
    if (event) event.preventDefault();
    if (!this.depSearch.trim()) return;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.depSearch)}&limit=5`)
      .then(r => r.json())
      .then(data => this.zone.run(() => { this.depResults = data; }));
  }

  pickDep(r: any): void {
    this.depResults = [];
    this.depSearch  = r.display_name;
    this.form.patchValue({ departureLocation: r.display_name });
    const lat = parseFloat(r.lat), lng = parseFloat(r.lon);
    this.depLatLng = [lat, lng];
    if (this.depMarker) this.map.removeLayer(this.depMarker);
    const greenIcon = L.divIcon({ className: '', html: '<div style="width:14px;height:14px;background:#2e7d32;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>' });
    this.depMarker = L.marker([lat, lng], { icon: greenIcon }).addTo(this.map).bindPopup('Departure').openPopup();
    this.fitBounds();
  }

  // Arrival search
  searchArr(event?: any): void {
    if (event) event.preventDefault();
    if (!this.arrSearch.trim()) return;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.arrSearch)}&limit=5`)
      .then(r => r.json())
      .then(data => this.zone.run(() => { this.arrResults = data; }));
  }

  pickArr(r: any): void {
    this.arrResults = [];
    this.arrSearch  = r.display_name;
    this.form.patchValue({ arrivalLocation: r.display_name });
    const lat = parseFloat(r.lat), lng = parseFloat(r.lon);
    this.arrLatLng = [lat, lng];
    if (this.arrMarker) this.map.removeLayer(this.arrMarker);
    const redIcon = L.divIcon({ className: '', html: '<div style="width:14px;height:14px;background:#c62828;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>' });
    this.arrMarker = L.marker([lat, lng], { icon: redIcon }).addTo(this.map).bindPopup('Arrival').openPopup();
    this.fitBounds();
  }

  private fitBounds(): void {
    const pts: [number, number][] = [];
    if (this.depLatLng) pts.push(this.depLatLng);
    if (this.arrLatLng) pts.push(this.arrLatLng);
    if (pts.length === 1) { this.map.setView(pts[0], 13); }
    if (pts.length === 2) {
      if (this.routeLine) this.map.removeLayer(this.routeLine);
      this.routeLine = L.polyline(pts, { color: '#000', weight: 2, dashArray: '6,6' }).addTo(this.map);
      this.map.fitBounds(L.latLngBounds(pts), { padding: [30, 30] });
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────────

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.error = null;
    this.carpoolingService.create(this.form.value).subscribe({
      next: () => { this.saving = false; this.router.navigate(['/carpooling/my-trips']); },
      error: err => { this.error = err?.error?.message || 'Creation failed.'; this.saving = false; }
    });
  }
}
