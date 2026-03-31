import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { WalletService, Wallet, TransactionResponse } from '../../../core/services/wallet.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'fo-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {

  wallet: Wallet | null = null;
  transactions: TransactionResponse[] = [];
  loading = true;
  actionLoading = false;
  error = '';
  success = '';

  activeTab: 'deposit' | 'withdraw' | 'transfer' = 'withdraw';
  txFilter = 'ALL';
  txFilters = ['ALL', 'PAYMENT', 'DEPOSIT', 'WITHDRAWAL', 'REFUND', 'TRANSFER'];

  depositAmount: number | null = null;
  withdrawAmount: number | null = null;
  withdrawDescription = '';
  transferAmount: number | null = null;
  transferUserId: number | null = null;
  transferDescription = '';

  filteredTx: TransactionResponse[] = [];
  presets = [100, 250, 500];

  insights = [
    { label: 'Venue Bookings',       pct: 45, color: 'black' },
    { label: 'Shop Purchases',       pct: 30, color: 'gray'  },
    { label: 'Events & Tournaments', pct: 25, color: 'light' },
  ];

  constructor(
    private walletService: WalletService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  // ── Role helpers ──────────────────────────────────────────
  isPlayer():     boolean { return this.authService.hasRole('PLAYER'); }
  isCoach():      boolean { return this.authService.hasRole('COACH'); }
  isReferee():    boolean { return this.authService.hasRole('REFEREE'); }
  isHealthPro():  boolean { return this.authService.hasRole('HEALTH_PROFESSIONAL'); }
  isSponsor():    boolean { return this.authService.hasRole('SPONSOR'); }
  isVenueOwner(): boolean { return this.authService.hasRole('VENUE_OWNER'); }

  get userRole(): string {
    return this.authService.getUserRole()?.replace('ROLE_', '') || '';
  }

  get roleLabel(): string {
    const map: { [key: string]: string } = {
      'PLAYER': 'Player', 'COACH': 'Coach', 'REFEREE': 'Referee',
      'HEALTH_PROFESSIONAL': 'Health Professional',
      'SPONSOR': 'Sponsor', 'VENUE_OWNER': 'Venue Owner'
    };
    return map[this.userRole] || this.userRole;
  }

  get incomeIcon(): string {
    const map: { [key: string]: string } = {
      'COACH': '🏋️', 'REFEREE': '🟡', 'HEALTH_PROFESSIONAL': '🩺',
      'VENUE_OWNER': '🏟️', 'SPONSOR': '💰'
    };
    return map[this.userRole] || '💳';
  }

  get roleDescription(): string {
    const map: { [key: string]: string } = {
      'COACH':               'Receive training fees from your players and pay tournament registrations for your team.',
      'REFEREE':             'Your match honoraires are credited automatically after each match you referee.',
      'HEALTH_PROFESSIONAL': 'You are rewarded by the platform for each validated recommendation. Consultations are free for players.',
      'VENUE_OWNER':         'Points are credited automatically when players book your venues.',
      'SPONSOR':             'Inject your budget to sponsor tournaments, teams and events on StreetLeague.',
    };
    return map[this.userRole] || '';
  }

  get incomeStats() {
    const received = this.transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const count    = this.transactions.filter(t => t.amount > 0).length;
    return { received, count };
  }

  // ── Init ──────────────────────────────────────────────────
  ngOnInit() {
    this.loadWallet();
    this.loadHistory();
  }
  get filteredTxCount(): number { return this.filteredTx.length; }

  get monthDeposits(): string {
    const v = this.transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    return `+${v}`;
  }

  get monthExpenses(): string {
    const v = this.transactions
      .filter(t => t.amount < 0 && t.transactionType !== 'TRANSFER')
      .reduce((s, t) => s + t.amount, 0);
    return `${v}`;
  }

  get monthTransfers(): string {
    const v = this.transactions
      .filter(t => t.transactionType === 'TRANSFER')
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return `${v}`;
  }

  txColor(tx: TransactionResponse): string {
    const type = tx.transactionType ?? tx.type ?? '';
    const map: { [key: string]: string } = {
      'DEPOSIT': 'green', 'REFUND': 'green',
      'WITHDRAWAL': 'red', 'PAYMENT': 'red',
      'TRANSFER': 'blue'
    };
    return map[type] || 'gray';
  }

  txEmoji(tx: TransactionResponse): string {
    const type = tx.transactionType ?? tx.type ?? '';
    const map: { [key: string]: string } = {
      'DEPOSIT': '⬆️', 'REFUND': '↩️',
      'WITHDRAWAL': '⬇️', 'PAYMENT': '🛒',
      'TRANSFER': '🔄'
    };
    return map[type] || '💳';
  }

  txLabel(tx: TransactionResponse): string {
    if (tx.description) return tx.description;
    const type = tx.transactionType ?? tx.type ?? '';
    const map: { [key: string]: string } = {
      'DEPOSIT': 'Wallet Recharge', 'REFUND': 'Order Refund',
      'WITHDRAWAL': 'Withdrawal', 'PAYMENT': 'Order Payment',
      'TRANSFER': 'Transfer'
    };
    return map[type] || type;
  }

  // ── Actions ───────────────────────────────────────────────
  loadWallet() {
    this.walletService.getMyWallet().subscribe({
      next: w => { this.wallet = w; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.error = 'Failed to load wallet'; this.loading = false; this.cdr.detectChanges(); }
    });
  }

  loadHistory() {
    this.walletService.getTransactions().subscribe({
      next: t => {
        this.transactions = t.map(tx => ({
          ...tx,
          transactionType: (tx.type || tx.transactionType || '').toUpperCase()
        }));
        this.applyFilter();
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  deposit() {
    if (!this.depositAmount) return;
    this.actionLoading = true;
    this.clearMessages();
    this.walletService.deposit(this.depositAmount).subscribe({
      next: w => {
        this.wallet = w;
        this.success = `+${Math.floor(this.depositAmount! / 10)} points added!`;
        this.depositAmount = null;
        this.actionLoading = false;
        this.cdr.detectChanges();
        this.loadHistory();
      },
      error: () => { this.error = 'Deposit failed'; this.actionLoading = false; this.cdr.detectChanges(); }
    });
  }

  withdraw() {
    if (!this.withdrawAmount) return;
    this.actionLoading = true;
    this.clearMessages();
    this.walletService.withdraw(this.withdrawAmount, this.withdrawDescription).subscribe({
      next: res => {
        if (this.wallet) this.wallet.points = res.newBalance;
        this.success = `Withdrawal successful! New balance: ${res.newBalance} pts`;
        this.withdrawAmount = null;
        this.withdrawDescription = '';
        this.actionLoading = false;
        this.cdr.detectChanges();
        this.loadHistory();
      },
      error: () => { this.error = 'Insufficient points or withdrawal failed'; this.actionLoading = false; this.cdr.detectChanges(); }
    });
  }

  transfer() {
    if (!this.transferAmount || !this.transferUserId) return;
    this.actionLoading = true;
    this.clearMessages();
    this.walletService.transfer(this.transferUserId, this.transferAmount, this.transferDescription).subscribe({
      next: () => {
        this.success = 'Transfer successful!';
        this.transferAmount = null;
        this.transferUserId = null;
        this.transferDescription = '';
        this.actionLoading = false;
        this.cdr.detectChanges();
        this.loadWallet();
        this.loadHistory();
      },
      error: () => { this.error = 'Transfer failed'; this.actionLoading = false; this.cdr.detectChanges(); }
    });
  }

  setFilter(f: string) {
    this.txFilter = f;
    this.applyFilter();
    this.cdr.detectChanges();
  }

  applyFilter() {
    this.filteredTx = this.txFilter === 'ALL'
      ? [...this.transactions]
      : this.transactions.filter(t => t.transactionType === this.txFilter);
  }

  clearMessages() { this.error = ''; this.success = ''; }
}