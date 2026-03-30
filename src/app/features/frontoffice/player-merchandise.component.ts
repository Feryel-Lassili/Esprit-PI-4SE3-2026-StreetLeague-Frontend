import { Component, OnInit } from '@angular/core';
import { ShopService } from '../../core/services/shop.service';
import { ToastService } from '../shared/services/toast.service';
import { MerchandiseSubmission, MerchandiseStatus, SportType } from '../../core/models/shop.model';

@Component({
  selector: 'fo-player-merchandise',
  standalone: false,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6">
      <h1 class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-8">My Merchandise</h1>

      <!-- Submission Form -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
        <h2 class="text-xl font-bold mb-5 text-gray-900">Submit New Product</h2>
        <form (ngSubmit)="submitForm()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Product Name</label>
            <input [(ngModel)]="form.name" name="name" required placeholder="e.g. Signed Jersey"
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Category</label>
            <input [(ngModel)]="form.category" name="category" required placeholder="e.g. Jersey, Ball"
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Price ($)</label>
            <input [(ngModel)]="form.price" name="price" type="number" min="0" required
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Stock</label>
            <input [(ngModel)]="form.stock" name="stock" type="number" min="0" required
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Sport Type</label>
            <select [(ngModel)]="form.sportType" name="sportType" required
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
              <option value="">Select sport</option>
              <option *ngFor="let s of sports" [value]="s">{{ s }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Image URL</label>
            <input [(ngModel)]="form.image" name="image" placeholder="https://..."
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
          </div>
          <div class="md:col-span-2 flex justify-end">
            <button type="submit" [disabled]="submitting"
                    class="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50">
              {{ submitting ? 'Submitting...' : 'Submit for Review' }}
            </button>
          </div>
        </form>
      </div>

      <!-- My Submissions -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 class="text-xl font-bold mb-5 text-gray-900">My Submissions</h2>
        <div *ngIf="loading" class="text-center py-10 text-gray-400">Loading...</div>
        <div *ngIf="!loading && submissions.length === 0" class="text-center py-10 text-gray-400">No submissions yet.</div>
        <div class="overflow-x-auto">
          <table *ngIf="!loading && submissions.length > 0" class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 font-bold text-gray-600 uppercase text-xs">Product</th>
                <th class="text-left py-3 px-4 font-bold text-gray-600 uppercase text-xs">Price</th>
                <th class="text-left py-3 px-4 font-bold text-gray-600 uppercase text-xs">Sport</th>
                <th class="text-left py-3 px-4 font-bold text-gray-600 uppercase text-xs">Status</th>
                <th class="text-left py-3 px-4 font-bold text-gray-600 uppercase text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of submissions" class="border-b border-gray-100 hover:bg-gray-50">
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                      <img *ngIf="s.image" [src]="s.image" [alt]="s.name"
                           class="w-full h-full object-cover"
                           (error)="$any($event.target).style.display='none'">
                      <span *ngIf="!s.image" class="text-xl">{{ sportEmoji(s.sportType) }}</span>
                    </div>
                    <span class="font-medium text-gray-900">{{ s.name }}</span>
                  </div>
                </td>
                <td class="py-3 px-4 text-gray-600">\${{ s.price }}</td>
                <td class="py-3 px-4 text-gray-600">{{ s.sportType }}</td>
                <td class="py-3 px-4">
                  <span class="px-3 py-1 rounded-full text-xs font-bold"
                        [class.bg-yellow-100]="s.status === 'PENDING'"
                        [class.text-yellow-800]="s.status === 'PENDING'"
                        [class.bg-green-100]="s.status === 'APPROVED'"
                        [class.text-green-800]="s.status === 'APPROVED'"
                        [class.bg-red-100]="s.status === 'REJECTED'"
                        [class.text-red-800]="s.status === 'REJECTED'">
                    {{ s.status }}
                  </span>
                  <span *ngIf="s.status === 'REJECTED' && s.rejectionReason"
                        class="ml-2 text-xs text-red-500 italic">{{ s.rejectionReason }}</span>
                </td>
                <td class="py-3 px-4 flex gap-2">
                  <button *ngIf="s.status === 'PENDING'"
                          (click)="openEdit(s)"
                          class="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors">
                    Edit
                  </button>
                  <button (click)="deleteSubmission(s.id!)"
                          class="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div *ngIf="editTarget"
         class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
         (click)="closeEdit()">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6" (click)="$event.stopPropagation()">
        <div class="flex justify-between items-center mb-5">
          <h3 class="text-xl font-bold">Edit Submission</h3>
          <button (click)="closeEdit()" class="text-2xl text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form (ngSubmit)="saveEdit()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Name</label>
            <input [(ngModel)]="editForm.name" name="eName" required
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Category</label>
            <input [(ngModel)]="editForm.category" name="eCat" required
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Price ($)</label>
            <input [(ngModel)]="editForm.price" name="ePrice" type="number" min="0" required
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Stock</label>
            <input [(ngModel)]="editForm.stock" name="eStock" type="number" min="0" required
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Sport Type</label>
            <select [(ngModel)]="editForm.sportType" name="eSport" required
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
              <option *ngFor="let s of sports" [value]="s">{{ s }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-gray-600 mb-1">Image URL</label>
            <input [(ngModel)]="editForm.image" name="eImage"
                   class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
          </div>
          <div class="md:col-span-2 flex justify-end gap-3">
            <button type="button" (click)="closeEdit()"
                    class="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" [disabled]="saving"
                    class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PlayerMerchandiseComponent implements OnInit {
  submissions: MerchandiseSubmission[] = [];
  loading = false;
  submitting = false;
  saving = false;
  editTarget: MerchandiseSubmission | null = null;
  editForm: MerchandiseSubmission = this.emptyForm();
  form: MerchandiseSubmission = this.emptyForm();
  sports: SportType[] = ['FOOTBALL', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL'];

  constructor(private shopService: ShopService, private toast: ToastService) {}

  ngOnInit() { this.loadSubmissions(); }

  private emptyForm(): MerchandiseSubmission {
    return { name: '', price: 0, stock: 0, category: '', image: '', sportType: 'FOOTBALL' };
  }

  loadSubmissions() {
    this.loading = true;
    this.shopService.getMySubmissions().subscribe({
      next: data => { this.submissions = data; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Failed to load submissions'); }
    });
  }

  submitForm() {
    this.submitting = true;
    this.shopService.submitMerchandise(this.form).subscribe({
      next: () => {
        this.submitting = false;
        this.form = this.emptyForm();
        this.toast.success('Submitted for review!');
        this.loadSubmissions();
      },
      error: () => { this.submitting = false; this.toast.error('Submission failed'); }
    });
  }

  openEdit(s: MerchandiseSubmission) {
    this.editTarget = s;
    this.editForm = { ...s };
  }

  closeEdit() { this.editTarget = null; }

  saveEdit() {
    if (!this.editTarget?.id) return;
    this.saving = true;
    this.shopService.updateMySubmission(this.editTarget.id, this.editForm).subscribe({
      next: () => {
        this.saving = false;
        this.closeEdit();
        this.toast.success('Updated successfully');
        this.loadSubmissions();
      },
      error: () => { this.saving = false; this.toast.error('Update failed'); }
    });
  }

  deleteSubmission(id: number) {
    if (!confirm('Delete this submission?')) return;
    this.shopService.deleteMySubmission(id).subscribe({
      next: () => { this.toast.success('Deleted'); this.loadSubmissions(); },
      error: () => this.toast.error('Delete failed')
    });
  }

  sportEmoji(sportType: string): string {
    const map: Record<string, string> = { FOOTBALL: '⚽', BASKETBALL: '🏀', TENNIS: '🎾', VOLLEYBALL: '🏐' };
    return map[sportType] ?? '📦';
  }
}
