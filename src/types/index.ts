export type ProductCategory = 'Men' | 'Women' | 'Tops' | 'Bottoms' | 'Outerwear' | 'Accessories';

export type CollectionName = 'Essential Collection' | 'Urban Collection' | 'Monochrome Collection' | 'Weekend Collection';

export interface ProductColor {
  name: string;
  hex: string;
  imageIndex: number;
}

export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  email?: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
  photoUrl?: string;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  price?: number;
  originalPrice?: number;
  stockCount: number;
  inStock: boolean;
  image?: string;
  barcode?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  category: ProductCategory;
  gender: 'Men' | 'Women' | 'Unisex' | 'Kids';
  subcategory: string;
  price: number;
  originalPrice?: number;
  description: string;
  details: string[];
  materials: string;
  care: string[];
  colors: ProductColor[];
  sizes: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  collection: CollectionName;
  inStock: boolean;
  stockCount?: number;
  sku: string;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  reviews?: ProductReview[];
  // Pre-Order Attributes
  isPreOrder?: boolean;
  preOrderReleaseDate?: string;
  preOrderLimit?: number;
  preOrderCount?: number;
  preOrderMessage?: string;
  // Complete The Look (Atelier Stylist Pairings)
  completeLookIds?: string[];
  completeLookNote?: string;
  completeLookDiscount?: number;
  // SEO & Meta Attributes
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
}

export interface CartItem {
  id: string; // unique item instance id
  productId: string;
  product: Product;
  selectedColor: ProductColor;
  selectedSize: string;
  quantity: number;
  isPreOrder?: boolean;
  preOrderReleaseDate?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
  image: string;
  isPreOrder?: boolean;
  preOrderReleaseDate?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  shipping: number;
  total: number;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Refunded';
  trackingNumber: string;
  courierCarrier?: string;
  trackingUrl?: string;
  estimatedDelivery: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  userId?: string;
}

export interface FilterState {
  category: string;
  gender?: 'Men' | 'Women' | 'All' | 'Kids';
  collection?: string;
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  sortBy: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating';
}

export type ActivePageType = 'home' | 'shop' | 'product' | 'wishlist' | 'account' | 'story' | 'policy' | 'admin' | 'checkout' | 'contact';

export type PolicyTab = 'privacy' | 'terms' | 'shipping' | 'returns' | 'contact' | 'faqs' | 'sustainability';

export interface ContactInquiry {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  phone?: string;
  intent: string;
  subject?: string;
  orderId?: string;
  appointmentDate?: string;
  preferredTime?: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string;
}

export interface Category {
  id: string | number;
  title: string;
  category: string;
  subtitle: string;
  image: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  description?: string;
  image: string;
  displayOrder: number;
  productCount?: number;
  parentId?: string | null;
  parent_id?: string | null;
  title?: string;
  category?: string;
  tagline?: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  label?: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  googleId?: string;
  addresses: UserAddress[];
  rewardPoints?: number;
  membershipTier?: string;
  createdAt?: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Inventory Manager' | 'Customer Support';
  pin: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface OrderRefund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'Completed' | 'Pending';
  createdAt: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalClients: number;
  totalProducts?: number;
  avgOrderValue: number;
  recentSales: { date: string; amount: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
}

export interface StoreSettings {
  storeName: string;
  storeLogoUrl: string;
  supportEmail: string;
  supportPhone: string;
  physicalAddress: string;
  currencySymbol: string;
  taxRatePercent: number;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpSecure: boolean;
  senderEmail: string;
  senderName: string;
  homeMenCategory?: string;
  homeWomenCategory?: string;
  homeKidsCategory?: string;
  heroSlide1Url?: string;
  heroSlide2Url?: string;
  heroSlide3Url?: string;
  heroSlideUrls?: string[];
  razorpayEnabled?: boolean;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayCurrency?: string;
  razorpayMode?: 'test' | 'live';
  cloudApiEndpoint?: string;
  cloudApiKey?: string;
  cloudWorkspaceId?: string;
  enableRecentlyViewed?: boolean;
  recentlyViewedTitle?: string;
  enablePersistentCart?: boolean;
  cartRetentionDays?: number;
  freeShippingThreshold?: number;
  standardShippingRate?: number;
  expressShippingRate?: number;
  internationalShippingRate?: number;
}

export interface PersistentCartRecord {
  id: string;
  userId?: string | null;
  sessionId: string;
  userEmail?: string | null;
  userName?: string | null;
  items: CartItem[];
  itemCount: number;
  cartSubtotal: number;
  isAbandoned: boolean;
  ageHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RazorpayConfig {
  enabled: boolean;
  keyId: string;
  currency: string;
  mode: 'test' | 'live';
  hasSecret: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  status: 'Active' | 'Suspended';
  createdAt: string;
  lastOrderDate?: string;
}

export interface StoreMenu {
  id: string;
  title: string;
  link?: string;
  displayOrder: number;
  assignedCategories: string | string[]; // JSON string or array of Category titles/names
}

export interface ProductReviewAdmin {
  id: string;
  productId: string;
  productName: string;
  productCategory?: string;
  productImage?: string;
  author: string;
  email?: string;
  rating: number;
  title: string;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
  adminReply?: string;
  verified: boolean;
  photoUrl?: string;
  createdAt: string;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  product_name: string;
  change_qty: number;
  new_stock: number;
  reason: string;
  created_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id?: string;
  details: string;
  ip_address?: string;
  created_at: string;
}
