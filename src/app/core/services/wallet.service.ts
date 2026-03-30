import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Wallet {
  id: number;
  points: number;
}

export interface WalletStats {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  totalTransactions: number;
}

export interface TransactionResponse {
  id: number;
  amount: number;
  earnedPoints: number;
  date: string;
  transactionType: string;
  description?: string;
  userId: number;
  username: string;
  email: string;
  currentPoints: number;
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private base = `${environment.baseUrl}/wallet`;

  constructor(private http: HttpClient) {}

  getMyWallet(): Observable<Wallet> {
    return this.http.get<Wallet>(`${this.base}/balance`);
  }

  getBalance(): Observable<number> {
    return this.http.get<number>(`${this.base}/balance`);
  }

  getStats(): Observable<WalletStats> {
    return this.http.get<WalletStats>(`${this.base}/stats`);
  }

  getTransactions(): Observable<TransactionResponse[]> {
    return this.http.get<TransactionResponse[]>(`${this.base}/transactions`);
  }

  deposit(amount: number): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.base}/deposit`, { amount });
  }

  withdraw(amount: number): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.base}/withdraw`, { amount });
  }

  transfer(toUserId: number, amount: number): Observable<string> {
    return this.http.post(`${this.base}/transfer`, { toUserId, amount }, { responseType: 'text' });
  }

  getHistory(): Observable<TransactionResponse[]> {
    return this.http.get<TransactionResponse[]>(`${this.base}/history`);
  }
}