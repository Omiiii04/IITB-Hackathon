export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type Role = 'CUSTOMER' | 'SELLER' | 'DELIVERY' | 'ADMIN';
export type OrderStatus = 'AWAITING_PAYMENT' | 'PAYMENT_FAILED' | 'PAYMENT_SUCCESSFUL' | 'PROCESSING' | 'PARTIALLY_FULFILLED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type SubOrderStatus = 'PLACED' | 'SELLER_ACCEPTED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
