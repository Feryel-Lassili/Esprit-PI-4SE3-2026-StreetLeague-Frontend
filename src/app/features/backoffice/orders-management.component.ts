import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../../core/services/shop.service';
import { ToastService } from '../shared/services/toast.service';
import { Order, OrderStats, OrderStatus } from '../../core/models/shop.model';

const STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING:    ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED:    ['DELIVERED'],
  DELIVERED:  [],
  CANCELLED:  []
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING:    'bg-yellow-100 text-yellow-700',
  CONFIRMED:  'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-purple-100 text-purple-700',
  SHIPPED:    'bg-indigo-100 text-indigo-700',
  DELIVERED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700'
};

@Component({
  selector: 'bo-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-black text-gray-900">🛒 Orders Management</h1>
        <p class="text-gray-600 mt-1">View and manage all customer orders</p>
      </div>

      <!-- Stats -->
      <div *ngIf="stats" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
        <div class="bg-white rounded-2xl shadow p-4 border-l-4 border-gray-400 col-span-2 md:col-span-1">
          <p class="text-xs text-gray-500">Total</p>
          <p class="text-2xl font-black text-gray-800">{{ stats.totalOrders }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-4 border-l-4 border-yellow-400">
          <p class="text-xs text-gray-500">Pending</p>
          <p class="text-2xl font-black text-yellow-600">{{ stats.pending }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-4 border-l-4 border-blue-400">
          <p class="text-xs text-gray-500">Confirmed</p>
          <p class="text-2xl font-black text-blue-600">{{ stats.confirmed }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-4 border-l-4 border-purple-400">
          <p class="text-xs text-gray-500">Processing</p>
          <p class="text-2xl font-black text-purple-600">{{ stats.processing }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-4 border-l-4 border-indigo-400">
          <p class="text-xs text-gray-500">Shipped</p>
          <p class="text-2xl font-black text-indigo-600">{{ stats.shipped }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-4 border-l-4 border-green-400">
          <p class="text-xs text-gray-500">Delivered</p>
          <p class="text-2xl font-black text-green-600">{{ stats.delivered }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-4 border-l-4 border-[#0D6EFD] col-span-2 md:col-span-1">
          <p class="text-xs text-gray-500">Revenue (MTD)</p>
          <p class="text-2xl font-black text-[#0D6EFD]">\${{ stats.revenueThisMonth.toFixed(0) }}</p>
        </div>
      </div>

      <!-- Filter -->
      <div class="bg-white rounded-2xl shadow p-4 mb-6 flex flex-wrap gap-3 items-center">
        <select [(ngModel)]="filterStatus" (ngModelChange)="onFilterChange()"
                class="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#0D6EFD] focus:outline-none">
          <option value="">All Statuses</option>
          <option *ngFor="let s of allStatuses" [value]="s">{{ s }}</option>
        </select>
        <span class="text-sm text-gray-500 ml-auto">{{ filteredOrders.length }} orders</span>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl shadow border border-gray-100">
        <div *ngIf="loading" class="p-12 text-center text-gray-500">⏳ Loading orders...</div>

        <div *ngIf="!loading && filteredOrders.length === 0" class="p-12 text-center">
          <div class="text-5xl mb-3">📭</div>
          <p class="text-gray-500">No orders found</p>
        </div>

        <div *ngIf="!loading && filteredOrders.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Order ID</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Customer</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Date</th>
                <th class="px-6 py-4 text-right text-sm font-bold text-gray-700">Total</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-gray-700">Status</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-gray-700">Update Status</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of filteredOrders"
                  class="border-t border-gray-100 hover:bg-gray-50 transition-all">
                <td class="px-6 py-4 font-bold text-gray-900">#{{ order.id }}</td>
                <td class="px-6 py-4 text-gray-700">
                  <div>{{ order.username || order.user?.username || '—' }}</div>
                  <div class="text-xs text-gray-400">{{ order.userEmail || order.user?.email }}</div>
                </td>
                <td class="px-6 py-4 text-gray-600 text-sm">{{ (order.orderDate || order.createdAt) ? ((order.orderDate || order.createdAt) | date:'MMM d, y, h:mm a') : '—' }}</td>
                <td class="px-6 py-4 text-right font-black text-[#0D6EFD]">\${{ order.totalAmount.toFixed(2) }}</td>
                <td class="px-6 py-4 text-center">
                  <span class="px-3 py-1 rounded-full text-xs font-bold" [ngClass]="getStatusStyle(order.status)">
                    {{ order.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <select *ngIf="getNextStatuses(order.status).length > 0"
                          (change)="onStatusChange(order, $any($event.target).value)"
                          [disabled]="updatingId === order.id"
                          class="px-3 py-1.5 border-2 border-gray-200 rounded-xl text-sm focus:border-[#0D6EFD] focus:outline-none disabled:opacity-50">
                    <option value="">Move to...</option>
                    <option *ngFor="let s of getNextStatuses(order.status)" [value]="s">{{ s }}</option>
                  </select>
                  <span *ngIf="getNextStatuses(order.status).length === 0" class="text-xs text-gray-400">—</span>
                  <span *ngIf="updatingId === order.id" class="ml-2 text-xs text-gray-400">⏳</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <button (click)="openDetail(order)"
                          class="p-2 hover:bg-blue-50 text-[#0D6EFD] rounded-lg transition-all mr-1" title="View">
                    👁️
                  </button>
                  <button (click)="deleteOrder(order.id)"
                          [disabled]="deletingId === order.id"
                          class="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all disabled:opacity-50" title="Delete">
                    {{ deletingId === order.id ? '⏳' : '🗑️' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Modal -->
      <div *ngIf="selectedOrder"
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
           (click)="selectedOrder = null">
        <div class="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
             (click)="$event.stopPropagation()">
          <div class="p-6">
            <div class="flex justify-between items-center mb-5">
              <h2 class="text-xl font-black text-gray-900">Order #{{ selectedOrder.id }}</h2>
              <button (click)="selectedOrder = null" class="text-2xl text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div class="space-y-3 text-sm mb-5">
              <div class="flex justify-between">
                <span class="text-gray-500">Status</span>
                <span class="px-3 py-1 rounded-full text-xs font-bold" [ngClass]="getStatusStyle(selectedOrder.status)">{{ selectedOrder.status }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Customer</span>
                <span class="font-medium">{{ selectedOrder.username || selectedOrder.user?.username || '—' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Email</span>
                <span class="font-medium">{{ selectedOrder.userEmail || selectedOrder.user?.email || '—' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Shipping Address</span>
                <span class="font-medium text-right max-w-xs">{{ selectedOrder.shippingAddress || '—' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Phone</span>
                <span class="font-medium">{{ selectedOrder.phoneNumber || '—' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">Date</span>
                <span class="font-medium">{{ (selectedOrder.orderDate || selectedOrder.createdAt) | date:'medium' }}</span>
              </div>
            </div>

            <div *ngIf="selectedOrder.orderItems?.length" class="border-t border-gray-100 pt-4">
              <p class="font-bold text-gray-700 mb-3">Items</p>
              <div *ngFor="let item of selectedOrder.orderItems" class="flex justify-between items-center py-2 border-b border-gray-50">
                <div class="flex items-center gap-2">
                  <img *ngIf="item.product.image" [src]="item.product.image" class="w-8 h-8 rounded-lg object-cover">
                  <span class="font-medium text-gray-800">{{ item.product.name }}</span>
                </div>
                <span class="text-gray-600 text-sm">x{{ item.quantity }} · <span class="font-bold text-[#0D6EFD]">\${{ (item.price * item.quantity).toFixed(2) }}</span></span>
              </div>
            </div>

            <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
              <span class="font-bold text-gray-700">Total</span>
              <span class="text-2xl font-black text-[#0D6EFD]">\${{ selectedOrder.totalAmount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BackofficeOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  stats: OrderStats | null = null;
  loading = false;
  filterStatus: OrderStatus | '' = '';
  updatingId: number | null = null;
  deletingId: number | null = null;
  selectedOrder: Order | null = null;

  readonly allStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  constructor(
    private shopService: ShopService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadStats();
    this.loadOrders();
  }

  loadStats() {
    this.shopService.adminGetStats().subscribe({
      next: s => { this.stats = s; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  loadOrders() {
    this.loading = true;
    this.shopService.adminGetAllOrders().subscribe({
      next: orders => {
        this.orders = orders;
        this.applyFilter();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.toast.error('Failed to load orders');
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange() {
    if (this.filterStatus) {
      this.shopService.adminGetOrdersByStatus(this.filterStatus).subscribe({
        next: orders => { this.filteredOrders = orders; this.cdr.detectChanges(); },
        error: () => this.toast.error('Failed to filter orders')
      });
    } else {
      this.applyFilter();
    }
  }

  applyFilter() {
    this.filteredOrders = this.filterStatus
      ? this.orders.filter(o => o.status === this.filterStatus)
      : [...this.orders];
  }

  onStatusChange(order: Order, newStatus: OrderStatus) {
    if (!newStatus) return;
    this.updatingId = order.id;
    this.shopService.adminUpdateOrderStatus(order.id, newStatus).subscribe({
      next: updated => {
        order.status = updated.status;
        this.updatingId = null;
        this.toast.success(`Order #${order.id} → ${newStatus}`);
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: () => {
        this.updatingId = null;
        this.toast.error('Failed to update status');
        this.cdr.detectChanges();
      }
    });
  }

  deleteOrder(id: number) {
    if (!confirm(`Delete order #${id}? This cannot be undone.`)) return;
    this.deletingId = id;
    this.shopService.adminDeleteOrder(id).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.id !== id);
        this.applyFilter();
        this.deletingId = null;
        this.toast.success(`Order #${id} deleted`);
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: () => {
        this.deletingId = null;
        this.toast.error('Failed to delete order');
        this.cdr.detectChanges();
      }
    });
  }

  openDetail(order: Order) {
    this.shopService.getOrder(order.id).subscribe({
      next: full => { this.selectedOrder = full; this.cdr.detectChanges(); },
      error: () => { this.selectedOrder = order; this.cdr.detectChanges(); }
    });
  }

  getNextStatuses(status: OrderStatus): OrderStatus[] {
    return STATUS_FLOW[status] ?? [];
  }

  getStatusStyle(status: OrderStatus): string {
    return STATUS_STYLE[status] ?? 'bg-gray-100 text-gray-700';
  }
}
