import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackofficeOrdersComponent } from './orders-management.component';
import { ShopService } from '../../core/services/shop.service';
import { ToastService } from '../shared/services/toast.service';
import { of, throwError } from 'rxjs';
import { Order, OrderStats, OrderStatus } from '../../core/models/shop.model';

describe('BackofficeOrdersComponent', () => {
  let component: BackofficeOrdersComponent;
  let fixture: ComponentFixture<BackofficeOrdersComponent>;
  let mockShopService: jasmine.SpyObj<ShopService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

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
    cancelled: 0,
    revenueThisMonth: 1500.00
  };

  beforeEach(async () => {
    mockShopService = jasmine.createSpyObj<ShopService>('ShopService', [
      'adminGetStats',
      'adminGetAllOrders',
      'adminGetOrdersByStatus',
      'adminUpdateOrderStatus',
      'adminDeleteOrder',
      'getOrder'
    ]);

    mockToastService = jasmine.createSpyObj<ToastService>('ToastService', [
      'success',
      'error'
    ]);

    await TestBed.configureTestingModule({
      imports: [BackofficeOrdersComponent],
      providers: [
        { provide: ShopService, useValue: mockShopService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BackofficeOrdersComponent);
    component = fixture.componentInstance;

    // Default successful responses
    mockShopService.adminGetStats.and.returnValue(of(mockStats));
    mockShopService.adminGetAllOrders.and.returnValue(of(mockOrders));
  });

  describe('ngOnInit', () => {
    it('should load stats and orders on initialization', () => {
      component.ngOnInit();

      expect(component.stats).toEqual(mockStats);
      expect(component.orders).toEqual(mockOrders);
      expect(component.filteredOrders).toEqual(mockOrders);
      expect(mockShopService.adminGetStats).toHaveBeenCalled();
      expect(mockShopService.adminGetAllOrders).toHaveBeenCalled();
    });

    it('should handle error when loading stats', () => {
      mockShopService.adminGetStats.and.returnValue(throwError(() => new Error('Error')));
      mockShopService.adminGetAllOrders.and.returnValue(of(mockOrders));

      component.ngOnInit();

      expect(component.stats).toBeNull();
      expect(component.orders).toEqual(mockOrders);
    });

    it('should handle error when loading orders', () => {
      mockShopService.adminGetStats.and.returnValue(of(mockStats));
      mockShopService.adminGetAllOrders.and.returnValue(throwError(() => new Error('Error')));

      component.ngOnInit();

      expect(component.stats).toEqual(mockStats);
      expect(component.orders).toEqual([]);
      expect(component.loading).toBeFalse();
      expect(mockToastService.error).toHaveBeenCalledWith('Failed to load orders');
    });
  });

  describe('loadStats', () => {
    it('should load stats and update component', () => {
      component.loadStats();

      expect(component.stats).toEqual(mockStats);
      expect(mockShopService.adminGetStats).toHaveBeenCalled();
    });

    it('should handle error when loading stats', () => {
      mockShopService.adminGetStats.and.returnValue(throwError(() => new Error('Error')));

      component.loadStats();

      expect(component.stats).toBeNull();
    });
  });

  describe('loadOrders', () => {
    it('should load orders and apply filter', () => {
      component.loadOrders();

      expect(component.orders).toEqual(mockOrders);
      expect(component.filteredOrders).toEqual(mockOrders);
      expect(component.loading).toBeFalse();
      expect(mockShopService.adminGetAllOrders).toHaveBeenCalled();
    });

    it('should handle error when loading orders', () => {
      mockShopService.adminGetAllOrders.and.returnValue(throwError(() => new Error('Error')));

      component.loadOrders();

      expect(component.orders).toEqual([]);
      expect(component.loading).toBeFalse();
      expect(mockToastService.error).toHaveBeenCalledWith('Failed to load orders');
    });
  });

  describe('onFilterChange', () => {
    it('should filter orders by status', () => {
      component.orders = mockOrders;
      mockShopService.adminGetOrdersByStatus.and.returnValue(of([mockOrders[0]]));

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
      mockShopService.adminGetOrdersByStatus.and.returnValue(throwError(() => new Error('Error')));

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
      mockShopService.adminUpdateOrderStatus.and.returnValue(of(updatedOrder));

      component.orders = [...mockOrders];
      const originalOrder = component.orders[0];

      component.onStatusChange(originalOrder, 'CONFIRMED');

      expect(mockShopService.adminUpdateOrderStatus).toHaveBeenCalledWith(1, 'CONFIRMED');
      expect(originalOrder.status).toBe('CONFIRMED');
      expect(mockToastService.success).toHaveBeenCalledWith('Order #1 → CONFIRMED');
      expect(mockShopService.adminGetStats).toHaveBeenCalled();
    });

    it('should handle error when updating status', () => {
      mockShopService.adminUpdateOrderStatus.and.returnValue(throwError(() => new Error('Error')));

      component.orders = [...mockOrders];

      component.onStatusChange(mockOrders[0], 'CONFIRMED');

      expect(mockShopService.adminUpdateOrderStatus).toHaveBeenCalledWith(1, 'CONFIRMED');
      expect(mockToastService.error).toHaveBeenCalledWith('Failed to update status');
    });

    it('should return early when newStatus is empty string', () => {
      component.orders = [...mockOrders];
      component.onStatusChange(mockOrders[0], '' as any);
      expect(mockShopService.adminUpdateOrderStatus).not.toHaveBeenCalled();
    });
  });

  describe('deleteOrder', () => {
    it('should delete order and refresh data', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      mockShopService.adminDeleteOrder.and.returnValue(of(undefined));
      mockShopService.adminGetStats.and.returnValue(of(mockStats));

      component.orders = [...mockOrders];

      component.deleteOrder(1);

      expect(mockShopService.adminDeleteOrder).toHaveBeenCalledWith(1);
      expect(component.orders.length).toBe(1);
      expect(component.orders[0].id).toBe(2);
      expect(mockToastService.success).toHaveBeenCalledWith('Order #1 deleted');
      expect(mockShopService.adminGetStats).toHaveBeenCalled();
    });

    it('should handle error when deleting order', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      mockShopService.adminDeleteOrder.and.returnValue(throwError(() => new Error('Error')));

      component.orders = [...mockOrders];

      component.deleteOrder(1);

      expect(mockShopService.adminDeleteOrder).toHaveBeenCalledWith(1);
      expect(mockToastService.error).toHaveBeenCalledWith('Failed to delete order');
      expect(component.orders.length).toBe(2); // should not be deleted on error
    });
  });

  describe('openDetail', () => {
    it('should open order detail with full order data', () => {
      const fullOrder = { ...mockOrders[0], orderItems: [] };
      mockShopService.getOrder.and.returnValue(of(fullOrder));

      component.openDetail(mockOrders[0]);

      expect(component.selectedOrder).toEqual(fullOrder);
      expect(mockShopService.getOrder).toHaveBeenCalledWith(1);
    });

    it('should open order detail with partial order data on error', () => {
      mockShopService.getOrder.and.returnValue(throwError(() => new Error('Error')));

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