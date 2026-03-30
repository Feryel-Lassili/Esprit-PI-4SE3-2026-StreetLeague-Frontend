import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CarService } from '../../services/car.service';
import { CarDTO } from '../../models/carpooling.model';

function seatsValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const seats = control.get('seats')?.value;
  const available = control.get('availableSeats')?.value;
  if (seats != null && available != null && available > seats) {
    return { availableExceedsSeats: true };
  }
  return null;
}

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

  // Photo upload
  photoPreview: string | null = null;
  private photoFile: File | null = null;
  private newCarId: number | null = null;
  photoUploading = false;

  // Photo for existing car
  uploadingCarId: number | null = null;

  constructor(private carService: CarService, private fb: FormBuilder) {
    this.addForm = this.fb.group({
      model:          ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
      seats:          [null, [Validators.required, Validators.min(1), Validators.max(20)]],
      availableSeats: [null, [Validators.required, Validators.min(0)]],
      plateNumber:    ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]]
    });
    this.addForm.setValidators(seatsValidator);
  }

  ngOnInit(): void { this.loadCars(); }

  loadCars(): void {
    this.loading = true;
    this.error   = null;
    this.carService.getMyCars().subscribe({
      next: data => { this.cars = data; this.loading = false; },
      error: err  => { this.error = err?.error?.message || 'Failed to load cars.'; this.loading = false; }
    });
  }

  openAdd(): void { this.showAddForm = true; this.addError = null; this.addForm.reset(); this.photoPreview = null; this.photoFile = null; }
  closeAdd(): void { this.showAddForm = false; this.addError = null; this.photoPreview = null; this.photoFile = null; }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.photoFile = file;
    const reader = new FileReader();
    reader.onload = () => { this.photoPreview = reader.result as string; };
    reader.readAsDataURL(file);
  }

  removePhoto(): void { this.photoPreview = null; this.photoFile = null; }

  submitAdd(): void {
    if (this.addForm.invalid) { this.addForm.markAllAsTouched(); return; }
    this.addSaving = true;
    this.addError  = null;
    this.carService.addCar(this.addForm.value).subscribe({
      next: car => {
        if (this.photoFile) {
          this.carService.uploadCarPhoto(car.id, this.photoFile).subscribe({
            next: () => { this.addSaving = false; this.closeAdd(); this.loadCars(); },
            error: () => { this.addSaving = false; this.closeAdd(); this.loadCars(); }
          });
        } else {
          this.addSaving = false; this.closeAdd(); this.loadCars();
        }
      },
      error: err => { this.addError = err?.error?.message || 'Add failed.'; this.addSaving = false; }
    });
  }

  // Upload photo for existing car
  onExistingCarPhoto(event: Event, carId: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingCarId = carId;
    this.carService.uploadCarPhoto(carId, file).subscribe({
      next: res => {
        const car = this.cars.find(c => c.id === carId);
        if (car) (car as any).photoUrl = res.photoUrl;
        this.uploadingCarId = null;
      },
      error: () => { this.uploadingCarId = null; }
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
