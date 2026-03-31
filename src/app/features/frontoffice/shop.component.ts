import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';
import { debounceTime, distinctUntilChanged, Subject, takeUntil, forkJoin } from 'rxjs';
import { ShopService } from '../../core/services/shop.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../shared/services/toast.service';
import { Product, Cart, SportType, ProductReview, PaginatedResponse, Order, OrderItem, MerchandiseSubmission } from '../../core/models/shop.model';

@Component({
  selector: 'fo-shop',
  standalone: false,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <!-- Modern Header -->
      <div class="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-6 py-5">
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <h1 class="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600">
                SHOP
              </h1>
              <p class="text-gray-500 text-sm font-medium mt-1">Curated sports gear for champions</p>
            </div>
            <div class="flex gap-3 items-center">
              <!-- Filter Toggle (Mobile) -->
              <button class="md:hidden px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                      (click)="showFilters = !showFilters">
                ⚙️ Filters
              </button>
              <button *ngIf="isAuthenticated && cart"
                      (click)="toggleCart()"
                      class="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2 group">
                <span class="text-lg">🛒</span>
                <span *ngIf="cart.cartItems.length > 0" class="ml-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center scale-125">
                  {{ cart.cartItems.length }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modern Category Tabs -->
      <div class="bg-white/50 backdrop-blur-sm border-b border-gray-200/50 overflow-x-auto">
        <div class="max-w-7xl mx-auto px-6 py-3 flex gap-2">
          <button (click)="searchSportType = ''; showPlayerMerch = false; onSearchChange()"
                  [class.bg-gradient-to-r]="searchSportType === '' && !showPlayerMerch"
                  [class.from-blue-600]="searchSportType === '' && !showPlayerMerch"
                  [class.to-purple-600]="searchSportType === '' && !showPlayerMerch"
                  [class.text-white]="searchSportType === '' && !showPlayerMerch"
                  [class.bg-gray-100]="searchSportType !== '' || showPlayerMerch"
                  [class.text-gray-700]="searchSportType !== '' || showPlayerMerch"
                  class="px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all hover:shadow-md">
            All Sports
          </button>
          <button *ngFor="let sport of ['FOOTBALL', 'BASKETBALL', 'TENNIS', 'VOLLEYBALL']"
                  (click)="selectSport(sport)"
                  [class.bg-gradient-to-r]="searchSportType === sport && !showPlayerMerch"
                  [class.from-blue-600]="searchSportType === sport && !showPlayerMerch"
                  [class.to-purple-600]="searchSportType === sport && !showPlayerMerch"
                  [class.text-white]="searchSportType === sport && !showPlayerMerch"
                  [class.bg-gray-100]="searchSportType !== sport || showPlayerMerch"
                  [class.text-gray-700]="searchSportType !== sport || showPlayerMerch"
                  class="px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all hover:shadow-md">
            {{ sport }}
          </button>
          <button (click)="togglePlayerMerch()"
                  [class.bg-gradient-to-r]="showPlayerMerch"
                  [class.from-purple-600]="showPlayerMerch"
                  [class.to-pink-600]="showPlayerMerch"
                  [class.text-white]="showPlayerMerch"
                  [class.bg-gray-100]="!showPlayerMerch"
                  [class.text-gray-700]="!showPlayerMerch"
                  class="px-5 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all hover:shadow-md flex items-center gap-1.5">
            🏅 Player Merch
          </button>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 py-10">
        <div class="flex gap-8">
          <!-- Modern Filters Sidebar -->
          <div [class.hidden]="!showFilters" class="md:block md:w-72 flex-shrink-0">
            <div class="bg-white rounded-2xl border border-gray-200 p-7 sticky top-28 shadow-sm hover:shadow-md transition-shadow">
              <h3 class="text-lg font-bold mb-7 text-gray-900">REFINE SEARCH</h3>
              
              <!-- Search -->
              <div class="mb-7">
                <label class="block text-xs font-bold uppercase text-gray-600 mb-3 tracking-wide">Search</label>
                <input [(ngModel)]="searchName"
                       (ngModelChange)="onSearchChange()"
                       type="text"
                       placeholder="Product name..."
                       list="productSuggestions"
                       class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all bg-gray-50/50">
                <datalist id="productSuggestions">
                  <option *ngFor="let suggestion of searchSuggestions"
                          [value]="suggestion">
                  </option>
                </datalist>
              </div>

              <!-- Category -->
              <div class="mb-7">
                <label class="block text-xs font-bold uppercase text-gray-600 mb-3 tracking-wide">Category</label>
                <input [(ngModel)]="searchCategory"
                       (ngModelChange)="onSearchChange()"
                       type="text"
                       placeholder="e.g. Ball, Jersey"
                       class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all bg-gray-50/50">
              </div>

              <!-- Sorting -->
              <div class="mb-7">
                <label class="block text-xs font-bold uppercase text-gray-600 mb-3 tracking-wide">Sort</label>
                <select [(ngModel)]="sortBy"
                        (ngModelChange)="onSortChange()"
                        class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all bg-gray-50/50">
                  <option value="id">Latest</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="stock">Most Available</option>
                </select>
              </div>

              <!-- Price Range -->
              <div class="mb-7">
                <label class="block text-xs font-bold uppercase text-gray-600 mb-4 tracking-wide">Max Price</label>
                <input [(ngModel)]="maxPrice"
                       (ngModelChange)="onPriceChange()"
                       type="range"
                       min="0"
                       max="1000"
                       step="10"
                       class="w-full">
              </div>

              <div class="flex items-center justify-between mt-3">
                <span class="text-sm font-bold text-blue-600">\${{ maxPrice }}</span>
              </div>

              <!-- Reset Button -->
              <button (click)="resetFilters()"
                      class="w-full py-3 mt-7 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700 font-semibold rounded-lg transition-all border border-gray-200">
                ↺ Reset All
              </button>
            </div>
          </div>

          <!-- Main Content -->
          <div class="flex-1">
            <!-- Recently Viewed Products -->
            <div *ngIf="recentlyViewed.length > 0" class="mb-12">
              <div class="flex items-center gap-3 mb-5">
                <span class="text-2xl">👀</span>
                <h3 class="text-2xl font-bold text-gray-900">Recently Viewed</h3>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-2">
                <div *ngFor="let product of recentlyViewed.slice(0, 3)"
                     (click)="openProductDetail(product)"
                     class="bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all p-4 cursor-pointer group">
                  <div class="h-28 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <img *ngIf="hasImage(product)"
                         [src]="getProductImage(product)"
                         [alt]="product.name"
                         class="h-24 w-24 object-contain"
                         (error)="$any($event.target).style.display='none'; $any($event.target).nextElementSibling && ($any($event.target).nextElementSibling.style.display='flex')">
                    <div [style.display]="hasImage(product) ? 'none' : 'flex'"
                         class="text-4xl items-center justify-center">
                      {{ getProductImage(product) }}
                    </div>
                  </div>
                  <h4 class="font-semibold text-sm line-clamp-2 mb-1 text-gray-900">{{ product.name }}</h4>
                  <p class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold text-lg">\${{ product.price }}</p>
                </div>
              </div>
            </div>

            <!-- Products Grid -->
            <div *ngIf="!showCart">
              <!-- Loading Skeleton -->
              <div *ngIf="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <div *ngFor="let item of [1,2,3,4,5,6]"
                     class="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
                  <div class="h-56 bg-gray-200"></div>
                  <div class="p-5">
                    <div class="h-5 bg-gray-200 rounded mb-3 w-3/4"></div>
                    <div class="h-4 bg-gray-100 rounded mb-4 w-1/2"></div>
                    <div class="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>

              <!-- No Products -->
              <div *ngIf="hasLoaded && !loading && (!products || products.length === 0)" class="text-center py-20 bg-white border border-gray-200 rounded-2xl">
                <div class="text-6xl mb-4">📭</div>
                <p class="text-gray-600 text-lg font-medium">No products found</p>
                <button (click)="resetFilters()" class="mt-5 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  Clear Filters
                </button>
              </div>

              <!-- Products Grid - Modern Card Design -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div *ngFor="let product of products; trackBy: trackByProduct"
                     class="group bg-white border border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl transition-all overflow-hidden cursor-pointer"
                     (click)="openProductDetail(product)">
                  
                  <!-- Product Image Container -->
                  <div class="relative h-56 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 flex items-center justify-center overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <img *ngIf="hasImage(product)"
                         [src]="getProductImage(product)"
                         [alt]="product.name"
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                         (error)="$any($event.target).style.display='none'; $any($event.target).nextElementSibling && ($any($event.target).nextElementSibling.style.display='flex')">
                    <div [style.display]="hasImage(product) ? 'none' : 'flex'"
                         class="text-7xl items-center justify-center absolute inset-0 group-hover:scale-110 transition-transform">
                      {{ getProductImage(product) }}
                    </div>
                    
                    <!-- Top Badges -->
                    <div class="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                      <div class="flex flex-col gap-1">
                        <span class="px-3 py-1.5 rounded-full text-xs font-bold bg-white/95 backdrop-blur-sm text-gray-900 shadow-sm">
                          {{ product.sportType }}
                        </span>
                        <span *ngIf="isPlayerMerch(product)"
                              class="px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm">
                          🏅 Player Merch
                        </span>
                      </div>
                      <button (click)="toggleWishlist(product); $event.stopPropagation()"
                              class="text-2xl hover:scale-125 transition-transform drop-shadow-lg"
                              [title]="isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'">
                        {{ isInWishlist(product.id) ? '❤️' : '🤍' }}
                      </button>
                    </div>

                    <!-- Rating Badge -->
                    <div *ngIf="product.averageRating && product.averageRating > 0"
                         class="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                      ⭐ {{ product.averageRating.toFixed(1) }}
                      <span class="text-xs opacity-70">({{ product.reviewCount }})</span>
                    </div>
                  </div>

                  <!-- Product Info -->
                  <div class="p-5 flex flex-col">
                    <h3 class="font-bold text-base text-gray-900 line-clamp-2 mb-1.5 group-hover:text-blue-600 transition-colors">{{ product.name }}</h3>
                    <p class="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">{{ product.category }}</p>
                    <p *ngIf="getSellerName(product)" class="text-purple-600 text-xs font-semibold mb-2">🏅 by {{ getSellerName(product) }}</p>

                    <!-- Price & Stock -->
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">\${{ product.price }}</span>
                      <span class="text-xs font-bold px-2 py-1 rounded-full"
                            [class.bg-red-100]="product.stock < 5"
                            [class.text-red-700]="product.stock < 5"
                            [class.bg-green-100]="product.stock >= 10"
                            [class.text-green-700]="product.stock >= 10"
                            [class.bg-yellow-100]="product.stock >= 5 && product.stock < 10"
                            [class.text-yellow-700]="product.stock >= 5 && product.stock < 10">
                        {{ product.stock > 0 ? product.stock + ' in stock' : 'Out of stock' }}
                      </span>
                    </div>

                    <!-- Stock Indicator -->
                    <div class="mb-4">
                      <div class="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                             [style.width.%]="getStockPercentage(product.stock)"></div>
                      </div>
                    </div>

                    <!-- Action Button -->
                    <button *ngIf="isAuthenticated && product.stock > 0"
                            (click)="addToCart(product); $event.stopPropagation()"
                            class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 rounded-lg font-semibold hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all">
                      Add to Cart
                    </button>

                    <div *ngIf="!isAuthenticated || product.stock === 0"
                         class="w-full text-center py-2.5 bg-gray-100 text-gray-500 rounded-lg font-semibold">
                      {{ product.stock === 0 ? 'Out of Stock' : 'Login to Shop' }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div *ngIf="!showCart && totalPages > 1" class="flex justify-center items-center gap-2 mb-10">
                <button (click)="previousPage()"
                        [disabled]="currentPage === 0"
                        class="px-4 py-2 bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-700 rounded-lg font-medium border border-gray-200">
                  ← Prev
                </button>
                <div class="flex gap-1">
                  <button *ngFor="let page of getPaginationPages()"
                          (click)="goToPage(page)"
                          [class.bg-[#0D6EFD]]="page === currentPage"
                          [class.text-white]="page === currentPage"
                          [class.bg-white]="page !== currentPage"
                          class="px-3 py-2 rounded-lg font-medium border border-gray-200 hover:bg-gray-100 transition-all">
                    {{ page + 1 }}
                  </button>
                </div>
                <button (click)="nextPage()"
                        [disabled]="currentPage >= totalPages - 1"
                        class="px-4 py-2 bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-700 rounded-lg font-medium border border-gray-200">
                  Next →
                </button>
              </div>
            </div>

            <!-- Wishlist Section -->
            <div *ngIf="showCart && showWishlist && !showOrders && isAuthenticated && wishlist.length > 0" class="mb-8">
              <div class="bg-white rounded-3xl shadow p-8">
                <h2 class="text-3xl font-black mb-6">❤️ My Wishlist</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div *ngFor="let product of wishlist"
                       class="bg-gray-50 rounded-2xl p-4 hover:shadow-lg transition-all">
                    <div class="flex gap-4">
                      <div class="w-20 h-20 bg-gradient-to-br from-[#0D6EFD] to-[#9D4EDD] rounded-lg flex items-center justify-center flex-shrink-0">
                        <img *ngIf="hasImage(product)"
                             [src]="getProductImage(product)"
                             [alt]="product.name"
                             class="w-16 h-16 object-contain">
                        <div *ngIf="!hasImage(product)" class="text-3xl">
                          {{ getProductImage(product) }}
                        </div>
                      </div>
                      <div class="flex-1">
                        <h4 class="font-bold line-clamp-1">{{ product.name }}</h4>
                        <p class="text-[#0D6EFD] font-bold text-lg">\${{ product.price }}</p>
                        <div class="flex gap-2 mt-2">
                          <button (click)="addToCart(product)"
                                  class="flex-1 px-2 py-1 bg-[#0D6EFD] text-white text-sm rounded font-bold hover:bg-[#0b5ed7]">
                            Add
                          </button>
                          <button (click)="toggleWishlist(product)"
                                  class="px-2 py-1 text-red-500 hover:bg-red-50 rounded font-bold">
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


      <!-- Product Detail Modal (Feature #5) -->
      <div *ngIf="showProductDetail && selectedProduct"
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4"
           (click)="closeProductDetail()">
        <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
             (click)="$event.stopPropagation()">
             <div class="bg-red-500 text-white p-4 rounded-2xl text-center mb-6">
  
</div>
          <div class="p-8">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h2 class="text-3xl font-black text-gray-900">{{ selectedProduct.name }}</h2>
                <p class="text-gray-600 mt-2">{{ selectedProduct.category }} • {{ selectedProduct.sportType }}</p>
              </div>
              <button (click)="closeProductDetail()" class="text-3xl text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div class="flex gap-6 mb-8">
              <div class="flex-shrink-0">
                <img *ngIf="hasImage(selectedProduct)"
                     [src]="getProductImage(selectedProduct)"
                     [alt]="selectedProduct.name"
                     class="w-32 h-32 object-contain rounded-lg bg-gray-50"
                     (error)="$any($event.target).style.display='none'; $any($event.target).nextElementSibling && ($any($event.target).nextElementSibling.style.display='flex')">
                <div [style.display]="hasImage(selectedProduct) ? 'none' : 'flex'"
                     class="text-8xl items-center justify-center">
                  {{ getProductImage(selectedProduct) }}
                </div>
              </div>
              <div>
                <p class="text-4xl font-black text-[#0D6EFD] mb-3">\${{ selectedProduct.price }}</p>
                <p class="text-gray-600 mb-4">Stock Available: <span class="font-bold text-gray-900">{{ selectedProduct.stock }}</span></p>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden mb-6" style="width: 200px;">
                  <div class="h-full bg-gradient-to-r from-[#32CD32] to-[#228B22]"
                       [style.width.%]="getStockPercentage(selectedProduct.stock)"></div>
                </div>
                <button *ngIf="isAuthenticated && selectedProduct.stock > 0"
                        (click)="addToCart(selectedProduct); closeProductDetail()"
                        class="w-full bg-gradient-to-r from-[#0D6EFD] to-[#FF6B00] text-white py-3 rounded-2xl font-bold hover:scale-105 transition-all">
                  Add to Cart
                </button>
              </div>
            </div>

            <!-- Reviews Section -->
            <div class="border-t-2 border-gray-200 pt-6">
              <h3 class="text-2xl font-bold mb-4">Reviews</h3>

              <!-- Write a Review Form -->
              <div *ngIf="isAuthenticated" class="bg-gray-50 rounded-2xl p-5 mb-6">
                <p class="font-bold text-gray-800 mb-3">Write a Review</p>

                <!-- Star Rating Picker -->
                <div class="flex gap-1 mb-3">
                  <button *ngFor="let star of [1,2,3,4,5]"
                          type="button"
                          (click)="reviewForm.rating = star"
                          class="text-3xl transition-transform hover:scale-110 focus:outline-none">
                    {{ star <= reviewForm.rating ? '⭐' : '☆' }}
                  </button>
                  <span class="ml-2 text-sm text-gray-500 self-center">{{ reviewForm.rating > 0 ? reviewForm.rating + '/5' : 'Select rating' }}</span>
                </div>

                <textarea [(ngModel)]="reviewForm.comment"
                          name="reviewComment"
                          placeholder="Share your experience with this product..."
                          rows="3"
                          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#0D6EFD] focus:outline-none resize-none mb-3"></textarea>

                <div class="flex items-center gap-3">
                  <button (click)="submitReview()"
                          [disabled]="isSubmittingReview || reviewForm.rating === 0 || !reviewForm.comment.trim()"
                          class="px-6 py-2.5 bg-[#0D6EFD] text-white rounded-xl font-bold hover:bg-[#0b5ed7] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {{ isSubmittingReview ? '⏳ Submitting...' : '✓ Submit Review' }}
                  </button>
                  <span *ngIf="reviewError" class="text-red-500 text-sm">{{ reviewError }}</span>
                </div>
              </div>

              <div *ngIf="!isAuthenticated" class="bg-gray-50 rounded-2xl p-4 mb-6 text-center text-gray-500 text-sm">
                Login to leave a review
              </div>

              <!-- Reviews List -->
              <div *ngIf="loadingReviews" class="text-center py-6 text-gray-500">Loading reviews...</div>
              <div *ngIf="!loadingReviews && productReviews.length === 0" class="text-center py-6 text-gray-500">
                No reviews yet. Be the first to review!
              </div>
              <div *ngFor="let review of productReviews" class="mb-4 pb-4 border-b last:border-0">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <p class="font-bold text-gray-900">{{ review.username }}</p>
                    <div class="text-yellow-400">
                      <span *ngFor="let i of [1,2,3,4,5]">{{ i <= review.rating ? '⭐' : '☆' }}</span>
                      <span class="text-gray-600 text-sm ml-2">({{ review.rating }}/5)</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <p class="text-xs text-gray-500">{{ review.createdAt | date:'short' }}</p>
                    <button *ngIf="review.userId === currentUserId"
                            (click)="deleteReview(review.id)"
                            [disabled]="deletingReviewId === review.id"
                            class="text-red-400 hover:text-red-600 text-lg disabled:opacity-50 transition-colors"
                            title="Delete review">
                      {{ deletingReviewId === review.id ? '⏳' : '🗑️' }}
                    </button>
                  </div>
                </div>
                <p class="text-gray-700">{{ review.comment }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Sidebar / Modal -->
      <div *ngIf="showCart && cart" class="bg-white rounded-3xl shadow-xl p-8">
        <div class="flex justify-between items-center mb-8">
                <div class="flex gap-4">
                  <button (click)="showWishlist = false; showOrders = false"
                          [class.border-b-4]="!showWishlist && !showOrders"
                          [class.border-[#0D6EFD]]="!showWishlist && !showOrders"
                          class="text-2xl font-bold pb-2 transition-all">
                    🛒 Cart
                  </button>
                  <button *ngIf="isAuthenticated" (click)="showWishlist = true; showOrders = false"
                          [class.border-b-4]="showWishlist && !showOrders"
                          [class.border-[#0D6EFD]]="showWishlist && !showOrders"
                          class="text-2xl font-bold pb-2 transition-all relative">
                    ❤️ Wishlist
                    <span *ngIf="wishlist.length > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {{ wishlist.length }}
                    </span>
                  </button>
                  <button *ngIf="isAuthenticated" (click)="showOrders = true; showWishlist = false; loadOrders()"
                          [class.border-b-4]="showOrders"
                          [class.border-[#0D6EFD]]="showOrders"
                          class="text-2xl font-bold pb-2 transition-all">
                    📦 Orders
                  </button>
                </div>
                <button (click)="toggleCart()" class="text-3xl text-gray-400 hover:text-gray-600">✕</button>
              </div>

        <!-- Orders View -->
        <div *ngIf="showOrders">
          <div *ngIf="loadingOrders" class="text-center py-10 text-gray-500">Loading orders...</div>
          <div *ngIf="!loadingOrders && orders.length === 0" class="text-center py-20">
            <div class="text-6xl mb-4">📭</div>
            <p class="text-gray-500 text-lg">No orders yet</p>
          </div>
          <div *ngFor="let order of orders" class="mb-4 border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer" (click)="openOrderDetail(order)">
            <div class="flex items-center justify-between p-4 bg-gray-50">
              <div>
                <p class="font-bold text-gray-900">Order #{{ order.id }}</p>
                <p class="text-xs text-gray-500">{{ order.createdAt | date:'mediumDate' }}</p>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-lg font-black text-[#0D6EFD]">\${{ order.totalAmount }}</span>
                <span class="px-3 py-1 rounded-full text-xs font-bold"
                      [ngClass]="getStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </div>
            </div>
            <div class="px-4 py-2 text-xs text-gray-500">
              <span *ngIf="order.shippingAddress">📍 {{ order.shippingAddress }}</span>
              <span *ngIf="order.orderItems"> · {{ order.orderItems.length }} item(s)</span>
            </div>
          </div>
        </div>

        <!-- Order Detail Modal -->
        <div *ngIf="selectedOrder"
             class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
             (click)="selectedOrder = null">
          <div class="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-8"
               (click)="$event.stopPropagation()">
            <div class="flex justify-between items-center mb-6">
              <div>
                <h2 class="text-2xl font-black">Order #{{ selectedOrder.id }}</h2>
                <p class="text-gray-500 text-sm">{{ selectedOrder.createdAt | date:'medium' }}</p>
              </div>
              <button (click)="selectedOrder = null" class="text-3xl text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div class="flex items-center gap-3 mb-6">
              <span class="px-4 py-1.5 rounded-full text-sm font-bold" [ngClass]="getStatusClass(selectedOrder.status)">{{ selectedOrder.status }}</span>
              <span *ngIf="selectedOrder.phoneNumber" class="text-gray-500 text-sm">📞 {{ selectedOrder.phoneNumber }}</span>
            </div>
            <div *ngIf="selectedOrder.shippingAddress" class="bg-gray-50 rounded-xl p-4 mb-6">
              <p class="text-xs font-bold text-gray-500 uppercase mb-1">Shipping Address</p>
              <p class="text-gray-800">{{ selectedOrder.shippingAddress }}</p>
            </div>
            <div *ngIf="selectedOrder.orderItems && selectedOrder.orderItems.length > 0">
              <p class="font-bold text-gray-700 mb-3">Items</p>
              <div *ngFor="let item of selectedOrder.orderItems" class="flex items-center gap-4 py-3 border-b last:border-0">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
                  {{ getProductImage(item.product) }}
                </div>
                <div class="flex-1">
                  <p class="font-semibold text-sm">{{ item.product.name }}</p>
                  <p class="text-gray-500 text-xs">{{ item.quantity }} × \${{ item.price }}</p>
                </div>
                <p class="font-bold text-[#0D6EFD]">\${{ (item.quantity * item.price).toFixed(2) }}</p>
              </div>
            </div>
            <div class="mt-6 pt-4 border-t-2 flex justify-between items-center">
              <span class="text-lg font-bold">Total</span>
              <span class="text-3xl font-black text-[#0D6EFD]">\${{ selectedOrder.totalAmount }}</span>
            </div>
          </div>
        </div>

        <div *ngIf="!showOrders && cart.cartItems.length === 0" class="text-center py-20">
          <div class="text-7xl mb-6">🛒</div>
          <p class="text-2xl text-gray-400">Your cart is empty</p>
          <button (click)="toggleCart()" class="mt-4 px-6 py-2 bg-[#0D6EFD] text-white rounded-xl font-bold">
            Continue Shopping
          </button>
        </div>

        <div *ngIf="!showOrders && cart.cartItems.length > 0">
          <div *ngFor="let item of cart.cartItems; trackBy: trackByCartItem" class="flex gap-4 py-6 border-b last:border-0">
            <div class="w-20 h-20 bg-gradient-to-br from-[#0D6EFD] to-[#9D4EDD] rounded-2xl flex-shrink-0 flex items-center justify-center">
              <img *ngIf="hasImage(item.product)"
                   [src]="getProductImage(item.product)"
                   [alt]="item.product.name"
                   class="w-16 h-16 object-contain rounded-lg"
                   (error)="$any($event.target).style.display='none'; $any($event.target).nextElementSibling && ($any($event.target).nextElementSibling.style.display='flex')">
              <div [style.display]="hasImage(item.product) ? 'none' : 'flex'"
                   class="text-4xl items-center justify-center">
                {{ getProductImage(item.product) }}
              </div>
            </div>
            <div class="flex-1">
              <h4 class="font-bold text-lg">{{ item.product.name }}</h4>
              <p class="text-gray-500">\${{ item.product.price }} × {{ item.quantity }}</p>
            </div>
            <div class="text-right">
              <p class="text-2xl font-black text-[#0D6EFD] mb-2">\${{ item.subtotal }}</p>
              <div class="flex gap-2 justify-center mb-2">
                <button (click)="updateQuantity(item.id!, item.quantity - 1)" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded font-bold text-sm">−</button>
                <span class="w-8 text-center font-bold">{{ item.quantity }}</span>
                <button (click)="updateQuantity(item.id!, item.quantity + 1)" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded font-bold text-sm">+</button>
              </div>
              <button (click)="removeItem(item.id!)" class="text-red-600 text-xs hover:underline">Remove</button>
            </div>
          </div>

          <div class="mt-8 pt-6 border-t-2 border-gray-200">
            <div class="flex justify-between items-center mb-2">
              <span class="text-gray-600">Subtotal</span>
              <span>\${{ cart.totalAmount }}</span>
            </div>
            <div class="flex justify-between items-center mb-6">
              <span class="text-gray-600">Shipping</span>
              <span class="text-green-600 font-bold">Free</span>
            </div>
            <div class="flex justify-between items-end pb-6 border-b-2 border-gray-200">
              <span class="text-2xl font-bold">Total</span>
              <span class="text-4xl font-black text-[#0D6EFD]">\${{ cart.totalAmount }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 mt-6">
            <button (click)="clearCart()"
                    class="py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all">
              Clear Cart
            </button>
            <button (click)="openCheckout()"
                    class="py-3 bg-gradient-to-r from-[#32CD32] to-[#228B22] text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all">
              Checkout
            </button>
          </div>
        </div>
      </div>

      <!-- Checkout Form (Feature #2) -->
      <div *ngIf="showCheckout && cart"
           class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4"
           (click)="closeCheckout()">
        <div class="bg-white rounded-3xl max-w-md w-full p-8"
             (click)="$event.stopPropagation()">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-3xl font-black">Checkout</h2>
            <button (click)="closeCheckout()" class="text-3xl text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form (ngSubmit)="confirmCheckout()">
            <div class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Shipping Address</label>
              <textarea [(ngModel)]="checkoutForm.shippingAddress"
                        name="shippingAddress"
                        placeholder="Street, City, Postal Code"
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#0D6EFD] focus:outline-none"
                        rows="3"></textarea>
              <span *ngIf="checkoutErrors.shippingAddress" class="text-red-600 text-sm">{{ checkoutErrors.shippingAddress }}</span>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <input [(ngModel)]="checkoutForm.phoneNumber"
                     name="phoneNumber"
                     type="tel"
                     placeholder="+1 (555) 123-4567"
                     class="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#0D6EFD] focus:outline-none">
              <span *ngIf="checkoutErrors.phoneNumber" class="text-red-600 text-sm">{{ checkoutErrors.phoneNumber }}</span>
            </div>

            <div class="bg-gray-50 rounded-2xl p-4 mb-6">
              <div class="flex justify-between mb-2">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-semibold">\${{ cart.totalAmount }}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span class="text-gray-600">Shipping</span>
                <span class="font-semibold">Free</span>
              </div>
              <div class="border-t pt-2 flex justify-between">
                <span class="font-bold">Total</span>
                <span class="text-2xl font-black text-[#0D6EFD]">\${{ cart.totalAmount }}</span>
              </div>
            </div>

            <button type="submit"
                    [disabled]="isCheckingOut"
                    class="w-full bg-gradient-to-r from-[#32CD32] to-[#228B22] text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50">
              {{ isCheckingOut ? 'Processing...' : 'Complete Order' }}
            </button>
          </form>
        </div>
      </div>

      <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-600 p-5 rounded-2xl mt-6">{{ error }}</div>
    </div>
  `
})
export class FrontofficeShopComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  wishlist: Product[] = [];
  recentlyViewed: Product[] = [];
  cart: Cart | null = null;
  showCart = false;
  showWishlist = false;
  showOrders = false;
  orders: Order[] = [];
  loadingOrders = false;
  selectedOrder: Order | null = null;
  showFilters = true;
  showProductDetail = false;
  showCheckout = false;
  selectedProduct: Product | null = null;
  productReviews: ProductReview[] = [];
  loading = false;
  loadingReviews = false;
  isSubmittingReview = false;
  deletingReviewId: number | null = null;
  reviewError = '';
  reviewForm = { rating: 0, comment: '' };
  currentUsername: string | null = null;
  currentUserId: number | null = null;
  isCheckingOut = false;
  error = '';
  hasLoaded = false;

  // Search & Filter
  searchName = '';
  searchCategory = '';
  searchSportType: SportType | '' = '';
  sortBy = 'id';
  maxPrice = 1000;
  searchSuggestions: string[] = [];

  // Pagination
  currentPage = 0;
  pageSize = 20;
  totalPages = 1;
  totalElements = 0;

  // Checkout Form
  checkoutForm = { shippingAddress: '', phoneNumber: '' };
  checkoutErrors = { shippingAddress: '', phoneNumber: '' };

  isAuthenticated = false;
  showPlayerMerch = false;
  playerMerchProducts: Product[] = [];
  private playerMerchSellerMap = new Map<number, string>();

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<void>();

  constructor(
    private shopService: ShopService,
    private authService: AuthService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  getStockPercentage(stock: number): number {
    return Math.min((stock / 50) * 100, 100);
  }

  getProductImage(product: Product): string {
    if (!product.image?.trim()) {
      const sportEmojis: { [key: string]: string } = {
        'FOOTBALL': '⚽', 'BASKETBALL': '🏀', 'TENNIS': '🎾', 'VOLLEYBALL': '🏐'
      };
      return sportEmojis[product.sportType] || '📦';
    }
    if (product.image.startsWith('http')) {
      // Convert ibb.co page URL to direct image URL
      const ibbPage = product.image.match(/https?:\/\/ibb\.co\/([a-zA-Z0-9]+)$/);
      if (ibbPage) return `https://i.ibb.co/${ibbPage[1]}/${ibbPage[1]}.jpg`;
      return product.image;
    }
    // Relative path from backend (e.g. uploads/products/uuid.jpg)
    return `http://localhost:8089/${product.image.replace(/^\//, '')}`;
  }

  hasImage(product: Product): boolean {
    return !!product.image?.trim();
  }

  trackByCartItem(index: number, item: any): number {
    return item.id || index;
  }

  trackByProduct(index: number, product: Product): number {
    return product.id || index;
  }

  ngOnInit() {
    this.isAuthenticated = this.authService.isLoggedIn();
    this.currentUsername = this.authService.getUsernameFromToken();
    if (this.isAuthenticated) {
      this.authService.getMyUserId().subscribe((id: number | null) => {
        this.currentUserId = id;
        this.cdr.detectChanges();
      });
    }
    this.loadProducts();

    if (this.isAuthenticated) {
      this.loadCart();
    }

    // Load wishlist and recently viewed from localStorage
    setTimeout(() => {
      this.loadWishlistFromLocalStorage();
      this.loadRecentlyViewedFromLocalStorage();
    }, 500);

    this.searchSubject.pipe(
      debounceTime(400),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0;
      this.performSearch();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProducts() {
    this.loading = true;
    this.hasLoaded = false;
    const sortBy = this.parseSortBy();
    console.log('📦 loadProducts starting... page:', this.currentPage);
    this.shopService.getAllProductsPaginated(this.currentPage, this.pageSize, sortBy.field, sortBy.dir).subscribe({
      next: (data: PaginatedResponse<Product>) => {
        console.log('✅ API Response received:', data);
        console.log('  Content array length:', data.content?.length);
        console.log('  Total pages:', data.totalPages);
        console.log('  Total elements:', data.totalElements);
        
        // Run inside Angular zone to ensure change detection
        this.ngZone.run(() => {
          // Safely extract content from paginated response
          const content = data?.content;
          if (Array.isArray(content)) {
            this.products = [...content]; // Create new array reference
            console.log('✅ Products assigned from content array:', this.products.length);
            console.log('✅ Products is array:', Array.isArray(this.products));
          } else {
            console.warn('⚠️ content is not an array:', typeof content, content);
            this.products = [];
          }
          
          this.totalPages = data.totalPages || 0;
          this.totalElements = data.totalElements || 0;
          this.updateSearchSuggestions();
          this.loading = false;
          this.hasLoaded = true;
          
          console.log('✅ Final products array:', this.products.length, this.products);
          console.log('✅ hasLoaded:', this.hasLoaded);
          console.log('✅ About to mark for check');
          this.cdr.markForCheck();
          console.log('✅ Change detection marked for check');
        });
      },
      error: (err) => {
        console.error('❌ Load products error:', err);
        this.ngZone.run(() => {
          this.error = 'Failed to load products';
          this.products = [];
          this.loading = false;
          this.hasLoaded = true;
          this.cdr.markForCheck();
        });
      }
    });
  }

  performSearch() {
    this.loading = true;
    this.hasLoaded = false;
    const sortBy = this.parseSortBy();
    this.shopService.searchProductsPaginated(
      this.currentPage,
      this.pageSize,
      sortBy.field,
      sortBy.dir,
      this.searchName || undefined,
      this.searchCategory || undefined,
      this.searchSportType || undefined,
      0,
      this.maxPrice
    ).subscribe({
      next: (data: PaginatedResponse<Product>) => {
        console.log('Search API Response:', data);
        this.ngZone.run(() => {
          this.products = Array.isArray(data.content) ? data.content : (Array.isArray(data) ? data : []);
          console.log('Search products assigned:', this.products.length);
          this.totalPages = data.totalPages || 0;
          this.totalElements = data.totalElements || 0;
          this.updateSearchSuggestions();
          this.loading = false;
          this.hasLoaded = true;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        console.error('Search error:', err);
        this.ngZone.run(() => {
          this.error = 'Search failed';
          this.products = [];
          this.loading = false;
          this.hasLoaded = true;
          this.cdr.markForCheck();
        });
      }
    });
  }

  private parseSortBy(): { field: string; dir: string } {
    switch (this.sortBy) {
      case 'name':
        return { field: 'name', dir: 'asc' };
      case 'price-asc':
        return { field: 'price', dir: 'asc' };
      case 'price-desc':
        return { field: 'price', dir: 'desc' };
      case 'stock':
        return { field: 'stock', dir: 'desc' };
      default:
        return { field: 'id', dir: 'asc' };
    }
  }

  private updateSearchSuggestions() {
    try {
      if (Array.isArray(this.products) && this.products.length > 0) {
        this.searchSuggestions = [...new Set(this.products.map(p => p.name))];
      } else {
        this.searchSuggestions = [];
      }
    } catch (err) {
      console.error('Error updating search suggestions:', err);
      this.searchSuggestions = [];
    }
  }

  onSearchChange() {
    this.searchSubject.next();
  }

  selectSport(sport: string) {
    this.showPlayerMerch = false;
    this.searchSportType = sport as SportType;
    this.onSearchChange();
  }

  togglePlayerMerch() {
    this.showPlayerMerch = !this.showPlayerMerch;
    if (this.showPlayerMerch) {
      this.searchSportType = '';
      this.loadPlayerMerch();
    } else {
      this.loadProducts();
    }
  }

  loadPlayerMerch() {
    this.loading = true;
    this.shopService.getApprovedPlayerMerchandise().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          // Build seller map and product list from submissions
          this.playerMerchSellerMap.clear();
          const mapped: Product[] = [];
          for (const submission of data.content) {
            // Backend sets merch.product when approved — use submission fields as Product shape
            const product: Product = {
              id: submission.id,
              name: submission.name,
              price: submission.price,
              stock: submission.stock,
              category: submission.category,
              image: submission.image,
              sportType: submission.sportType
            };
            mapped.push(product);
            if (submission.id != null && submission.sellerName) {
              this.playerMerchSellerMap.set(submission.id, submission.sellerName);
            }
          }
          this.playerMerchProducts = mapped;
          this.products = mapped;
          this.totalPages = data.totalPages || 1;
          this.totalElements = data.totalElements || 0;
          this.loading = false;
          this.hasLoaded = true;
          this.cdr.markForCheck();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.loading = false;
          this.hasLoaded = true;
          this.toastService.error('Failed to load player merchandise');
          this.cdr.markForCheck();
        });
      }
    });
  }

  isPlayerMerch(product: Product): boolean {
    return this.playerMerchSellerMap.has(product.id!);
  }

  getSellerName(product: Product): string | null {
    return this.playerMerchSellerMap.get(product.id!) ?? null;
  }

  onSortChange() {
    this.currentPage = 0;
    this.performSearch();
  }

  onPriceChange() {
    this.currentPage = 0;
    this.performSearch();
  }

  resetFilters() {
    this.searchName = '';
    this.searchCategory = '';
    this.searchSportType = '';
    this.sortBy = 'id';
    this.maxPrice = 1000;
    this.currentPage = 0;
    this.loadProducts();
  }

  loadCart() {
    console.log('Loading cart...');
    this.shopService.getMyCart().subscribe({
      next: (data) => {
        console.log('Cart loaded:', data);
        this.ngZone.run(() => {
          // Sort cart items by product ID to maintain consistent order
          if (data.cartItems) {
            data.cartItems.sort((a, b) => (a.product.id || 0) - (b.product.id || 0));
          }
          this.cart = data;
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        console.error('Load cart error:', err);
        this.ngZone.run(() => {
          this.cart = { id: 0, totalAmount: 0, cartItems: [] };
          this.cdr.markForCheck();
        });
      }
    });
  }

  toggleCart() {
    this.showCart = !this.showCart;
  }

  addToCart(product: Product) {
    console.log('Adding to cart:', product.id);
    this.shopService.addToCart(product.id!, 1).subscribe({
      next: () => {
        console.log('Add to cart success');
        this.loadCart();
        this.toastService.success('✓ Added to cart!');
      },
      error: (err) => {
        console.error('Add to cart error:', err);
        this.toastService.error('Failed to add to cart');
      }
    });
  }

  updateQuantity(cartItemId: number, newQuantity: number) {
    if (newQuantity < 1) return;
    console.log('Updating quantity:', cartItemId, newQuantity);
    this.shopService.updateCartItem(cartItemId, newQuantity).subscribe({
      next: () => {
        console.log('Update response: success');
        this.loadCart();
        this.toastService.info('Quantity updated');
      },
      error: (err) => {
        console.error('Update error:', err);
        this.toastService.error('Failed to update quantity');
      }
    });
  }

  removeItem(cartItemId: number) {
    console.log('Removing item:', cartItemId);
    this.shopService.removeCartItem(cartItemId).subscribe({
      next: () => {
        console.log('Remove response: success');
        this.loadCart();
        this.toastService.success('Item removed from cart');
      },
      error: (err) => {
        console.error('Remove error:', err);
        this.toastService.error('Failed to remove item');
      }
    });
  }

  clearCart() {
    if (!confirm('Clear entire cart?')) return;

    this.shopService.clearCart().subscribe({
      next: () => {
        this.loadCart();
        this.toastService.success('Cart cleared');
      },
      error: () => this.toastService.error('Failed to clear cart')
    });
  }

  openProductDetail(product: Product) {
    this.selectedProduct = product;
    this.showProductDetail = true;
    this.reviewForm = { rating: 0, comment: '' };
    this.reviewError = '';
    this.addToRecentlyViewed(product);
    this.loadProductReviews(product.id!);
  }

  closeProductDetail() {
    this.showProductDetail = false;
    this.selectedProduct = null;
    this.productReviews = [];
    this.reviewForm = { rating: 0, comment: '' };
    this.reviewError = '';
  }

  // Wishlist Management
  toggleWishlist(product: Product) {
    if (this.isInWishlist(product.id)) {
      this.wishlist = this.wishlist.filter(p => p.id !== product.id);
      this.toastService.info('Removed from wishlist');
    } else {
      this.wishlist.push(product);
      this.toastService.success('Added to wishlist ❤️');
    }
    this.saveWishlistToLocalStorage();
  }

  isInWishlist(productId: number | undefined): boolean {
    return this.wishlist.some(p => p.id === productId);
  }

  private saveWishlistToLocalStorage() {
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist.map(p => p.id)));
  }

  private loadWishlistFromLocalStorage() {
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      const ids = JSON.parse(stored);
      this.wishlist = this.products.filter(p => ids.includes(p.id));
    }
  }

  // Recently Viewed Products
  private addToRecentlyViewed(product: Product) {
    // Remove if already exists
    this.recentlyViewed = this.recentlyViewed.filter(p => p.id !== product.id);
    // Add to beginning
    this.recentlyViewed.unshift(product);
    // Keep only last 5
    this.recentlyViewed = this.recentlyViewed.slice(0, 5);
    this.saveRecentlyViewedToLocalStorage();
  }

  private saveRecentlyViewedToLocalStorage() {
    localStorage.setItem('recentlyViewed', JSON.stringify(this.recentlyViewed.map(p => p.id)));
  }

  private loadRecentlyViewedFromLocalStorage() {
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      const ids = JSON.parse(stored);
      this.recentlyViewed = this.products.filter(p => ids.includes(p.id));
    }
  }

  loadProductReviews(productId: number) {
    this.loadingReviews = true;
    this.shopService.getProductReviews(productId).subscribe({
      next: (reviews) => {
        this.ngZone.run(() => {
          this.productReviews = [...reviews];
          this.loadingReviews = false;
          this.updateProductRating();
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.ngZone.run(() => {
          this.productReviews = [];
          this.loadingReviews = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  private updateProductRating() {
    if (!this.selectedProduct) return;
    const count = this.productReviews.length;
    const avg = count > 0
      ? this.productReviews.reduce((sum, r) => sum + r.rating, 0) / count
      : 0;
    this.selectedProduct.averageRating = avg;
    this.selectedProduct.reviewCount = count;
    // also update the card in the products grid
    const idx = this.products.findIndex(p => p.id === this.selectedProduct!.id);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], averageRating: avg, reviewCount: count };
      this.products = [...this.products];
    }
  }

  deleteReview(reviewId: number) {
    if (!this.selectedProduct) return;
    this.deletingReviewId = reviewId;
    this.shopService.deleteProductReview(this.selectedProduct.id!, reviewId).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.deletingReviewId = null;
          this.loadProductReviews(this.selectedProduct!.id!);
          this.toastService.success('Review deleted');
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.deletingReviewId = null;
          const msg = err.status === 403 ? 'You can only delete your own reviews' : (err?.error?.message || 'Failed to delete review');
          this.toastService.error(msg);
          this.cdr.detectChanges();
        });
      }
    });
  }

  submitReview() {
    if (!this.selectedProduct || this.reviewForm.rating === 0 || !this.reviewForm.comment.trim()) return;
    this.isSubmittingReview = true;
    this.reviewError = '';
    this.shopService.addProductReview(this.selectedProduct.id!, this.reviewForm).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.isSubmittingReview = false;
          this.reviewForm = { rating: 0, comment: '' };
          this.toastService.success('Review submitted!');
          this.loadProductReviews(this.selectedProduct!.id!);
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.isSubmittingReview = false;
          this.reviewError = err?.error?.message || 'Failed to submit review';
          this.cdr.detectChanges();
        });
      }
    });
  }

  openCheckout() {
    this.showCheckout = true;
    this.checkoutForm = { shippingAddress: '', phoneNumber: '' };
    this.checkoutErrors = { shippingAddress: '', phoneNumber: '' };
  }

  closeCheckout() {
    this.showCheckout = false;
  }

  loadOrders() {
    this.loadingOrders = true;
    this.shopService.getMyOrders().subscribe({
      next: (data) => { this.orders = data; this.loadingOrders = false; this.cdr.markForCheck(); },
      error: () => { this.loadingOrders = false; this.toastService.error('Failed to load orders'); }
    });
  }

  openOrderDetail(order: Order) {
    if (order.orderItems) { this.selectedOrder = order; return; }
    this.shopService.getOrder(order.id).subscribe({
      next: (data) => { this.selectedOrder = data; this.cdr.markForCheck(); },
      error: () => this.toastService.error('Failed to load order details')
    });
  }

  getStatusClass(status: string): { [key: string]: boolean } {
    return {
      'bg-yellow-100 text-yellow-800': status === 'PENDING',
      'bg-blue-100 text-blue-800': status === 'CONFIRMED' || status === 'PROCESSING',
      'bg-purple-100 text-purple-800': status === 'SHIPPED',
      'bg-green-100 text-green-800': status === 'DELIVERED',
      'bg-red-100 text-red-800': status === 'CANCELLED'
    };
  }

  confirmCheckout() {
    this.checkoutErrors = { shippingAddress: '', phoneNumber: '' };

    if (!this.checkoutForm.shippingAddress.trim()) {
      this.checkoutErrors.shippingAddress = 'Shipping address is required';
    }
    if (!this.checkoutForm.phoneNumber.trim()) {
      this.checkoutErrors.phoneNumber = 'Phone number is required';
    }

    if (this.checkoutErrors.shippingAddress || this.checkoutErrors.phoneNumber) {
      return;
    }

    this.isCheckingOut = true;
    this.shopService.checkout(this.checkoutForm).subscribe({
      next: (response) => {
        this.isCheckingOut = false;
        this.toastService.success(`🎉 Order #${response.orderId} placed successfully!`);
        this.closeCheckout();
        this.loadCart();
        this.showCart = false;
      },
      error: () => {
        this.isCheckingOut = false;
        this.toastService.error('Checkout failed. Please try again.');
      }
    });
  }

  // Pagination helpers
  getPaginationPages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }
}
