import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { WalletComponent } from './wallet.component';
import { WalletService, Wallet, TransactionResponse } from '../../../core/services/wallet.service';
import { AuthService } from '../../../core/services/auth.service';

const mockWallet: Wallet = { id: 1, points: 500 };

const mockTx: TransactionResponse[] = [
  { id: 1, amount: 100, earnedPoints: 100, date: '2024-01-01T10:00:00', type: 'DEPOSIT', description: 'Recharge' },
  { id: 2, amount: -50, earnedPoints: -50, date: '2024-01-02T10:00:00', type: 'WITHDRAWAL', description: 'ATM' },
  { id: 3, amount: -100, earnedPoints: -99, date: '2024-01-03T10:00:00', type: 'PAYMENT', description: 'Order #1' },
  { id: 4, amount: 10, earnedPoints: 10, date: '2024-01-04T10:00:00', type: 'REFUND', description: 'Refund' },
  { id: 5, amount: -20, earnedPoints: -20, date: '2024-01-05T10:00:00', type: 'TRANSFER', description: 'Transfer' },
];

function makeWalletSvc() {
  return jasmine.createSpyObj<WalletService>('WalletService', {
    getMyWallet: of(mockWallet),
    getTransactions: of(mockTx),
    deposit: of(mockWallet),
    withdraw: of({ message: 'OK', newBalance: 450, pointsWithdrawn: 50, transactionId: 1, amount: 50 }),
    transfer: of('Transfer successful')
  });
}

function makeAuthSvc(role = 'PLAYER') {
  return jasmine.createSpyObj<AuthService>('AuthService', {
    hasRole: false,
    getUserRole: `ROLE_${role}`
  });
}

