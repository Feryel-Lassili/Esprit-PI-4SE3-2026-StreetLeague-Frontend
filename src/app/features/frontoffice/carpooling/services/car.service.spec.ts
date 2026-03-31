import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CarService } from './car.service';
import { CarDTO } from '../models/carpooling.model';
import { environment } from '../../../../../environments/environment';

describe('CarService', () => {
  let service: CarService;
  let http: HttpTestingController;
  const BASE = `${environment.baseUrl}/cars`;

  const mockCar: CarDTO = {
    id: 1, model: 'Toyota Corolla', seats: 5,
    availableSeats: 5, plateNumber: '123TUN456'
  } as CarDTO;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CarService]
    });
    service = TestBed.inject(CarService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── addCar ─────────────────────────────────────────────────────────────────

  it('addCar: POSTs to /cars/add and returns CarDTO', () => {
    const payload = { model: 'Toyota Corolla', seats: 5, plateNumber: '123TUN456' };
    service.addCar(payload).subscribe(res => {
      expect(res.id).toBe(1);
      expect(res.model).toBe('Toyota Corolla');
    });

    const req = http.expectOne(`${BASE}/add`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockCar);
  });

  // ── getMyCars ──────────────────────────────────────────────────────────────

  it('getMyCars: GETs /cars/my-cars', () => {
    service.getMyCars().subscribe(cars => {
      expect(cars.length).toBe(1);
      expect(cars[0].plateNumber).toBe('123TUN456');
    });

    const req = http.expectOne(`${BASE}/my-cars`);
    expect(req.request.method).toBe('GET');
    req.flush([mockCar]);
  });

  // ── getAllCars ─────────────────────────────────────────────────────────────

  it('getAllCars: GETs /cars/all', () => {
    service.getAllCars().subscribe(cars => expect(cars.length).toBe(2));

    const req = http.expectOne(`${BASE}/all`);
    expect(req.request.method).toBe('GET');
    req.flush([mockCar, { ...mockCar, id: 2 }]);
  });

  // ── getCarById ─────────────────────────────────────────────────────────────

  it('getCarById: GETs /cars/details/:id', () => {
    service.getCarById(1).subscribe(car => expect(car.id).toBe(1));

    const req = http.expectOne(`${BASE}/details/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCar);
  });

  // ── deleteCar ──────────────────────────────────────────────────────────────

  it('deleteCar: DELETEs /cars/delete/:id', () => {
    service.deleteCar(1).subscribe(res => expect(res).toBeNull());

    const req = http.expectOne(`${BASE}/delete/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ── uploadCarPhoto ─────────────────────────────────────────────────────────

  it('uploadCarPhoto: POSTs FormData to /cars/:id/upload-photo', () => {
    const file = new File(['img'], 'car.jpg', { type: 'image/jpeg' });
    service.uploadCarPhoto(1, file).subscribe(res => {
      expect(res.photoUrl).toBe('/photos/car.jpg');
    });

    const req = http.expectOne(`${BASE}/1/upload-photo`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush({ photoUrl: '/photos/car.jpg' });
  });
});
