import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MedicalRecord {
  id?: number;
  weight: number;
  height: number;
  bloodType: string;
  chronicDiseases: string;
  allergies: string;
  lastCheckup: string;
  playerProfileId?: number;
  healthProfessionalId?: number;
}

export interface Injury {
  id?: number;
  report: string;
  recommendation?: string;
  date: string;
  severity: 'MINOR' | 'MODERATE' | 'SEVERE';
  medicalRecordId: number;
}

@Injectable({ providedIn: 'root' })
export class HealthService {
  private base = `${environment.baseUrl}/medical`;

  constructor(private http: HttpClient) {}

  createRecord(dto: MedicalRecord): Observable<MedicalRecord> {
    return this.http.post<MedicalRecord>(`${this.base}/records`, dto);
  }

  updateRecord(id: number, dto: MedicalRecord): Observable<MedicalRecord> {
    return this.http.put<MedicalRecord>(`${this.base}/records/${id}`, dto);
  }

  getRecordById(id: number): Observable<MedicalRecord> {
    return this.http.get<MedicalRecord>(`${this.base}/records/${id}`);
  }

  getRecordByPlayer(playerProfileId: number): Observable<MedicalRecord> {
    return this.http.get<MedicalRecord>(`${this.base}/records/player/${playerProfileId}`);
  }

  deleteRecord(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/records/${id}`);
  }

  declareInjury(dto: Injury): Observable<Injury> {
    return this.http.post<Injury>(`${this.base}/injuries`, dto);
  }

  getInjuryById(id: number): Observable<Injury> {
    return this.http.get<Injury>(`${this.base}/injuries/${id}`);
  }

  getInjuriesByRecord(medicalRecordId: number): Observable<Injury[]> {
    return this.http.get<Injury[]>(`${this.base}/injuries/record/${medicalRecordId}`);
  }

  filterBySeverity(medicalRecordId: number, severity: string): Observable<Injury[]> {
    return this.http.get<Injury[]>(
      `${this.base}/injuries/record/${medicalRecordId}/filter?severity=${severity}`
    );
  }

  deleteInjury(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/injuries/${id}`);
  }

  addRecommendation(injuryId: number, recommendation: string): Observable<Injury> {
    return this.http.put<Injury>(
      `${this.base}/injuries/${injuryId}/recommendation`,
      { recommendation }
    );
  }

  getAllInjuries(): Observable<Injury[]> {
    return this.http.get<Injury[]>(`${this.base}/injuries/all`);
  }

  getAllRecords(): Observable<MedicalRecord[]> {
    return this.http.get<MedicalRecord[]>(`${this.base}/records/all`);
  }
}