describe('WalletComponent', () => {
  let component: WalletComponent;
  let fixture: ComponentFixture<WalletComponent>;
  let walletSvc: jasmine.SpyObj<WalletService>;
  let authSvc: jasmine.SpyObj<AuthService>;

  async function setup(role = 'PLAYER') {
    walletSvc = makeWalletSvc();
    authSvc = makeAuthSvc(role);
    authSvc.hasRole.and.callFake((r: string) => r === role);
    await TestBed.configureTestingModule({
      declarations: [WalletComponent],
      imports: [CommonModule, FormsModule],
      providers: [
        { provide: WalletService, useValue: walletSvc },
        { provide: AuthService, useValue: authSvc }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(WalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('should load wallet on init', async () => {
    await setup();
    expect(component.wallet).toEqual(mockWallet);
    expect(component.loading).toBeFalse();
  });

  it('should load and normalize transactions on init', async () => {
    await setup();
    expect(component.transactions.length).toBe(5);
    expect(component.transactions[0].transactionType).toBe('DEPOSIT');
  });

  it('should show all transactions by default', async () => {
    await setup();
    expect(component.filteredTx.length).toBe(5);
  });

  it('should filter transactions by type', async () => {
    await setup();
    component.setFilter('DEPOSIT');
    expect(component.filteredTx.length).toBe(1);
    expect(component.filteredTx[0].type).toBe('DEPOSIT');
  });

  it('should filter PAYMENT transactions', async () => {
    await setup();
    component.setFilter('PAYMENT');
    expect(component.filteredTx.length).toBe(1);
  });

  it('should filter REFUND transactions', async () => {
    await setup();
    component.setFilter('REFUND');
    expect(component.filteredTx.length).toBe(1);
  });

  it('should filter TRANSFER transactions', async () => {
    await setup();
    component.setFilter('TRANSFER');
    expect(component.filteredTx.length).toBe(1);
  });

  it('should show all when filter set to ALL', async () => {
    await setup();
    component.setFilter('PAYMENT');
    component.setFilter('ALL');
    expect(component.filteredTx.length).toBe(5);
  });

  it('should handle wallet load error', async () => {
    walletSvc = makeWalletSvc();
    walletSvc.getMyWallet.and.returnValue(throwError(() => new Error('fail')));
    authSvc = makeAuthSvc();
    await TestBed.configureTestingModule({
      declarations: [WalletComponent],
      imports: [CommonModule, FormsModule],
      providers: [
        { provide: WalletService, useValue: walletSvc },
        { provide: AuthService, useValue: authSvc }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(WalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.error).toBe('Failed to load wallet');
    expect(component.loading).toBeFalse();
  });

  it('should deposit and update wallet', async () => {
    await setup();
    walletSvc.deposit.and.returnValue(of({ id: 1, points: 600 }));
    component.depositAmount = 100;
    component.deposit();
    expect(walletSvc.deposit).toHaveBeenCalledWith(100);
    expect(component.success).toContain('points');
    expect(component.depositAmount).toBeNull();
  });

  it('should not deposit when amount is null', async () => {
    await setup();
    component.depositAmount = null;
    component.deposit();
    expect(walletSvc.deposit).not.toHaveBeenCalled();
  });

  it('should handle deposit error', async () => {
    await setup();
    walletSvc.deposit.and.returnValue(throwError(() => new Error('fail')));
    component.depositAmount = 100;
    component.deposit();
    expect(component.error).toBe('Deposit failed');
  });

  it('should withdraw and update balance', async () => {
    await setup();
    component.withdrawAmount = 50;
    component.withdrawDescription = 'ATM';
    component.withdraw();
    expect(walletSvc.withdraw).toHaveBeenCalledWith(50, 'ATM');
    expect(component.success).toContain('450');
    expect(component.withdrawAmount).toBeNull();
  });

  it('should not withdraw when amount is null', async () => {
    await setup();
    component.withdrawAmount = null;
    component.withdraw();
    expect(walletSvc.withdraw).not.toHaveBeenCalled();
  });

  it('should handle withdraw error', async () => {
    await setup();
    walletSvc.withdraw.and.returnValue(throwError(() => new Error('fail')));
    component.withdrawAmount = 50;
    component.withdraw();
    expect(component.error).toBe('Insufficient points or withdrawal failed');
  });

  it('should transfer points', async () => {
    await setup();
    component.transferUserId = 5;
    component.transferAmount = 100;
    component.transferDescription = 'Payment';
    component.transfer();
    expect(walletSvc.transfer).toHaveBeenCalledWith(5, 100, 'Payment');
    expect(component.success).toBe('Transfer successful!');
  });

  it('should not transfer when amount or userId is null', async () => {
    await setup();
    component.transferUserId = null;
    component.transferAmount = 100;
    component.transfer();
    expect(walletSvc.transfer).not.toHaveBeenCalled();
  });

  it('should handle transfer error', async () => {
    await setup();
    walletSvc.transfer.and.returnValue(throwError(() => new Error('fail')));
    component.transferUserId = 5;
    component.transferAmount = 100;
    component.transfer();
    expect(component.error).toBe('Transfer failed');
  });

  it('txColor should return correct colors', async () => {
    await setup();
    const tx = (type: string) => ({ type, transactionType: type } as any);
    expect(component.txColor(tx('DEPOSIT'))).toBe('green');
    expect(component.txColor(tx('REFUND'))).toBe('green');
    expect(component.txColor(tx('WITHDRAWAL'))).toBe('red');
    expect(component.txColor(tx('PAYMENT'))).toBe('red');
    expect(component.txColor(tx('TRANSFER'))).toBe('blue');
    expect(component.txColor(tx('UNKNOWN'))).toBe('gray');
  });

  it('txEmoji should return correct emojis', async () => {
    await setup();
    const tx = (type: string) => ({ type, transactionType: type } as any);
    expect(component.txEmoji(tx('DEPOSIT'))).toBe('⬆️');
    expect(component.txEmoji(tx('REFUND'))).toBe('↩️');
    expect(component.txEmoji(tx('WITHDRAWAL'))).toBe('⬇️');
    expect(component.txEmoji(tx('PAYMENT'))).toBe('🛒');
    expect(component.txEmoji(tx('TRANSFER'))).toBe('🔄');
    expect(component.txEmoji(tx('UNKNOWN'))).toBe('💳');
  });

  it('txLabel should use description when available', async () => {
    await setup();
    const tx = { type: 'DEPOSIT', transactionType: 'DEPOSIT', description: 'My deposit' } as any;
    expect(component.txLabel(tx)).toBe('My deposit');
  });

  it('txLabel should fall back to type map', async () => {
    await setup();
    const tx = { type: 'PAYMENT', transactionType: 'PAYMENT' } as any;
    expect(component.txLabel(tx)).toBe('Order Payment');
  });

  it('isPlayer should return true for PLAYER role', async () => {
    await setup('PLAYER');
    expect(component.isPlayer()).toBeTrue();
  });

  it('isSponsor should return true for SPONSOR role', async () => {
    await setup('SPONSOR');
    expect(component.isSponsor()).toBeTrue();
  });

  it('monthDeposits should sum positive amounts', async () => {
    await setup();
    expect(component.monthDeposits).toBe('+110'); // 100 + 10
  });

  it('monthExpenses should sum negative non-transfer amounts', async () => {
    await setup();
    // -50 (WITHDRAWAL) + -100 (PAYMENT) = -150
    expect(component.monthExpenses).toBe('-150');
  });

  it('monthTransfers should sum transfer amounts', async () => {
    await setup();
    expect(component.monthTransfers).toBe('20');
  });

  it('clearMessages should reset error and success', async () => {
    await setup();
    component.error = 'err';
    component.success = 'ok';
    component.clearMessages();
    expect(component.error).toBe('');
    expect(component.success).toBe('');
  });

  it('roleLabel should return correct label', async () => {
    await setup('PLAYER');
    expect(component.roleLabel).toBe('Player');
  });

  it('userRole should strip ROLE_ prefix', async () => {
    await setup('PLAYER');
    expect(component.userRole).toBe('PLAYER');
  });

  it('withdraw should not update wallet.points when wallet is null', async () => {
    await setup();
    component.wallet = null;
    component.withdrawAmount = 50;
    component.withdraw();
    expect(component.wallet).toBeNull();
    expect(component.success).toContain('450');
  });

  it('should not transfer when transferAmount is null', async () => {
    await setup();
    component.transferUserId = 5;
    component.transferAmount = null;
    component.transfer();
    expect(walletSvc.transfer).not.toHaveBeenCalled();
  });

  it('loadHistory should handle error silently', async () => {
    walletSvc = makeWalletSvc();
    walletSvc.getTransactions.and.returnValue(throwError(() => new Error('fail')));
    authSvc = makeAuthSvc();
    authSvc.hasRole.and.callFake((r: string) => r === 'PLAYER');
    await TestBed.configureTestingModule({
      declarations: [WalletComponent],
      imports: [CommonModule, FormsModule],
      providers: [
        { provide: WalletService, useValue: walletSvc },
        { provide: AuthService, useValue: authSvc }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(WalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.transactions).toEqual([]);
  });

  it('roleLabel should return userRole as fallback for unknown role', async () => {
    await setup('UNKNOWN_ROLE');
    expect(component.roleLabel).toBe('UNKNOWN_ROLE');
  });

  it('incomeIcon should return correct icon for COACH', async () => {
    await setup('COACH');
    expect(component.incomeIcon).toBe('🏋️');
  });

  it('incomeIcon should return correct icon for REFEREE', async () => {
    await setup('REFEREE');
    expect(component.incomeIcon).toBe('🟡');
  });

  it('incomeIcon should return correct icon for SPONSOR', async () => {
    await setup('SPONSOR');
    expect(component.incomeIcon).toBe('💰');
  });

  it('incomeIcon should fallback to 💳 for PLAYER', async () => {
    await setup('PLAYER');
    expect(component.incomeIcon).toBe('💳');
  });

  it('roleDescription should return description for COACH', async () => {
    await setup('COACH');
    expect(component.roleDescription).toContain('training fees');
  });

  it('roleDescription should return empty string for PLAYER', async () => {
    await setup('PLAYER');
    expect(component.roleDescription).toBe('');
  });

  it('incomeStats should sum positive transactions', async () => {
    await setup();
    expect(component.incomeStats.received).toBe(110); // 100 + 10
    expect(component.incomeStats.count).toBe(2);
  });
});
