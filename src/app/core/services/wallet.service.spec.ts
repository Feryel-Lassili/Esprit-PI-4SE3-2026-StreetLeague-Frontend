import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { WalletService } from './wallet.service';
import { environment } from '../../../environments/environment';

const BASE = environment.baseUrl;

describe('WalletService', () => {
  let service: WalletService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [WalletService] });
    service = TestBed.inject(WalletService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => expect(service).toBeTruthy());

  it('getMyWallet should GET /wallet/balance', () => {
    service.getMyWallet().subscribe(w => expect(w.points).toBe(100));
    http.expectOne(`${BASE}/wallet/balance`).flush({ id: 1, points: 100 });
  });

  it('getBalance should GET /wallet/balance', () => {
    service.getBalance().subscribe();
    http.expectOne(`${BASE}/wallet/balance`).flush(100);
  });

  it('getStats should GET /wallet/stats', () => {
    service.getStats().subscribe();
    http.expectOne(`${BASE}/wallet/stats`).flush({ balance: 100, totalEarned: 200, totalSpent: 100, totalTransactions: 5 });
  });

  it('getTransactions should GET /wallet/transactions and return array', () => {
    let result: any;
    service.getTransactions().subscribe(t => result = t);
    http.expectOne(`${BASE}/wallet/transactions`).flush([{ id: 1, amount: 50, type: 'DEPOSIT' }]);
    expect(result.length).toBe(1);
  });

  it('getTransactions should handle wrapped response with transactions key', () => {
    let result: any;
    service.getTransactions().subscribe(t => result = t);
    http.expectOne(`${BASE}/wallet/transactions`).flush({ transactions: [{ id: 1 }] });
    expect(result.length).toBe(1);
  });

  it('getTransactions should handle wrapped response with content key', () => {
    let result: any;
    service.getTransactions().subscribe(t => result = t);
    http.expectOne(`${BASE}/wallet/transactions`).flush({ content: [{ id: 1 }] });
    expect(result.length).toBe(1);
  });

  it('getTransactions should return empty array for unknown format', () => {
    let result: any;
    service.getTransactions().subscribe(t => result = t);
    http.expectOne(`${BASE}/wallet/transactions`).flush({ unknown: 'data' });
    expect(result).toEqual([]);
  });

  it('deposit should POST /wallet/deposit', () => {
    service.deposit(100).subscribe();
    const req = http.expectOne(`${BASE}/wallet/deposit`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ amount: 100 });
    req.flush({ id: 1, points: 110 });
  });

  it('withdraw should POST /wallet/withdraw with description', () => {
    service.withdraw(50, 'ATM').subscribe();
    const req = http.expectOne(`${BASE}/wallet/withdraw`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ amount: 50, description: 'ATM' });
    req.flush({ message: 'OK', newBalance: 50 });
  });

  it('withdraw should use empty description by default', () => {
    service.withdraw(25).subscribe();
    const req = http.expectOne(`${BASE}/wallet/withdraw`);
    expect(req.request.body.description).toBe('');
    req.flush({ message: 'OK', newBalance: 75 });
  });

  it('transfer should POST /wallet/transfer with recipientId and description', () => {
    service.transfer(5, 100, 'Payment').subscribe();
    const req = http.expectOne(`${BASE}/wallet/transfer`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ recipientId: 5, amount: 100, description: 'Payment' });
    req.flush('Transfer successful');
  });

  it('transfer should use empty description by default', () => {
    service.transfer(5, 100).subscribe();
    const req = http.expectOne(`${BASE}/wallet/transfer`);
    expect(req.request.body.description).toBe('');
    req.flush('OK');
  });
});
