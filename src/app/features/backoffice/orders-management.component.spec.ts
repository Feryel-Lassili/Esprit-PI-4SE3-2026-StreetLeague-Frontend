import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackofficeOrdersComponent } from './orders-management.component';
import { ShopService } from '../services/shop.service';
import { ToastService } from '../shared/services/toast.service';
import { of, throwError } from 'rxjs';
import { Order, OrderStats, OrderStatus } from '../models/shop.model';

describe('BackofficeOrdersComponent', () => {
  let component: BackofficeOrdersComponent;
  let fixture: ComponentFixture<BackofficeOrdersComponent>;
  let mockShopService: any;
  let mockToastService: any;

  const mockOrders: Order[] = [
    {
      id: 1,
      status: 'PENDING' as OrderStatus,
      user: { id: 101, username: 'John Doe', email: 'john@example.com' },
      createdAt: new Date('2023-01-01'),
      totalAmount: 100.00,
      shippingAddress: '123 Main St',
      phoneNumber: '123-456-7890'
    },
    {
      id: 2,
      status: 'CONFIRMED' as OrderStatus,
      user: { id: 102, username: 'Jane Smith', email: 'jane@example.com' },
      createdAt: new Date('2023-01-02'),
      totalAmount: 200.00,
      shippingAddress: '456 Oak Ave',
      phoneNumber: '098-765-4321'
    }
  ];

  const mockStats: OrderStats = {
    totalOrders: 10,
    pending: 3,
    confirmed: 2,
    processing: 1,
    shipped: 2,
    delivered: 2,
    cancelled: 0,           // ← required
    revenueThisMonth: 1500.00
  };

  beforeEach(async () => {
    mockShopService = {
      adminGetStats: vi.fn(),
      adminGetAllOrders: vi.fn(),
      adminGetOrdersByStatus: vi.fn(),
      adminUpdateOrderStatus: vi.fn(),
      adminDeleteOrder: vi.fn(),
      getOrder: vi.fn()
    };

    mockToastService = {
      success: vi.fn(),
      error: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BackofficeOrdersComponent],
      providers: [
        { provide: ShopService, useValue: mockShopService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BackofficeOrdersComponent);
    component = fixture.componentInstance;

    // Default successful returns
    mockShopService.adminGetStats.mockReturnValue(of(mockStats));
    mockShopService.adminGetAllOrders.mockReturnValue(of(mockOrders));
  });

  describe('ngOnInit', () => {
    it('should load stats and orders on initialization', () => {
      mockShopService.adminGetStats.mockReturnValue(of(mockStats));
      mockShopService.adminGetAllOrders.mockReturnValue(of(mockOrders));

      component.ngOnInit();

      expect(component.stats).toEqual(mockStats);
      expect(component.orders).toEqual(mockOrders);
      expect(component.filteredOrders).toEqual(mockOrders);
      expect(mockShopService.adminGetStats).toHaveBeenCalled();
      expect(mockShopService.adminGetAllOrders).toHaveBeenCalled();
    });

    it('should handle error when loading stats', () => {
      mockShopService.adminGetStats.mockReturnValue(throwError(() => new Error('Error')));
      mockShopService.adminGetAllOrders.mockReturnValue(of(mockOrders));

      component.ngOnInit();

      expect(component.stats).toBeNull();
      expect(component.orders).toEqual(mockOrders);
    });

    it('should handle error when loading orders', () => {
      mockShopService.adminGetStats.mockReturnValue(of(mockStats));
      mockShopService.adminGetAllOrders.mockReturnValue(throwError(() => new Error('Error')));

      component.ngOnInit();

      expect(component.stats).toEqual(mockStats);
      expect(component.orders).toEqual([]);
      expect(component.loading).toBe(false);
      expect(mockToastService.error).toHaveBeenCalledWith('Failed to load orders');
    });
  });

  describe('loadStats', () => {
    it('should load stats and update component', () => {
      mockShopService.adminGetStats.mockReturnValue(of(mockStats));

      component.loadStats();

      expect(component.stats).toEqual(mockStats);
      expect(mockShopService.adminGetStats).toHaveBeenCalled();
    });

    it('should handle error when loading stats', () => {
      mockShopService.adminGetStats.mockReturnValue(throwError(() => new Error('Error')));

      component.loadStats();

      expect(component.stats).toBeNull();
    });
  });

  describe('loadOrders', () => {
    it('should load orders and apply filter', () => {
      mockShopService.adminGetAllOrders.mockReturnValue(of(mockOrders));

      component.loadOrders();

      expect(component.orders).toEqual(mockOrders);
      expect(component.filteredOrders).toEqual(mockOrders);
      expect(component.loading).toBe(false);
      expect(mockShopService.adminGetAllOrders).toHaveBeenCalled();
    });

    it('should handle error when loading orders', () => {
      mockShopService.adminGetAllOrders.mockReturnValue(throwError(() => new Error('Error')));

      component.loadOrders();

      expect(component.orders).toEqual([]);
      expect(component.loading).toBe(false);
      expect(mockToastService.error).toHaveBeenCalledWith('Failed to load orders');
    });
  });

  describe('onFilterChange', () => {
    it('should filter orders by status', () => {
      component.orders = mockOrders;
      mockShopService.adminGetOrdersByStatus.mockReturnValue(of([mockOrders[0]]));

      component.filterStatus = 'PENDING';
      component.onFilterChange();

      expect(component.filteredOrders).toEqual([mockOrders[0]]);
      expect(mockShopService.adminGetOrdersByStatus).toHaveBeenCalledWith('PENDING');
    });

    it('should apply all orders when no filter status', () => {
      component.orders = mockOrders;
      component.filterStatus = '';

      component.onFilterChange();

      expect(component.filteredOrders).toEqual(mockOrders);
    });

    it('should handle error when filtering orders', () => {
      component.orders = mockOrders;
      mockShopService.adminGetOrdersByStatus.mockReturnValue(throwError(() => new Error('Error')));

      component.filterStatus = 'PENDING';
      component.onFilterChange();

      expect(mockToastService.error).toHaveBeenCalledWith('Failed to filter orders');
    });
  });

  describe('applyFilter', () => {
    it('should filter orders by status', () => {
      component.orders = mockOrders;
      component.filterStatus = 'PENDING';

      component.applyFilter();

      expect(component.filteredOrders).toEqual([mockOrders[0]]);
    });

    it('should show all orders when no filter status', () => {
      component.orders = mockOrders;
      component.filterStatus = '';

      component.applyFilter();

      expect(component.filteredOrders).toEqual(mockOrders);
    });
  });

  describe('onStatusChange', () => {
    it('should update order status and refresh stats', () => {
      const updatedOrder = { ...mockOrders[0], status: 'CONFIRMED' as OrderStatus };
      mockShopService.adminUpdateOrderStatus.mockReturnValue(of(updatedOrder));

      component.orders = [...mockOrders];        // fresh copy
      const originalOrder = component.orders[0];

      component.onStatusChange(originalOrder, 'CONFIRMED');

      expect(mockShopService.adminUpdateOrderStatus).toHaveBeenCalledWith(1, 'CONFIRMED');
      expect(originalOrder.status).toEqual('CONFIRMED');   // mutated in place
      expect(mockToastService.success).toHaveBeenCalledWith('Order #1 → CONFIRMED');
      expect(mockShopService.adminGetStats).toHaveBeenCalled();
    });

    it('should handle error when updating status', () => {
      mockShopService.adminUpdateOrderStatus.mockReturnValue(throwError(() => new Error('Error')));

      component.orders = [...mockOrders];

      component.onStatusChange(mockOrders[0], 'CONFIRMED');

      expect(mockShopService.adminUpdateOrderStatus).toHaveBeenCalledWith(1, 'CONFIRMED');
      expect(mockToastService.error).toHaveBeenCalledWith('Failed to update status');
    });
  });

  describe('deleteOrder', () => {
    it('should delete order and refresh data', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);   // ← Important!

      mockShopService.adminDeleteOrder.mockReturnValue(of(undefined));
      mockShopService.adminGetStats.mockReturnValue(of(mockStats));

      component.orders = [...mockOrders];

      component.deleteOrder(1);

      expect(mockShopService.adminDeleteOrder).toHaveBeenCalledWith(1);
      expect(component.orders).toEqual([mockOrders[1]]);   // or check length + no id 1
      expect(mockToastService.success).toHaveBeenCalledWith('Order #1 deleted');
      expect(mockShopService.adminGetStats).toHaveBeenCalled();
    });

    it('should handle error when deleting order', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      mockShopService.adminDeleteOrder.mockReturnValue(throwError(() => new Error('Error')));

      component.orders = [...mockOrders];

      component.deleteOrder(1);

      expect(mockShopService.adminDeleteOrder).toHaveBeenCalledWith(1);
      expect(mockToastService.error).toHaveBeenCalledWith('Failed to delete order');
      expect(component.orders.length).toBe(2);   // should not be deleted on error
    });
  });

  describe('openDetail', () => {
    it('should open order detail with full order data', () => {
      const fullOrder = { ...mockOrders[0], orderItems: [] };
      mockShopService.getOrder.mockReturnValue(of(fullOrder));

      component.openDetail(mockOrders[0]);

      expect(component.selectedOrder).toEqual(fullOrder);
      expect(mockShopService.getOrder).toHaveBeenCalledWith(1);
    });

    it('should open order detail with partial order data on error', () => {
      mockShopService.getOrder.mockReturnValue(throwError(() => new Error('Error')));

      component.openDetail(mockOrders[0]);

      expect(component.selectedOrder).toEqual(mockOrders[0]);
    });
  });

  describe('getNextStatuses', () => {
    it('should return next valid statuses', () => {
      expect(component.getNextStatuses('PENDING')).toEqual(['CONFIRMED', 'CANCELLED']);
      expect(component.getNextStatuses('CONFIRMED')).toEqual(['PROCESSING', 'CANCELLED']);
      expect(component.getNextStatuses('PROCESSING')).toEqual(['SHIPPED', 'CANCELLED']);
      expect(component.getNextStatuses('SHIPPED')).toEqual(['DELIVERED']);
      expect(component.getNextStatuses('DELIVERED')).toEqual([]);
      expect(component.getNextStatuses('CANCELLED')).toEqual([]);
    });
  });

  describe('getStatusStyle', () => {
    it('should return correct style for status', () => {
      expect(component.getStatusStyle('PENDING')).toEqual('bg-yellow-100 text-yellow-700');
      expect(component.getStatusStyle('CONFIRMED')).toEqual('bg-blue-100 text-blue-700');
      expect(component.getStatusStyle('PROCESSING')).toEqual('bg-purple-100 text-purple-700');
      expect(component.getStatusStyle('SHIPPED')).toEqual('bg-indigo-100 text-indigo-700');
      expect(component.getStatusStyle('DELIVERED')).toEqual('bg-green-100 text-green-700');
      expect(component.getStatusStyle('CANCELLED')).toEqual('bg-red-100 text-red-700');
    });
  });
});