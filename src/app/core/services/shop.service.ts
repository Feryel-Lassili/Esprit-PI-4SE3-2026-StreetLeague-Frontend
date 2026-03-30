import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, Cart, SportType, Order, OrderStats, OrderStatus, CheckoutRequest, CheckoutResponse, ProductReview, ReviewRequest, PaginatedResponse, MerchandiseSubmission, MerchandiseStats } from '../models/shop.model';

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private readonly API_URL = `${environment.baseUrl}`;

  constructor(private http: HttpClient) {}

  // Products
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products`).pipe(
      tap(data => console.log('API response:', data)),
      catchError(err => {
        console.error('API error:', err);
        return throwError(() => err);
      })
    );
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/products/${id}`);
  }

  searchProducts(name?: string, category?: string, sportType?: SportType): Observable<Product[]> {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (category) params = params.set('category', category);
    if (sportType) params = params.set('sportType', sportType);
    return this.http.get<Product[]>(`${this.API_URL}/products/search`, { params });
  }

  // Products - Paginated
  getAllProductsPaginated(page: number = 0, pageSize: number = 20, sortBy: string = 'id', sortDir: string = 'asc'): Observable<PaginatedResponse<Product>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    return this.http.get<PaginatedResponse<Product>>(`${this.API_URL}/products`, { params });
  }

  searchProductsPaginated(
    page: number = 0,
    pageSize: number = 20,
    sortBy: string = 'id',
    sortDir: string = 'asc',
    name?: string,
    category?: string,
    sportType?: SportType,
    minPrice?: number,
    maxPrice?: number
  ): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize)
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);
    if (name) params = params.set('name', name);
    if (category) params = params.set('category', category);
    if (sportType) params = params.set('sportType', sportType);
    if (minPrice !== undefined) params = params.set('minPrice', minPrice);
    if (maxPrice !== undefined) params = params.set('maxPrice', maxPrice);
    return this.http.get<PaginatedResponse<Product>>(`${this.API_URL}/products/search`, { params });
  }

  getLowStockProducts(threshold: number = 5): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.API_URL}/products/low-stock?threshold=${threshold}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.API_URL}/products`, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.API_URL}/products/${id}`, product);
  }

  updateProductImage(id: number, imageUrl: string): Observable<Product> {
    return this.http.patch<Product>(`${this.API_URL}/products/${id}/image`, { imageUrl });
  }

  uploadProductImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.API_URL}/products/upload-image`, formData);
  }

  setProductImageUrl(id: number, imageUrl: string): Observable<Product> {
    return this.http.patch<Product>(`${this.API_URL}/products/${id}/image`, { imageUrl });
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/products/${id}`);
  }

  // Reviews
  getProductReviews(productId: number): Observable<ProductReview[]> {
    return this.http.get<ProductReview[]>(`${this.API_URL}/products/${productId}/reviews`);
  }

  addProductReview(productId: number, review: ReviewRequest): Observable<ProductReview> {
    return this.http.post<ProductReview>(`${this.API_URL}/products/${productId}/reviews`, review);
  }

  deleteProductReview(productId: number, reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/products/${productId}/reviews/${reviewId}`);
  }

  // Cart
  getMyCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.API_URL}/cart`);
  }

  addToCart(productId: number, quantity: number = 1): Observable<any> {
    return this.http.post(`${this.API_URL}/cart/add/${productId}`, { quantity });
  }

  updateCartItem(itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.API_URL}/cart/update/${itemId}`, { quantity });
  }

  removeCartItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.API_URL}/cart/remove/${itemId}`);
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/cart/clear`);
  }

  // Orders
  checkout(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.API_URL}/orders/checkout`, request);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API_URL}/orders/my-orders`);
  }

  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.API_URL}/orders/${orderId}`);
  }

  // Admin Orders
  adminGetAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API_URL}/orders/admin/all`);
  }

  adminGetOrdersByStatus(status: OrderStatus): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API_URL}/orders/admin/status/${status}`);
  }

  adminUpdateOrderStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http.put<Order>(`${this.API_URL}/orders/admin/${id}/status`, null, { params: { status } });
  }

  adminDeleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/orders/admin/${id}`);
  }

  adminGetStats(): Observable<OrderStats> {
    return this.http.get<OrderStats>(`${this.API_URL}/orders/admin/stats`);
  }

  // Player Merchandise
  submitMerchandise(data: MerchandiseSubmission): Observable<MerchandiseSubmission> {
    return this.http.post<MerchandiseSubmission>(`${this.API_URL}/player-merch/submit`, data);
  }

  getMySubmissions(): Observable<MerchandiseSubmission[]> {
    return this.http.get<MerchandiseSubmission[]>(`${this.API_URL}/player-merch/my-submissions`);
  }

  updateMySubmission(id: number, data: MerchandiseSubmission): Observable<MerchandiseSubmission> {
    return this.http.put<MerchandiseSubmission>(`${this.API_URL}/player-merch/${id}`, data);
  }

  deleteMySubmission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/player-merch/${id}`);
  }

  // Admin Merchandise
  adminGetPendingMerchandise(page: number = 0, pageSize: number = 20): Observable<PaginatedResponse<MerchandiseSubmission>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PaginatedResponse<MerchandiseSubmission>>(`${this.API_URL}/player-merch/admin/pending`, { params });
  }

  adminApproveMerchandise(id: number): Observable<MerchandiseSubmission> {
    return this.http.put<MerchandiseSubmission>(`${this.API_URL}/player-merch/admin/${id}/approve`, {});
  }

  adminRejectMerchandise(id: number, reason: string): Observable<MerchandiseSubmission> {
    return this.http.put<MerchandiseSubmission>(`${this.API_URL}/player-merch/admin/${id}/reject`, { reason });
  }

  adminGetMerchandiseStats(): Observable<MerchandiseStats> {
    return this.http.get<MerchandiseStats>(`${this.API_URL}/player-merch/admin/stats`);
  }

  getApprovedPlayerMerchandise(page: number = 0, pageSize: number = 20): Observable<PaginatedResponse<MerchandiseSubmission>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PaginatedResponse<MerchandiseSubmission>>(`${this.API_URL}/player-merch/approved`, { params });
  }
}
