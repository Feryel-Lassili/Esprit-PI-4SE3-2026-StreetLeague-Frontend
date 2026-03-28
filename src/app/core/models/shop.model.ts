export type SportType = 'FOOTBALL' | 'BASKETBALL' | 'TENNIS' | 'VOLLEYBALL';

export interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  sportType: SportType;
  reviewCount?: number;
  averageRating?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface CartItem {
  id?: number;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  totalAmount: number;
  cartItems: CartItem[];
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  shippingAddress?: string;
  phoneNumber?: string;
  user?: User;
  orderItems?: OrderItem[];
}

export interface OrderStats {
  totalOrders: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  revenueThisMonth: number;
}

export interface CheckoutRequest {
  shippingAddress: string;
  phoneNumber: string;
}

export interface CheckoutResponse {
  orderId: number;
  status: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface ProductReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: Date;
  userId: number;
  username: string;
}

export interface ReviewRequest {
  rating: number;
  comment: string;
}
