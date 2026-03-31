import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../../core/services/shop.service';
import { ToastService } from '../shared/services/toast.service';
import { MerchandiseSubmission, MerchandiseStats } from '../../core/models/shop.model';

@Component({
  selector: 'bo-merchandise-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Merchandise Submissions</h2>

      <!-- Stats Cards -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center">
          <p class="text-3xl font-black text-yellow-700">{{ stats?.pending ?? 0 }}</p>
          <p class="text-sm font-semibold text-yellow-600 mt-1">Pending</p>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <p class="text-3xl font-black text-green-700">{{ stats?.approved ?? 0 }}</p>
          <p class="text-sm font-semibold text-green-600 mt-1">Approved</p>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
          <p class="text-3xl font-black text-red-700">{{ stats?.rejected ?? 0 }}</p>
          <p class="text-sm font-semibold text-red-600 mt-1">Rejected</p>
        </div>
      </div>

      <!-- Pending Queue -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="font-bold text-gray-900">Pending Queue</h3>
          <button (click)="loadData()" class="text-sm text-blue-600 hover:underline">Refresh</button>
        </div>
        <div *ngIf="loading" class="text-center py-10 text-gray-400">Loading...</div>
        <div *ngIf="!loading && pending.length === 0" class="text-center py-10 text-gray-400">No pending submissions.</div>
        <div class="overflow-x-auto">
          <table *ngIf="!loading && pending.length > 0" class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="text-left py-3 px-4 font-bold text-gray-600 uppercase text-xs">Product</th>
                <th class="text-left py-3 px-4 font-bold text-gray-600 uppercase text-xs">Seller</th>
                <th class="text-left py-3 px-4 font-bold text-gray-600 uppercase text-xs">Price</th>
                <th class="text-left py-3 px-4 font-bold text-gray-600 uppercase text-xs">Sport</th>
                <th class="text-left py-3 px-4 font-bold text-gray-600 uppercase text-xs">Submitted</th>
                <th class="text-left py-3 px-4 font-bold text-gray-600 uppercase text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of pending" class="border-t border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                      <img *ngIf="s.image" [src]="s.image" [alt]="s.name"
                           class="w-full h-full object-cover"
                           (error)="$any($event.target).style.display='none'">
                      <span *ngIf="!s.image" class="text-xl">{{ sportEmoji(s.sportType) }}</span>
                    </div>
                    <div>
                      <p class="font-semibold text-gray-900">{{ s.name }}</p>
                      <p class="text-xs text-gray-500">{{ s.category }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4 text-gray-600">{{ s.sellerName || '—' }}</td>
                <td class="py-3 px-4 font-semibold text-blue-600">\${{ s.price }}</td>
                <td class="py-3 px-4 text-gray-600">{{ s.sportType }}</td>
                <td class="py-3 px-4 text-gray-500 text-xs">{{ s.submittedAt | date:'mediumDate' }}</td>
                <td class="py-3 px-4 flex gap-2">
                  <button (click)="approve(s)"
                          class="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">
                    ✓ Approve
                  </button>
                  <button (click)="openReject(s)"
                          class="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors">
                    ✕ Reject
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Reject Reason Modal -->
    <div *ngIf="rejectTarget"
         class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
         (click)="closeReject()">
      <div class="bg-white rounded-2xl max-w-md w-full p-6" (click)="$event.stopPropagation()">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">Reject Submission</h3>
          <button (click)="closeReject()" class="text-2xl text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <p class="text-sm text-gray-600 mb-4">Rejecting: <span class="font-semibold">{{ rejectTarget.name }}</span></p>
        <label class="block text-xs font-bold uppercase text-gray-600 mb-2">Reason (optional)</label>
        <textarea [(ngModel)]="rejectReason" rows="3" placeholder="Explain why this is being rejected..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-red-500 focus:outline-none resize-none mb-4"></textarea>
        <div class="flex gap-3 justify-end">
          <button (click)="closeReject()"
                  class="px-5 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </button>
          <button (click)="confirmReject()" [disabled]="processing"
                  class="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
            {{ processing ? 'Rejecting...' : 'Confirm Reject' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class MerchandiseAdminComponent implements OnInit {
  pending: MerchandiseSubmission[] = [];
  stats: MerchandiseStats | null = null;
  loading = false;
  processing = false;
  rejectTarget: MerchandiseSubmission | null = null;
  rejectReason = '';

  constructor(private shopService: ShopService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    this.loading = true;
    this.shopService.adminGetPendingMerchandise().subscribe({
      next: data => {
        console.log('Pending merch response:', data);
        this.pending = Array.isArray(data) ? data : (data?.content ?? []);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load pending merch:', err);
        this.loading = false;
        this.toast.error(`Failed to load submissions (${err?.status ?? 'unknown error'})`);
      }
    });
    this.shopService.adminGetMerchandiseStats().subscribe({
      next: data => { console.log('Merch stats:', data); this.stats = data; },
      error: (err) => console.error('Failed to load merch stats:', err)
    });
  }

  approve(s: MerchandiseSubmission) {
    this.shopService.adminApproveMerchandise(s.id!).subscribe({
      next: () => { this.toast.success(`"${s.name}" approved`); this.loadData(); },
      error: () => this.toast.error('Approval failed')
    });
  }

  openReject(s: MerchandiseSubmission) {
    this.rejectTarget = s;
    this.rejectReason = '';
  }

  closeReject() { this.rejectTarget = null; }

  sportEmoji(sportType: string): string {
    const map: Record<string, string> = { FOOTBALL: '⚽', BASKETBALL: '🏀', TENNIS: '🎾', VOLLEYBALL: '🏐' };
    return map[sportType] ?? '📦';
  }

  confirmReject() {
    if (!this.rejectTarget?.id) return;
    this.processing = true;
    this.shopService.adminRejectMerchandise(this.rejectTarget.id, this.rejectReason).subscribe({
      next: () => {
        this.processing = false;
        this.toast.success(`"${this.rejectTarget!.name}" rejected`);
        this.closeReject();
        this.loadData();
      },
      error: () => { this.processing = false; this.toast.error('Rejection failed'); }
    });
  }
}
