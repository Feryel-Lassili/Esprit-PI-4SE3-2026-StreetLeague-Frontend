import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { DriverWithCarsAndCarpoolingsDTO } from '../../../frontoffice/carpooling/models/carpooling.model';

@Injectable({ providedIn: 'root' })
export class AdminCarpoolingService {
  private readonly BASE = `${environment.baseUrl}/api/admin/carpoolings`;

  constructor(private http: HttpClient) {}

  getAllDrivers(): Observable<DriverWithCarsAndCarpoolingsDTO[]> {
    return this.http.get<DriverWithCarsAndCarpoolingsDTO[]>(`${this.BASE}/drivers`);
  }

  getDriver(driverId: number): Observable<DriverWithCarsAndCarpoolingsDTO> {
    return this.http.get<DriverWithCarsAndCarpoolingsDTO>(`${this.BASE}/drivers/${driverId}`);
  }

  deleteCar(carId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/cars/${carId}`);
  }

  deleteCarpooling(carpoolingId: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${carpoolingId}`);
  }
}
