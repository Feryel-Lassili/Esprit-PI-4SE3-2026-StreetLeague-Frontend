import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { MerchandiseAdminComponent } from './merchandise-admin.component';
import { ShopService } from '../../core/services/shop.service';
import { ToastService } from '../shared/services/toast.service';
import { MerchandiseSubmission } from '../../core/models/shop.model';

const mockPending: MerchandiseSubmission = {
  id: 1, name: 'Liverpool Jersey', price: 60, stock: 5,
  category: 'Jersey', image: 'http://img.com/jersey.jpg',
  sportType: 'FOOTBALL', status: 'PENDING', sellerName: 'player1',
  submittedAt: '2026-03-30T10:00:00'
};

const mockStats = { pending: 1, approved: 1, rejected: 0 };

function makeShopSvc() {
  return jasmine.createSpyObj<ShopService>('ShopService', {
    adminGetPendingMerchandise: of({ content: [mockPending], totalElements: 1, totalPages: 1, currentPage: 0, pageSize: 20 }),
    adminGetMerchandiseStats: of(mockStats),
    adminApproveMerchandise: of({ ...mockPending, status: 'APPROVED' as any }),
    adminRejectMerchandise: of({ ...mockPending, status: 'REJECTED' as any })
  });
}

function makeToastSvc() {
  return jasmine.createSpyObj<ToastService>('ToastService', ['success', 'error']);
}

describe('MerchandiseAdminComponent', () => {
  let component: MerchandiseAdminComponent;
  let fixture: ComponentFixture<MerchandiseAdminComponent>;
  let shopSvc: jasmine.SpyObj<ShopService>;
  let toastSvc: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    shopSvc = makeShopSvc();
    toastSvc = makeToastSvc();
    await TestBed.configureTestingModule({
      imports: [MerchandiseAdminComponent],
      providers: [
        { provide: ShopService, useValue: shopSvc },
        { provide: ToastService, useValue: toastSvc }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(MerchandiseAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load pending submissions on init', () => {
    expect(component.pending.length).toBe(1);
    expect(component.pending[0].name).toBe('Liverpool Jersey');
    expect(component.loading).toBeFalse();
  });

  it('should load stats on init', () => {
    expect(component.stats).toEqual(mockStats);
  });

  it('should handle plain array response', () => {
    shopSvc.adminGetPendingMerchandise.and.returnValue(of([mockPending] as any));
    component.loadData();
    expect(component.pending.length).toBe(1);
  });

  it('should handle load error', () => {
    shopSvc.adminGetPendingMerchandise.and.returnValue(throwError(() => ({ status: 403 })));
    component.loadData();
    expect(toastSvc.error).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('should approve submission and reload', () => {
    component.approve(mockPending);
    expect(shopSvc.adminApproveMerchandise).toHaveBeenCalledWith(1);
    expect(toastSvc.success).toHaveBeenCalled();
  });

  it('should handle approve error', () => {
    shopSvc.adminApproveMerchandise.and.returnValue(throwError(() => new Error('fail')));
    component.approve(mockPending);
    expect(toastSvc.error).toHaveBeenCalledWith('Approval failed');
  });

  it('should open reject modal', () => {
    component.openReject(mockPending);
    expect(component.rejectTarget).toEqual(mockPending);
    expect(component.rejectReason).toBe('');
  });

  it('should close reject modal', () => {
    component.openReject(mockPending);
    component.closeReject();
    expect(component.rejectTarget).toBeNull();
  });

  it('should confirm reject and reload', () => {
    component.openReject(mockPending);
    component.rejectReason = 'Not suitable';
    component.confirmReject();
    expect(shopSvc.adminRejectMerchandise).toHaveBeenCalledWith(1, 'Not suitable');
    expect(toastSvc.success).toHaveBeenCalled();
    expect(component.rejectTarget).toBeNull();
  });

  it('should not reject when no rejectTarget id', () => {
    component.rejectTarget = { name: 'Test', price: 10, stock: 1, category: 'Cat', image: '', sportType: 'FOOTBALL' };
    component.confirmReject();
    expect(shopSvc.adminRejectMerchandise).not.toHaveBeenCalled();
  });

  it('should handle reject error', () => {
    shopSvc.adminRejectMerchandise.and.returnValue(throwError(() => new Error('fail')));
    component.openReject(mockPending);
    component.confirmReject();
    expect(toastSvc.error).toHaveBeenCalledWith('Rejection failed');
    expect(component.processing).toBeFalse();
  });

  it('sportEmoji should return correct emoji', () => {
    expect(component.sportEmoji('FOOTBALL')).toBe('⚽');
    expect(component.sportEmoji('BASKETBALL')).toBe('🏀');
    expect(component.sportEmoji('TENNIS')).toBe('🎾');
    expect(component.sportEmoji('VOLLEYBALL')).toBe('🏐');
    expect(component.sportEmoji('OTHER')).toBe('📦');
  });
});
