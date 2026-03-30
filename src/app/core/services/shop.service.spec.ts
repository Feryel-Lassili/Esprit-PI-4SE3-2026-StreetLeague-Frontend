import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ShopService } from './shop.service';
import { environment } from '../../../environments/environment';

const BASE = environment.baseUrl;

describe('ShopService', () => {
  let service: ShopService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [ShopService] });
    service = TestBed.inject(ShopService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => expect(service).toBeTruthy());

  // Products
  it('getAllProducts should GET /products', () => {
    service.getAllProducts().subscribe();
    http.expectOne(`${BASE}/products`).flush([]);
  });

  it('getProduct should GET /products/:id', () => {
    service.getProduct(1).subscribe();
    http.expectOne(`${BASE}/products/1`).flush({});
  });

  it('searchProducts should GET /products/search with params', () => {
    service.searchProducts('ball', 'Sport', 'FOOTBALL').subscribe();
    const req = http.expectOne(r => r.url === `${BASE}/products/search`);
    expect(req.request.params.get('name')).toBe('ball');
    expect(req.request.params.get('category')).toBe('Sport');
    expect(req.request.params.get('sportType')).toBe('FOOTBALL');
    req.flush([]);
  });

  it('searchProducts without params should GET /products/search', () => {
    service.searchProducts().subscribe();
    http.expectOne(`${BASE}/products/search`).flush([]);
  });

  it('getAllProductsPaginated should GET /products with pagination params', () => {
    service.getAllProductsPaginated(1, 10, 'name', 'desc').subscribe();
    const req = http.expectOne(r => r.url === `${BASE}/products`);
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush({ content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 10 });
  });

  it('searchProductsPaginated should GET /products/search with all params', () => {
    service.searchProductsPaginated(0, 20, 'id', 'asc', 'ball', 'Sport', 'FOOTBALL', 0, 100).subscribe();
    const req = http.expectOne(r => r.url === `${BASE}/products/search`);
    expect(req.request.params.get('minPrice')).toBe('0');
    expect(req.request.params.get('maxPrice')).toBe('100');
    req.flush({ content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 20 });
  });

  it('getLowStockProducts should GET /products/low-stock', () => {
    service.getLowStockProducts(3).subscribe();
    http.expectOne(`${BASE}/products/low-stock?threshold=3`).flush([]);
  });

  it('createProduct should POST /products', () => {
    const p: any = { name: 'Ball', price: 10, stock: 5, category: 'Sport', image: '', sportType: 'FOOTBALL' };
    service.createProduct(p).subscribe();
    const req = http.expectOne(`${BASE}/products`);
    expect(req.request.method).toBe('POST');
    req.flush(p);
  });

  it('updateProduct should PUT /products/:id', () => {
    const p: any = { name: 'Ball', price: 10, stock: 5, category: 'Sport', image: '', sportType: 'FOOTBALL' };
    service.updateProduct(1, p).subscribe();
    const req = http.expectOne(`${BASE}/products/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(p);
  });

  it('deleteProduct should DELETE /products/:id', () => {
    service.deleteProduct(1).subscribe();
    const req = http.expectOne(`${BASE}/products/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('uploadProductImage should POST FormData', () => {
    const file = new File(['data'], 'img.jpg');
    service.uploadProductImage(file).subscribe();
    const req = http.expectOne(`${BASE}/products/upload-image`);
    expect(req.request.method).toBe('POST');
    req.flush({ imageUrl: 'http://img.com/img.jpg' });
  });

  it('updateProductImage should PATCH /products/:id/image', () => {
    service.updateProductImage(1, 'http://img.com/img.jpg').subscribe();
    const req = http.expectOne(`${BASE}/products/1/image`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});
  });

  // Reviews
  it('getProductReviews should GET /products/:id/reviews', () => {
    service.getProductReviews(1).subscribe();
    http.expectOne(`${BASE}/products/1/reviews`).flush([]);
  });

  it('addProductReview should POST /products/:id/reviews', () => {
    service.addProductReview(1, { rating: 5, comment: 'Great' }).subscribe();
    const req = http.expectOne(`${BASE}/products/1/reviews`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('deleteProductReview should DELETE /products/:id/reviews/:reviewId', () => {
    service.deleteProductReview(1, 2).subscribe();
    const req = http.expectOne(`${BASE}/products/1/reviews/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // Cart
  it('getMyCart should GET /cart', () => {
    service.getMyCart().subscribe();
    http.expectOne(`${BASE}/cart`).flush({ id: 1, totalAmount: 0, cartItems: [] });
  });

  it('addToCart should POST /cart/add/:id', () => {
    service.addToCart(5, 2).subscribe();
    const req = http.expectOne(`${BASE}/cart/add/5`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('updateCartItem should PUT /cart/update/:id', () => {
    service.updateCartItem(3, 4).subscribe();
    const req = http.expectOne(`${BASE}/cart/update/3`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('removeCartItem should DELETE /cart/remove/:id', () => {
    service.removeCartItem(3).subscribe();
    const req = http.expectOne(`${BASE}/cart/remove/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('clearCart should DELETE /cart/clear', () => {
    service.clearCart().subscribe();
    const req = http.expectOne(`${BASE}/cart/clear`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // Orders
  it('checkout should POST /orders/checkout', () => {
    service.checkout({ shippingAddress: '123 St', phoneNumber: '555' }).subscribe();
    const req = http.expectOne(`${BASE}/orders/checkout`);
    expect(req.request.method).toBe('POST');
    req.flush({ orderId: 1, status: 'PENDING' });
  });

  it('getMyOrders should GET /orders/my-orders', () => {
    service.getMyOrders().subscribe();
    http.expectOne(`${BASE}/orders/my-orders`).flush([]);
  });

  it('getOrder should GET /orders/:id', () => {
    service.getOrder(1).subscribe();
    http.expectOne(`${BASE}/orders/1`).flush({});
  });

  it('adminGetAllOrders should GET /orders/admin/all', () => {
    service.adminGetAllOrders().subscribe();
    http.expectOne(`${BASE}/orders/admin/all`).flush([]);
  });

  it('adminGetOrdersByStatus should GET /orders/admin/status/:status', () => {
    service.adminGetOrdersByStatus('PENDING').subscribe();
    http.expectOne(`${BASE}/orders/admin/status/PENDING`).flush([]);
  });

  it('adminUpdateOrderStatus should PUT /orders/admin/:id/status', () => {
    service.adminUpdateOrderStatus(1, 'CONFIRMED').subscribe();
    const req = http.expectOne(r => r.url === `${BASE}/orders/admin/1/status`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('adminDeleteOrder should DELETE /orders/admin/:id', () => {
    service.adminDeleteOrder(1).subscribe();
    const req = http.expectOne(`${BASE}/orders/admin/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('adminGetStats should GET /orders/admin/stats', () => {
    service.adminGetStats().subscribe();
    http.expectOne(`${BASE}/orders/admin/stats`).flush({});
  });

  // Player Merchandise
  it('submitMerchandise should POST /player-merch/submit', () => {
    const m: any = { name: 'Jersey', price: 50, stock: 10, category: 'Apparel', image: '', sportType: 'FOOTBALL' };
    service.submitMerchandise(m).subscribe();
    const req = http.expectOne(`${BASE}/player-merch/submit`);
    expect(req.request.method).toBe('POST');
    req.flush(m);
  });

  it('getMySubmissions should GET /player-merch/my-submissions', () => {
    service.getMySubmissions().subscribe();
    http.expectOne(`${BASE}/player-merch/my-submissions`).flush([]);
  });

  it('updateMySubmission should PUT /player-merch/:id', () => {
    const m: any = { name: 'Jersey', price: 50, stock: 10, category: 'Apparel', image: '', sportType: 'FOOTBALL' };
    service.updateMySubmission(1, m).subscribe();
    const req = http.expectOne(`${BASE}/player-merch/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(m);
  });

  it('deleteMySubmission should DELETE /player-merch/:id', () => {
    service.deleteMySubmission(1).subscribe();
    const req = http.expectOne(`${BASE}/player-merch/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('adminGetPendingMerchandise should GET /player-merch/admin/pending', () => {
    service.adminGetPendingMerchandise().subscribe();
    const req = http.expectOne(r => r.url === `${BASE}/player-merch/admin/pending`);
    req.flush({ content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 20 });
  });

  it('adminApproveMerchandise should PUT /player-merch/admin/:id/approve', () => {
    service.adminApproveMerchandise(1).subscribe();
    const req = http.expectOne(`${BASE}/player-merch/admin/1/approve`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('adminRejectMerchandise should PUT /player-merch/admin/:id/reject', () => {
    service.adminRejectMerchandise(1, 'Not suitable').subscribe();
    const req = http.expectOne(`${BASE}/player-merch/admin/1/reject`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ reason: 'Not suitable' });
    req.flush({});
  });

  it('adminGetMerchandiseStats should GET /player-merch/admin/stats', () => {
    service.adminGetMerchandiseStats().subscribe();
    http.expectOne(`${BASE}/player-merch/admin/stats`).flush({ pending: 0, approved: 0, rejected: 0 });
  });

  it('getApprovedPlayerMerchandise should GET /player-merch/approved', () => {
    service.getApprovedPlayerMerchandise().subscribe();
    const req = http.expectOne(r => r.url === `${BASE}/player-merch/approved`);
    req.flush({ content: [], totalElements: 0, totalPages: 0, currentPage: 0, pageSize: 20 });
  });
});
