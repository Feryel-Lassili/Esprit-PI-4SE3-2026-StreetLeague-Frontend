import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { CreateCarpoolingComponent } from './create-carpooling.component';
import { CarService } from '../../services/car.service';
import { CarpoolingService } from '../../services/carpooling.service';
import { CarDTO, CarpoolingDTO } from '../../models/carpooling.model';

describe('CreateCarpoolingComponent', () => {
  let component: CreateCarpoolingComponent;
  let fixture: ComponentFixture<CreateCarpoolingComponent>;
  let carServiceSpy: jasmine.SpyObj<CarService>;
  let carpoolingServiceSpy: jasmine.SpyObj<CarpoolingService>;

  const mockCar: CarDTO = {
    id: 10, model: 'Toyota', seats: 4, availableSeats: 3, plateNumber: '123TUN'
  } as CarDTO;

  const mockTrip: CarpoolingDTO = {
    id: 1, departureLocation: 'Tunis', arrivalLocation: 'Sousse',
    carId: 10, driverUsername: 'alice'
  } as any;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 2);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  beforeEach(async () => {
    carServiceSpy = jasmine.createSpyObj('CarService', ['getMyCars']);
    carpoolingServiceSpy = jasmine.createSpyObj('CarpoolingService', ['create']);
    carServiceSpy.getMyCars.and.returnValue(of([mockCar]));

    await TestBed.configureTestingModule({
      imports: [
        CreateCarpoolingComponent,
        CommonModule, ReactiveFormsModule, FormsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: CarService,        useValue: carServiceSpy },
        { provide: CarpoolingService, useValue: carpoolingServiceSpy }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(CreateCarpoolingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── ngOnInit ───────────────────────────────────────────────────────────────

  it('ngOnInit: loads cars on init', () => {
    expect(component.cars.length).toBe(1);
    expect(component.cars[0].model).toBe('Toyota');
    expect(component.loadingCars).toBeFalse();
  });

  // ── Form initial state ─────────────────────────────────────────────────────

  it('form: starts invalid', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('form: departureLocation required', () => {
    component.form.patchValue({ departureLocation: '' });
    expect(component.f['departureLocation'].errors?.['required']).toBeTrue();
  });

  it('form: arrivalLocation required', () => {
    component.form.patchValue({ arrivalLocation: '' });
    expect(component.f['arrivalLocation'].errors?.['required']).toBeTrue();
  });

  it('form: date required', () => {
    component.form.patchValue({ date: '' });
    expect(component.f['date'].errors?.['required']).toBeTrue();
  });

  it('form: date in the past triggers pastDate error', () => {
    component.form.patchValue({ date: '2020-01-01' });
    expect(component.f['date'].errors?.['pastDate']).toBeTrue();
  });

  it('form: future date has no pastDate error', () => {
    component.form.patchValue({ date: futureDateStr });
    expect(component.f['date'].errors?.['pastDate']).toBeFalsy();
  });

  it('form: carId required', () => {
    component.form.patchValue({ carId: null });
    expect(component.f['carId'].errors?.['required']).toBeTrue();
  });

  it('todayStr: has correct format YYYY-MM-DD', () => {
    expect(component.todayStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // ── form valid state ───────────────────────────────────────────────────────

  it('form: valid with all correct values', () => {
    component.form.setValue({
      departureLocation: 'Tunis',
      arrivalLocation:   'Sousse',
      date:              futureDateStr,
      departureTime:     '08:00',
      carId:             10
    });
    expect(component.form.valid).toBeTrue();
  });

  // ── submit ─────────────────────────────────────────────────────────────────

  it('submit: does not call carpoolingService.create when invalid', () => {
    component.submit();
    expect(carpoolingServiceSpy.create).not.toHaveBeenCalled();
  });

  it('submit: calls create with form value when valid', () => {
    carpoolingServiceSpy.create.and.returnValue(of(mockTrip));
    component.form.setValue({
      departureLocation: 'Tunis',
      arrivalLocation:   'Sousse',
      date:              futureDateStr,
      departureTime:     '08:00',
      carId:             10
    });
    component.submit();
    expect(carpoolingServiceSpy.create).toHaveBeenCalledWith(component.form.value);
  });

  it('submit: sets error on service failure', () => {
    carpoolingServiceSpy.create.and.returnValue(
      throwError(() => ({ error: { message: 'Car not found' } }))
    );
    component.form.setValue({
      departureLocation: 'Tunis', arrivalLocation: 'Sousse',
      date: futureDateStr, departureTime: '08:00', carId: 10
    });
    component.submit();
    expect(component.error).toBe('Car not found');
    expect(component.saving).toBeFalse();
  });

  it('submit: markAllAsTouched called on invalid form', () => {
    spyOn(component.form, 'markAllAsTouched');
    component.submit();
    expect(component.form.markAllAsTouched).toHaveBeenCalled();
  });
});
