import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToastService, Toast } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ToastService] });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => expect(service).toBeTruthy());

  it('should add success toast', () => {
    let toasts: Toast[] = [];
    service.getToasts().subscribe(t => toasts = t);
    service.success('Done!');
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].message).toBe('Done!');
  });

  it('should add error toast', () => {
    let toasts: Toast[] = [];
    service.getToasts().subscribe(t => toasts = t);
    service.error('Failed!');
    expect(toasts[0].type).toBe('error');
  });

  it('should add info toast', () => {
    let toasts: Toast[] = [];
    service.getToasts().subscribe(t => toasts = t);
    service.info('Info');
    expect(toasts[0].type).toBe('info');
  });

  it('should add warning toast', () => {
    let toasts: Toast[] = [];
    service.getToasts().subscribe(t => toasts = t);
    service.warning('Warn');
    expect(toasts[0].type).toBe('warning');
  });

  it('should remove toast by id', () => {
    let toasts: Toast[] = [];
    service.getToasts().subscribe(t => toasts = t);
    service.success('Test');
    const id = toasts[0].id;
    service.remove(id);
    expect(toasts.length).toBe(0);
  });

  it('should clear all toasts', () => {
    let toasts: Toast[] = [];
    service.getToasts().subscribe(t => toasts = t);
    service.success('A');
    service.error('B');
    service.clear();
    expect(toasts.length).toBe(0);
  });

  it('should auto-remove toast after duration', fakeAsync(() => {
    let toasts: Toast[] = [];
    service.getToasts().subscribe(t => toasts = t);
    service.success('Auto remove', 1000);
    expect(toasts.length).toBe(1);
    tick(1000);
    expect(toasts.length).toBe(0);
  }));

  it('should assign unique ids to multiple toasts', () => {
    let toasts: Toast[] = [];
    service.getToasts().subscribe(t => toasts = t);
    service.success('A');
    service.success('B');
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });
});
