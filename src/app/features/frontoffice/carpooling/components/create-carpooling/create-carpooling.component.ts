import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CarService } from '../../services/car.service';
import { CarpoolingService } from '../../services/carpooling.service';
import { CarDTO } from '../../models/carpooling.model';

@Component({
  selector: 'app-create-carpooling',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-carpooling.component.html'
})
export class CreateCarpoolingComponent implements OnInit {
  form: FormGroup;
  cars: CarDTO[] = [];
  saving = false;
  error: string | null = null;
  loadingCars = true;

  constructor(private fb: FormBuilder, private carService: CarService, private carpoolingService: CarpoolingService, public router: Router) {
    this.form = this.fb.group({
      departureLocation: ['', [Validators.required]],
      arrivalLocation: ['', [Validators.required]],
      date: ['', [Validators.required]],
      departureTime: ['', [Validators.required]],
      carId: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.carService.getMyCars().subscribe({
      next: d => { this.cars = d; this.loadingCars = false; },
      error: () => { this.loadingCars = false; }
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.error = null;
    this.carpoolingService.create(this.form.value).subscribe({
      next: () => { this.saving = false; this.router.navigate(['/carpooling/my-trips']); },
      error: err => { this.error = err?.error?.message || 'Creation failed.'; this.saving = false; }
    });
  }
}
