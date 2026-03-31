import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { PlayerMerchandiseComponent } from './player-merchandise.component';
import { ShopService } from '../../core/services/shop.service';
import { ToastService } from '../shared/services/toast.service';
import { MerchandiseSubmission } from '../../core/models/shop.model';

const mockSubmission: MerchandiseSubmission = {
  id: 1, name: 'Signed Jersey', price: 60, stock: 5,
  category: 'Jersey', image: '', sportType: 'FOOTBALL', status: 'PENDING'
};

function makeShopSvc() {
  return jasmine.createSpyObj<ShopService>('ShopService', {
    getMySubmissions: of([mockSubmission]),
    submitMerchandise: of({ ...mockSubmission, id: 2 }),
    updateMySubmission: of(mockSubmission),
    deleteMySubmission: of(undefined)
  });
}

function makeToastSvc() {
  return jasmine.createSpyObj<ToastService>('ToastService', ['success', 'error', 'info']);
}

describe('PlayerMerchandiseComponent', () => {
  let component: PlayerMerchandiseComponent;
  let fixture: ComponentFixture<PlayerMerchandiseComponent>;
  let shopSvc: jasmine.SpyObj<ShopService>;
  let toastSvc: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    shopSvc = makeShopSvc();
    toastSvc = makeToastSvc();
    await TestBed.configureTestingModule({
      declarations: [PlayerMerchandiseComponent],
      imports: [CommonModule, FormsModule],
      providers: [
        { provide: ShopService, useValue: shopSvc },
        { provide: ToastService, useValue: toastSvc }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(PlayerMerchandiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load submissions on init', () => {
    expect(component.submissions.length).toBe(1);
    expect(component.submissions[0].name).toBe('Signed Jersey');
    expect(component.loading).toBeFalse();
  });

  it('should handle load error', () => {
    shopSvc.getMySubmissions.and.returnValue(throwError(() => new Error('fail')));
    component.loadSubmissions();
    expect(toastSvc.error).toHaveBeenCalledWith('Failed to load submissions');
    expect(component.loading).toBeFalse();
  });

  it('should submit form and reload', () => {
    component.form = { name: 'Ball', price: 30, stock: 10, category: 'Sport', image: '', sportType: 'FOOTBALL' };
    component.submitForm();
    expect(shopSvc.submitMerchandise).toHaveBeenCalled();
    expect(toastSvc.success).toHaveBeenCalledWith('Submitted for review!');
    expect(component.form.name).toBe('');
  });

  it('should handle submit error', () => {
    shopSvc.submitMerchandise.and.returnValue(throwError(() => new Error('fail')));
    component.form = { name: 'Ball', price: 30, stock: 10, category: 'Sport', image: '', sportType: 'FOOTBALL' };
    component.submitForm();
    expect(toastSvc.error).toHaveBeenCalledWith('Submission failed');
    expect(component.submitting).toBeFalse();
  });

  it('should open edit modal with submission data', () => {
    component.openEdit(mockSubmission);
    expect(component.editTarget).toEqual(mockSubmission);
    expect(component.editForm.name).toBe('Signed Jersey');
  });

  it('should close edit modal', () => {
    component.openEdit(mockSubmission);
    component.closeEdit();
    expect(component.editTarget).toBeNull();
  });

  it('should save edit and reload', () => {
    component.openEdit(mockSubmission);
    component.editForm.name = 'Updated Jersey';
    component.saveEdit();
    expect(shopSvc.updateMySubmission).toHaveBeenCalledWith(1, component.editForm);
    expect(toastSvc.success).toHaveBeenCalledWith('Updated successfully');
    expect(component.editTarget).toBeNull();
  });

  it('should not save edit when no editTarget id', () => {
    component.editTarget = { name: 'Test', price: 10, stock: 1, category: 'Cat', image: '', sportType: 'FOOTBALL' };
    component.saveEdit();
    expect(shopSvc.updateMySubmission).not.toHaveBeenCalled();
  });

  it('should handle save edit error', () => {
    shopSvc.updateMySubmission.and.returnValue(throwError(() => new Error('fail')));
    component.openEdit(mockSubmission);
    component.saveEdit();
    expect(toastSvc.error).toHaveBeenCalledWith('Update failed');
    expect(component.saving).toBeFalse();
  });

  it('should delete submission after confirm', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.deleteSubmission(1);
    expect(shopSvc.deleteMySubmission).toHaveBeenCalledWith(1);
    expect(toastSvc.success).toHaveBeenCalledWith('Deleted');
  });

  it('should not delete when confirm cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.deleteSubmission(1);
    expect(shopSvc.deleteMySubmission).not.toHaveBeenCalled();
  });

  it('should handle delete error', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    shopSvc.deleteMySubmission.and.returnValue(throwError(() => new Error('fail')));
    component.deleteSubmission(1);
    expect(toastSvc.error).toHaveBeenCalledWith('Delete failed');
  });

  it('sportEmoji should return correct emoji', () => {
    expect(component.sportEmoji('FOOTBALL')).toBe('⚽');
    expect(component.sportEmoji('BASKETBALL')).toBe('🏀');
    expect(component.sportEmoji('TENNIS')).toBe('🎾');
    expect(component.sportEmoji('VOLLEYBALL')).toBe('🏐');
    expect(component.sportEmoji('UNKNOWN')).toBe('📦');
  });
});
