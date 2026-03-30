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
  type: string;
  transactionType?: string;
  description?: string;
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
    return this.http.get<any>(`${this.base}/transactions`).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.transactions)) return res.transactions;
        if (Array.isArray(res?.content)) return res.content;
        if (Array.isArray(res?.data)) return res.data;
        return [];
      })
    );
  }

  deposit(amount: number): Observable<Wallet> {
    return this.http.post<Wallet>(`${this.base}/deposit`, { amount });
  }

  withdraw(amount: number, description: string = ''): Observable<any> {
    return this.http.post<any>(`${this.base}/withdraw`, { amount, description });
  }

  transfer(recipientId: number, amount: number, description: string = ''): Observable<string> {
    return this.http.post(`${this.base}/transfer`, { recipientId, amount, description }, { responseType: 'text' });
  }

}