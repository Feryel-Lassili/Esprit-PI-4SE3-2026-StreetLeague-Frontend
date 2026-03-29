import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CarDTO } from '../models/carpooling.model';

@Injectable({ providedIn: 'root' })
export class CarService {
  private readonly BASE = `${environment.baseUrl}/cars`;

  constructor(private http: HttpClient) {}

  addCar(car: Partial<CarDTO>): Observable<CarDTO> {
    return this.http.post<CarDTO>(`${this.BASE}/add`, car);
  }

  getAllCars(): Observable<CarDTO[]> {
    return this.http.get<CarDTO[]>(`${this.BASE}/all`);
  }

  getMyCars(): Observable<CarDTO[]> {
    return this.http.get<CarDTO[]>(`${this.BASE}/my-cars`);
  }

  getCarById(id: number): Observable<CarDTO> {
    return this.http.get<CarDTO>(`${this.BASE}/details/${id}`);
  }

  deleteCar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/delete/${id}`);
  }
}
