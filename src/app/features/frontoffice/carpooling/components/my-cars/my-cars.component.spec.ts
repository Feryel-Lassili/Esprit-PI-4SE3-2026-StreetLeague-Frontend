import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';
import { MyCarsComponent } from './my-cars.component';
import { CarService } from '../../services/car.service';
import { CarDTO } from '../../models/carpooling.model';

describe('MyCarsComponent', () => {
  let component: MyCarsComponent;
  let fixture: ComponentFixture<MyCarsComponent>;
  let carServiceSpy: jasmine.SpyObj<CarService>;

  const mockCar: CarDTO = {
    id: 1, model: 'Toyota Corolla', seats: 5,
    availableSeats: 5, plateNumber: '123TUN456'
  } as CarDTO;

  beforeEach(async () => {
    carServiceSpy = jasmine.createSpyObj('CarService', [
      'getMyCars', 'addCar', 'deleteCar', 'uploadCarPhoto'
    ]);
    carServiceSpy.getMyCars.and.returnValue(of([mockCar]));

    await TestBed.configureTestingModule({
      imports: [MyCarsComponent, CommonModule, ReactiveFormsModule],
      providers: [{ provide: CarService, useValue: carServiceSpy }]
    }).compileComponents();

    fixture   = TestBed.createComponent(MyCarsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── ngOnInit ───────────────────────────────────────────────────────────────

  it('ngOnInit: loads cars and sets loading=false', () => {
    expect(component.cars.length).toBe(1);
    expect(component.cars[0].model).toBe('Toyota Corolla');
    expect(component.loading).toBeFalse();
  });

  it('ngOnInit: error sets error message', () => {
    carServiceSpy.getMyCars.and.returnValue(throwError(() => ({ error: { message: 'Server error' } })));
    component.loadCars();
    expect(component.error).toBe('Server error');
  });

  // ── Form validation ────────────────────────────────────────────────────────

  it('addForm: invalid when all fields empty', () => {
    expect(component.addForm.invalid).toBeTrue();
  });

  it('addForm: valid with correct values', () => {
    component.addForm.setValue({
      model: 'Toyota', seats: 5, availableSeats: 3, plateNumber: 'ABC123'
    });
    expect(component.addForm.valid).toBeTrue();
  });

  it('model: required validation', () => {
    component.addForm.patchValue({ model: '' });
    expect(component.f['model'].errors?.['required']).toBeTrue();
  });

  it('model: minlength validation (< 2 chars)', () => {
    component.addForm.patchValue({ model: 'X' });
    expect(component.f['model'].errors?.['minlength']).toBeTruthy();
  });

  it('seats: min validation (< 1)', () => {
    component.addForm.patchValue({ seats: 0 });
    expect(component.f['seats'].errors?.['min']).toBeTruthy();
  });

  it('seats: max validation (> 20)', () => {
    component.addForm.patchValue({ seats: 25 });
    expect(component.f['seats'].errors?.['max']).toBeTruthy();
  });

  it('availableSeats: min validation (< 0)', () => {
    component.addForm.patchValue({ availableSeats: -1 });
    expect(component.f['availableSeats'].errors?.['min']).toBeTruthy();
  });

  it('cross-field: availableSeats > seats triggers availableExceedsSeats error', () => {
    component.addForm.setValue({ model: 'Toyota', seats: 3, availableSeats: 5, plateNumber: 'AB123' });
    expect(component.addForm.errors?.['availableExceedsSeats']).toBeTrue();
  });

  it('cross-field: availableSeats <= seats has no cross-field error', () => {
    component.addForm.setValue({ model: 'Toyota', seats: 5, availableSeats: 3, plateNumber: 'AB123' });
    expect(component.addForm.errors).toBeNull();
  });

  it('plateNumber: required validation', () => {
    component.addForm.patchValue({ plateNumber: '' });
    expect(component.f['plateNumber'].errors?.['required']).toBeTrue();
  });

  // ── submitAdd ──────────────────────────────────────────────────────────────

  it('submitAdd: does not call addCar when form is invalid', () => {
    component.submitAdd();
    expect(carServiceSpy.addCar).not.toHaveBeenCalled();
  });

  it('submitAdd: calls addCar when form is valid', () => {
    carServiceSpy.addCar.and.returnValue(of(mockCar));
    component.addForm.setValue({
      model: 'Toyota', seats: 5, availableSeats: 3, plateNumber: 'AB123'
    });
    component.submitAdd();
    expect(carServiceSpy.addCar).toHaveBeenCalled();
  });

  it('submitAdd: marks all touched when invalid', () => {
    spyOn(component.addForm, 'markAllAsTouched');
    component.submitAdd();
    expect(component.addForm.markAllAsTouched).toHaveBeenCalled();
  });

  // ── openAdd / closeAdd ─────────────────────────────────────────────────────

  it('openAdd: sets showAddForm=true and resets form', () => {
    component.openAdd();
    expect(component.showAddForm).toBeTrue();
    expect(component.addForm.pristine).toBeTrue();
  });

  it('closeAdd: sets showAddForm=false', () => {
    component.openAdd();
    component.closeAdd();
    expect(component.showAddForm).toBeFalse();
  });

  // ── deleteCar ──────────────────────────────────────────────────────────────

  it('deleteCar: calls carService.deleteCar after confirm', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    carServiceSpy.deleteCar.and.returnValue(of(void 0));
    component.deleteCar(1);
    expect(carServiceSpy.deleteCar).toHaveBeenCalledWith(1);
  });

  it('deleteCar: does nothing when confirm cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteCar(1);
    expect(carServiceSpy.deleteCar).not.toHaveBeenCalled();
  });
});
