import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService } from '../../core/services/shop.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../shared/services/toast.service';
import { Product, SportType } from '../../core/models/shop.model';

@Component({
  selector: 'bo-shop',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-black text-gray-900">📦 Product Management</h1>
          <p class="text-gray-600 mt-1">Manage your shop inventory and products</p>
        </div>
        <button (click)="openForm()" 
                class="bg-[#0D6EFD] text-white px-6 py-3 rounded-2xl font-bold hover:bg-[#0b5ed7] transition-all shadow-lg">
          + Add Product
        </button>
      </div>

      <!-- Search & Filter Bar -->
      <div class="bg-white rounded-2xl shadow p-4 mb-6 border border-gray-100">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input [(ngModel)]="searchQuery" 
                 (ngModelChange)="onSearchChange()"
                 type="text" 
                 placeholder="Search products..." 
                 class="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#0D6EFD] focus:outline-none">
          
          <input [(ngModel)]="filterCategory" 
                 (ngModelChange)="onFilterChange()"
                 type="text" 
                 placeholder="Filter by category..." 
                 class="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#0D6EFD] focus:outline-none">
          
          <select [(ngModel)]="filterSportType" 
                  (ngModelChange)="onFilterChange()"
                  class="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-[#0D6EFD] focus:outline-none">
            <option value="">All Sports</option>
            <option value="FOOTBALL">Football</option>
            <option value="BASKETBALL">Basketball</option>
            <option value="TENNIS">Tennis</option>
            <option value="VOLLEYBALL">Volleyball</option>
          </select>

          <button (click)="resetFilters()"
                  class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all">
            Reset
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-2xl shadow p-5 border-l-4 border-[#0D6EFD]">
          <p class="text-gray-600 text-sm">Total Products</p>
          <p class="text-3xl font-black text-[#0D6EFD]">{{ filteredProducts.length }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-5 border-l-4 border-[#32CD32]">
          <p class="text-gray-600 text-sm">In Stock</p>
          <p class="text-3xl font-black text-[#32CD32]">{{ inStockCount }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-5 border-l-4 border-[#FFD60A]">
          <p class="text-gray-600 text-sm">Low Stock</p>
          <p class="text-3xl font-black text-[#FFD60A]">{{ lowStockCount }}</p>
        </div>
        <div class="bg-white rounded-2xl shadow p-5 border-l-4 border-[#FF6B6B]">
          <p class="text-gray-600 text-sm">Out of Stock</p>
          <p class="text-3xl font-black text-[#FF6B6B]">{{ outOfStockCount }}</p>
        </div>
      </div>

      <!-- Form Modal -->
      <div *ngIf="showForm" 
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4"
           (click)="closeForm()">
        <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
             (click)="$event.stopPropagation()">
          <div class="p-8">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h2 class="text-2xl font-black text-gray-900">{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h2>
                <p class="text-gray-600 mt-1">{{ editingProduct ? 'Update product details' : 'Create a new product' }}</p>
              </div>
              <button (click)="closeForm()" class="text-3xl text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form (ngSubmit)="saveProduct()" class="space-y-5">
              <!-- Name -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                <input [(ngModel)]="formData.name" 
                       name="name"
                       type="text"
                       placeholder="e.g., Pro Football Jersey"
                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0D6EFD] focus:outline-none transition-all"
                       [class.border-red-500]="isFieldInvalid('name')">
                <span class="text-red-600 text-sm" *ngIf="isFieldInvalid('name')">{{ getFieldError('name') }}</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Price -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Price (\$) *</label>
                  <input [(ngModel)]="formData.price" 
                         name="price"
                         type="number"
                         placeholder="0.00"
                         min="0"
                         step="0.01"
                         class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0D6EFD] focus:outline-none transition-all"
                         [class.border-red-500]="isFieldInvalid('price')">
                  <span class="text-red-600 text-sm" *ngIf="isFieldInvalid('price')">{{ getFieldError('price') }}</span>
                </div>

                <!-- Stock -->
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Stock Quantity *</label>
                  <input [(ngModel)]="formData.stock" 
                         name="stock"
                         type="number"
                         placeholder="0"
                         min="0"
                         class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0D6EFD] focus:outline-none transition-all"
                         [class.border-red-500]="isFieldInvalid('stock')">
                  <span class="text-red-600 text-sm" *ngIf="isFieldInvalid('stock')">{{ getFieldError('stock') }}</span>
                </div>
              </div>

              <!-- Category & Sport Type -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                  <input [(ngModel)]="formData.category" 
                         name="category"
                         type="text"
                         placeholder="e.g., Jersey, Ball, Shoes"
                         class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0D6EFD] focus:outline-none transition-all"
                         [class.border-red-500]="isFieldInvalid('category')">
                  <span class="text-red-600 text-sm" *ngIf="isFieldInvalid('category')">{{ getFieldError('category') }}</span>
                </div>

                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Sport Type *</label>
                  <select [(ngModel)]="formData.sportType"
                          name="sportType"
                          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0D6EFD] focus:outline-none transition-all"
                          [class.border-red-500]="isFieldInvalid('sportType')">
                    <option value="FOOTBALL">Football</option>
                    <option value="BASKETBALL">Basketball</option>
                    <option value="TENNIS">Tennis</option>
                    <option value="VOLLEYBALL">Volleyball</option>
                  </select>
                  <span class="text-red-600 text-sm" *ngIf="isFieldInvalid('sportType')">{{ getFieldError('sportType') }}</span>
                </div>
              </div>

              <!-- Image -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Product Image *</label>

                <!-- Preview -->
                <div *ngIf="formData.image" class="mb-3 relative w-full h-40 rounded-xl overflow-hidden bg-gray-100">
                  <img [src]="formData.image" alt="Preview" class="w-full h-full object-cover">
                  <button type="button" (click)="formData.image = ''"
                          class="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full text-sm font-bold hover:bg-red-600">✕</button>
                </div>

                <!-- Upload Button -->
                <div class="flex gap-3 mb-3">
                  <label class="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#0D6EFD] hover:bg-blue-50 transition-all">
                    <span *ngIf="!isUploading">📁 Upload from device</span>
                    <span *ngIf="isUploading">⏳ Uploading...</span>
                    <input type="file" accept="image/*" class="hidden" (change)="onImageFileSelected($event)" [disabled]="isUploading">
                  </label>
                </div>

                <!-- URL Input -->
                <input [(ngModel)]="formData.image"
                       name="image"
                       type="text"
                       placeholder="Or paste image URL (https://...)"
                       class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0D6EFD] focus:outline-none transition-all"
                       [class.border-red-500]="isFieldInvalid('image')">
                <span class="text-red-600 text-sm" *ngIf="isFieldInvalid('image')">{{ getFieldError('image') }}</span>
              </div>

              <!-- Form Actions -->
              <div class="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button type="submit"
                        [disabled]="isFormSubmitting"
                        class="flex-1 bg-[#32CD32] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#228B22] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {{ isFormSubmitting ? '⏳ Saving...' : '✓ Save Product' }}
                </button>
                <button type="button"
                        (click)="closeForm()"
                        class="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Products Table/Cards View -->
      <div class="bg-white rounded-2xl shadow border border-gray-100">
        <!-- Loading State -->
        <div *ngIf="loading" class="p-12 text-center">
          <div class="text-4xl mb-4">⏳</div>
          <p class="text-gray-600">Loading products...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && filteredProducts.length === 0" class="p-12 text-center">
          <div class="text-6xl mb-4">📭</div>
          <p class="text-gray-600 mb-4">{{ searchQuery || filterCategory || filterSportType !== '' ? 'No products match your filters' : 'No products yet' }}</p>
          <button *ngIf="!searchQuery && !filterCategory && filterSportType === ''" 
                  (click)="openForm()"
                  class="bg-[#0D6EFD] text-white px-6 py-3 rounded-xl font-bold">
            + Add First Product
          </button>
        </div>

        <!-- Responsive Table -->
        <div *ngIf="!loading && filteredProducts.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Product</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Category</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Sport</th>
                <th class="px-6 py-4 text-right text-sm font-bold text-gray-700">Price</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-gray-700">Stock Status</th>
                <th class="px-6 py-4 text-left text-sm font-bold text-gray-700">Stock</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of filteredProducts" 
                  class="border-t border-gray-100 hover:bg-gray-50 transition-all">
                <!-- Product Info -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <img *ngIf="p.image" [src]="p.image" [alt]="p.name" class="w-10 h-10 object-cover rounded-lg">
                    <span *ngIf="!p.image" class="text-3xl">📦</span>
                    <div>
                      <p class="font-bold text-gray-900">{{ p.name }}</p>
                      <p class="text-xs text-gray-500">ID: {{ p.id }}</p>
                    </div>
                  </div>
                </td>
                <!-- Category -->
                <td class="px-6 py-4">
                  <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                    {{ p.category }}
                  </span>
                </td>
                <!-- Sport Type -->
                <td class="px-6 py-4">
                  <span class="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium">
                    {{ p.sportType }}
                  </span>
                </td>
                <!-- Price -->
                <td class="px-6 py-4 text-right">
                  <span class="text-lg font-black text-[#0D6EFD]">\${{ p.price.toFixed(2) }}</span>
                </td>
                <!-- Stock Status -->
                <td class="px-6 py-4 text-center">
                  <ng-container *ngIf="p.stock > 5">
                    <span class="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg font-medium">
                      <span class="w-2 h-2 bg-green-600 rounded-full"></span>
                      In Stock
                    </span>
                  </ng-container>
                  <ng-container *ngIf="p.stock > 0 && p.stock <= 5">
                    <span class="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg font-medium">
                      <span class="w-2 h-2 bg-yellow-600 rounded-full"></span>
                      Low Stock
                    </span>
                  </ng-container>
                  <ng-container *ngIf="p.stock === 0">
                    <span class="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-lg font-medium">
                      <span class="w-2 h-2 bg-red-600 rounded-full"></span>
                      Out of Stock
                    </span>
                  </ng-container>
                </td>
                <!-- Stock Quantity -->
                <td class="px-6 py-4 text-gray-900 font-bold">{{ p.stock }}</td>
                <!-- Actions -->
                <td class="px-6 py-4">
                  <div class="flex gap-2 justify-center">
                    <button (click)="editProduct(p)"
                            title="Edit"
                            class="p-2 hover:bg-blue-100 text-[#0D6EFD] rounded-lg transition-all">
                      ✏️
                    </button>
                    <button *ngIf="isAdmin" 
                            (click)="deleteProduct(p.id!)"
                            title="Delete"
                            [disabled]="isDeletingId === p.id"
                            class="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all disabled:opacity-50">
                      {{ isDeletingId === p.id ? '⏳' : '🗑️' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Error Toast -->
      <div *ngIf="error" 
           class="fixed bottom-6 right-6 bg-red-50 border-2 border-red-300 text-red-600 p-4 rounded-xl shadow-lg max-w-sm">
        <div class="flex gap-3 items-start">
          <span class="text-2xl">❌</span>
          <div>
            <p class="font-bold">Error</p>
            <p class="text-sm">{{ error }}</p>
          </div>
          <button (click)="error = ''" class="text-red-400 hover:text-red-600">✕</button>
        </div>
      </div>
    </div>
  `,
  styles: []
})

export class BackofficeShopComponent implements OnInit {
  // Data
  products: Product[] = [];
  filteredProducts: Product[] = [];
  
  // UI State
  showForm = false;
  editingProduct: Product | null = null;
  isAdmin = false;
  loading = false;
  isFormSubmitting = false;
  isDeletingId: number | null = null;
  error = '';

  // Search & Filter
  searchQuery = '';
  filterCategory = '';
  filterSportType: SportType | '' = '';

  // Form Data
  formData: Product = {
    name: '',
    price: 0,
    stock: 0,
    category: '',
    image: '',
    sportType: 'FOOTBALL'
  };

  // Form Validation Errors
  formErrors: { [key: string]: string } = {};

  constructor(
    private shopService: ShopService,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const role = this.authService.getUserRole();
    this.isAdmin = role?.includes('ADMIN') || role?.includes('VENUE_OWNER') || false;
    this.loadProducts();
  }

  // ============= CRUD Operations =============

  loadProducts() {
    this.loading = true;
    this.error = '';
    this.shopService.getAllProducts().subscribe({
      next: (data: any) => {
        this.products = Array.isArray(data) ? data : (data?.content ?? []);
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Failed to load products. Check your connection.';
        this.products = [];
        this.filteredProducts = [];
        this.loading = false;
        this.toastService.error('Failed to load products');
        this.cdr.detectChanges();
      }
    });
  }

  saveProduct() {
    // Clear previous errors
    this.formErrors = {};

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    this.isFormSubmitting = true;
    this.error = '';

    if (this.editingProduct?.id) {
      // Update existing product
      this.shopService.updateProduct(this.editingProduct.id, this.formData).subscribe({
        next: () => {
          this.isFormSubmitting = false;
          this.toastService.success('✓ Product updated successfully!');
          this.loadProducts();
          this.closeForm();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.isFormSubmitting = false;
          this.error = 'Failed to update product. Please try again.';
          this.toastService.error('Failed to update product');
          this.cdr.detectChanges();
        }
      });
    } else {
      // Create new product
      this.shopService.createProduct(this.formData).subscribe({
        next: () => {
          this.isFormSubmitting = false;
          this.toastService.success('✓ Product created successfully!');
          this.loadProducts();
          this.closeForm();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.isFormSubmitting = false;
          this.error = 'Failed to create product. Please try again.';
          this.toastService.error('Failed to create product');
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteProduct(id: number) {
    if (!confirm('🗑️ Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    this.isDeletingId = id;
    this.shopService.deleteProduct(id).subscribe({
      next: () => {
        this.isDeletingId = null;
        this.toastService.success('✓ Product deleted successfully!');
        this.loadProducts();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isDeletingId = null;
        this.error = 'Failed to delete product. Please try again.';
        this.toastService.error('Failed to delete product');
        this.cdr.detectChanges();
      }
    });
  }

  // ============= Form Management =============

  openForm() {
    this.editingProduct = null;
    this.resetForm();
    this.formErrors = {};
    this.error = '';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingProduct = null;
    this.resetForm();
    this.formErrors = {};
    this.error = '';
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.formData = { ...product };
    this.formErrors = {};
    this.error = '';
    this.showForm = true;
  }

  resetForm() {
    this.formData = {
      name: '',
      price: 0,
      stock: 0,
      category: '',
      image: '',
      sportType: 'FOOTBALL'
    };
    this.formErrors = {};
  }

  // ============= Validation =============

  validateForm(): boolean {
    const errors: { [key: string]: string } = {};

    // Name validation
    if (!this.formData.name?.trim()) {
      errors['name'] = 'Product name is required';
    } else if (this.formData.name.trim().length < 2) {
      errors['name'] = 'Product name must be at least 2 characters';
    } else if (this.formData.name.trim().length > 100) {
      errors['name'] = 'Product name must be less than 100 characters';
    }

    // Price validation
    if (this.formData.price === null || this.formData.price === undefined) {
      errors['price'] = 'Price is required';
    } else if (this.formData.price < 0) {
      errors['price'] = 'Price cannot be negative';
    } else if (this.formData.price > 100000) {
      errors['price'] = 'Price is too high (max \$100,000)';
    }

    // Stock validation
    if (this.formData.stock === null || this.formData.stock === undefined) {
      errors['stock'] = 'Stock is required';
    } else if (this.formData.stock < 0) {
      errors['stock'] = 'Stock cannot be negative';
    } else if (this.formData.stock > 1000000) {
      errors['stock'] = 'Stock is too high (max 1,000,000)';
    }

    // Category validation
    if (!this.formData.category?.trim()) {
      errors['category'] = 'Category is required';
    } else if (this.formData.category.trim().length < 2) {
      errors['category'] = 'Category must be at least 2 characters';
    }

    // Image validation
    if (!this.formData.image?.trim()) {
      errors['image'] = 'Image is required';
    } else if (!this.formData.image.startsWith('http') && !this.formData.image.startsWith('data:image')) {
      errors['image'] = 'Please upload an image or enter a valid URL';
    }

    // Sport Type validation
    if (!this.formData.sportType) {
      errors['sportType'] = 'Sport type is required';
    }

    this.formErrors = errors;
    return Object.keys(errors).length === 0;
  }

  isFieldInvalid(fieldName: string): boolean {
    return !!this.formErrors[fieldName];
  }

  getFieldError(fieldName: string): string {
    return this.formErrors[fieldName] || '';
  }

  // ============= Search & Filter =============

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  resetFilters() {
    this.searchQuery = '';
    this.filterCategory = '';
    this.filterSportType = '';
    this.applyFilters();
  }

  applyFilters() {
    // Defensive check: ensure products is an array
    if (!Array.isArray(this.products)) {
      this.filteredProducts = [];
      return;
    }

    this.filteredProducts = this.products.filter(product => {
      // Search by name
      if (this.searchQuery && !product.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by category
      if (this.filterCategory && !product.category.toLowerCase().includes(this.filterCategory.toLowerCase())) {
        return false;
      }

      // Filter by sport type
      if (this.filterSportType && product.sportType !== this.filterSportType) {
        return false;
      }

      return true;
    });

    this.cdr.detectChanges();
  }

  isUploading = false;

  onImageFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      this.toastService.error('Invalid file type. Allowed: JPEG, PNG, WEBP, GIF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toastService.error('File too large. Max size is 5MB');
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => { this.formData.image = e.target?.result as string; this.cdr.detectChanges(); };
    reader.readAsDataURL(file);

    // Upload to backend
    this.isUploading = true;
    this.shopService.uploadProductImage(file).subscribe({
      next: (res: any) => { this.formData.image = res.imageUrl; this.isUploading = false; this.cdr.detectChanges(); },
      error: () => {
        this.isUploading = false;
        this.toastService.error('Image upload failed — using local preview only');
        this.cdr.detectChanges();
      }
    });
  }

  get inStockCount(): number {
    return this.filteredProducts.filter(p => p.stock > 5).length;
  }

  get lowStockCount(): number {
    return this.filteredProducts.filter(p => p.stock > 0 && p.stock <= 5).length;
  }

  get outOfStockCount(): number {
    return this.filteredProducts.filter(p => p.stock === 0).length;
  }
}
