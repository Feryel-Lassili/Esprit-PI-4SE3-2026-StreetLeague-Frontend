import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CarService } from '../../services/car.service';
import { CarDTO } from '../../models/carpooling.model';

@Component({
  selector: 'app-my-cars',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './my-cars.component.html'
})
export class MyCarsComponent implements OnInit {
  cars: CarDTO[] = [];
  loading = true;
  error: string | null = null;

  showAddForm = false;
  addForm: FormGroup;
  addSaving = false;
  addError: string | null = null;

  constructor(private carService: CarService, private fb: FormBuilder) {
    this.addForm = this.fb.group({
      model: ['', [Validators.required, Validators.minLength(2)]],
      seats: [null, [Validators.required, Validators.min(1)]],
      availableSeats: [null, [Validators.required, Validators.min(0)]],
      plateNumber: ['', [Validators.required]]
    });
  }

  ngOnInit(): void { this.loadCars(); }

  loadCars(): void {
    this.loading = true;
    this.error = null;
    this.carService.getMyCars().subscribe({
      next: data => { this.cars = data; this.loading = false; },
      error: err => { this.error = err?.error?.message || 'Failed to load cars.'; this.loading = false; }
    });
  }

  openAdd(): void { this.showAddForm = true; this.addError = null; this.addForm.reset(); }
  closeAdd(): void { this.showAddForm = false; this.addError = null; }

  submitAdd(): void {
    if (this.addForm.invalid) { this.addForm.markAllAsTouched(); return; }
    this.addSaving = true;
    this.addError = null;
    this.carService.addCar(this.addForm.value).subscribe({
      next: () => { this.addSaving = false; this.closeAdd(); this.loadCars(); },
      error: err => { this.addError = err?.error?.message || 'Add failed.'; this.addSaving = false; }
    });
  }

  deleteCar(id: number): void {
    if (!confirm('Delete this car?')) return;
    this.carService.deleteCar(id).subscribe({
      next: () => this.loadCars(),
      error: err => alert(err?.error?.message || 'Delete failed.')
    });
  }

  get f() { return this.addForm.controls; }
}
