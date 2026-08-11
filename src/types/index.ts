export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type Role = 'CUSTOMER' | 'SELLER' | 'DELIVERY' | 'ADMIN';

// Trimmed-down user shape safe to hand back to the client / embed in a
// session — no passwordHash, oauthId, etc. Used by the Google OAuth flow
// (modules/auth/auth.service.ts) and, in a later commit, email/password login.
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export type OrderStatus = 'AWAITING_PAYMENT' | 'PAYMENT_FAILED' | 'PAYMENT_SUCCESSFUL' | 'PROCESSING' | 'PARTIALLY_FULFILLED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type SubOrderStatus = 'PLACED' | 'SELLER_ACCEPTED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
