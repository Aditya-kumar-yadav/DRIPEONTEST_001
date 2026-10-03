export type UserRole = 'ADMIN' | 'CUSTOMER' | 'admin' | 'user';

declare global {
  interface CustomJwtSessionClaims {
    role?: 'admin' | 'user' | string;
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CategoryType = string;
export interface Category {
  id: string;
  name: string;
  type: 'CLOTHING' | 'FOOTWEAR' | 'CAPS' | 'ORNAMENT';
}
export type ColorType = string;
export type SizeType = 'S' | 'M' | 'L' | 'XL' | 'US 7' | 'US 8' | 'US 9' | 'US 10' | 'US 11' | 'US 12' | 'All Sizes' | '7.5 inches' | '22 inches' | 'One Size';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: CategoryType;
  fabric?: string;
  fit?: string;
  closure?: string;
  waistStyle?: string;
  styleType?: string;
  upperMaterial?: string;
  soleType?: string;
  toeStyle?: string;
  price: number;
  comparePrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  variants: ProductVariant[];
  highlights?: string[];
  specifications?: Record<string, string>;
  imageUrl?: string;
  audioUrl?: string;
  artistName?: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  color: ColorType;
  size: SizeType;
  stockQuantity: number;
  sku: string;
  price?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
  color?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED';

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAmount: number;
  paymentId?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  stripePaymentIntentId?: string;
  paymentMethod?: 'card' | 'upi' | 'cod';
  cancellationRequested?: boolean;
  cancellationReason?: string;
  cancellationRequestedAt?: string;
  deliveryOtp?: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  trackingNumber?: string;
  carrier?: string;
  statusTimeline?: {
    status: OrderStatus;
    timestamp: string;
    description: string;
  }[];
  review?: {
    rating: number;
    comment: string;
    reviewImages: string[];
    createdAt: string;
  };
}

export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  quantity: number;
  unitPrice: number;
  productSnapshot: {
    name: string;
    category: CategoryType;
    color: ColorType;
    size: SizeType;
    imageUrl?: string;
  };
}

export interface CartItem {
  id: string;
  userId: string;
  productVariantId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedCartItem extends CartItem {
  product?: Product;
  variant?: ProductVariant;
}

export type RequestType = 'RETURN' | 'EXCHANGE';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface ReturnExchangeRequest {
  id: string;
  orderId: string;
  orderItemId: string;
  userId: string;
  type: RequestType;
  reason: string;
  photos: string[];
  status: RequestStatus;
  adminNotes?: string;
  createdAt: string;
}

export type DiscountType = 'PERCENT' | 'FLAT';

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: string;
}

export interface SiteSettings {
  announcementText: string;
  showAnnouncement: boolean;
  heroTitle: string;
  heroSub: string;
  freeShippingThreshold: number;
  shippingRate: number;
  contactEmail: string;
  promoImageBase64?: string;
  promoImageCaption?: string;
  deliverablePincodes?: string[];
  // Global Assets
  homeHeroImage?: string;
  footwearHeroImage?: string;
  earPiercingImage?: string;
  aboutImage?: string;
  clothingStoryImage1?: string;
  clothingStoryImage2?: string;
  brandAnthemBase64?: string;
  piercingLobeImage?: string;
  piercingHelixImage?: string;
  piercingTragusImage?: string;
  piercingCartilageImage?: string;
}

export interface Review {
  id: string;
  productId: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  userName: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  imageUrl?: string | null;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'PENDING' | 'RESOLVED';
  createdAt: string;
}

export interface ServiceablePincode {
  id: string;
  pincode: string;
  city?: string;
  state?: string;
  createdAt: string;
  updatedAt: string;
}

