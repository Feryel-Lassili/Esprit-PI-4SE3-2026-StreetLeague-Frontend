import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-6 right-6 z-50 space-y-3 max-w-md pointer-events-none">
      <div *ngFor="let toast of (toastService.getToasts() | async)"
           class="animate-slideIn"
           [ngClass]="{
             'bg-green-50 border-green-200 text-green-700': toast.type === 'success',
             'bg-red-50 border-red-200 text-red-700': toast.type === 'error',
             'bg-blue-50 border-blue-200 text-blue-700': toast.type === 'info',
             'bg-yellow-50 border-yellow-200 text-yellow-700': toast.type === 'warning'
           }"
           class="border rounded-2xl p-4 shadow-lg flex items-start justify-between pointer-events-auto">
        <div class="flex items-start gap-3">
          <span class="text-xl mt-0.5">
            {{ getIcon(toast.type) }}
          </span>
          <p class="text-sm font-medium">{{ toast.message }}</p>
        </div>
        <button (click)="toastService.remove(toast.id)"
                class="text-lg hover:opacity-60 flex-shrink-0">
          ✕
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(400px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .animate-slideIn {
      animation: slideIn 0.3s ease-out;
    }
  `]
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      default: return '📢';
    }
  }
}


