import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  Tag, 
  Users, 
  TrendingUp, 
  Shield, 
  Key, 
  Menu,
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Printer, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  Mail, 
  Lock,
  FolderTree,
  Building,
  Send,
  Eye,
  EyeOff,
  CreditCard,
  RefreshCw,
  Globe,
  ArrowUpRight,
  ArrowLeft,
  LogOut,
  ChevronRight,
  Sliders,
  DollarSign,
  FileSpreadsheet,
  Upload,
  Download,
  X,
  Layers,
  Sparkles,
  HelpCircle,
  Filter,
  Copy,
  Calendar,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  Cloud,
  FileText,
  ExternalLink,
  Activity,
  Terminal,
  ShoppingCart,
  Clock,
  AlertCircle,
  Grid,
  SlidersHorizontal,
  Palette,
  Ruler,
  Wand2,
  Maximize2,
  ChevronDown,
  Info,
  MessageSquare,
  Star,
  Boxes,
  FileCheck,
  Truck,
  History,
  Share2,
  SearchCheck,
  Barcode,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useShop } from '../context/ShopContext';
import { 
  Product, 
  Order, 
  DiscountCode, 
  StaffMember, 
  AnalyticsSummary, 
  StoreSettings, 
  Customer, 
  CategoryItem, 
  StoreMenu, 
  PersistentCartRecord, 
  ProductVariant, 
  ProductColor,
  ContactInquiry,
  ProductReviewAdmin,
  InventoryLog,
  AuditLog
} from '../types';
import { CloudImageUploader } from './CloudImageUploader';

export type AdminTabType = 
  | 'analytics' 
  | 'orders' 
  | 'catalog' 
  | 'product-new' 
  | 'product-edit' 
  | 'categories' 
  | 'tags' 
  | 'inquiries'
  | 'reviews'
  | 'inventory'
  | 'audit-logs'
  | 'menus' 
  | 'customers' 
  | 'persistent-carts' 
  | 'discounts' 
  | 'settings' 
  | 'staff';

export const getAdminRouteFromPath = (path: string): { tab: AdminTabType; param?: string } => {
  const clean = path.toLowerCase().replace(/\/$/, '');
  if (clean === '/admin/products/new' || clean === '/admin/products/add' || clean === '/admin/add-product') {
    return { tab: 'product-new' };
  }
  if (clean.startsWith('/admin/products/edit/') || clean.startsWith('/admin/edit-product/')) {
    const parts = path.split('/');
    const id = parts[4] || parts[3];
    return { tab: 'product-edit', param: id };
  }
  if (clean === '/admin/products' || clean === '/admin/catalog') {
    return { tab: 'catalog' };
  }
  if (clean === '/admin/orders') {
    return { tab: 'orders' };
  }
  if (clean === '/admin/inquiries' || clean === '/admin/concierge' || clean === '/admin/support') {
    return { tab: 'inquiries' };
  }
  if (clean === '/admin/reviews' || clean === '/admin/ratings') {
    return { tab: 'reviews' };
  }
  if (clean === '/admin/inventory' || clean === '/admin/stock') {
    return { tab: 'inventory' };
  }
  if (clean === '/admin/audit-logs' || clean === '/admin/audit' || clean === '/admin/logs') {
    return { tab: 'audit-logs' };
  }
  if (clean === '/admin/categories') {
    return { tab: 'categories' };
  }
  if (clean === '/admin/tags') {
    return { tab: 'tags' };
  }
  if (clean === '/admin/customers') {
    return { tab: 'customers' };
  }
  if (clean === '/admin/persistent-carts' || clean === '/admin/carts') {
    return { tab: 'persistent-carts' };
  }
  if (clean === '/admin/discounts' || clean === '/admin/coupons') {
    return { tab: 'discounts' };
  }
  if (clean === '/admin/menus' || clean === '/admin/navigation') {
    return { tab: 'menus' };
  }
  if (clean === '/admin/settings') {
    return { tab: 'settings' };
  }
  if (clean === '/admin/staff' || clean === '/admin/security') {
    return { tab: 'staff' };
  }
  return { tab: 'analytics' };
};

export const AdminPanel: React.FC = () => {
  const { products, refreshProducts, storeSettings, refreshStoreSettings, showToast, setActivePage, menus, refreshMenus } = useShop();

  // PIN Authentication state
  const [adminPin, setAdminPin] = useState(() => localStorage.getItem('cornus_admin_pin') || '');
  const [inputPin, setInputPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active Tab initialized directly from Browser URL pathname
  const [activeTab, setActiveTab] = useState<AdminTabType>(() => {
    if (typeof window !== 'undefined') {
      return getAdminRouteFromPath(window.location.pathname).tab;
    }
    return 'analytics';
  });
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(true);
  const [customTagsList, setCustomTagsList] = useState<{ id: string; name: string; slug: string; description: string }[]>([
    { id: '1', name: 'New Arrival', slug: 'new-arrival', description: 'Freshly released garments from the current season drop.' },
    { id: '2', name: 'Trending', slug: 'trending', description: 'Most viewed and highly requested pieces by boutique clients.' },
    { id: '3', name: 'Best Seller', slug: 'best-seller', description: 'Consistently top-performing signature silhouettes.' },
    { id: '4', name: 'Atelier Edition', slug: 'atelier-edition', description: 'Limited handcrafted garments made in boutique batches.' },
    { id: '5', name: 'Limited Edition', slug: 'limited-edition', description: 'Numbered collector-grade archive runs.' },
    { id: '6', name: 'Pre-Order Drop', slug: 'pre-order-drop', description: 'Advance reservation garments currently in atelier tailoring.' },
    { id: '7', name: 'Silk Series', slug: 'silk-series', description: '100% Mulberry silk and double-crepe compositions.' },
    { id: '8', name: 'Architectural Cut', slug: 'architectural-cut', description: 'Sculptural tailored shoulders and modernist draping.' }
  ]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagSlug, setNewTagSlug] = useState('');
  const [newTagDesc, setNewTagDesc] = useState('');
  const [tagSearchQuery, setTagSearchQuery] = useState('');

  // Live Data States
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [customersList, setCustomersList] = useState<Customer[]>([]);
  const [dbStatus, setDbStatus] = useState<string>('Checking...');

  // Persistent Carts State
  const [persistentCartsList, setPersistentCartsList] = useState<PersistentCartRecord[]>([]);
  const [persistentCartStats, setPersistentCartStats] = useState({
    totalActiveCarts: 0,
    totalCartValue: 0,
    abandonedCount: 0,
    abandonedValue: 0,
    avgBasketValue: 0
  });
  const [isLoadingPersistentCarts, setIsLoadingPersistentCarts] = useState(false);
  const [selectedPersistentCartModal, setSelectedPersistentCartModal] = useState<PersistentCartRecord | null>(null);
  const [isPurgingCarts, setIsPurgingCarts] = useState(false);
  const [persistentCartSearch, setPersistentCartSearch] = useState('');
  const [persistentCartFilter, setPersistentCartFilter] = useState<'All' | 'Active' | 'Abandoned'>('All');

  // Store Settings Form State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({
    storeName: 'CORNUS',
    storeLogoUrl: 'https://i.ibb.co/SwmnN7pz/Cornus-Logo.png',
    supportEmail: 'concierge@cornus.com',
    supportPhone: '+1 (800) 555-CORNUS',
    physicalAddress: '740 Madison Avenue, New York, NY 10065',
    currencySymbol: '₹',
    taxRatePercent: 8.5,
    facebookUrl: 'https://facebook.com/cornus',
    instagramUrl: 'https://instagram.com/cornus_official',
    twitterUrl: 'https://twitter.com/cornus',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    smtpUser: 'apikey',
    smtpPass: 'SG.default_demo_key',
    smtpSecure: false,
    senderEmail: 'noreply@cornus.com',
    senderName: 'CORNUS Atelier',
    heroSlide1Url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
    heroSlide2Url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
    heroSlide3Url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80',
    enablePersistentCart: true,
    cartRetentionDays: 30
  });
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Search & Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderPreOrderFilter, setOrderPreOrderFilter] = useState<'All' | 'PreOrderOnly' | 'StandardOnly'>('All');
  const [productSearch, setProductSearch] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState<'All' | 'InStock' | 'PreOrder' | 'OutOfStock' | 'CompleteLook'>('All');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  // Bulk update states
  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkStockCount, setBulkStockCount] = useState('');
  const [bulkInStock, setBulkInStock] = useState<string>(''); // 'true', 'false', or '' (unset)
  const [bulkGender, setBulkGender] = useState('');
  const [bulkSubcategory, setBulkSubcategory] = useState('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [showBulkPanel, setShowBulkPanel] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilterStatus, setCustomerFilterStatus] = useState('All');

  // Modals & Forms
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<Customer | null>(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catSubtitle, setCatSubtitle] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catOrder, setCatOrder] = useState(1);
  const [catParentId, setCatParentId] = useState<string | null>(null);

  // Menu Management Modal State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<StoreMenu | null>(null);
  const [menuTitle, setMenuTitle] = useState('');
  const [menuLink, setMenuLink] = useState('');
  const [menuDisplayOrder, setMenuDisplayOrder] = useState(1);
  const [menuAssignedCategories, setMenuAssignedCategories] = useState<string[]>([]);

  // Product Form Modal & Validation State
  const [productModalTab, setProductModalTab] = useState<'general' | 'media' | 'variants' | 'specs' | 'preorder' | 'ensemble' | 'seo'>('general');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Core Garment Fields
  const [prodName, setProdName] = useState('');
  const [prodSubtitle, setProdSubtitle] = useState('');
  const [prodCategory, setProdCategory] = useState<any>('Outerwear');
  const [prodGender, setProdGender] = useState<'Men' | 'Women' | 'Unisex' | 'Kids'>('Men');
  const [prodSubcategory, setProdSubcategory] = useState('Essentials');
  const [prodCollection, setProdCollection] = useState<string>('Essential Collection');
  const [prodPrice, setProdPrice] = useState<number>(4990);
  const [prodOriginalPrice, setProdOriginalPrice] = useState<number | ''>('');
  const [prodStock, setProdStock] = useState<number>(15);
  const [prodSku, setProdSku] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodMaterials, setProdMaterials] = useState('');
  const [prodCare, setProdCare] = useState('');
  const [prodDetails, setProdDetails] = useState('Hand-finished Italian seams\nArchitectural tailored cut\nSignature Cornus silk-blend lining');
  const [prodSizes, setProdSizes] = useState('S, M, L, XL');
  const [prodColors, setProdColors] = useState('Black');
  const [prodImages, setProdImages] = useState('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80');
  const [prodSecondaryImage, setProdSecondaryImage] = useState('');
  const [prodExtraImages, setProdExtraImages] = useState<string[]>([]);
  const [prodIsNew, setProdIsNew] = useState(true);
  const [prodIsTrending, setProdIsTrending] = useState(false);
  const [prodIsBestSeller, setProdIsBestSeller] = useState(false);

  // SEO & Social OpenGraph Fields
  const [prodMetaTitle, setProdMetaTitle] = useState('');
  const [prodMetaDesc, setProdMetaDesc] = useState('');
  const [prodKeywords, setProdKeywords] = useState('');

  // Variable Product & Variant Matrix State
  const [prodHasVariants, setProdHasVariants] = useState(false);
  const [prodColorsList, setProdColorsList] = useState<ProductColor[]>([
    { name: 'Obsidian Black', hex: '#111111', imageIndex: 0 },
    { name: 'Warm Camel', hex: '#C19A6B', imageIndex: 1 }
  ]);
  const [prodSizesList, setProdSizesList] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [prodVariantsMatrix, setProdVariantsMatrix] = useState<ProductVariant[]>([]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#111111');
  const [newSizeInput, setNewSizeInput] = useState('');
  const [variantBulkPrice, setVariantBulkPrice] = useState('');
  const [variantBulkStock, setVariantBulkStock] = useState('');
  const [variantBulkSkuPrefix, setVariantBulkSkuPrefix] = useState('CRN');

  // Pre-Order Attributes
  const [prodIsPreOrder, setProdIsPreOrder] = useState(false);
  const [prodPreOrderReleaseDate, setProdPreOrderReleaseDate] = useState('');
  const [prodPreOrderLimit, setProdPreOrderLimit] = useState(50);
  const [prodPreOrderCount, setProdPreOrderCount] = useState(0);
  const [prodPreOrderMessage, setProdPreOrderMessage] = useState('');

  // Complete The Look (Curated Ensemble Bundling)
  const [prodCompleteLookIds, setProdCompleteLookIds] = useState<string[]>([]);
  const [prodCompleteLookNote, setProdCompleteLookNote] = useState('');
  const [prodCompleteLookDiscount, setProdCompleteLookDiscount] = useState(15);
  const [completeLookSearch, setCompleteLookSearch] = useState('');

  // Inquiries / Concierge Desk State
  const [inquiriesList, setInquiriesList] = useState<ContactInquiry[]>([]);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryFilter, setInquiryFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved'>('All');
  const [selectedInquiryDetail, setSelectedInquiryDetail] = useState<ContactInquiry | null>(null);
  const [replyModalInquiry, setReplyModalInquiry] = useState<ContactInquiry | null>(null);
  const [inquiryReplyText, setInquiryReplyText] = useState('');
  const [isSendingInquiryReply, setIsSendingInquiryReply] = useState(false);

  // Product Reviews Moderation State
  const [reviewsList, setReviewsList] = useState<ProductReviewAdmin[]>([]);
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewFilter, setReviewFilter] = useState<'All' | 'approved' | 'pending' | 'rejected'>('All');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<string>('All');
  const [replyReviewModal, setReplyReviewModal] = useState<ProductReviewAdmin | null>(null);
  const [reviewReplyText, setReviewReplyText] = useState('');
  const [isSavingReviewReply, setIsSavingReviewReply] = useState(false);

  // Inventory & Movement Logs State
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [inventorySearch, setInventorySearch] = useState('');
  const [adjustStockProduct, setAdjustStockProduct] = useState<Product | null>(null);
  const [adjustStockChange, setAdjustStockChange] = useState<number>(10);
  const [adjustStockReason, setAdjustStockReason] = useState<string>('Supplier Restock Batch');
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('All');

  // Order Fulfillment Modal State
  const [fulfillmentOrderModal, setFulfillmentOrderModal] = useState<Order | null>(null);
  const [fulfillmentCarrier, setFulfillmentCarrier] = useState<string>('BlueDart');
  const [fulfillmentTrackingNumber, setFulfillmentTrackingNumber] = useState<string>('');
  const [fulfillmentEstimatedDelivery, setFulfillmentEstimatedDelivery] = useState<string>('3-5 Business Days');
  const [fulfillmentStatus, setFulfillmentStatus] = useState<'Shipped' | 'Out for Delivery' | 'Delivered'>('Shipped');
  const [isSavingFulfillment, setIsSavingFulfillment] = useState(false);

  // CSV / Excel Import State with Field Mapping
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [importRawRows, setImportRawRows] = useState<any[]>([]);
  const [fieldMappings, setFieldMappings] = useState<Record<string, string>>({
    name: '',
    price: '',
    category: '',
    gender: '',
    subcategory: '',
    sku: '',
    stock: '',
    description: '',
    subtitle: '',
    materials: '',
    images: '',
    sizes: '',
    colors: ''
  });
  const [isExecutingImport, setIsExecutingImport] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; updated: number; categoriesCreated: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Discount Form State
  const [isAddingDiscount, setIsAddingDiscount] = useState(false);
  const [discCode, setDiscCode] = useState('');
  const [discType, setDiscType] = useState<'percentage' | 'fixed'>('percentage');
  const [discValue, setDiscValue] = useState(15);
  const [discMinSpend, setDiscMinSpend] = useState(2000);
  const [discMaxUses, setDiscMaxUses] = useState(500);
  const [discExpiresAt, setDiscExpiresAt] = useState('2026-12-31');
  const [isSavingDiscount, setIsSavingDiscount] = useState(false);

  // Staff Form State
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<'Super Admin' | 'Inventory Manager' | 'Customer Support'>('Inventory Manager');
  const [staffPin, setStaffPin] = useState('');

  // Refund Modal
  const [refundingOrder, setRefundingOrder] = useState<Order | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('Client requested cancellation');

  // Razorpay Gateway Settings
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_test_51AtelierCornus');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('secret_cornus_atelier_live');
  const [razorpayCurrency, setRazorpayCurrency] = useState('INR');
  const [razorpayMode, setRazorpayMode] = useState<'test' | 'live'>('test');
  const [showRzpSecret, setShowRzpSecret] = useState(false);
  const [isSavingRzp, setIsSavingRzp] = useState(false);

  // Personal Cloud Storage Settings (TeleCloud API)
  const [cloudApiEndpoint, setCloudApiEndpoint] = useState(
    storeSettings?.cloudApiEndpoint || 'https://ais-dev-y6wlfhoudz3f6xc5ep2uxc-384474894487.asia-east1.run.app/api/v1/upload'
  );
  const [cloudApiKey, setCloudApiKey] = useState(
    storeSettings?.cloudApiKey || 'tc_live_92094a5f46b81b5fae1bc5725bb47ab1aa42f089ce1f8543'
  );
  const [cloudWorkspaceId, setCloudWorkspaceId] = useState(
    storeSettings?.cloudWorkspaceId || '8'
  );
  const [showCloudKey, setShowCloudKey] = useState(false);
  const [isSavingCloud, setIsSavingCloud] = useState(false);
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);
  const [cloudUploadsList, setCloudUploadsList] = useState<any[]>([]);
  const [lastUploadedDirectLink, setLastUploadedDirectLink] = useState<string | null>(null);
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [cloudTestResult, setCloudTestResult] = useState<{
    success: boolean;
    statusCode?: number;
    statusText?: string;
    latencyMs?: number;
    contentType?: string;
    endpoint?: string;
    workspaceId?: string;
    apiKeyMasked?: string;
    isJson?: boolean;
    data?: any;
    raw?: string;
    directLink?: string | null;
    uploadId?: string | null;
    error?: string | null;
    timestamp?: string;
  } | null>(null);
  const [showRawResponse, setShowRawResponse] = useState(false);

  const getCategoryBreadcrumb = (cat: CategoryItem): string => {
    const path: string[] = [cat.name];
    let currentParentId = cat.parentId || cat.parent_id;
    let safeguard = 0;

    while (currentParentId && safeguard < 10) {
      safeguard++;
      const parent = categoriesList.find((c) => c.id === currentParentId);
      if (parent) {
        path.unshift(parent.name);
        currentParentId = parent.parentId || parent.parent_id;
      } else {
        break;
      }
    }

    return path.join(' > ');
  };

  // Sync context storeSettings into form state when loaded
  useEffect(() => {
    if (storeSettings) {
      setSettingsForm(storeSettings);
    }
  }, [storeSettings]);

  // Check PIN login
  useEffect(() => {
    if (adminPin === '0000' || adminPin === '1234' || adminPin === '5678' || adminPin === 'cornus2026') {
      setIsAuthenticated(true);
      fetchAdminData(adminPin);
    }
  }, [adminPin]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin === '0000' || inputPin === '1234' || inputPin === '5678' || inputPin === 'cornus2026') {
      setAdminPin(inputPin);
      localStorage.setItem('cornus_admin_pin', inputPin);
      setIsAuthenticated(true);
      setAuthError('');
      fetchAdminData(inputPin);
      showToast('Authenticated to Admin Operations Console');
    } else {
      setAuthError('Invalid Passcode PIN. Use 0000 for Super Admin.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cornus_admin_pin');
    setAdminPin('');
    setIsAuthenticated(false);
    showToast('Signed out of Admin Console');
  };

  const fetchAdminData = async (pin: string) => {
    const headers = { 'x-admin-pin': pin };

    try {
      // Check DB Status
      const dbRes = await fetch('/api/db-status');
      const dbData = await dbRes.json();
      setDbStatus(dbData.status || 'Connected');

      // Fetch Analytics
      const analyticsRes = await fetch('/api/admin/analytics', { headers });
      const analyticsData = await analyticsRes.json();
      if (analyticsData.success) setAnalytics(analyticsData.analytics);

      // Fetch Orders
      const ordersRes = await fetch('/api/admin/orders', { headers });
      const ordersData = await ordersRes.json();
      if (ordersData.success) setAdminOrders(ordersData.orders);

      // Fetch Discounts
      const discRes = await fetch('/api/admin/discounts', { headers });
      const discData = await discRes.json();
      if (discData.success) setDiscounts(discData.discounts);

      // Fetch Staff
      const staffRes = await fetch('/api/admin/staff', { headers });
      const staffData = await staffRes.json();
      if (staffData.success) setStaffList(staffData.staff);

      // Fetch Categories
      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      if (catData.success && Array.isArray(catData.categories)) {
        setCategoriesList(catData.categories);
      }

      // Fetch Customers
      const custRes = await fetch('/api/admin/customers', { headers });
      const custData = await custRes.json();
      if (custData.success && Array.isArray(custData.customers)) {
        setCustomersList(custData.customers);
      }

      // Fetch Settings
      const settRes = await fetch('/api/settings');
      const settData = await settRes.json();
      if (settData.success && settData.settings) {
        setSettingsForm(settData.settings);
        if (settData.settings.cloudApiEndpoint) setCloudApiEndpoint(settData.settings.cloudApiEndpoint);
        if (settData.settings.cloudApiKey) setCloudApiKey(settData.settings.cloudApiKey);
        if (settData.settings.cloudWorkspaceId) setCloudWorkspaceId(settData.settings.cloudWorkspaceId);
      }

      // Fetch Cloud Uploads History
      try {
        const uplRes = await fetch('/api/admin/uploads', { headers });
        const uplData = await uplRes.json();
        if (uplData.success && Array.isArray(uplData.uploads)) {
          setCloudUploadsList(uplData.uploads);
        }
      } catch (e) {
        // silent fallback
      }

      // Fetch Razorpay Payment Gateway Settings
      const rzpRes = await fetch('/api/admin/payment-settings', { headers });
      const rzpData = await rzpRes.json();
      if (rzpData.success && rzpData.config) {
        setRazorpayEnabled(rzpData.config.enabled);
        setRazorpayKeyId(rzpData.config.keyId || '');
        setRazorpayKeySecret(rzpData.config.keySecret || '');
        setRazorpayCurrency(rzpData.config.currency || 'INR');
        setRazorpayMode(rzpData.config.mode || 'test');
      }

      // Fetch Concierge Inquiries
      try {
        const inqRes = await fetch('/api/admin/inquiries', { headers });
        const inqData = await inqRes.json();
        if (inqData.success && Array.isArray(inqData.inquiries)) {
          setInquiriesList(inqData.inquiries);
        }
      } catch (e) {}

      // Fetch Customer Reviews
      try {
        const revRes = await fetch('/api/admin/reviews', { headers });
        const revData = await revRes.json();
        if (revData.success && Array.isArray(revData.reviews)) {
          setReviewsList(revData.reviews);
        }
      } catch (e) {}

      // Fetch Inventory Movement Logs
      try {
        const invRes = await fetch('/api/admin/inventory/logs', { headers });
        const invData = await invRes.json();
        if (invData.success && Array.isArray(invData.logs)) {
          setInventoryLogs(invData.logs);
        }
      } catch (e) {}

      // Fetch Audit Logs
      try {
        const audRes = await fetch('/api/admin/audit-logs', { headers });
        const audData = await audRes.json();
        if (audData.success && Array.isArray(audData.logs)) {
          setAuditLogs(audData.logs);
        }
      } catch (e) {}

      // Fetch Persistent Carts
      fetchPersistentCarts(pin);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  const fetchPersistentCarts = async (pin = adminPin) => {
    setIsLoadingPersistentCarts(true);
    try {
      const res = await fetch('/api/admin/persistent-carts', {
        headers: { 'x-admin-pin': pin }
      });
      const data = await res.json();
      if (data.success) {
        setPersistentCartsList(data.carts || []);
        if (data.stats) {
          setPersistentCartStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load persistent carts:', err);
    } finally {
      setIsLoadingPersistentCarts(false);
    }
  };

  const handleDeletePersistentCart = async (cartId: string) => {
    if (!confirm('Are you sure you want to remove this persistent cart record from the database?')) return;
    try {
      const res = await fetch(`/api/admin/persistent-carts/${encodeURIComponent(cartId)}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': adminPin }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Persistent cart removed from MySQL');
        fetchPersistentCarts();
      } else {
        showToast(`Failed to delete: ${data.error}`);
      }
    } catch (e) {
      showToast('Failed to delete persistent cart');
    }
  };

  const handlePurgeExpiredCarts = async () => {
    if (!confirm(`Purge all inactive carts older than ${settingsForm.cartRetentionDays || 30} days?`)) return;
    setIsPurgingCarts(true);
    try {
      const res = await fetch('/api/admin/persistent-carts/cleanup', {
        method: 'POST',
        headers: { 'x-admin-pin': adminPin }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Cleanup completed. Purged ${data.deletedCount} expired carts.`);
        fetchPersistentCarts();
      } else {
        showToast(`Cleanup error: ${data.error}`);
      }
    } catch (e) {
      showToast('Cleanup failed');
    } finally {
      setIsPurgingCarts(false);
    }
  };

  const handleSavePersistentCartSettings = async (enabled: boolean, retentionDays: number) => {
    try {
      const res = await fetch('/api/admin/settings/persistent-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({
          enablePersistentCart: enabled,
          cartRetentionDays: retentionDays
        })
      });
      const data = await res.json();
      if (data.success) {
        setSettingsForm(prev => ({
          ...prev,
          enablePersistentCart: enabled,
          cartRetentionDays: retentionDays
        }));
        showToast('Persistent cart settings saved to MySQL database');
        refreshStoreSettings();
      } else {
        showToast(`Save error: ${data.error}`);
      }
    } catch (e) {
      showToast('Failed to save persistent cart settings');
    }
  };

  const handleSaveCloudSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingCloud(true);
    try {
      const res = await fetch('/api/admin/settings/cloud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({
          cloudApiEndpoint: cloudApiEndpoint.trim(),
          cloudApiKey: cloudApiKey.trim(),
          cloudWorkspaceId: cloudWorkspaceId.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Personal Cloud credentials saved directly to MySQL database!');
        refreshStoreSettings();
      } else {
        showToast(`Failed to save cloud credentials: ${data.error}`);
      }
    } catch (err) {
      showToast('Error saving personal cloud credentials');
    } finally {
      setIsSavingCloud(false);
    }
  };

  const handleUploadFileToCloud = async (file: File, onUploaded?: (directLink: string) => void) => {
    setIsUploadingToCloud(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workspace_id', cloudWorkspaceId);
      formData.append('caption', `Uploaded via CORNUS Atelier Admin (${file.name})`);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'x-admin-pin': adminPin
        },
        body: formData
      });
      const data = await res.json();
      if (data.success && (data.direct_link || data.file_url)) {
        const link = data.direct_link || data.file_url;
        setLastUploadedDirectLink(link);
        if (onUploaded) onUploaded(link);
        showToast(`File "${file.name}" uploaded to personal cloud! Direct link stored in MySQL.`);
        // Refresh uploads list
        const uplRes = await fetch('/api/admin/uploads', { headers: { 'x-admin-pin': adminPin } });
        const uplData = await uplRes.json();
        if (uplData.success && Array.isArray(uplData.uploads)) {
          setCloudUploadsList(uplData.uploads);
        }
      } else {
        showToast(`Cloud upload failed: ${data.error || 'Server error'}`);
      }
    } catch (err: any) {
      showToast(`Upload error: ${err.message}`);
    } finally {
      setIsUploadingToCloud(false);
    }
  };

  const handleTestCloudConnection = async (saveCurrentCredentials = false) => {
    setIsTestingCloud(true);
    setShowRawResponse(false);
    try {
      const res = await fetch('/api/admin/cloud/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({
          endpoint: cloudApiEndpoint.trim(),
          apiKey: cloudApiKey.trim(),
          workspaceId: cloudWorkspaceId.trim(),
          saveToDb: saveCurrentCredentials
        })
      });
      const result = await res.json();
      result.timestamp = new Date().toLocaleTimeString();
      setCloudTestResult(result);

      if (result.success && result.directLink) {
        setLastUploadedDirectLink(result.directLink);
        showToast(`Cloud connection verified! Latency: ${result.latencyMs}ms. Direct link stored in MySQL.`);
        // Refresh uploads list to show newly recorded probe upload
        const uplRes = await fetch('/api/admin/uploads', { headers: { 'x-admin-pin': adminPin } });
        const uplData = await uplRes.json();
        if (uplData.success && Array.isArray(uplData.uploads)) {
          setCloudUploadsList(uplData.uploads);
        }
      } else {
        showToast(`Cloud probe finished (HTTP ${result.statusCode}): ${result.error || 'Review response below'}`);
      }
    } catch (err: any) {
      setCloudTestResult({
        success: false,
        statusCode: 0,
        statusText: 'Client Request Error',
        error: err.message,
        timestamp: new Date().toLocaleTimeString()
      });
      showToast(`Test execution failed: ${err.message}`);
    } finally {
      setIsTestingCloud(false);
    }
  };

  const handleDeleteUpload = async (id: string) => {
    if (!window.confirm('Remove this upload record from MySQL?')) return;
    try {
      const res = await fetch(`/api/admin/uploads/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': adminPin }
      });
      const data = await res.json();
      if (data.success) {
        setCloudUploadsList((prev) => prev.filter((u) => u.id !== id));
        showToast('Upload record removed from MySQL.');
      } else {
        showToast(`Error: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`);
    }
  };

  const handleSaveRazorpaySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingRzp(true);
    try {
      const res = await fetch('/api/admin/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({
          enabled: razorpayEnabled,
          keyId: razorpayKeyId.trim(),
          keySecret: razorpayKeySecret.trim(),
          currency: razorpayCurrency,
          mode: razorpayMode
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Razorpay Gateway Credentials saved securely in database!');
      } else {
        showToast(`Failed to save payment settings: ${data.error}`);
      }
    } catch (err) {
      showToast('Error saving Razorpay settings');
    } finally {
      setIsSavingRzp(false);
    }
  };

  // --- STORE SETTINGS ACTIONS ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify(settingsForm)
      });
      const data = await res.json();
      if (data.success) {
        await refreshStoreSettings();
        showToast('Storefront & SMTP Settings saved!');
      } else {
        showToast(`Failed to save: ${data.error}`);
      }
    } catch (err: any) {
      showToast('Error saving settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!testEmailAddress) {
      showToast('Please enter a test email address.');
      return;
    }
    setIsTestingSmtp(true);
    try {
      const res = await fetch('/api/admin/settings/test-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({ testEmail: testEmailAddress })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'SMTP Handshake Test Succeeded!');
      } else {
        showToast(`SMTP Error: ${data.error}`);
      }
    } catch (err) {
      showToast('Failed to execute SMTP test.');
    } finally {
      setIsTestingSmtp(false);
    }
  };

  // --- CATEGORY ACTIONS ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    const payload = {
      name: catName,
      slug: catSlug || catName.toLowerCase().replace(/\s+/g, '-'),
      subtitle: catSubtitle,
      description: catDesc,
      image: catImage || 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
      displayOrder: catOrder,
      parentId: catParentId
    };

    try {
      const isEdit = !!editingCategory;
      const url = isEdit ? `/api/admin/categories/${editingCategory.id}` : '/api/admin/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? 'Category updated' : 'Category created successfully');
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        setCatName('');
        setCatSlug('');
        setCatSubtitle('');
        setCatDesc('');
        setCatImage('');
        setCatParentId(null);
        fetchAdminData(adminPin);
      }
    } catch (err) {
      showToast('Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': adminPin }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Category removed');
        fetchAdminData(adminPin);
      }
    } catch (err) {
      showToast('Failed to delete category');
    }
  };

  // --- MENU ACTIONS ---
  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuTitle) {
      showToast('Menu title is required.');
      return;
    }

    const payload = {
      id: editingMenu?.id || null,
      title: menuTitle,
      link: menuLink || `category/${menuTitle.toLowerCase()}`,
      displayOrder: Number(menuDisplayOrder),
      assignedCategories: menuAssignedCategories
    };

    try {
      const res = await fetch('/api/admin/menus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingMenu ? 'Navigation menu updated' : 'Navigation menu created successfully');
        setIsMenuModalOpen(false);
        setEditingMenu(null);
        setMenuTitle('');
        setMenuLink('');
        setMenuDisplayOrder(1);
        setMenuAssignedCategories([]);
        refreshMenus();
      } else {
        showToast(`Failed to save menu: ${data.error}`);
      }
    } catch (err) {
      showToast('Error saving menu');
    }
  };

  const handleDeleteMenu = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`/api/admin/menus/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': adminPin }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Menu item removed');
        refreshMenus();
      }
    } catch (err) {
      showToast('Failed to delete menu');
    }
  };

  // --- CUSTOMER CRM ACTIONS ---
  const handleToggleCustomerStatus = async (customer: Customer) => {
    const nextStatus = customer.status === 'Active' ? 'Suspended' : 'Active';
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Customer account marked as ${nextStatus}`);
        fetchAdminData(adminPin);
      }
    } catch (err) {
      showToast('Failed to update status');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Delete this customer account completely?')) return;
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': adminPin }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Customer record deleted');
        fetchAdminData(adminPin);
      }
    } catch (err) {
      showToast('Failed to delete customer');
    }
  };

  // --- ORDER STATUS ACTIONS ---
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin 
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order #${orderId} status changed to ${newStatus}`);
        fetchAdminData(adminPin);
      }
    } catch (err) {
      showToast('Failed to update order status');
    }
  };

  // --- REFUND PROCESSOR ---
  const handleProcessRefund = async () => {
    if (!refundingOrder) return;
    try {
      const res = await fetch(`/api/admin/orders/${refundingOrder.id}/refund`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin 
        },
        body: JSON.stringify({ amount: refundAmount, reason: refundReason })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Refund of ${storeSettings.currencySymbol}${refundAmount.toLocaleString('en-IN')} processed for Order #${refundingOrder.id}`);
        setRefundingOrder(null);
        fetchAdminData(adminPin);
      }
    } catch (err) {
      showToast('Failed to process refund');
    }
  };

  // --- PRINT PDF INVOICE ---
  const handlePrintInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br/>
          <span style="font-size: 11px; color: #666;">Size: ${item.size} | Color: ${item.color}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${storeSettings.currencySymbol}${item.price.toLocaleString('en-IN')}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${storeSettings.currencySymbol}${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${order.id} - ${storeSettings.storeName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111; margin: 0; padding: 40px; font-size: 13px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 20px; margin-bottom: 30px; }
            .brand { font-size: 24px; font-weight: 800; tracking: 0.1em; letter-spacing: 2px; }
            .meta { text-align: right; font-size: 12px; color: #555; }
            .section { margin-bottom: 30px; display: flex; justify-content: space-between; }
            .box { width: 48%; }
            .box-title { font-weight: bold; text-transform: uppercase; font-size: 11px; color: #888; letter-spacing: 1px; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 10px 12px; background: #f8f8f8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; }
            .totals { width: 300px; margin-left: auto; text-align: right; line-height: 1.8; }
            .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
            .total-final { font-size: 16px; font-weight: bold; border-top: 2px solid #111; padding-top: 8px; margin-top: 8px; }
            .footer { margin-top: 60px; font-size: 11px; text-align: center; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">${storeSettings.storeName}</div>
              <div style="font-size: 11px; color: #666; margin-top: 4px;">Atelier Invoice & Order Confirmation</div>
            </div>
            <div class="meta">
              <strong>INVOICE #${order.id}</strong><br/>
              Date: ${order.date}<br/>
              Status: <strong>${order.status.toUpperCase()}</strong>
            </div>
          </div>

          <div class="section">
            <div class="box">
              <div class="box-title">Billed & Shipped To</div>
              <strong>${order.shippingAddress.fullName}</strong><br/>
              ${order.shippingAddress.street}<br/>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br/>
              ${order.shippingAddress.country}<br/>
              Email: ${order.shippingAddress.email}<br/>
              Phone: ${order.shippingAddress.phone}
            </div>
            <div class="box" style="text-align: right;">
              <div class="box-title">Fulfilled By</div>
              <strong>${storeSettings.storeName} Atelier</strong><br/>
              ${storeSettings.physicalAddress}<br/>
              Contact: ${storeSettings.supportEmail}<br/>
              Phone: ${storeSettings.supportPhone}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>$${order.subtotal.toLocaleString()}</span>
            </div>
            ${order.discount > 0 ? `
            <div class="totals-row" style="color: #c00;">
              <span>Discount (${order.discountCode || 'Promo'}):</span>
              <span>-$${order.discount.toLocaleString()}</span>
            </div>` : ''}
            <div class="totals-row">
              <span>Courier Delivery:</span>
              <span>$${order.shipping.toLocaleString()}</span>
            </div>
            <div class="totals-row total-final">
              <span>Total Paid:</span>
              <span>$${order.total.toLocaleString()}</span>
            </div>
          </div>

          <div class="footer">
            Thank you for shopping with ${storeSettings.storeName}. All garments crafted in limited atelier runs.<br/>
            For customer support or return inquiries, contact ${storeSettings.supportEmail}.
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const navigateAdminTab = (tab: AdminTabType, param?: string, push = true) => {
    setActiveTab(tab);
    let slug = '/admin/analytics';
    switch (tab) {
      case 'analytics': slug = '/admin/analytics'; break;
      case 'orders': slug = '/admin/orders'; break;
      case 'catalog': slug = '/admin/products'; break;
      case 'product-new': slug = '/admin/products/new'; break;
      case 'product-edit': slug = `/admin/products/edit/${param || editingProduct?.id || ''}`; break;
      case 'categories': slug = '/admin/categories'; break;
      case 'tags': slug = '/admin/tags'; break;
      case 'inquiries': slug = '/admin/inquiries'; break;
      case 'reviews': slug = '/admin/reviews'; break;
      case 'inventory': slug = '/admin/inventory'; break;
      case 'audit-logs': slug = '/admin/audit-logs'; break;
      case 'customers': slug = '/admin/customers'; break;
      case 'persistent-carts': slug = '/admin/persistent-carts'; break;
      case 'discounts': slug = '/admin/discounts'; break;
      case 'menus': slug = '/admin/menus'; break;
      case 'settings': slug = '/admin/settings'; break;
      case 'staff': slug = '/admin/staff'; break;
      default: slug = '/admin/analytics';
    }
    if (push && typeof window !== 'undefined' && window.location.pathname !== slug) {
      window.history.pushState({ tab, param }, '', slug);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- PRINT THERMAL 4X6 PACKING SLIP & COURIER SHIPPING LABEL ---
  const handlePrintPackingSlip = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=650,height=800');
    if (!printWindow) return;

    const itemsHtml = order.items.map(item => `
      <tr style="border-bottom: 1px dashed #000;">
        <td style="padding: 6px 0;"><strong>${item.name}</strong><br/><span style="font-size: 10px;">Size: ${item.size} | Color: ${item.color}</span></td>
        <td style="padding: 6px 0; text-align: center; font-weight: bold;">${item.quantity}</td>
        <td style="padding: 6px 0; text-align: right; font-family: monospace;">${storeSettings.currencySymbol}${item.price.toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Packing Slip #${order.id}</title>
          <style>
            @page { size: 4in 6in; margin: 8mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 11px; line-height: 1.3; color: #000; margin: 0; padding: 10px; }
            .badge { display: inline-block; border: 1.5px solid #000; padding: 2px 6px; font-weight: 900; font-size: 10px; text-transform: uppercase; }
            .barcode { font-family: monospace; letter-spacing: 4px; font-size: 18px; font-weight: 900; text-align: center; padding: 8px 0; border: 1px solid #000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11px; }
            th { text-align: left; border-bottom: 1.5px solid #000; padding-bottom: 4px; font-size: 10px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 6px;">
            <div>
              <div style="font-size: 16px; font-weight: 900; letter-spacing: 1px;">${storeSettings.storeName} ATELIER</div>
              <div style="font-size: 9px;">PREMIUM FULFILLMENT PACKING SLIP</div>
            </div>
            <div class="badge">PRIORITY EXPEDITED</div>
          </div>

          <div class="barcode">|||| ||||| |||| |||||| ||||</div>
          <div style="text-align: center; font-family: monospace; font-size: 9px; margin-top: -6px; margin-bottom: 8px;">ORDER REF: #${order.id} | TRK: ${order.trackingNumber || 'EXP-AUTO'}</div>

          <div style="border: 1px solid #000; padding: 6px; margin-bottom: 8px;">
            <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: #444;">DELIVER TO:</div>
            <div style="font-size: 13px; font-weight: 900;">${order.shippingAddress.fullName}</div>
            <div>${order.shippingAddress.street}</div>
            <div>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}</div>
            <div>${order.shippingAddress.country} | Ph: ${order.shippingAddress.phone}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Garment Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Val</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="border-top: 1.5px solid #000; margin-top: 8px; padding-top: 4px; display: flex; justify-content: space-between; font-weight: bold;">
            <span>TOTAL ITEMS: ${order.items.reduce((s, it) => s + it.quantity, 0)}</span>
            <span>TOTAL: ${storeSettings.currencySymbol}${order.total.toLocaleString('en-IN')}</span>
          </div>

          <div style="margin-top: 14px; border-top: 1px dashed #000; padding-top: 6px; font-size: 8px; text-align: center; color: #555;">
            Verified by CORNUS Atelier QC Team. Handcrafted in limited batch runs.<br/>
            For returns or concierge resizing assistance: ${storeSettings.supportEmail}
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // --- CSV / EXCEL STREAMING EXPORT HANDLER ---
  const handleExportCSV = (resource: 'products' | 'orders' | 'customers') => {
    try {
      showToast(`Generating ${resource} CSV export from MySQL...`);
      window.location.href = `/api/admin/export/${resource}?t=${Date.now()}`;
    } catch (e) {
      showToast('Export generation failed.');
    }
  };

  // --- ORDER FULFILLMENT HANDLER ---
  const handleSaveFulfillment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fulfillmentOrderModal) return;
    setIsSavingFulfillment(true);
    try {
      const res = await fetch(`/api/admin/orders/${fulfillmentOrderModal.id}/fulfillment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({
          carrier: fulfillmentCarrier,
          trackingNumber: fulfillmentTrackingNumber || `CRN-${Date.now().toString().slice(-8)}`,
          status: fulfillmentStatus,
          estimatedDelivery: fulfillmentEstimatedDelivery
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order #${fulfillmentOrderModal.id} marked as ${fulfillmentStatus} via ${fulfillmentCarrier}!`);
        setFulfillmentOrderModal(null);
        fetchAdminData(adminPin);
      } else {
        showToast(`Fulfillment error: ${data.error}`);
      }
    } catch (e) {
      showToast('Failed to update fulfillment');
    } finally {
      setIsSavingFulfillment(false);
    }
  };

  // --- INQUIRY REPLY HANDLER ---
  const handleSaveInquiryReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyModalInquiry || !inquiryReplyText.trim()) return;
    setIsSendingInquiryReply(true);
    try {
      const res = await fetch(`/api/admin/inquiries/${replyModalInquiry.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({
          replyMessage: inquiryReplyText.trim(),
          recipientEmail: replyModalInquiry.email,
          recipientName: replyModalInquiry.name,
          subject: replyModalInquiry.subject
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Concierge reply transmitted to ${replyModalInquiry.email}! Ticket resolved.`);
        setReplyModalInquiry(null);
        setInquiryReplyText('');
        fetchAdminData(adminPin);
      } else {
        showToast(`Reply error: ${data.error}`);
      }
    } catch (e) {
      showToast('Failed to send reply');
    } finally {
      setIsSendingInquiryReply(false);
    }
  };

  // --- REVIEW MODERATION & REPLY HANDLER ---
  const handleUpdateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected' | 'pending') => {
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Review #${reviewId} marked as ${status}`);
        fetchAdminData(adminPin);
      }
    } catch (e) {
      showToast('Failed to update review status');
    }
  };

  const handleSaveReviewReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyReviewModal || !reviewReplyText.trim()) return;
    setIsSavingReviewReply(true);
    try {
      const res = await fetch(`/api/admin/reviews/${replyReviewModal.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({ adminReply: reviewReplyText.trim() })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Atelier response published beneath review!');
        setReplyReviewModal(null);
        setReviewReplyText('');
        fetchAdminData(adminPin);
      }
    } catch (e) {
      showToast('Failed to save review reply');
    } finally {
      setIsSavingReviewReply(false);
    }
  };

  // --- INVENTORY ADJUSTMENT HANDLER ---
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustStockProduct) return;
    setIsAdjustingStock(true);
    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({
          productId: adjustStockProduct.id,
          changeQty: Number(adjustStockChange),
          reason: adjustStockReason
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Stock updated for ${adjustStockProduct.name}: New total ${data.newStock} units.`);
        setAdjustStockProduct(null);
        await refreshProducts();
        fetchAdminData(adminPin);
      } else {
        showToast(`Adjustment error: ${data.error}`);
      }
    } catch (e) {
      showToast('Failed to adjust stock');
    } finally {
      setIsAdjustingStock(false);
    }
  };

  const openNewProductModal = (push = true) => {
    setEditingProduct(null);
    setProductModalTab('general');
    setFormErrors({});
    setFormTouched({});
    setProdName('');
    setProdSubtitle('');
    setProdCategory(categoriesList[0]?.name || 'Outerwear');
    setProdGender('Men');
    setProdSubcategory('Essentials');
    setProdCollection('Essential Collection');
    setProdPrice(4990);
    setProdOriginalPrice('');
    setProdStock(15);
    setProdSku(`CRN-${Date.now().toString().slice(-6)}`);
    setProdDesc('');
    setProdMaterials('100% Fine Italian Fabric');
    setProdCare('Dry clean only by luxury specialist');
    setProdDetails('Hand-finished Italian seams\nArchitectural tailored cut\nSignature Cornus silk-blend lining');
    setProdColorsList([
      { name: 'Obsidian Black', hex: '#111111', imageIndex: 0 },
      { name: 'Warm Camel', hex: '#C19A6B', imageIndex: 1 }
    ]);
    setProdSizesList(['S', 'M', 'L', 'XL']);
    setProdHasVariants(false);
    setProdVariantsMatrix([]);
    setProdImages('https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85');
    setProdSecondaryImage('');
    setProdExtraImages([]);
    setProdIsNew(true);
    setProdIsTrending(false);
    setProdIsBestSeller(false);
    setProdIsPreOrder(false);
    setProdPreOrderReleaseDate('');
    setProdPreOrderLimit(50);
    setProdPreOrderCount(0);
    setProdPreOrderMessage('');
    setProdCompleteLookIds([]);
    setProdCompleteLookNote('');
    setProdCompleteLookDiscount(15);
    setCompleteLookSearch('');
    setProdMetaTitle('');
    setProdMetaDesc('');
    setProdKeywords('');
    setIsAddingProduct(true);
    navigateAdminTab('product-new', undefined, push);
  };

  const openEditProductModal = (p: Product, push = true) => {
    setEditingProduct(p);
    setProductModalTab('general');
    setFormErrors({});
    setFormTouched({});
    setProdName(p.name);
    setProdSubtitle(p.subtitle || '');
    setProdCategory(p.category);
    setProdGender(p.gender);
    setProdSubcategory(p.subcategory || 'Essentials');
    setProdCollection(p.collection || 'Essential Collection');
    setProdPrice(p.price);
    setProdOriginalPrice(p.originalPrice !== undefined && p.originalPrice !== null ? p.originalPrice : '');
    setProdStock(p.stockCount ?? 10);
    setProdSku(p.sku);
    setProdDesc(p.description || '');
    setProdMaterials(p.materials || '');
    setProdCare(Array.isArray(p.care) ? p.care.join('\n') : (p.care || ''));
    setProdDetails(Array.isArray(p.details) ? p.details.join('\n') : '');
    
    // Normalize colors
    const colors = Array.isArray(p.colors) && p.colors.length > 0 
      ? p.colors 
      : [{ name: 'Obsidian Black', hex: '#111111', imageIndex: 0 }];
    setProdColorsList(colors);

    // Normalize sizes
    const sizes = Array.isArray(p.sizes) && p.sizes.length > 0
      ? p.sizes
      : ['S', 'M', 'L', 'XL'];
    setProdSizesList(sizes);

    const hasVars = !!(p.hasVariants || (Array.isArray(p.variants) && p.variants.length > 0));
    setProdHasVariants(hasVars);
    setProdVariantsMatrix(Array.isArray(p.variants) ? p.variants : []);

    setProdImages(p.images[0] || '');
    setProdSecondaryImage(p.images[1] || '');
    setProdExtraImages(p.images.slice(2) || []);
    setProdIsNew(!!p.isNew);
    setProdIsTrending(!!p.isTrending);
    setProdIsBestSeller(!!p.isBestSeller);
    setProdIsPreOrder(!!p.isPreOrder);
    setProdPreOrderReleaseDate(p.preOrderReleaseDate || '');
    setProdPreOrderLimit(p.preOrderLimit ?? 50);
    setProdPreOrderCount(p.preOrderCount ?? 0);
    setProdPreOrderMessage(p.preOrderMessage || '');
    setProdCompleteLookIds(Array.isArray(p.completeLookIds) ? p.completeLookIds : []);
    setProdCompleteLookNote(p.completeLookNote || '');
    setProdCompleteLookDiscount(p.completeLookDiscount ?? 15);
    setCompleteLookSearch('');
    setProdMetaTitle(p.metaTitle || p.name);
    setProdMetaDesc(p.metaDescription || p.description || '');
    setProdKeywords(p.keywords || `${p.name}, ${p.category}, Atelier fashion`);
    setIsAddingProduct(true);
    navigateAdminTab('product-edit', p.id, push);
  };

  useEffect(() => {
    const handlePopState = () => {
      const route = getAdminRouteFromPath(window.location.pathname);
      setActiveTab(route.tab);
      if (route.tab === 'product-new') {
        openNewProductModal(false);
      } else if (route.tab === 'product-edit' && route.param) {
        const prod = products.find(p => p.id === route.param || p.slug === route.param);
        if (prod) openEditProductModal(prod, false);
      } else {
        setIsAddingProduct(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products]);

  // Initial load route check for /admin/products/new or /admin/products/edit/:id
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const route = getAdminRouteFromPath(window.location.pathname);
      if (route.tab === 'product-new') {
        openNewProductModal(false);
      } else if (route.tab === 'product-edit' && route.param && products.length > 0) {
        const prod = products.find(p => p.id === route.param || p.slug === route.param);
        if (prod) openEditProductModal(prod, false);
      }
    }
  }, [products.length]);

  // --- LUXURY PALETTE COLOR PRESETS ---
  const COLOR_PALETTE_PRESETS = [
    { name: 'Obsidian Black', hex: '#111111' },
    { name: 'Warm Camel', hex: '#C19A6B' },
    { name: 'Alabaster Bone', hex: '#F4F1EA' },
    { name: 'Charcoal Slate', hex: '#3E424B' },
    { name: 'Midnight Navy', hex: '#1A2436' },
    { name: 'Forest Green', hex: '#233D2D' },
    { name: 'Burgundy Port', hex: '#4A1521' },
    { name: 'Cognac Leather', hex: '#8B4513' },
    { name: 'Heather Grey', hex: '#9E9E9E' },
    { name: 'Champagne Silk', hex: '#E6D7C3' },
    { name: 'Olive Drab', hex: '#556B2F' },
    { name: 'Pure Chalk', hex: '#FFFFFF' }
  ];

  // Quick Size Preset Curves
  const SIZE_PRESETS = {
    standard: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    trousers: ['28', '30', '32', '34', '36', '38'],
    footwear: ['EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44', 'EU 45'],
    onesize: ['One Size']
  };

  // Field validation engine
  const validateProductForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    // 1. Name validation
    if (!prodName || prodName.trim().length < 3) {
      errors.name = 'Garment name must be at least 3 characters.';
    }

    // 2. Price validation
    if (prodPrice === undefined || prodPrice === null || isNaN(Number(prodPrice)) || Number(prodPrice) <= 0) {
      errors.price = 'Retail price must be a valid number greater than ₹0.';
    }

    // 3. Compare-at / Original price validation
    if (prodOriginalPrice !== '' && prodOriginalPrice !== undefined && prodOriginalPrice !== null) {
      const orig = Number(prodOriginalPrice);
      if (isNaN(orig) || orig <= 0) {
        errors.originalPrice = 'Original / compare-at price must be greater than 0.';
      } else if (orig < Number(prodPrice)) {
        errors.originalPrice = 'Original price should be greater than or equal to sale price.';
      }
    }

    // 4. Category validation
    if (!prodCategory || String(prodCategory).trim() === '') {
      errors.category = 'Please select a catalog category.';
    }

    // 5. Primary Image validation
    if (!prodImages || prodImages.trim().length === 0) {
      errors.primaryImage = 'Primary garment photo is required.';
    } else {
      const img = prodImages.trim();
      if (!img.startsWith('http://') && !img.startsWith('https://') && !img.startsWith('/') && !img.startsWith('data:image/')) {
        errors.primaryImage = 'Primary photo must be a valid URL, cloud upload, or image data path.';
      }
    }

    // 6. Color & Size validation
    if (!prodColorsList || prodColorsList.length === 0) {
      errors.colors = 'Please define at least one color swatch for this garment.';
    }
    if (!prodSizesList || prodSizesList.length === 0) {
      errors.sizes = 'Please add at least one available size.';
    }

    // 7. Base Stock units validation (for simple products)
    if (!prodHasVariants) {
      if (prodStock === undefined || prodStock === null || isNaN(Number(prodStock)) || Number(prodStock) < 0) {
        errors.stock = 'Stock units cannot be negative.';
      }
    }

    // 8. Pre-Order drop validation
    if (prodIsPreOrder) {
      if (!prodPreOrderReleaseDate || prodPreOrderReleaseDate.trim() === '') {
        errors.preOrderReleaseDate = 'Expected dispatch date is required when Pre-Order Drop is enabled.';
      }
      if (prodPreOrderLimit !== undefined && prodPreOrderLimit !== null && Number(prodPreOrderLimit) < 0) {
        errors.preOrderLimit = 'Production allocation cap cannot be negative.';
      }
    }

    // 9. Variable Product / Variants Matrix validation
    if (prodHasVariants) {
      if (!prodVariantsMatrix || prodVariantsMatrix.length === 0) {
        errors.variants = 'Variable Product is enabled. Please generate or add at least one variant combination.';
      } else {
        for (let i = 0; i < prodVariantsMatrix.length; i++) {
          const v = prodVariantsMatrix[i];
          if (!v.color || !v.size) {
            errors.variants = `Variant #${i + 1} is missing a Color or Size attribute.`;
            break;
          }
          if (v.price !== undefined && (isNaN(Number(v.price)) || Number(v.price) <= 0)) {
            errors.variants = `Variant #${i + 1} (${v.color} / ${v.size}) has an invalid price (must be > 0).`;
            break;
          }
          if (isNaN(Number(v.stockCount)) || Number(v.stockCount) < 0) {
            errors.variants = `Variant #${i + 1} (${v.color} / ${v.size}) has invalid stock (cannot be negative).`;
            break;
          }
        }
      }
    }

    return errors;
  };

  // Auto-generate variants Cartesian matrix
  const generateVariantCombinations = (basePrice?: number, baseStock?: number, skuPrefix?: string) => {
    if (prodColorsList.length === 0 || prodSizesList.length === 0) {
      showToast('Please add at least 1 color and 1 size before generating combinations.');
      return;
    }

    const priceVal = basePrice !== undefined && basePrice > 0 ? basePrice : Number(prodPrice) || 4990;
    const stockVal = baseStock !== undefined && baseStock >= 0 ? baseStock : 10;
    const prefix = skuPrefix || prodSku || 'CRN';

    const newMatrix: ProductVariant[] = [];

    prodColorsList.forEach((col, cIdx) => {
      prodSizesList.forEach((sz) => {
        const cleanCol = col.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase() || 'COL';
        const cleanSz = sz.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'SZ';
        const autoSku = `${prefix}-${cleanCol}-${cleanSz}`;

        // Find existing match if updating
        const existing = prodVariantsMatrix.find(v => v.color.toLowerCase() === col.name.toLowerCase() && v.size.toLowerCase() === sz.toLowerCase());
        if (existing) {
          newMatrix.push(existing);
        } else {
          newMatrix.push({
            id: `var_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            size: sz,
            color: col.name,
            sku: autoSku,
            price: priceVal,
            stockCount: stockVal,
            inStock: stockVal > 0,
            image: prodImages || ''
          });
        }
      });
    });

    setProdVariantsMatrix(newMatrix);
    const sumStock = newMatrix.reduce((sum, v) => sum + (Number(v.stockCount) || 0), 0);
    setProdStock(sumStock);
    showToast(`Generated ${newMatrix.length} variants matrix.`);
  };

  // --- PRODUCT CRUD ACTIONS ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setFormTouched({
      name: true,
      price: true,
      originalPrice: true,
      category: true,
      primaryImage: true,
      colors: true,
      sizes: true,
      stock: true,
      preOrderReleaseDate: true,
      variants: true
    });

    const validationErrors = validateProductForm();
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Auto-switch to tab containing error
      if (validationErrors.name || validationErrors.price || validationErrors.originalPrice || validationErrors.category) {
        setProductModalTab('general');
      } else if (validationErrors.primaryImage) {
        setProductModalTab('media');
      } else if (validationErrors.colors || validationErrors.sizes || validationErrors.variants || validationErrors.stock) {
        setProductModalTab('variants');
      } else if (validationErrors.preOrderReleaseDate || validationErrors.preOrderLimit) {
        setProductModalTab('preorder');
      }

      const firstError = Object.values(validationErrors)[0];
      showToast(`Please fix: ${firstError}`);
      return;
    }

    setIsSavingProduct(true);
    const isEdit = !!editingProduct;
    const url = isEdit ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';
    const method = isEdit ? 'PUT' : 'POST';

    const detailsList = prodDetails
      .split('\n')
      .map(d => d.trim().replace(/^[•\-\*]\s*/, ''))
      .filter(Boolean);

    const careList = prodCare
      .split('\n')
      .map(c => c.trim().replace(/^[•\-\*]\s*/, ''))
      .filter(Boolean);

    const imageList = [prodImages, prodSecondaryImage, ...prodExtraImages].map(s => s?.trim()).filter(Boolean);
    if (imageList.length === 0) {
      imageList.push('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80');
    }

    // Synchronize total stock
    let totalStock = Number(prodStock);
    if (prodHasVariants && prodVariantsMatrix.length > 0) {
      totalStock = prodVariantsMatrix.reduce((sum, v) => sum + (Number(v.stockCount) || 0), 0);
    }

    const payload = {
      name: prodName.trim(),
      subtitle: prodSubtitle.trim() || 'Atelier Collection',
      category: prodCategory,
      gender: prodGender,
      subcategory: prodSubcategory.trim() || 'Essentials',
      collection: prodCollection || 'Essential Collection',
      price: Number(prodPrice),
      originalPrice: prodOriginalPrice !== '' ? Number(prodOriginalPrice) : null,
      stockCount: totalStock,
      sku: prodSku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
      description: prodDesc.trim() || `${prodName.trim()} meticulously crafted for discerning clientele.`,
      details: detailsList.length > 0 ? detailsList : ['Hand-finished seams', 'Architectural cut', 'Atelier branded lining'],
      materials: prodMaterials.trim() || '100% Fine Fabric',
      care: careList.length > 0 ? careList : ['Dry clean only by luxury specialist'],
      colors: prodColorsList,
      sizes: prodSizesList,
      hasVariants: prodHasVariants,
      variants: prodHasVariants ? prodVariantsMatrix : [],
      images: imageList,
      isNew: prodIsNew,
      isTrending: prodIsTrending,
      isBestSeller: prodIsBestSeller,
      inStock: prodIsPreOrder ? true : totalStock > 0,
      isPreOrder: prodIsPreOrder,
      preOrderReleaseDate: prodIsPreOrder ? prodPreOrderReleaseDate : '',
      preOrderLimit: prodIsPreOrder ? Number(prodPreOrderLimit) : 0,
      preOrderCount: Number(prodPreOrderCount) || 0,
      preOrderMessage: prodIsPreOrder ? prodPreOrderMessage : '',
      completeLookIds: prodCompleteLookIds,
      completeLookNote: prodCompleteLookNote,
      completeLookDiscount: Number(prodCompleteLookDiscount) || 15,
      metaTitle: prodMetaTitle.trim() || prodName.trim(),
      metaDescription: prodMetaDesc.trim() || prodDesc.trim(),
      keywords: prodKeywords.trim() || `${prodName.trim()}, ${prodCategory}, Atelier`
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin 
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(isEdit ? 'Garment updated in live catalog' : 'New garment published to store');
        setIsAddingProduct(false);
        setEditingProduct(null);
        navigateAdminTab('catalog');
        await refreshProducts();
      } else {
        showToast(`Failed to save product: ${data.error}`);
      }
    } catch (err: any) {
      showToast(`Failed to save product: ${err.message || 'Network error'}`);
    } finally {
      setIsSavingProduct(false);
    }
  };

  // --- CSV / EXCEL IMPORT HANDLERS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (!data || data.length < 2) {
          showToast('Uploaded spreadsheet must contain at least 1 header row and 1 product row.');
          return;
        }

        const headers = data[0].map((h: any) => String(h || '').trim()).filter(Boolean);
        const rows = data.slice(1).map((r) => {
          const rowObj: Record<string, any> = {};
          headers.forEach((h, idx) => {
            rowObj[h] = r[idx] !== undefined ? r[idx] : '';
          });
          return rowObj;
        }).filter(row => Object.values(row).some(v => v !== ''));

        setImportHeaders(headers);
        setImportRawRows(rows);

        // Smart auto-mapping detection
        const autoMap: Record<string, string> = {
          name: '',
          price: '',
          category: '',
          gender: '',
          subcategory: '',
          sku: '',
          stock: '',
          description: '',
          subtitle: '',
          materials: '',
          images: '',
          sizes: '',
          colors: ''
        };

        headers.forEach(h => {
          const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (['name', 'title', 'productname', 'garment', 'itemname'].includes(lower) && !autoMap.name) autoMap.name = h;
          if (['price', 'cost', 'mrp', 'amount', 'rate'].includes(lower) && !autoMap.price) autoMap.price = h;
          if (['category', 'cat', 'collectiontype'].includes(lower) && !autoMap.category) autoMap.category = h;
          if (['gender', 'sex', 'audience'].includes(lower) && !autoMap.gender) autoMap.gender = h;
          if (['subcategory', 'type', 'style'].includes(lower) && !autoMap.subcategory) autoMap.subcategory = h;
          if (['sku', 'code', 'barcode', 'itemcode'].includes(lower) && !autoMap.sku) autoMap.sku = h;
          if (['stock', 'qty', 'quantity', 'inventory', 'stockcount'].includes(lower) && !autoMap.stock) autoMap.stock = h;
          if (['description', 'desc', 'details', 'about'].includes(lower) && !autoMap.description) autoMap.description = h;
          if (['subtitle', 'tagline', 'shortdesc'].includes(lower) && !autoMap.subtitle) autoMap.subtitle = h;
          if (['materials', 'fabric', 'material', 'composition'].includes(lower) && !autoMap.materials) autoMap.materials = h;
          if (['images', 'image', 'photo', 'picture', 'imageurl', 'img'].includes(lower) && !autoMap.images) autoMap.images = h;
          if (['sizes', 'size', 'sizing'].includes(lower) && !autoMap.sizes) autoMap.sizes = h;
          if (['colors', 'color', 'shade'].includes(lower) && !autoMap.colors) autoMap.colors = h;
        });

        setFieldMappings(autoMap);
        showToast(`Loaded ${rows.length} rows from ${file.name}`);
      } catch (err: any) {
        console.error('File parsing error:', err);
        showToast('Failed to parse file. Please upload a valid CSV or Excel file.');
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = [
      'Name,Subtitle,Category,Gender,Subcategory,Price,Stock,SKU,Description,Materials,Images,Sizes,Colors',
      'Milano Double-Breasted Blazer,Italian virgin wool tailoring,Outerwear,Men,Jackets,495,12,CRN-M-BLZ-01,"A structured statement jacket engineered with an architectural shoulder and horn buttons.","100% Italian Virgin Wool","https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85","S, M, L, XL","Charcoal Black, Navy"',
      'Silk Pleated Maxi Gown,Sculpted evening silhouette,Evening Wear,Women,Dresses,620,8,CRN-W-DRS-01,"Pure mulberry silk maxi dress featuring delicate hand-pleated drape.","100% Mulberry Silk","https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85","XS, S, M, L","Bone White, Noir"',
      'Tuscan Leather Cardholder,Vegetable tanned box leather,Leather Goods,Unisex,Small Leather Goods,180,25,CRN-U-ACC-01,"Hand-finished edges with minimal embossed branding.","100% Tuscan Calfskin","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85","One Size","Black, Saddle Tan"'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'cornus_products_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded sample CSV template');
  };

  const handleExecuteImport = async () => {
    if (!fieldMappings.name || !fieldMappings.price) {
      showToast('Please map at least the Name and Price columns before proceeding.');
      return;
    }

    if (importRawRows.length === 0) {
      showToast('No product records detected to import.');
      return;
    }

    setIsExecutingImport(true);

    try {
      const mappedProducts = importRawRows.map((row, idx) => {
        const name = String(row[fieldMappings.name] || '').trim();
        const price = parseFloat(String(row[fieldMappings.price] || '0').replace(/[^0-9.]/g, '')) || 0;
        const category = fieldMappings.category && row[fieldMappings.category] ? String(row[fieldMappings.category]).trim() : 'Outerwear';
        const gender = fieldMappings.gender && row[fieldMappings.gender] ? String(row[fieldMappings.gender]).trim() : 'Unisex';
        const subcategory = fieldMappings.subcategory && row[fieldMappings.subcategory] ? String(row[fieldMappings.subcategory]).trim() : 'Essentials';
        const sku = fieldMappings.sku && row[fieldMappings.sku] ? String(row[fieldMappings.sku]).trim() : `SKU-IMP-${Date.now().toString().slice(-4)}-${idx + 1}`;
        const stock = fieldMappings.stock && row[fieldMappings.stock] ? parseInt(String(row[fieldMappings.stock]).replace(/[^0-9]/g, ''), 10) || 10 : 10;
        const description = fieldMappings.description && row[fieldMappings.description] ? String(row[fieldMappings.description]).trim() : '';
        const subtitle = fieldMappings.subtitle && row[fieldMappings.subtitle] ? String(row[fieldMappings.subtitle]).trim() : 'Atelier Collection';
        const materials = fieldMappings.materials && row[fieldMappings.materials] ? String(row[fieldMappings.materials]).trim() : '100% Fine Fabric';
        const imagesRaw = fieldMappings.images && row[fieldMappings.images] ? String(row[fieldMappings.images]).trim() : '';
        const sizesRaw = fieldMappings.sizes && row[fieldMappings.sizes] ? String(row[fieldMappings.sizes]).trim() : 'S, M, L, XL';
        const colorsRaw = fieldMappings.colors && row[fieldMappings.colors] ? String(row[fieldMappings.colors]).trim() : 'Black';

        return {
          name,
          price,
          category,
          gender,
          subcategory,
          sku,
          stockCount: stock,
          description,
          subtitle,
          materials,
          images: imagesRaw ? imagesRaw.split(',').map(s => s.trim()) : ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'],
          sizes: sizesRaw.split(',').map(s => s.trim()).filter(Boolean),
          colors: colorsRaw.split(',').map((c, cIdx) => ({ name: c.trim(), hex: '#000000', imageIndex: 0 }))
        };
      }).filter(p => p.name);

      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({ products: mappedProducts })
      });

      const data = await res.json();
      if (data.success) {
        setImportResult({
          imported: data.importedCount,
          updated: data.updatedCount,
          categoriesCreated: data.categoriesCreated || []
        });

        const catMsg = data.categoriesCreated && data.categoriesCreated.length > 0 
          ? ` (${data.categoriesCreated.length} new categories created: ${data.categoriesCreated.join(', ')})`
          : '';
        showToast(`Successfully imported ${data.importedCount} products into MySQL!${catMsg}`);
        
        await refreshProducts();
        await fetchAdminData(adminPin);
      } else {
        showToast(`Import failed: ${data.error}`);
      }
    } catch (err: any) {
      showToast('Error executing product import.');
    } finally {
      setIsExecutingImport(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this garment from the catalog?')) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': adminPin }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Garment deleted');
        refreshProducts();
      }
    } catch (err) {
      showToast('Failed to delete garment');
    }
  };

  const handleBatchDeleteProducts = async () => {
    if (selectedProductIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedProductIds.length} selected garments?`)) return;

    try {
      const res = await fetch('/api/admin/products/batch-delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin 
        },
        body: JSON.stringify({ ids: selectedProductIds })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${selectedProductIds.length} garments deleted`);
        setSelectedProductIds([]);
        refreshProducts();
      }
    } catch (err) {
      showToast('Batch delete failed');
    }
  };

  const handleBatchUpdateProducts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.length === 0) {
      showToast('Please select at least one garment first.');
      return;
    }
    setIsBulkUpdating(true);

    try {
      const payload: Record<string, any> = { ids: selectedProductIds };
      if (bulkCategory) payload.category = bulkCategory;
      if (bulkPrice) payload.price = Number(bulkPrice);
      if (bulkStockCount) payload.stockCount = Number(bulkStockCount);
      if (bulkInStock !== '') payload.inStock = bulkInStock === 'true';
      if (bulkGender) payload.gender = bulkGender;
      if (bulkSubcategory) payload.subcategory = bulkSubcategory;

      const res = await fetch('/api/admin/products/batch-update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin 
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Successfully bulk updated ${selectedProductIds.length} garments!`);
        setSelectedProductIds([]);
        setShowBulkPanel(false);
        setBulkCategory('');
        setBulkPrice('');
        setBulkStockCount('');
        setBulkInStock('');
        setBulkGender('');
        setBulkSubcategory('');
        refreshProducts();
      } else {
        showToast(`Bulk update failed: ${data.error}`);
      }
    } catch (err) {
      showToast('Bulk update failed');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // --- DISCOUNT CRUD ACTIONS ---
  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discCode.trim() || !discValue) {
      showToast('Please provide a coupon code and discount value.');
      return;
    }
    setIsSavingDiscount(true);
    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin 
        },
        body: JSON.stringify({
          code: discCode.trim().toUpperCase(),
          type: discType,
          value: Number(discValue),
          minSpend: Number(discMinSpend) || 0,
          maxUses: Number(discMaxUses) || 500,
          expiresAt: discExpiresAt || '2026-12-31',
          active: true
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Promo coupon ${discCode.trim().toUpperCase()} saved to database!`);
        setIsAddingDiscount(false);
        setDiscCode('');
        setDiscValue(15);
        setDiscMinSpend(2000);
        setDiscMaxUses(500);
        setDiscExpiresAt('2026-12-31');
        fetchAdminData(adminPin);
      } else {
        showToast(data.error || 'Failed to create discount coupon.');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create discount');
    } finally {
      setIsSavingDiscount(false);
    }
  };

  const handleToggleDiscountStatus = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/discounts/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin
        },
        body: JSON.stringify({ active: !currentActive })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Coupon status set to ${!currentActive ? 'Active' : 'Paused'}`);
        fetchAdminData(adminPin);
      } else {
        showToast('Failed to update status');
      }
    } catch {
      showToast('Failed to update coupon status');
    }
  };

  const handleDeleteDiscount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon code permanently?')) return;
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-pin': adminPin }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Promo coupon deleted from database');
        fetchAdminData(adminPin);
      } else {
        showToast(data.error || 'Failed to delete discount');
      }
    } catch (err) {
      showToast('Failed to delete discount');
    }
  };

  // --- STAFF MEMBER ACTIONS ---
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin 
        },
        body: JSON.stringify({
          name: staffName,
          email: staffEmail,
          role: staffRole,
          pin: staffPin
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Staff member ${staffName} added!`);
        setIsAddingStaff(false);
        setStaffName('');
        setStaffEmail('');
        setStaffPin('');
        fetchAdminData(adminPin);
      }
    } catch (err) {
      showToast('Failed to add staff member');
    }
  };

  // --- LOGIN LOCK SCREEN (LIGHT THEME) ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-100 text-zinc-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-zinc-900 via-amber-500 to-zinc-900"></div>

          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">{storeSettings.storeName} Admin Suite</h1>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-mono font-semibold">Store Management Console</p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Security PIN Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  placeholder="Enter 4-digit PIN (e.g. 0000)"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-2xl px-4 py-3.5 text-center text-lg tracking-widest text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all font-mono"
                  maxLength={10}
                  autoFocus
                />
                <Key className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-black text-white font-bold py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg active:scale-[0.99]"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Admin Console</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-500 font-mono">
              Demo Super Admin PIN: <code className="text-zinc-900 font-bold bg-zinc-100 px-2 py-1 rounded border border-zinc-200">0000</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filtered lists
  const filteredOrders = adminOrders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.shippingAddress.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.shippingAddress.email.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
    const hasPreOrder = o.items.some((it: any) => it.isPreOrder);
    const matchesPreOrder = orderPreOrderFilter === 'All' ||
                            (orderPreOrderFilter === 'PreOrderOnly' && hasPreOrder) ||
                            (orderPreOrderFilter === 'StandardOnly' && !hasPreOrder);
    return matchesSearch && matchesStatus && matchesPreOrder;
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(productSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (productTypeFilter === 'InStock') return !p.isPreOrder && (p.stockCount ?? 10) > 0;
    if (productTypeFilter === 'PreOrder') return !!p.isPreOrder;
    if (productTypeFilter === 'OutOfStock') return !p.isPreOrder && (p.stockCount ?? 10) <= 0;
    if (productTypeFilter === 'CompleteLook') return Array.isArray(p.completeLookIds) && p.completeLookIds.length > 0;
    return true;
  });

  const filteredCustomers = customersList.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.email.toLowerCase().includes(customerSearch.toLowerCase());
    const matchesStatus = customerFilterStatus === 'All' || c.status === customerFilterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredPersistentCarts = persistentCartsList.filter((cart) => {
    const searchLower = persistentCartSearch.toLowerCase();
    const matchesSearch = !persistentCartSearch ||
      (cart.userEmail && cart.userEmail.toLowerCase().includes(searchLower)) ||
      (cart.userName && cart.userName.toLowerCase().includes(searchLower)) ||
      cart.sessionId.toLowerCase().includes(searchLower) ||
      cart.items.some(it => it.product?.name?.toLowerCase().includes(searchLower));
    
    if (!matchesSearch) return false;
    if (persistentCartFilter === 'Active') return !cart.isAbandoned;
    if (persistentCartFilter === 'Abandoned') return cart.isAbandoned;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-zinc-900 flex flex-col font-sans antialiased">
      {/* --- SHOPIFY CLASS GLOBAL ADMIN HEADER --- */}
      <header className="bg-[#1a1a1a] text-white border-b border-black/40 sticky top-0 z-40 px-4 sm:px-6 h-13 flex items-center justify-between shadow-xs select-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 text-amber-400 flex items-center justify-center border border-white/10 shadow-inner">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white tracking-tight">{storeSettings.storeName}</span>
                <span className="text-[10px] uppercase tracking-wider font-mono font-bold bg-white/10 text-zinc-200 px-1.5 py-0.5 rounded border border-white/10">
                  Shopify Admin
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>MySQL Live: {dbStatus}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchAdminData(adminPin)}
            className="text-xs text-zinc-300 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 font-medium flex items-center gap-1.5 cursor-pointer border border-white/10"
            title="Refresh Store Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setActivePage('home')}
            className="text-xs font-semibold text-zinc-200 bg-zinc-800/90 hover:bg-zinc-800 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/15 flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Visit Store</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-400" />
          </button>

          <button
            onClick={handleLogout}
            className="text-xs text-red-400 hover:text-red-300 font-semibold px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-950/80 border border-red-500/30 transition-colors cursor-pointer flex items-center gap-1"
            title="Lock & Exit Console"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lock</span>
          </button>
        </div>
      </header>

      {/* Main Layout: Full-Height Edge-to-Edge Container */}
      <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-52px)] w-full overflow-hidden">
        {/* Sidebar Navigation: Flush with Left Edge (Shopify Polaris UI) */}
        <aside className="w-full md:w-60 lg:w-64 bg-[#ebebeb] md:bg-[#f1f1ef] border-r border-zinc-200/90 flex flex-col justify-between shrink-0 md:h-[calc(100vh-52px)] md:sticky md:top-13 md:overflow-y-auto p-2.5 select-none space-y-4">
          <div className="space-y-4">
            {/* Section 1: CORE */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 block mb-1">
                Core Operations
              </span>

              <button
                onClick={() => navigateAdminTab('analytics')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200/80'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-zinc-500" />
                <span>Sales Intelligence</span>
              </button>

              <button
                onClick={() => navigateAdminTab('orders')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200/80'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-zinc-500" />
                  <span>Orders</span>
                </div>
                {adminOrders.length > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    activeTab === 'orders' ? 'bg-zinc-900 text-white' : 'bg-zinc-200/80 text-zinc-700'
                  }`}>
                    {adminOrders.length}
                  </span>
                )}
              </button>

              {/* Products (WordPress & Shopify Dropdown) */}
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setIsProductsDropdownOpen(!isProductsDropdownOpen);
                    if (!['catalog', 'categories', 'tags', 'product-new', 'product-edit'].includes(activeTab)) {
                      navigateAdminTab('catalog');
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    ['catalog', 'categories', 'tags', 'product-new', 'product-edit'].includes(activeTab)
                      ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200/80'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-zinc-500" />
                    <span>Products</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-zinc-400">
                      {products.length}
                    </span>
                    {isProductsDropdownOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    )}
                  </div>
                </button>

                {/* Sub-Items */}
                {isProductsDropdownOpen && (
                  <div className="pl-3.5 pr-1 py-0.5 space-y-0.5 border-l-2 border-zinc-300/80 ml-4 my-0.5 animate-in fade-in duration-150">
                    <button
                      onClick={() => openNewProductModal()}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer group text-left ${
                        activeTab === 'product-new'
                          ? 'bg-zinc-200/90 text-zinc-950 font-bold'
                          : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900" />
                      <span>Add new product</span>
                    </button>

                    <button
                      onClick={() => navigateAdminTab('catalog')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                        activeTab === 'catalog'
                          ? 'bg-zinc-200/90 text-zinc-950 font-bold'
                          : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70'
                      }`}
                    >
                      <span>Manage Products</span>
                      <span className="text-[10px] font-mono text-zinc-400">{products.length}</span>
                    </button>

                    <button
                      onClick={() => navigateAdminTab('categories')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                        activeTab === 'categories'
                          ? 'bg-zinc-200/90 text-zinc-950 font-bold'
                          : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70'
                      }`}
                    >
                      <span>Categories</span>
                      <span className="text-[10px] font-mono text-zinc-400">{categoriesList.length}</span>
                    </button>

                    <button
                      onClick={() => navigateAdminTab('tags')}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                        activeTab === 'tags'
                          ? 'bg-zinc-200/90 text-zinc-950 font-bold'
                          : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70'
                      }`}
                    >
                      <span>Tags</span>
                      <span className="text-[10px] font-mono text-zinc-400">{customTagsList.length}</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigateAdminTab('inventory')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200/80'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Boxes className="w-4 h-4 text-zinc-500" />
                  <span>Inventory & Stock</span>
                </div>
                {products.filter(p => (p.stockCount ?? 10) <= 5).length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                    {products.filter(p => (p.stockCount ?? 10) <= 5).length} Low
                  </span>
                )}
              </button>

              <button
                onClick={() => navigateAdminTab('reviews')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'reviews'
                    ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200/80'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Star className="w-4 h-4 text-zinc-500" />
                  <span>Product Reviews</span>
                </div>
                {reviewsList.length > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    activeTab === 'reviews' ? 'bg-zinc-900 text-white' : 'bg-zinc-200/80 text-zinc-700'
                  }`}>
                    {reviewsList.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigateAdminTab('inquiries')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'inquiries'
                    ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200/80'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-zinc-500" />
                  <span>Concierge Desk</span>
                </div>
                {inquiriesList.filter(i => i.status === 'Open').length > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-blue-100 text-blue-900 border border-blue-300">
                    {inquiriesList.filter(i => i.status === 'Open').length} New
                  </span>
                )}
              </button>

              <button
                onClick={() => navigateAdminTab('customers')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'customers'
                    ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200/80'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-zinc-500" />
                  <span>Customers</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  activeTab === 'customers' ? 'bg-zinc-900 text-white' : 'bg-zinc-200/80 text-zinc-700'
                }`}>
                  {customersList.length}
                </span>
              </button>
            </div>

            {/* Section 2: SALES CHANNELS & MARKETING */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 block mb-1">
                Sales & Channels
              </span>

              <button
                onClick={() => {
                  navigateAdminTab('persistent-carts');
                  fetchPersistentCarts();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'persistent-carts'
                    ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200/80'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-4 h-4 text-zinc-500" />
                  <span>Persistent Carts</span>
                </div>
                {persistentCartsList.length > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    activeTab === 'persistent-carts' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {persistentCartsList.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigateAdminTab('discounts')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'discounts'
                    ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200/80'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <Tag className="w-4 h-4 text-zinc-500" />
                <span>Discounts & Promos</span>
              </button>

              <button
                onClick={() => navigateAdminTab('menus')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'menus'
                    ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200/80'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <Menu className="w-4 h-4 text-zinc-500" />
                <span>Navigation Menus</span>
              </button>
            </div>

            {/* Section 3: CONFIGURATION & AUDIT */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 block mb-1">
                Store Settings
              </span>

              <button
                onClick={() => navigateAdminTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200/80'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <Sliders className="w-4 h-4 text-zinc-500" />
                <span>Store, Rates & Cloud</span>
              </button>

              <button
                onClick={() => navigateAdminTab('staff')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'staff'
                    ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200/80'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <Shield className="w-4 h-4 text-zinc-500" />
                <span>Staff Roles & Security</span>
              </button>

              <button
                onClick={() => navigateAdminTab('audit-logs')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'audit-logs'
                    ? 'bg-white text-zinc-950 font-bold shadow-2xs border border-zinc-200/80'
                    : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/60'
                }`}
              >
                <History className="w-4 h-4 text-zinc-500" />
                <span>Activity Audit Logs</span>
              </button>
            </div>
          </div>

          {/* Profile Card at bottom */}
          <div className="p-3 bg-white border border-zinc-200/90 rounded-xl shadow-2xs space-y-1">
            <span className="text-[9px] font-mono font-bold text-zinc-400 block uppercase tracking-wider">Atelier Profile</span>
            <p className="text-xs text-zinc-900 font-extrabold truncate">{storeSettings.storeName}</p>
            <p className="text-[11px] text-zinc-500 truncate">{storeSettings.supportEmail}</p>
          </div>
        </aside>

        {/* Content Display Panel (Full Width Canvas with Professional Padding) */}
        <main className="flex-1 min-w-0 bg-[#f6f6f7] overflow-y-auto md:h-[calc(100vh-52px)] p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
          {/* 1. SALES INTELLIGENCE TAB */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900">Sales Intelligence & Business Performance</h2>
                  <p className="text-xs text-zinc-500">Live order volume, gross revenue, average transaction value, and top garment lines.</p>
                </div>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm">
                  <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Gross Sales Revenue</div>
                  <div className="text-2xl font-black text-zinc-900 tracking-tight">
                    {storeSettings.currencySymbol}{(analytics?.totalRevenue || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-500 mt-2 flex items-center gap-1 font-mono font-semibold">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Real-time settled revenue</span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm">
                  <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Client Orders</div>
                  <div className="text-2xl font-black text-zinc-900 tracking-tight">
                    {analytics?.totalOrders || 0}
                  </div>
                  <div className="text-xs text-zinc-500 mt-2 flex items-center gap-1 font-mono font-semibold">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                    <span>Fulfilled in atelier</span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm">
                  <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Average Order Value (AOV)</div>
                  <div className="text-2xl font-black text-zinc-900 tracking-tight">
                    {storeSettings.currencySymbol}{(analytics?.avgOrderValue || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-500 mt-2 font-mono">
                    Calculated from actual purchases
                  </div>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm">
                  <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Registered Clients</div>
                  <div className="text-2xl font-black text-zinc-900 tracking-tight">
                    {analytics?.totalClients || 0}
                  </div>
                  <div className="text-xs text-zinc-500 mt-2 flex items-center gap-1 font-mono font-semibold">
                    <Users className="w-3.5 h-3.5 text-sky-600" />
                    <span>Active client database</span>
                  </div>
                </div>
              </div>

              {/* Weekly Performance Breakdown */}
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Weekly Revenue Run-Rate (Past 7 Days)</h3>
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">MySQL Synchronized</span>
                </div>
                
                {analytics?.recentSales && analytics.recentSales.length > 0 ? (
                  <div className="grid grid-cols-7 gap-2 h-44 items-end pt-6 border-b border-zinc-100 pb-4">
                    {analytics.recentSales.map((item, idx) => {
                      const maxVal = Math.max(...analytics.recentSales.map(s => s.amount), 100);
                      const heightPct = Math.min(100, Math.max(15, (item.amount / maxVal) * 100));
                      return (
                        <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                          <span className="text-[10px] font-mono font-bold text-zinc-700">{storeSettings.currencySymbol}{item.amount.toLocaleString('en-IN')}</span>
                          <div 
                            style={{ height: `${heightPct}%` }}
                            className="w-full bg-zinc-900 rounded-t-lg transition-all hover:bg-amber-600 cursor-pointer"
                          ></div>
                          <span className="text-xs font-mono font-semibold text-zinc-500">{item.date}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-10 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                    <BarChart3 className="w-7 h-7 text-zinc-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-zinc-700">No client orders recorded in the past 7 days.</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">As client transactions occur in your store, live daily run-rates will graph here.</p>
                  </div>
                )}
              </div>

              {/* Top Products Table */}
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Top Performing Garments</h3>
                  <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">Real Orders Rank</span>
                </div>
                
                {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topProducts.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/60">
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{item.name}</p>
                          <p className="text-xs text-zinc-500 font-mono">{item.sales} units fulfilled</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono font-black text-zinc-900">{storeSettings.currencySymbol}{item.revenue.toLocaleString()}</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Gross Sales</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                    <Package className="w-7 h-7 text-zinc-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-zinc-700">No garments fulfilled yet.</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Products will be automatically ranked based on actual customer checkouts.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. ORDERS & FULFILLMENT TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900">Orders & Courier Operations</h2>
                  <p className="text-xs text-zinc-500">Update order status, print PDF invoices, manage courier manifests, or issue refunds.</p>
                </div>

                {/* Search & Filter Controls */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search order #, client name..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="bg-white border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 shadow-sm w-full sm:w-64"
                    />
                  </div>

                  <select
                    value={orderPreOrderFilter}
                    onChange={(e) => setOrderPreOrderFilter(e.target.value as any)}
                    className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 font-medium focus:outline-none focus:border-zinc-900 shadow-sm cursor-pointer"
                  >
                    <option value="All">All Order Types</option>
                    <option value="PreOrderOnly">Pre-Orders Only</option>
                    <option value="StandardOnly">Standard Ready-to-Ship</option>
                  </select>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 font-medium focus:outline-none focus:border-zinc-900 shadow-sm cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center bg-white border border-zinc-200 rounded-2xl shadow-sm">
                  <ShoppingBag className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-zinc-800">No client orders match your filter.</p>
                  <p className="text-xs text-zinc-500 mt-1">Try clearing search text or status filter.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono font-black text-zinc-900 text-sm">#{order.id}</span>
                          <span className="text-xs text-zinc-500 font-mono">{order.date}</span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            order.status === 'Refunded' ? 'bg-red-50 text-red-700 border border-red-200' :
                            order.status === 'Shipped' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {order.status}
                          </span>
                          {order.items.some((it: any) => it.isPreOrder) && (
                            <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Pre-Order Allocation</span>
                            </span>
                          )}
                        </div>

                        {/* Actions & Status Select */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-zinc-500 font-medium hidden sm:inline">Set Status:</label>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-zinc-900 font-semibold cursor-pointer"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Refunded">Refunded</option>
                          </select>

                          <button
                            onClick={() => handlePrintInvoice(order)}
                            className="px-3 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                            title="Print PDF Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Print Invoice</span>
                          </button>

                          {order.status !== 'Refunded' && (
                            <button
                              onClick={() => {
                                setRefundingOrder(order);
                                setRefundAmount(order.total);
                              }}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-red-200"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Refund</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items & Shipping Detail */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                        <div className="md:col-span-2 space-y-2">
                          <span className="text-zinc-400 font-mono text-[10px] uppercase font-bold tracking-wider block">Ordered Garments</span>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/60">
                                <div className="flex items-center gap-3">
                                  {item.image && (
                                    <img src={item.image} alt={item.name} className="w-10 h-12 object-cover rounded-lg border border-zinc-200" />
                                  )}
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-bold text-zinc-900">{item.name}</p>
                                      {item.isPreOrder && (
                                        <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                                          <Clock className="w-2.5 h-2.5" />
                                          <span>Ships {item.preOrderReleaseDate || 'Soon'}</span>
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-zinc-500">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                                  </div>
                                </div>
                                <span className="font-mono text-zinc-900 font-bold">{storeSettings.currencySymbol}{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/60 space-y-3">
                          <div>
                            <span className="text-zinc-400 font-mono text-[10px] uppercase font-bold tracking-wider block mb-1">Delivery Address</span>
                            <p className="font-extrabold text-zinc-900">{order.shippingAddress.fullName}</p>
                            <p className="text-zinc-700">{order.shippingAddress.street}</p>
                            <p className="text-zinc-700">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                            <p className="text-zinc-500 mt-1">{order.shippingAddress.email} | {order.shippingAddress.phone}</p>
                          </div>

                          <div className="border-t border-zinc-200/80 pt-2 font-mono">
                            <div className="flex justify-between text-zinc-600">
                              <span>Subtotal:</span>
                              <span>{storeSettings.currencySymbol}{order.subtotal.toLocaleString()}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-red-600 font-semibold">
                                <span>Discount ({order.discountCode}):</span>
                                <span>-{storeSettings.currencySymbol}{order.discount.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-zinc-900 font-black text-sm pt-1 border-t border-zinc-200 mt-1">
                              <span>Total Paid:</span>
                              <span className="text-zinc-900">{storeSettings.currencySymbol}{order.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. PRODUCTS (MANAGE PRODUCTS) TAB */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900">Products</h2>
                  <p className="text-xs text-zinc-500">Manage all store products, variable matrices, stock levels, categories, and tags.</p>
                </div>

                <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto">
                  {selectedProductIds.length > 0 && (
                    <>
                      <button
                        onClick={handleBatchDeleteProducts}
                        className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete ({selectedProductIds.length})</span>
                      </button>
                      <button
                        onClick={() => setShowBulkPanel(true)}
                        className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Bulk Edit ({selectedProductIds.length})</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setIsImportModalOpen(true);
                      setImportFileName('');
                      setImportHeaders([]);
                      setImportRawRows([]);
                      setImportResult(null);
                    }}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    title="Import CSV or Excel files with interactive field mapping directly into MySQL"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Import CSV / Excel</span>
                  </button>

                  <button
                    onClick={() => openNewProductModal()}
                    className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter products by name, SKU, or category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setProductTypeFilter('All')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      productTypeFilter === 'All' ? 'bg-zinc-900 text-white shadow-xs' : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
                    }`}
                  >
                    All ({products.length})
                  </button>
                  <button
                    onClick={() => setProductTypeFilter('PreOrder')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      productTypeFilter === 'PreOrder' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    <span>Pre-Order Drops ({products.filter(p => p.isPreOrder).length})</span>
                  </button>
                  <button
                    onClick={() => setProductTypeFilter('CompleteLook')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      productTypeFilter === 'CompleteLook' ? 'bg-purple-700 text-white shadow-xs' : 'bg-purple-50 text-purple-900 hover:bg-purple-100 border border-purple-200'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Ensembles ({products.filter(p => Array.isArray(p.completeLookIds) && p.completeLookIds.length > 0).length})</span>
                  </button>
                  <button
                    onClick={() => setProductTypeFilter('InStock')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      productTypeFilter === 'InStock' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
                    }`}
                  >
                    In Stock ({products.filter(p => !p.isPreOrder && (p.stockCount ?? 10) > 0).length})
                  </button>
                  <button
                    onClick={() => setProductTypeFilter('OutOfStock')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      productTypeFilter === 'OutOfStock' ? 'bg-red-700 text-white shadow-xs' : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
                    }`}
                  >
                    Sold Out ({products.filter(p => !p.isPreOrder && (p.stockCount ?? 10) <= 0).length})
                  </button>
                </div>
              </div>

              {/* Catalog Table */}
              <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100/80 border-b border-zinc-200 text-zinc-600 font-mono text-[10px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-4 w-10">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.length === filteredProducts.length && filteredProducts.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds(filteredProducts.map(p => p.id));
                              } else {
                                setSelectedProductIds([]);
                              }
                            }}
                            className="rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer"
                          />
                        </th>
                        <th className="p-4">Garment</th>
                        <th className="p-4">SKU</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={selectedProductIds.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProductIds(prev => [...prev, p.id]);
                                } else {
                                  setSelectedProductIds(prev => prev.filter(id => id !== p.id));
                                }
                              }}
                              className="rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="p-4 font-bold text-zinc-900">
                            <div className="flex items-center gap-3">
                              {p.images && p.images[0] && (
                                <img src={p.images[0]} alt={p.name} className="w-9 h-11 object-cover rounded-lg border border-zinc-200" />
                              )}
                              <div className="space-y-1">
                                <p className="font-bold">{p.name}</p>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[11px] text-zinc-500 font-normal">{p.gender} | {p.subcategory}</span>
                                  {p.isPreOrder && (
                                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                                      <Clock className="w-2.5 h-2.5" />
                                      <span>Pre-Order • Ships {p.preOrderReleaseDate || 'Soon'} ({p.preOrderCount || 0}/{p.preOrderLimit || 50})</span>
                                    </span>
                                  )}
                                  {Array.isArray(p.completeLookIds) && p.completeLookIds.length > 0 && (
                                    <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      <span>Ensemble ({p.completeLookIds.length} paired • {p.completeLookDiscount || 15}% off)</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-zinc-500 font-medium">{p.sku}</td>
                          <td className="p-4">
                            <span className="bg-zinc-100 text-zinc-800 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold border border-zinc-200">
                              {p.category}
                            </span>
                          </td>
                          <td className="p-4 font-mono font-black text-zinc-900">{storeSettings.currencySymbol}{p.price.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              (p.stockCount ?? 10) < 5 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {p.stockCount ?? 10} in stock
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => openEditProductModal(p)}
                              className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                              title="Edit Garment"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-colors cursor-pointer"
                              title="Delete Garment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900">Categories</h2>
                  <p className="text-xs text-zinc-500">Manage storefront product categories, hierarchy, cover imagery, and navigation display order.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCatName('');
                    setCatSlug('');
                    setCatSubtitle('');
                    setCatDesc('');
                    setCatImage('');
                    setCatOrder(categoriesList.length + 1);
                    setIsCategoryModalOpen(true);
                  }}
                  className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoriesList.map((cat) => (
                  <div key={cat.id} className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm group">
                    <div className="relative h-40 overflow-hidden">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-3 left-4 right-4">
                        <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                          Order: #{cat.displayOrder || 1}
                        </span>
                        <h3 className="text-lg font-black text-white mt-1">{cat.name}</h3>
                      </div>
                    </div>

                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs font-bold text-zinc-800">{cat.subtitle}</p>
                        {cat.description && (
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{cat.description}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                        <button
                          onClick={() => {
                            setProductSearch(cat.name);
                            navigateAdminTab('catalog');
                          }}
                          className="text-[11px] font-mono font-bold text-zinc-600 hover:text-zinc-900 flex items-center gap-1 cursor-pointer bg-zinc-50 hover:bg-zinc-100 px-2 py-1 rounded-md border border-zinc-200 transition-colors"
                          title="View and manage products under this category"
                        >
                          <Package className="w-3 h-3 text-zinc-500" />
                          <span>View Products</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setCatName(cat.name);
                              setCatSlug(cat.slug);
                              setCatSubtitle(cat.subtitle);
                              setCatDesc(cat.description || '');
                              setCatImage(cat.image);
                              setCatOrder(cat.displayOrder || 1);
                              setIsCategoryModalOpen(true);
                            }}
                            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 border border-zinc-200"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs cursor-pointer border border-red-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4.1 PRODUCT TAGS TAB (WORDPRESS STYLE) */}
          {activeTab === 'tags' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-zinc-700" />
                    <span>Product Tags</span>
                  </h2>
                  <p className="text-xs text-zinc-500">Create, organize, and manage product tags and collection keywords for catalog filtering.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Add New Tag Form */}
                <div className="lg:col-span-5 bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
                  <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                    <Plus className="w-4 h-4 text-zinc-900" />
                    <h3 className="text-sm font-extrabold text-zinc-900">Add New Tag</h3>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newTagName.trim()) {
                        showToast('Please enter a tag name.');
                        return;
                      }
                      const slug = newTagSlug.trim() || newTagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                      const newTag = {
                        id: String(Date.now()),
                        name: newTagName.trim(),
                        slug: slug,
                        description: newTagDesc.trim() || 'Curated tag collection.'
                      };
                      setCustomTagsList([...customTagsList, newTag]);
                      setNewTagName('');
                      setNewTagSlug('');
                      setNewTagDesc('');
                      showToast(`Tag "${newTag.name}" created successfully!`);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => {
                          setNewTagName(e.target.value);
                          if (!newTagSlug || newTagSlug === newTagName.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
                            setNewTagSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                          }
                        }}
                        placeholder="e.g. Pure Cashmere"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                      />
                      <p className="text-[10px] text-zinc-400 mt-1">The name is how it appears on your storefront and product filters.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={newTagSlug}
                        onChange={(e) => setNewTagSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                        placeholder="e.g. pure-cashmere"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 font-mono text-xs text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                      />
                      <p className="text-[10px] text-zinc-400 mt-1">The "slug" is the URL-friendly version of the name (usually all lowercase with hyphens).</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-800 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newTagDesc}
                        onChange={(e) => setNewTagDesc(e.target.value)}
                        rows={3}
                        placeholder="Garments crafted with 100% Mongolian combed cashmere fibers."
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                      />
                    </div>

                    {/* Quick Presets */}
                    <div>
                      <span className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Quick Presets</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['Pre-Order Drop', 'Silk Series', 'Italian Wool', 'Bespoke Fit', 'Minimalist', 'Summer Archive', 'Winter Drop'].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setNewTagName(preset);
                              setNewTagSlug(preset.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                            }}
                            className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors border border-zinc-200"
                          >
                            + {preset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Tag</span>
                    </button>
                  </form>
                </div>

                {/* Right Column: Tags Table */}
                <div className="lg:col-span-7 bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                  <div>
                    {/* Filter Bar */}
                    <div className="p-4 border-b border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={tagSearchQuery}
                          onChange={(e) => setTagSearchQuery(e.target.value)}
                          placeholder="Search product tags..."
                          className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                        />
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 font-bold shrink-0">
                        {customTagsList.length} Tags
                      </span>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase font-mono font-bold text-zinc-500">
                          <tr>
                            <th className="p-3.5">Tag Name</th>
                            <th className="p-3.5">Description</th>
                            <th className="p-3.5">Slug</th>
                            <th className="p-3.5 text-center">Products</th>
                            <th className="p-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 font-medium">
                          {customTagsList
                            .filter(t => !tagSearchQuery || t.name.toLowerCase().includes(tagSearchQuery.toLowerCase()) || t.slug.toLowerCase().includes(tagSearchQuery.toLowerCase()))
                            .map((tag) => {
                              // Compute count of products matching this tag name
                              const count = products.filter(p => 
                                (p.name && p.name.toLowerCase().includes(tag.name.toLowerCase())) ||
                                (p.subtitle && p.subtitle.toLowerCase().includes(tag.name.toLowerCase())) ||
                                (p.materials && p.materials.toLowerCase().includes(tag.name.toLowerCase())) ||
                                (p.category && p.category.toLowerCase().includes(tag.name.toLowerCase())) ||
                                (tag.name === 'Pre-Order Drop' && p.isPreOrder) ||
                                (tag.name === 'New Arrival' && p.isNew) ||
                                (tag.name === 'Trending' && p.isTrending) ||
                                (tag.name === 'Best Seller' && p.isBestSeller)
                              ).length;

                              return (
                                <tr key={tag.id} className="hover:bg-zinc-50/70 transition-colors">
                                  <td className="p-3.5">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 border border-zinc-200 text-zinc-900 rounded-lg font-bold text-xs">
                                      <Tag className="w-3 h-3 text-zinc-500" />
                                      <span>{tag.name}</span>
                                    </span>
                                  </td>
                                  <td className="p-3.5 text-zinc-600 max-w-[200px] truncate text-[11px]">
                                    {tag.description}
                                  </td>
                                  <td className="p-3.5 font-mono text-zinc-500 text-[11px]">
                                    {tag.slug}
                                  </td>
                                  <td className="p-3.5 text-center">
                                    <button
                                      onClick={() => {
                                        setProductSearch(tag.name);
                                        navigateAdminTab('catalog');
                                      }}
                                      className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full font-mono font-bold text-[11px] cursor-pointer transition-colors"
                                      title="Filter products with this tag"
                                    >
                                      {count}
                                    </button>
                                  </td>
                                  <td className="p-3.5 text-right space-x-1.5">
                                    <button
                                      onClick={() => {
                                        setProductSearch(tag.name);
                                        navigateAdminTab('catalog');
                                      }}
                                      className="p-1 text-zinc-400 hover:text-zinc-900 rounded transition-colors cursor-pointer"
                                      title="View tagged products in catalog"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Delete tag "${tag.name}"?`)) {
                                          setCustomTagsList(customTagsList.filter(t => t.id !== tag.id));
                                          showToast(`Tag "${tag.name}" removed.`);
                                        }
                                      }}
                                      className="p-1 text-zinc-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                                      title="Delete tag"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4.5 NAVIGATION MENUS TAB */}
          {activeTab === 'menus' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900">Storefront Menus & Mega Navigation</h2>
                  <p className="text-xs text-zinc-500">Configure global menu headers and map multiple categories to trigger gorgeous dynamic hover Mega Menus loaded with products.</p>
                </div>
                <button
                  onClick={() => {
                    setEditingMenu(null);
                    setMenuTitle('');
                    setMenuLink('');
                    setMenuDisplayOrder(menus.length + 1);
                    setMenuAssignedCategories([]);
                    setIsMenuModalOpen(true);
                  }}
                  className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Menu Item</span>
                </button>
              </div>

              {menus.length === 0 ? (
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center space-y-3">
                  <Menu className="w-12 h-12 text-zinc-300 mx-auto" />
                  <p className="text-sm font-bold text-zinc-900">No Custom Menus Created Yet</p>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">Click "Add Menu Item" to start designing your storefront navigation and mapping mega drop-down categories.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                  {menus.map((menu) => {
                    let cats: string[] = [];
                    try {
                      cats = typeof menu.assignedCategories === 'string' 
                        ? JSON.parse(menu.assignedCategories) 
                        : (menu.assignedCategories || []);
                    } catch (e) {
                      cats = [];
                    }

                    const dbCategoryNames = categoriesList.map(c => c.name);
                    const validCats = cats.filter(c => dbCategoryNames.includes(c));

                    return (
                      <div key={menu.id} className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition-colors">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                              Order: #{menu.displayOrder}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingMenu(menu);
                                  setMenuTitle(menu.title);
                                  setMenuLink(menu.link || '');
                                  setMenuDisplayOrder(menu.displayOrder);
                                  setMenuAssignedCategories(cats);
                                  setIsMenuModalOpen(true);
                                }}
                                className="p-1 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 rounded-lg transition-colors cursor-pointer"
                                title="Edit Menu"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMenu(menu.id)}
                                className="p-1 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                                title="Delete Menu"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-base font-black text-zinc-900">{menu.title}</h3>
                            <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{menu.link || 'Custom Trigger'}</p>
                          </div>

                          <div className="pt-3 border-t border-zinc-150">
                            <span className="text-[9px] uppercase font-mono tracking-widest text-zinc-400 block mb-1.5 font-extrabold">Hover Mega Menu Category Mapping</span>
                            {validCats.length === 0 ? (
                              <span className="text-[11px] italic text-zinc-400">Direct link only (no active categories assigned - no mega dropdown hover)</span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5">
                                {validCats.map((cat, idx) => (
                                  <span key={idx} className="text-[10px] bg-zinc-900 text-white font-mono px-2 py-0.5 rounded border border-zinc-900 font-semibold shadow-xs animate-fadeIn">
                                    {cat}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 5. CUSTOMER CRM TAB */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900">Customer CRM & Profiles</h2>
                  <p className="text-xs text-zinc-500">View client spending profiles, total order counts, and manage account statuses.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search customer name or email..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="bg-white border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 shadow-sm w-full sm:w-64"
                    />
                  </div>

                  <select
                    value={customerFilterStatus}
                    onChange={(e) => setCustomerFilterStatus(e.target.value)}
                    className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 font-medium focus:outline-none focus:border-zinc-900 shadow-sm cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-100/80 border-b border-zinc-200 text-zinc-600 font-mono text-[10px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-4">Client Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Orders</th>
                        <th className="p-4">Total Spent</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Last Order</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {filteredCustomers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="p-4 font-bold text-zinc-900">{cust.name}</td>
                          <td className="p-4 font-mono text-zinc-600 font-medium">{cust.email}</td>
                          <td className="p-4 font-mono text-zinc-700 font-semibold">{cust.ordersCount} orders</td>
                          <td className="p-4 font-mono font-black text-zinc-900">{storeSettings.currencySymbol}{cust.totalSpent.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                              cust.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {cust.status}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-zinc-500">{cust.lastOrderDate || 'N/A'}</td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => setSelectedCustomerDetail(cust)}
                              className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Profile</span>
                            </button>
                            <button
                              onClick={() => handleToggleCustomerStatus(cust)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer border ${
                                cust.status === 'Active' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              }`}
                            >
                              {cust.status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(cust.id)}
                              className="p-1 hover:bg-red-50 rounded-lg text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PERSISTENT CARTS & ABANDONED BASKETS TAB */}
          {activeTab === 'persistent-carts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-amber-600" />
                    <span>Persistent Carts & Abandoned Baskets</span>
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Real-time cross-device shopping cart persistence stored in MySQL. Track active baskets and recover abandoned checkouts.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => fetchPersistentCarts()}
                    disabled={isLoadingPersistentCarts}
                    className="px-3.5 py-2 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPersistentCarts ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={handlePurgeExpiredCarts}
                    disabled={isPurgingCarts}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge Expired ({settingsForm.cartRetentionDays || 30}d+)</span>
                  </button>
                </div>
              </div>

              {/* Analytics Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm space-y-1">
                  <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Active Saved Carts</div>
                  <div className="text-2xl font-black text-zinc-900 tracking-tight">
                    {persistentCartStats.totalActiveCarts}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono">Synchronized in MySQL database</p>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm space-y-1">
                  <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Cart Value at Risk</div>
                  <div className="text-2xl font-black text-amber-700 tracking-tight font-mono">
                    {storeSettings.currencySymbol}{persistentCartStats.totalCartValue.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono">Total value in shopper bags</p>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm space-y-1">
                  <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Abandoned Carts (24h+)</div>
                  <div className="text-2xl font-black text-red-600 tracking-tight">
                    {persistentCartStats.abandonedCount}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono font-bold text-red-500">
                    {storeSettings.currencySymbol}{persistentCartStats.abandonedValue.toLocaleString()} potential recovery
                  </p>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm space-y-1">
                  <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Average Basket Size</div>
                  <div className="text-2xl font-black text-zinc-900 tracking-tight font-mono">
                    {storeSettings.currencySymbol}{persistentCartStats.avgBasketValue.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-mono">Per active persistent session</p>
                </div>
              </div>

              {/* Persistence Options & Policy Card */}
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-zinc-700" />
                      <span>Persistent Cart Engine Options</span>
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Configure automatic synchronization across user logins, devices, and retention periods.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSavePersistentCartSettings(settingsForm.enablePersistentCart !== false, settingsForm.cartRetentionDays || 30)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Options to MySQL</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                  <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/60">
                    <div>
                      <span className="text-xs font-bold text-zinc-900 block">Real-Time Server Cart Sync</span>
                      <p className="text-[11px] text-zinc-500">Automatically syncs bag additions directly to MySQL table.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.enablePersistentCart !== false}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enablePersistentCart: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-zinc-900"></div>
                    </label>
                  </div>

                  <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-900 block">Cart Inactivity Retention Window</span>
                      <p className="text-[11px] text-zinc-500">Duration before abandoned guest baskets expire from database.</p>
                    </div>
                    <select
                      value={settingsForm.cartRetentionDays || 30}
                      onChange={(e) => setSettingsForm({ ...settingsForm, cartRetentionDays: Number(e.target.value) })}
                      className="bg-white border border-zinc-200 text-xs font-mono font-bold text-zinc-900 rounded-lg px-3 py-1.5 focus:outline-none focus:border-zinc-900 cursor-pointer shadow-2xs"
                    >
                      <option value={14}>14 Days</option>
                      <option value={30}>30 Days (Standard)</option>
                      <option value={60}>60 Days</option>
                      <option value={90}>90 Days (Extended)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by client email, name, session ID, or item..."
                    value={persistentCartSearch}
                    onChange={(e) => setPersistentCartSearch(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 shadow-sm"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPersistentCartFilter('All')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      persistentCartFilter === 'All' ? 'bg-zinc-900 text-white shadow-xs' : 'bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200'
                    }`}
                  >
                    All ({persistentCartsList.length})
                  </button>
                  <button
                    onClick={() => setPersistentCartFilter('Active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      persistentCartFilter === 'Active' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    Active Browsing ({persistentCartsList.filter(c => !c.isAbandoned).length})
                  </button>
                  <button
                    onClick={() => setPersistentCartFilter('Abandoned')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      persistentCartFilter === 'Abandoned' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    Abandoned 24h+ ({persistentCartsList.filter(c => c.isAbandoned).length})
                  </button>
                </div>
              </div>

              {/* Persistent Carts Table */}
              <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
                {filteredPersistentCarts.length === 0 ? (
                  <div className="p-12 text-center space-y-2">
                    <ShoppingCart className="w-8 h-8 text-zinc-300 mx-auto" />
                    <p className="text-sm font-bold text-zinc-800">No persistent carts match your search.</p>
                    <p className="text-xs text-zinc-400">As customers add pieces to their bags, live records will sync here automatically.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-100/80 border-b border-zinc-200 text-zinc-600 font-mono text-[10px] font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Client / Session</th>
                          <th className="p-4">Bag Contents</th>
                          <th className="p-4">Value</th>
                          <th className="p-4">Last Activity</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {filteredPersistentCarts.map((cart) => (
                          <tr key={cart.id} className="hover:bg-zinc-50 transition-colors">
                            <td className="p-4 font-bold text-zinc-900">
                              <div>
                                {cart.userEmail ? (
                                  <div>
                                    <p className="font-bold text-zinc-900">{cart.userName || cart.userEmail}</p>
                                    <p className="text-[11px] text-zinc-500 font-normal">{cart.userEmail}</p>
                                    <span className="inline-block mt-0.5 text-[9px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                                      Registered Member
                                    </span>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="font-mono text-zinc-800 text-[11px]">Guest Shopper</p>
                                    <p className="text-[10px] font-mono text-zinc-400 truncate max-w-[150px]">{cart.sessionId}</p>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="flex -space-x-2 overflow-hidden">
                                  {cart.items.slice(0, 3).map((item, i) => (
                                    <img
                                      key={i}
                                      src={item.product?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'}
                                      alt={item.product?.name || 'Garment'}
                                      className="inline-block w-8 h-10 object-cover rounded border-2 border-white shadow-2xs"
                                    />
                                  ))}
                                </div>
                                <div className="text-zinc-600 text-[11px]">
                                  <span className="font-bold text-zinc-900">{cart.itemCount}</span> garments
                                </div>
                              </div>
                            </td>
                            <td className="p-4 font-mono font-black text-zinc-900">
                              {storeSettings.currencySymbol}{cart.cartSubtotal.toLocaleString()}
                            </td>
                            <td className="p-4 text-zinc-500 font-mono text-[11px]">
                              {new Date(cart.updatedAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="p-4">
                              {cart.isAbandoned ? (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold">
                                  <Clock className="w-2.5 h-2.5 text-amber-600" />
                                  <span>Abandoned ({cart.ageHours || 24}h)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  <span>Active Browsing</span>
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => setSelectedPersistentCartModal(cart)}
                                className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                title="Inspect Bag Contents"
                              >
                                Inspect
                              </button>
                              <button
                                onClick={() => handleDeletePersistentCart(cart.id)}
                                className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                                title="Delete Cart Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. DISCOUNT COUPONS TAB */}
          {activeTab === 'discounts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-amber-600" />
                    <span>Discount Coupons & Promo Engine</span>
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Create promotional discount codes stored in MySQL with real-time checkout validation, minimum spend, and redemption limits.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingDiscount(true)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Create Promo Code</span>
                </button>
              </div>

              {discounts.length === 0 ? (
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Tag className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-zinc-900 text-sm">No Active Promotional Coupons</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Create your first coupon code to offer percentage discounts or flat price deductions during client checkout.
                  </p>
                  <button
                    onClick={() => setIsAddingDiscount(true)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Coupon</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {discounts.map((disc) => {
                    const isExpired = disc.expiresAt && new Date(disc.expiresAt).getTime() < new Date().setHours(0,0,0,0);
                    const usagePercent = disc.maxUses ? Math.min(100, Math.round((disc.usedCount / disc.maxUses) * 100)) : 0;
                    
                    return (
                      <div 
                        key={disc.id} 
                        className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 relative transition-all ${
                          disc.active && !isExpired ? 'border-zinc-200/90 hover:border-zinc-300' : 'border-zinc-200 bg-zinc-50/70 opacity-80'
                        }`}
                      >
                        {/* Header: Code & Actions */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-zinc-900 text-sm tracking-wider bg-zinc-100 border border-zinc-200/90 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{disc.code}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(disc.code);
                                showToast(`Copied code: ${disc.code}`);
                              }}
                              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg cursor-pointer transition-colors"
                              title="Copy code"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleDiscountStatus(disc.id, disc.active)}
                              className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                                disc.active
                                  ? 'text-zinc-500 hover:text-amber-700 hover:bg-amber-50'
                                  : 'text-zinc-400 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={disc.active ? 'Pause Coupon' : 'Activate Coupon'}
                            >
                              {disc.active ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4 text-emerald-600" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteDiscount(disc.id)}
                              className="text-zinc-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                              title="Delete Coupon"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Value & Discount Info */}
                        <div className="space-y-1">
                          <div className="flex items-baseline justify-between">
                            <p className="text-xl font-black text-zinc-900 tracking-tight">
                              {disc.type === 'percentage' 
                                ? `${disc.value}% OFF` 
                                : `${storeSettings.currencySymbol}${Number(disc.value).toLocaleString('en-IN')} FLAT`}
                            </p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              !disc.active 
                                ? 'bg-zinc-100 text-zinc-500 border-zinc-200' 
                                : isExpired
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {!disc.active ? 'PAUSED' : isExpired ? 'EXPIRED' : 'ACTIVE'}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 font-medium">
                            {disc.type === 'percentage' 
                              ? `Deducts ${disc.value}% from applicable bag total` 
                              : `Fixed deduction of ${storeSettings.currencySymbol}${Number(disc.value).toLocaleString('en-IN')}`}
                          </p>
                        </div>

                        {/* Specifications & Usage Bar */}
                        <div className="pt-2 border-t border-zinc-100 space-y-2 text-xs text-zinc-600">
                          <div className="flex items-center justify-between font-mono text-[11px]">
                            <span className="text-zinc-400">Min Order Spend:</span>
                            <span className="font-bold text-zinc-900">
                              {disc.minSpend > 0 ? `${storeSettings.currencySymbol}${Number(disc.minSpend).toLocaleString('en-IN')}` : 'No Minimum'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between font-mono text-[11px]">
                            <span className="text-zinc-400">Expires:</span>
                            <span className={`font-semibold ${isExpired ? 'text-red-600 font-bold' : 'text-zinc-700'}`}>
                              {disc.expiresAt || 'No Expiry'}
                            </span>
                          </div>

                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                              <span>Redemptions</span>
                              <span className="font-bold text-zinc-700">{disc.usedCount} / {disc.maxUses} used</span>
                            </div>
                            <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-zinc-900 h-full rounded-full transition-all"
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 7. STORE SETTINGS & SMTP CONFIGURATION TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-zinc-900">Store Settings & SMTP Mailer Configuration</h2>
                <p className="text-xs text-zinc-500">Manage store identity, contact channels, sales tax %, and SMTP mail server parameters.</p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-8">
                {/* General Store Identity */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <Building className="w-4 h-4 text-zinc-700" />
                    <span>General Store Identity & Contact Details</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">Store / Brand Name</label>
                      <input
                        type="text"
                        value={settingsForm.storeName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900"
                        required
                      />
                    </div>

                    <div>
                      <CloudImageUploader
                        label="Store Brand Logo"
                        sublabel="Header branding mark & invoice logo"
                        value={settingsForm.storeLogoUrl}
                        onChange={(url) => setSettingsForm({ ...settingsForm, storeLogoUrl: url })}
                        adminPin={adminPin}
                        showToast={showToast}
                        cloudWorkspaceId={cloudWorkspaceId}
                        aspectRatio="wide"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">Support Email</label>
                      <input
                        type="email"
                        value={settingsForm.supportEmail}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">Support Phone</label>
                      <input
                        type="text"
                        value={settingsForm.supportPhone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-zinc-600 font-bold mb-1">Physical Address</label>
                      <input
                        type="text"
                        value={settingsForm.physicalAddress}
                        onChange={(e) => setSettingsForm({ ...settingsForm, physicalAddress: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">Currency Symbol</label>
                      <input
                        type="text"
                        value={settingsForm.currencySymbol}
                        onChange={(e) => setSettingsForm({ ...settingsForm, currencySymbol: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono text-center font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">Sales Tax (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={settingsForm.taxRatePercent}
                        onChange={(e) => setSettingsForm({ ...settingsForm, taxRatePercent: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Homepage Section Categories Selection */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-zinc-700" />
                    <span>Homepage Division Categories</span>
                  </h3>
                  <p className="text-[11px] text-zinc-500">Configure which product categories are mapped to show in the Men, Women, and Kids divisions on the home page.</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">Men Homepage Division Category</label>
                      <select
                        value={settingsForm.homeMenCategory || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, homeMenCategory: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 cursor-pointer"
                      >
                        <option value="">Default (Gender Men)</option>
                        <option value="All">All Categories</option>
                        {categoriesList.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">Women Homepage Division Category</label>
                      <select
                        value={settingsForm.homeWomenCategory || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, homeWomenCategory: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 cursor-pointer"
                      >
                        <option value="">Default (Gender Women)</option>
                        <option value="All">All Categories</option>
                        {categoriesList.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">Kids Homepage Division Category</label>
                      <select
                        value={settingsForm.homeKidsCategory || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, homeKidsCategory: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 cursor-pointer"
                      >
                        <option value="">Default (Gender Kids)</option>
                        <option value="All">All Categories</option>
                        {categoriesList.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Hero Slider Images Selection (Dynamic Multiple URLs) */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-zinc-700" />
                        <span>Homepage Hero Slider Images ({(settingsForm.heroSlideUrls || [settingsForm.heroSlide1Url, settingsForm.heroSlide2Url, settingsForm.heroSlide3Url].filter(Boolean)).length} Slides)</span>
                      </h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">Add, edit, or re-order image URLs for the homepage hero carousel. You can add as many high-res image URLs as desired.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const current = (settingsForm.heroSlideUrls && settingsForm.heroSlideUrls.length > 0)
                          ? settingsForm.heroSlideUrls
                          : [
                              settingsForm.heroSlide1Url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
                              settingsForm.heroSlide2Url || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
                              settingsForm.heroSlide3Url || 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80'
                            ];
                        const updated = [...current, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'];
                        setSettingsForm({
                          ...settingsForm,
                          heroSlideUrls: updated,
                          heroSlide1Url: updated[0] || '',
                          heroSlide2Url: updated[1] || '',
                          heroSlide3Url: updated[2] || ''
                        });
                      }}
                      className="px-3.5 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Add Hero Slide Image URL</span>
                    </button>
                  </div>

                  {/* List of Slide URL Inputs with Image Previews */}
                  <div className="space-y-3 pt-2">
                    {((settingsForm.heroSlideUrls && settingsForm.heroSlideUrls.length > 0)
                      ? settingsForm.heroSlideUrls
                      : [
                          settingsForm.heroSlide1Url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
                          settingsForm.heroSlide2Url || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
                          settingsForm.heroSlide3Url || 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80'
                        ]
                    ).map((url: string, idx: number) => (
                      <div key={idx} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-800 font-mono font-bold text-[10px]">
                            Hero Slide #{idx + 1}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Move Up */}
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const currentList = [...(settingsForm.heroSlideUrls || [settingsForm.heroSlide1Url || '', settingsForm.heroSlide2Url || '', settingsForm.heroSlide3Url || ''])];
                                  const temp = currentList[idx];
                                  currentList[idx] = currentList[idx - 1];
                                  currentList[idx - 1] = temp;
                                  setSettingsForm({
                                    ...settingsForm,
                                    heroSlideUrls: currentList,
                                    heroSlide1Url: currentList[0] || '',
                                    heroSlide2Url: currentList[1] || '',
                                    heroSlide3Url: currentList[2] || ''
                                  });
                                }}
                                className="px-2 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-md font-mono text-[10px] font-bold cursor-pointer"
                                title="Move Up"
                              >
                                ↑
                              </button>
                            )}

                            {/* Move Down */}
                            {idx < ((settingsForm.heroSlideUrls || []).length - 1) && (
                              <button
                                type="button"
                                onClick={() => {
                                  const currentList = [...(settingsForm.heroSlideUrls || [settingsForm.heroSlide1Url || '', settingsForm.heroSlide2Url || '', settingsForm.heroSlide3Url || ''])];
                                  const temp = currentList[idx];
                                  currentList[idx] = currentList[idx + 1];
                                  currentList[idx + 1] = temp;
                                  setSettingsForm({
                                    ...settingsForm,
                                    heroSlideUrls: currentList,
                                    heroSlide1Url: currentList[0] || '',
                                    heroSlide2Url: currentList[1] || '',
                                    heroSlide3Url: currentList[2] || ''
                                  });
                                }}
                                className="px-2 py-1 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-md font-mono text-[10px] font-bold cursor-pointer"
                                title="Move Down"
                              >
                                ↓
                              </button>
                            )}

                            {/* Remove Slide */}
                            <button
                              type="button"
                              onClick={() => {
                                const currentList = [...(settingsForm.heroSlideUrls || [settingsForm.heroSlide1Url || '', settingsForm.heroSlide2Url || '', settingsForm.heroSlide3Url || ''])];
                                if (currentList.length <= 1) {
                                  alert('At least 1 hero slide image is required.');
                                  return;
                                }
                                currentList.splice(idx, 1);
                                setSettingsForm({
                                  ...settingsForm,
                                  heroSlideUrls: currentList,
                                  heroSlide1Url: currentList[0] || '',
                                  heroSlide2Url: currentList[1] || '',
                                  heroSlide3Url: currentList[2] || ''
                                });
                              }}
                              className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg cursor-pointer"
                              title="Remove Slide"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <CloudImageUploader
                          label={`Hero Slide #${idx + 1} Image`}
                          sublabel="Featured carousel background photo"
                          value={url}
                          onChange={(newUrl) => {
                            const currentList = [...((settingsForm.heroSlideUrls && settingsForm.heroSlideUrls.length > 0)
                              ? settingsForm.heroSlideUrls
                              : [settingsForm.heroSlide1Url || '', settingsForm.heroSlide2Url || '', settingsForm.heroSlide3Url || '']
                            )];
                            currentList[idx] = newUrl;
                            setSettingsForm({
                              ...settingsForm,
                              heroSlideUrls: currentList,
                              heroSlide1Url: currentList[0] || '',
                              heroSlide2Url: currentList[1] || '',
                              heroSlide3Url: currentList[2] || ''
                            });
                          }}
                          adminPin={adminPin}
                          showToast={showToast}
                          cloudWorkspaceId={cloudWorkspaceId}
                          aspectRatio="wide"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Razorpay Payment Gateway Integration */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span>Razorpay Payment Gateway Integration</span>
                      </h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Configure your Razorpay Merchant Key ID & Key Secret to accept Cards, UPI, NetBanking, and Wallets at checkout.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded border ${
                        razorpayEnabled
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-zinc-500 bg-zinc-100 border-zinc-200'
                      }`}>
                        {razorpayEnabled ? 'Gateway Active' : 'Gateway Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">Razorpay Key ID (Public Key)</label>
                      <input
                        type="text"
                        value={razorpayKeyId}
                        onChange={(e) => setRazorpayKeyId(e.target.value)}
                        placeholder="rzp_test_... or rzp_live_..."
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono text-xs font-bold"
                      />
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        Used to initialize Razorpay Checkout popup in customer browser.
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-zinc-600 font-bold">Razorpay Key Secret (Private)</label>
                        <button
                          type="button"
                          onClick={() => setShowRzpSecret(!showRzpSecret)}
                          className="text-[10px] text-zinc-500 hover:text-zinc-900 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          {showRzpSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showRzpSecret ? 'Hide' : 'Reveal'}</span>
                        </button>
                      </div>
                      <input
                        type={showRzpSecret ? 'text' : 'password'}
                        value={razorpayKeySecret}
                        onChange={(e) => setRazorpayKeySecret(e.target.value)}
                        placeholder="Razorpay merchant secret key"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono text-xs"
                      />
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        Stored securely on the server for automated order creation & HMAC verification.
                      </span>
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">Settlement Currency</label>
                      <select
                        value={razorpayCurrency}
                        onChange={(e) => setRazorpayCurrency(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono font-bold cursor-pointer"
                      >
                        <option value="INR">INR (₹ - Indian Rupee)</option>
                        <option value="USD">USD ($ - US Dollar)</option>
                        <option value="EUR">EUR (€ - Euro)</option>
                        <option value="GBP">GBP (£ - British Pound)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">Gateway Environment Mode</label>
                      <select
                        value={razorpayMode}
                        onChange={(e) => setRazorpayMode(e.target.value as any)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono cursor-pointer"
                      >
                        <option value="test">Sandbox / Test Mode (rzp_test_...)</option>
                        <option value="live">Live Production (rzp_live_...)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer self-start sm:self-auto">
                      <input
                        type="checkbox"
                        checked={razorpayEnabled}
                        onChange={(e) => setRazorpayEnabled(e.target.checked)}
                        className="w-4 h-4 rounded text-zinc-900 focus:ring-0"
                      />
                      <span>Enable Razorpay for Client Storefront Checkouts</span>
                    </label>

                    <button
                      type="button"
                      onClick={handleSaveRazorpaySettings}
                      disabled={isSavingRzp}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 shadow-xs w-full sm:w-auto justify-center"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isSavingRzp ? 'Saving Gateway Keys...' : 'Save Razorpay Credentials'}</span>
                    </button>
                  </div>
                </div>

                {/* Personal Cloud Storage (TeleCloud API) */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                    <div>
                      <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-emerald-600" />
                        <span>Personal Cloud Storage (TeleCloud API)</span>
                      </h3>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Centralized media storage endpoint. Uploaded files return a direct link stored directly in MySQL database.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        Stored in MySQL
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="md:col-span-2">
                      <label className="block text-zinc-600 font-bold mb-1">Cloud API Endpoint URL</label>
                      <input
                        type="url"
                        value={cloudApiEndpoint}
                        onChange={(e) => setCloudApiEndpoint(e.target.value)}
                        placeholder="https://.../api/v1/upload"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono text-xs font-bold"
                      />
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        Target endpoint receiving multipart file upload with x-api-key and x-workspace-id headers.
                      </span>
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">Workspace ID</label>
                      <input
                        type="text"
                        value={cloudWorkspaceId}
                        onChange={(e) => setCloudWorkspaceId(e.target.value)}
                        placeholder="8"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono text-xs font-bold"
                      />
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        Workspace destination ID (e.g. 8 for Cornus Media Library).
                      </span>
                    </div>

                    <div className="md:col-span-3">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-zinc-600 font-bold">API Key (x-api-key)</label>
                        <button
                          type="button"
                          onClick={() => setShowCloudKey(!showCloudKey)}
                          className="text-[10px] text-zinc-500 hover:text-zinc-900 font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          {showCloudKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showCloudKey ? 'Hide Key' : 'Reveal Key'}</span>
                        </button>
                      </div>
                      <input
                        type={showCloudKey ? 'text' : 'password'}
                        value={cloudApiKey}
                        onChange={(e) => setCloudApiKey(e.target.value)}
                        placeholder="tc_live_..."
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono text-xs"
                      />
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        Stored in MySQL table store_settings. Passed securely on server-side requests.
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-100">
                    <p className="text-[11px] text-zinc-400">
                      Changes persist directly to MySQL and take effect immediately for all file uploads.
                    </p>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleTestCloudConnection(false)}
                        disabled={isTestingCloud}
                        className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 shadow-xs justify-center flex-1 sm:flex-initial transition-all"
                      >
                        <Activity className={`w-3.5 h-3.5 ${isTestingCloud ? 'animate-pulse text-amber-400' : 'text-emerald-400'}`} />
                        <span>{isTestingCloud ? 'Sending Probe...' : 'Test Connection & Check Response'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveCloudSettings()}
                        disabled={isSavingCloud}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 shadow-xs justify-center flex-1 sm:flex-initial transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isSavingCloud ? 'Saving to MySQL...' : 'Save Cloud Credentials'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Endpoint Diagnostic & Response Inspector */}
                  {cloudTestResult && (
                    <div className={`p-4 rounded-xl border transition-all ${
                      cloudTestResult.success 
                        ? 'bg-emerald-50/70 border-emerald-300' 
                        : 'bg-zinc-50 border-zinc-300'
                    } space-y-3`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                            cloudTestResult.success 
                              ? 'bg-emerald-700 text-white' 
                              : cloudTestResult.statusCode === 302
                                ? 'bg-amber-600 text-white'
                                : 'bg-red-600 text-white'
                          }`}>
                            {cloudTestResult.success ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {cloudTestResult.statusCode 
                                ? `HTTP ${cloudTestResult.statusCode} ${cloudTestResult.statusText || ''}` 
                                : 'Connection Failed'}
                            </span>
                          </span>

                          <span className="text-xs font-mono font-bold text-zinc-700 bg-white/90 px-2 py-0.5 rounded border border-zinc-200 shadow-2xs">
                            ⚡ {cloudTestResult.latencyMs}ms
                          </span>

                          <span className="text-[10px] text-zinc-400 font-mono">
                            Tested at {cloudTestResult.timestamp}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setCloudTestResult(null)}
                          className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-200/50 cursor-pointer"
                          title="Close test result"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Diagnostic details grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] font-mono bg-white/90 p-2.5 rounded-lg border border-zinc-200/80">
                        <div className="truncate">
                          <span className="text-zinc-400 block text-[9px] uppercase font-sans font-bold">Tested Endpoint</span>
                          <span className="text-zinc-800 font-semibold truncate block" title={cloudTestResult.endpoint}>{cloudTestResult.endpoint}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[9px] uppercase font-sans font-bold">Workspace ID</span>
                          <span className="text-zinc-800 font-semibold">{cloudTestResult.workspaceId}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[9px] uppercase font-sans font-bold">API Key (Masked)</span>
                          <span className="text-zinc-800 font-semibold">{cloudTestResult.apiKeyMasked || 'Configured'}</span>
                        </div>
                      </div>

                      {/* Direct Link Banner if success */}
                      {cloudTestResult.directLink && (
                        <div className="bg-white border-2 border-emerald-500/80 rounded-xl p-3 shadow-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-emerald-600" />
                              <span>Direct Link Retrieved & Stored in MySQL!</span>
                            </span>
                            {cloudTestResult.uploadId && (
                              <span className="text-[10px] font-mono text-zinc-400">
                                ID: {cloudTestResult.uploadId}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 font-mono text-xs">
                            <span className="text-zinc-800 truncate select-all">{cloudTestResult.directLink}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(cloudTestResult.directLink!);
                                  showToast('Direct link copied!');
                                }}
                                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </button>
                              <a
                                href={cloudTestResult.directLink}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-zinc-900 hover:bg-black text-white rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Open</span>
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Error or Warning alert if present */}
                      {cloudTestResult.error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs text-red-800 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="font-bold">{cloudTestResult.error}</p>
                            {cloudTestResult.statusCode === 302 && (
                              <p className="text-[11px] text-red-700 font-normal">
                                The personal cloud service returned an HTTP 302 redirect. If testing an AI Studio preview URL, it requires authentication or public access without cookie checks.
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Response Payload Inspector */}
                      <div className="bg-zinc-950 rounded-xl p-3 space-y-2 text-zinc-100 font-mono text-xs">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
                              Response Body Inspector
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowRawResponse(!showRawResponse)}
                              className="text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                            >
                              {showRawResponse ? 'Show JSON View' : 'Show Raw HTTP View'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const textToCopy = showRawResponse || !cloudTestResult.data 
                                  ? (cloudTestResult.raw || '') 
                                  : JSON.stringify(cloudTestResult.data, null, 2);
                                navigator.clipboard.writeText(textToCopy);
                                showToast('Response payload copied to clipboard!');
                              }}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy Response</span>
                            </button>
                          </div>
                        </div>

                        <div className="max-h-60 overflow-y-auto overflow-x-auto text-[11px] leading-relaxed scrollbar-thin">
                          {showRawResponse || !cloudTestResult.data ? (
                            <pre className="text-zinc-300 font-mono whitespace-pre-wrap break-all">
                              {cloudTestResult.raw || '(Empty response body)'}
                            </pre>
                          ) : (
                            <pre className="text-emerald-400 font-mono whitespace-pre-wrap">
                              {JSON.stringify(cloudTestResult.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>

                      {/* Actions footer */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleTestCloudConnection(false)}
                          disabled={isTestingCloud}
                          className="text-xs font-bold text-zinc-700 hover:text-zinc-900 flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isTestingCloud ? 'animate-spin' : ''}`} />
                          <span>Run Probe Again</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTestCloudConnection(true)}
                          disabled={isTestingCloud || isSavingCloud}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Tested Credentials to MySQL</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Direct File Upload & Test Box */}
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-zinc-700" />
                        <span className="text-xs font-bold text-zinc-800">Quick Cloud File Upload Tool</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">Max 50MB</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className="w-full sm:w-auto px-4 py-2.5 bg-white border border-zinc-300 hover:border-zinc-500 rounded-xl text-xs font-bold text-zinc-800 flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:bg-zinc-100 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingToCloud ? 'Uploading to Personal Cloud...' : 'Choose File to Upload'}</span>
                        <input
                          type="file"
                          className="hidden"
                          disabled={isUploadingToCloud}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUploadFileToCloud(file);
                          }}
                        />
                      </label>

                      {lastUploadedDirectLink && (
                        <div className="flex-1 w-full bg-white border border-emerald-300 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-2xs">
                          <div className="truncate text-xs text-zinc-800 font-mono">
                            <span className="text-emerald-700 font-bold mr-1">Direct Link:</span>
                            <span className="text-zinc-600 truncate">{lastUploadedDirectLink}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(lastUploadedDirectLink);
                                showToast('Direct link copied to clipboard!');
                              }}
                              className="px-2.5 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-black cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </button>
                            <a
                              href={lastUploadedDirectLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-zinc-500 hover:text-black rounded"
                              title="Open file"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recent Uploads from MySQL */}
                    {cloudUploadsList.length > 0 && (
                      <div className="pt-2 border-t border-zinc-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                          Recent Uploads in MySQL ({cloudUploadsList.length})
                        </span>
                        <div className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin">
                          {cloudUploadsList.map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-zinc-200 text-xs">
                              <div className="flex items-center gap-2 truncate pr-2">
                                <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                <span className="font-semibold text-zinc-800 truncate">{item.file_name}</span>
                                {item.file_size && (
                                  <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                                    {(item.file_size / 1024).toFixed(1)} KB
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(item.direct_link);
                                    showToast('Direct link copied to clipboard!');
                                  }}
                                  className="p-1 hover:bg-zinc-100 rounded text-zinc-600 cursor-pointer"
                                  title="Copy direct link"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                <a
                                  href={item.direct_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1 hover:bg-zinc-100 rounded text-zinc-600"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUpload(item.id)}
                                  className="p-1 hover:bg-red-50 rounded text-zinc-400 hover:text-red-600 cursor-pointer"
                                  title="Delete record from MySQL"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SMTP Config */}
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                      <Mail className="w-4 h-4 text-zinc-700" />
                      <span>SMTP Transactional Mailer</span>
                    </h3>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      Active Transactional Engine
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">SMTP Host</label>
                      <input
                        type="text"
                        value={settingsForm.smtpHost}
                        onChange={(e) => setSettingsForm({ ...settingsForm, smtpHost: e.target.value })}
                        placeholder="smtp.sendgrid.net"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">SMTP Port</label>
                      <input
                        type="number"
                        value={settingsForm.smtpPort}
                        onChange={(e) => setSettingsForm({ ...settingsForm, smtpPort: parseInt(e.target.value) || 587 })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">SMTP User / API Key</label>
                      <input
                        type="text"
                        value={settingsForm.smtpUser}
                        onChange={(e) => setSettingsForm({ ...settingsForm, smtpUser: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">SMTP Secret Password</label>
                      <input
                        type="password"
                        value={settingsForm.smtpPass}
                        onChange={(e) => setSettingsForm({ ...settingsForm, smtpPass: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">Sender Email</label>
                      <input
                        type="email"
                        value={settingsForm.senderEmail}
                        onChange={(e) => setSettingsForm({ ...settingsForm, senderEmail: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-bold mb-1">Sender Name</label>
                      <input
                        type="text"
                        value={settingsForm.senderName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, senderName: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900"
                      />
                    </div>
                  </div>

                  {/* Test Email Section */}
                  <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="email"
                      placeholder="Enter recipient email to test SMTP..."
                      value={testEmailAddress}
                      onChange={(e) => setTestEmailAddress(e.target.value)}
                      className="bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 w-full sm:w-80 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleTestSmtp}
                      disabled={isTestingSmtp}
                      className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isTestingSmtp ? 'Sending Test...' : 'Send Test Email'}</span>
                    </button>
                  </div>
                </div>

                {/* Save Settings Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="px-6 py-3 bg-zinc-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSavingSettings ? 'Saving Settings...' : 'Save Settings & Configurations'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 8. STAFF ROLES & ACCESS CONTROL TAB */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-zinc-900">Staff Members & Passcode PINs</h2>
                  <p className="text-xs text-zinc-500">Manage administrator roles and security PIN passcodes.</p>
                </div>
                <button
                  onClick={() => setIsAddingStaff(true)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Staff Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {staffList.map((stf) => (
                  <div key={stf.id} className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 text-sm">{stf.name}</span>
                      <span className="text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                        {stf.role}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-600 font-mono space-y-1">
                      <p>{stf.email}</p>
                      <p>Passcode PIN: <code className="text-zinc-900 font-bold bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">{stf.pin}</code></p>
                      <p className="text-emerald-700 font-bold">Status: {stf.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </main>
      </div>

      {/* --- LIGHT MODAL 1: GARMENT FORM (FULL PRODUCTION SPEC & VARIABLE PRODUCTS) --- */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 text-amber-400 flex items-center justify-center shadow-xs">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-zinc-900">
                      {editingProduct ? `Edit Garment: ${prodName || editingProduct.name}` : 'Publish New Luxury Garment'}
                    </h3>
                    <span className="text-[10px] font-mono font-bold bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded">
                      {prodHasVariants ? `VARIABLE (${prodVariantsMatrix.length} VARIANTS)` : 'SIMPLE PRODUCT'}
                    </span>
                    {prodIsPreOrder && (
                      <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        PRE-ORDER
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Comprehensive catalog management with live field validation and variant matrix generator.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddingProduct(false);
                  setEditingProduct(null);
                  navigateAdminTab('catalog');
                }}
                className="p-2 hover:bg-zinc-200/80 rounded-xl text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs Bar */}
            <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-zinc-200 bg-white overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setProductModalTab('general')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  productModalTab === 'general'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>1. General & Pricing</span>
                {(formErrors.name || formErrors.price || formErrors.originalPrice || formErrors.category) && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setProductModalTab('media')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  productModalTab === 'media'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>2. Media & Gallery</span>
                {formErrors.primaryImage && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setProductModalTab('variants')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  productModalTab === 'variants'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>3. Variants & Inventory</span>
                {(formErrors.colors || formErrors.sizes || formErrors.variants || formErrors.stock) && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setProductModalTab('specs')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  productModalTab === 'specs'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>4. Fabric & Specs</span>
              </button>

              <button
                type="button"
                onClick={() => setProductModalTab('preorder')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  productModalTab === 'preorder'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-amber-900 hover:bg-amber-50'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>5. Pre-Order Drop</span>
                {(formErrors.preOrderReleaseDate || formErrors.preOrderLimit) && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setProductModalTab('ensemble')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  productModalTab === 'ensemble'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-purple-900 hover:bg-purple-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>6. Complete The Look ({prodCompleteLookIds.length})</span>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* TAB 1: GENERAL & PRICING */}
              {productModalTab === 'general' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-700 font-bold mb-1">
                        Garment Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={prodName}
                        onChange={(e) => {
                          setProdName(e.target.value);
                          if (formTouched.name) {
                            setFormErrors(prev => ({
                              ...prev,
                              name: e.target.value.trim().length >= 3 ? '' : 'Garment name must be at least 3 characters.'
                            }));
                          }
                        }}
                        onBlur={() => setFormTouched(prev => ({ ...prev, name: true }))}
                        placeholder="e.g. Architectural Double-Breasted Wool Overcoat"
                        className={`w-full bg-zinc-50 border rounded-xl px-3.5 py-2.5 text-zinc-900 text-xs transition-colors focus:bg-white focus:outline-none ${
                          formErrors.name ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-zinc-300 focus:border-zinc-900'
                        }`}
                        required
                      />
                      {formErrors.name && (
                        <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{formErrors.name}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-bold mb-1">
                        Subtitle / Editorial Tagline
                      </label>
                      <input
                        type="text"
                        value={prodSubtitle}
                        onChange={(e) => setProdSubtitle(e.target.value)}
                        placeholder="e.g. Hand-tailored in Biella wool with architectural drop shoulders"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-zinc-900 text-xs focus:bg-white focus:border-zinc-900 focus:outline-none"
                      />
                      <p className="text-[10px] text-zinc-400 mt-1">Appears directly below the product title in editorial catalog view.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-zinc-700 font-bold mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={prodCategory}
                        onChange={(e) => {
                          setProdCategory(e.target.value);
                          if (formTouched.category) {
                            setFormErrors(prev => ({ ...prev, category: '' }));
                          }
                        }}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-zinc-900 text-xs focus:bg-white focus:border-zinc-900 focus:outline-none cursor-pointer"
                      >
                        {categoriesList.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                        {!categoriesList.some(c => c.name === prodCategory) && (
                          <option value={prodCategory}>{prodCategory}</option>
                        )}
                      </select>
                      {formErrors.category && (
                        <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-bold mb-1">
                        Gender Focus <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={prodGender}
                        onChange={(e) => setProdGender(e.target.value as any)}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-zinc-900 text-xs focus:bg-white focus:border-zinc-900 focus:outline-none cursor-pointer"
                      >
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                        <option value="Kids">Kids</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-bold mb-1">
                        Atelier Collection
                      </label>
                      <select
                        value={prodCollection}
                        onChange={(e) => setProdCollection(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2.5 text-zinc-900 text-xs focus:bg-white focus:border-zinc-900 focus:outline-none cursor-pointer font-medium"
                      >
                        <option value="Essential Collection">Essential Collection</option>
                        <option value="Urban Collection">Urban Collection</option>
                        <option value="Monochrome Collection">Monochrome Collection</option>
                        <option value="Weekend Collection">Weekend Collection</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-bold mb-1">
                        Subcategory / Silhouette
                      </label>
                      <input
                        type="text"
                        value={prodSubcategory}
                        onChange={(e) => setProdSubcategory(e.target.value)}
                        placeholder="e.g. Overcoats, Raw Denim, Knitwear"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-zinc-900 text-xs focus:bg-white focus:border-zinc-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pricing and Base Inventory */}
                  <div className="p-4.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider font-mono">
                        Commercial Pricing & Stock Taxonomy
                      </span>
                      {prodOriginalPrice && Number(prodOriginalPrice) > Number(prodPrice) && (
                        <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {Math.round(((Number(prodOriginalPrice) - Number(prodPrice)) / Number(prodOriginalPrice)) * 100)}% DISCOUNT APPLIED
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-zinc-700 font-bold mb-1">
                          Retail Price ({storeSettings.currencySymbol}) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold">
                            {storeSettings.currencySymbol}
                          </span>
                          <input
                            type="number"
                            value={prodPrice}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setProdPrice(val);
                              if (formTouched.price) {
                                setFormErrors(prev => ({
                                  ...prev,
                                  price: val > 0 ? '' : 'Retail price must be greater than ₹0.'
                                }));
                              }
                            }}
                            onBlur={() => setFormTouched(prev => ({ ...prev, price: true }))}
                            min="1"
                            step="1"
                            className={`w-full bg-white border rounded-xl pl-8 pr-3 py-2.5 text-zinc-900 font-mono font-bold text-xs focus:outline-none ${
                              formErrors.price ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-zinc-300 focus:border-zinc-900'
                            }`}
                            required
                          />
                        </div>
                        {formErrors.price && (
                          <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.price}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-zinc-700 font-bold mb-1">
                          Compare-At / MRP ({storeSettings.currencySymbol})
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold">
                            {storeSettings.currencySymbol}
                          </span>
                          <input
                            type="number"
                            value={prodOriginalPrice}
                            onChange={(e) => setProdOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="Optional"
                            min="0"
                            className="w-full bg-white border border-zinc-300 rounded-xl pl-8 pr-3 py-2.5 text-zinc-900 font-mono text-xs focus:border-zinc-900 focus:outline-none"
                          />
                        </div>
                        {formErrors.originalPrice && (
                          <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.originalPrice}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-zinc-700 font-bold mb-1">
                          Base SKU Identifier
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={prodSku}
                            onChange={(e) => setProdSku(e.target.value.toUpperCase())}
                            placeholder="CRN-M-OUT-01"
                            className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2.5 text-zinc-900 font-mono text-xs focus:border-zinc-900 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const catCode = (prodCategory || 'GAR').slice(0, 3).toUpperCase();
                              const genCode = (prodGender || 'UNI').slice(0, 1).toUpperCase();
                              setProdSku(`CRN-${genCode}-${catCode}-${Date.now().toString().slice(-4)}`);
                            }}
                            className="px-2.5 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-[10px] font-bold cursor-pointer transition-colors shrink-0"
                            title="Generate SKU Code"
                          >
                            Auto
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-700 font-bold mb-1">
                          Base Stock Units {prodHasVariants && '(Summed from Matrix)'}
                        </label>
                        <input
                          type="number"
                          value={prodStock}
                          onChange={(e) => setProdStock(Number(e.target.value))}
                          disabled={prodHasVariants}
                          min="0"
                          className={`w-full border rounded-xl px-3.5 py-2.5 text-zinc-900 font-mono font-bold text-xs focus:outline-none ${
                            prodHasVariants ? 'bg-zinc-200/60 border-zinc-200 text-zinc-500 cursor-not-allowed' : 'bg-white border-zinc-300 focus:border-zinc-900'
                          }`}
                        />
                        {prodHasVariants && (
                          <p className="text-[10px] text-zinc-400 mt-1">Calculated automatically from variant matrix</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Merchandising Flags */}
                  <div className="flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-800 select-none">
                      <input
                        type="checkbox"
                        checked={prodIsNew}
                        onChange={(e) => setProdIsNew(e.target.checked)}
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                      <span>Mark as New Season Drop</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-800 select-none">
                      <input
                        type="checkbox"
                        checked={prodIsTrending}
                        onChange={(e) => setProdIsTrending(e.target.checked)}
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                      <span>Mark as Trending / Best Seller</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-800 select-none">
                      <input
                        type="checkbox"
                        checked={prodIsBestSeller}
                        onChange={(e) => setProdIsBestSeller(e.target.checked)}
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                      <span>Featured Atelier Showcase</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: MEDIA & GALLERY */}
              {productModalTab === 'media' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <CloudImageUploader
                        label="Primary Garment Image *"
                        sublabel="Main catalog visual, collection thumbnail & search image"
                        value={prodImages}
                        onChange={(val) => {
                          setProdImages(val);
                          if (formTouched.primaryImage) {
                            setFormErrors(prev => ({ ...prev, primaryImage: '' }));
                          }
                        }}
                        required
                        adminPin={adminPin}
                        showToast={showToast}
                        cloudWorkspaceId={cloudWorkspaceId}
                        aspectRatio="portrait"
                      />
                      {formErrors.primaryImage && (
                        <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{formErrors.primaryImage}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <CloudImageUploader
                        label="Secondary Hover Image (Editorial Angle)"
                        sublabel="Revealed smoothly when shoppers hover on garment cards"
                        value={prodSecondaryImage}
                        onChange={setProdSecondaryImage}
                        adminPin={adminPin}
                        showToast={showToast}
                        cloudWorkspaceId={cloudWorkspaceId}
                        aspectRatio="portrait"
                      />
                    </div>
                  </div>

                  {/* Multi-Angle Gallery Section */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-zinc-900 block">
                          Multi-Angle Editorial Gallery ({prodExtraImages.length} Additional Shots)
                        </span>
                        <p className="text-[11px] text-zinc-400">
                          Upload lookbook angles, fabric drape closeups, or lifestyle shots directly to your personal cloud.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProdExtraImages([...prodExtraImages, ''])}
                        className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Gallery Shot</span>
                      </button>
                    </div>

                    {prodExtraImages.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                        {prodExtraImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                                Look Angle #{idx + 3}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setProdExtraImages(prodExtraImages.filter((_, i) => i !== idx));
                                }}
                                className="p-1 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Delete angle"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <CloudImageUploader
                              label={`Gallery Angle #${idx + 3}`}
                              value={imgUrl}
                              onChange={(newUrl) => {
                                const updated = [...prodExtraImages];
                                updated[idx] = newUrl;
                                setProdExtraImages(updated);
                              }}
                              adminPin={adminPin}
                              showToast={showToast}
                              cloudWorkspaceId={cloudWorkspaceId}
                              aspectRatio="portrait"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: VARIABLE PRODUCTS & VARIANTS MATRIX */}
              {productModalTab === 'variants' && (
                <div className="space-y-6">
                  {/* Mode Switch: Simple vs Variable Product */}
                  <div className="p-4.5 rounded-2xl bg-blue-50/60 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Grid className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-blue-950 block">
                          Variable Product (Multi-Size & Color Variants Matrix)
                        </span>
                        <p className="text-[11px] text-blue-800/80">
                          Enable matrix creation for garments with size-specific pricing, individual SKUs, and per-variant stock tracking.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={prodHasVariants}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setProdHasVariants(checked);
                          if (checked && prodVariantsMatrix.length === 0) {
                            generateVariantCombinations();
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Section A: Color Palette Swatches */}
                  <div className="p-4.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-zinc-700" />
                        <span className="text-xs font-bold text-zinc-900">Color Swatches Palette ({prodColorsList.length})</span>
                      </div>
                      {formErrors.colors && (
                        <span className="text-[11px] text-red-600 font-semibold">{formErrors.colors}</span>
                      )}
                    </div>

                    {/* Active Colors Chips */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {prodColorsList.map((col, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 shadow-2xs text-xs font-medium text-zinc-800"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{col.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = prodColorsList.filter((_, i) => i !== idx);
                              setProdColorsList(updated);
                            }}
                            className="text-zinc-400 hover:text-red-600 ml-1 p-0.5 rounded cursor-pointer"
                            title="Remove color"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick Preset Palette Adders */}
                    <div className="pt-2 border-t border-zinc-200/60">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block mb-1.5">
                        Quick Luxury Color Presets:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {COLOR_PALETTE_PRESETS.map((pCol) => {
                          const isAdded = prodColorsList.some(c => c.name.toLowerCase() === pCol.name.toLowerCase());
                          return (
                            <button
                              key={pCol.name}
                              type="button"
                              onClick={() => {
                                if (isAdded) {
                                  setProdColorsList(prodColorsList.filter(c => c.name.toLowerCase() !== pCol.name.toLowerCase()));
                                } else {
                                  setProdColorsList([...prodColorsList, { name: pCol.name, hex: pCol.hex, imageIndex: prodColorsList.length }]);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                                isAdded ? 'bg-zinc-900 text-white font-bold' : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: pCol.hex }} />
                              <span>{pCol.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Custom Color Adder */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-300 p-0.5"
                        title="Pick custom hex"
                      />
                      <input
                        type="text"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        placeholder="Custom color name (e.g. Sage Green)"
                        className="flex-1 bg-white border border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newColorName.trim()) return;
                          setProdColorsList([
                            ...prodColorsList,
                            { name: newColorName.trim(), hex: newColorHex, imageIndex: prodColorsList.length }
                          ]);
                          setNewColorName('');
                        }}
                        className="px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
                      >
                        Add Color
                      </button>
                    </div>
                  </div>

                  {/* Section B: Size Matrix Curves */}
                  <div className="p-4.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-zinc-700" />
                        <span className="text-xs font-bold text-zinc-900">Garment Sizing Options ({prodSizesList.length})</span>
                      </div>
                      {formErrors.sizes && (
                        <span className="text-[11px] text-red-600 font-semibold">{formErrors.sizes}</span>
                      )}
                    </div>

                    {/* Active Sizes Chips */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {prodSizesList.map((sz, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-zinc-200 shadow-2xs text-xs font-mono font-bold text-zinc-800"
                        >
                          <span>{sz}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = prodSizesList.filter((_, i) => i !== idx);
                              setProdSizesList(updated);
                            }}
                            className="text-zinc-400 hover:text-red-600 ml-1 p-0.5 rounded cursor-pointer"
                            title="Remove size"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick Size Curves Presets */}
                    <div className="pt-2 border-t border-zinc-200/60">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block mb-1.5">
                        Quick Sizing Curves:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setProdSizesList(SIZE_PRESETS.standard)}
                          className="px-3 py-1 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Alpha (XS, S, M, L, XL, XXL)
                        </button>
                        <button
                          type="button"
                          onClick={() => setProdSizesList(SIZE_PRESETS.trousers)}
                          className="px-3 py-1 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Waist (28 - 38)
                        </button>
                        <button
                          type="button"
                          onClick={() => setProdSizesList(SIZE_PRESETS.footwear)}
                          className="px-3 py-1 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Footwear (EU 39 - 45)
                        </button>
                        <button
                          type="button"
                          onClick={() => setProdSizesList(SIZE_PRESETS.onesize)}
                          className="px-3 py-1 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          One Size Only
                        </button>
                      </div>
                    </div>

                    {/* Custom Size Adder */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={newSizeInput}
                        onChange={(e) => setNewSizeInput(e.target.value)}
                        placeholder="Custom size (e.g. 42R, Custom Bespoke)"
                        className="flex-1 bg-white border border-zinc-300 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newSizeInput.trim()) return;
                          if (!prodSizesList.includes(newSizeInput.trim())) {
                            setProdSizesList([...prodSizesList, newSizeInput.trim()]);
                          }
                          setNewSizeInput('');
                        }}
                        className="px-3.5 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shrink-0"
                      >
                        Add Size
                      </button>
                    </div>
                  </div>

                  {/* Section C: Complete Variants Matrix Table (When Variable Product is ON) */}
                  {prodHasVariants && (
                    <div className="p-4.5 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-zinc-900">
                              Generated Variants Matrix ({prodVariantsMatrix.length} Total SKUs)
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400">
                            Configure individual retail pricing, stock units, and SKUs per variant combination.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => generateVariantCombinations()}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Regenerate Matrix</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setProdVariantsMatrix([])}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                          >
                            Clear Matrix
                          </button>
                        </div>
                      </div>

                      {/* Bulk Modifier Bar */}
                      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 flex items-center gap-3 flex-wrap">
                        <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase">
                          Bulk Matrix Actions:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            placeholder="Set Price ₹"
                            value={variantBulkPrice}
                            onChange={(e) => setVariantBulkPrice(e.target.value)}
                            className="w-24 bg-white border border-zinc-300 rounded-lg px-2 py-1 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!variantBulkPrice) return;
                              const pNum = Number(variantBulkPrice);
                              const updated = prodVariantsMatrix.map(v => ({ ...v, price: pNum }));
                              setProdVariantsMatrix(updated);
                              showToast(`Updated price on ${updated.length} variants.`);
                            }}
                            className="px-2.5 py-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Apply Price
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            placeholder="Set Stock"
                            value={variantBulkStock}
                            onChange={(e) => setVariantBulkStock(e.target.value)}
                            className="w-24 bg-white border border-zinc-300 rounded-lg px-2 py-1 text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!variantBulkStock) return;
                              const sNum = Number(variantBulkStock);
                              const updated = prodVariantsMatrix.map(v => ({ ...v, stockCount: sNum, inStock: sNum > 0 }));
                              setProdVariantsMatrix(updated);
                              const sumStock = updated.reduce((sum, v) => sum + sNum, 0);
                              setProdStock(sumStock);
                              showToast(`Updated stock on ${updated.length} variants.`);
                            }}
                            className="px-2.5 py-1 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Apply Stock
                          </button>
                        </div>
                      </div>

                      {/* Variants Matrix Table */}
                      {prodVariantsMatrix.length > 0 ? (
                        <div className="overflow-x-auto border border-zinc-200 rounded-xl">
                          <table className="w-full text-left text-xs text-zinc-700">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] uppercase font-mono font-bold text-zinc-500">
                              <tr>
                                <th className="p-3">Color Swatch</th>
                                <th className="p-3">Size</th>
                                <th className="p-3">Variant SKU</th>
                                <th className="p-3">Price ({storeSettings.currencySymbol})</th>
                                <th className="p-3">Stock Units</th>
                                <th className="p-3">In Stock</th>
                                <th className="p-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 font-medium">
                              {prodVariantsMatrix.map((variant, idx) => {
                                const colMatch = prodColorsList.find(c => c.name.toLowerCase() === variant.color.toLowerCase());
                                return (
                                  <tr key={variant.id || idx} className="hover:bg-zinc-50/60 transition-colors">
                                    <td className="p-3">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                                          style={{ backgroundColor: colMatch?.hex || '#111' }}
                                        />
                                        <span className="font-bold text-zinc-900">{variant.color}</span>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded font-mono font-bold text-zinc-800">
                                        {variant.size}
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      <input
                                        type="text"
                                        value={variant.sku}
                                        onChange={(e) => {
                                          const updated = [...prodVariantsMatrix];
                                          updated[idx].sku = e.target.value.toUpperCase();
                                          setProdVariantsMatrix(updated);
                                        }}
                                        className="w-36 bg-white border border-zinc-300 rounded-lg px-2 py-1 font-mono text-xs focus:outline-none focus:border-zinc-900"
                                      />
                                    </td>
                                    <td className="p-3">
                                      <div className="relative w-28">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 font-mono">
                                          {storeSettings.currencySymbol}
                                        </span>
                                        <input
                                          type="number"
                                          value={variant.price !== undefined ? variant.price : prodPrice}
                                          onChange={(e) => {
                                            const updated = [...prodVariantsMatrix];
                                            updated[idx].price = Number(e.target.value);
                                            setProdVariantsMatrix(updated);
                                          }}
                                          className="w-full bg-white border border-zinc-300 rounded-lg pl-6 pr-2 py-1 font-mono font-bold text-xs focus:outline-none focus:border-zinc-900"
                                        />
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <input
                                        type="number"
                                        value={variant.stockCount}
                                        min="0"
                                        onChange={(e) => {
                                          const updated = [...prodVariantsMatrix];
                                          const count = Number(e.target.value);
                                          updated[idx].stockCount = count;
                                          updated[idx].inStock = count > 0;
                                          setProdVariantsMatrix(updated);
                                          const total = updated.reduce((s, v) => s + (Number(v.stockCount) || 0), 0);
                                          setProdStock(total);
                                        }}
                                        className="w-20 bg-white border border-zinc-300 rounded-lg px-2 py-1 font-mono font-bold text-xs focus:outline-none focus:border-zinc-900"
                                      />
                                    </td>
                                    <td className="p-3">
                                      <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={variant.inStock}
                                          onChange={(e) => {
                                            const updated = [...prodVariantsMatrix];
                                            updated[idx].inStock = e.target.checked;
                                            setProdVariantsMatrix(updated);
                                          }}
                                          className="sr-only peer"
                                        />
                                        <div className="w-8 h-4 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                                      </label>
                                    </td>
                                    <td className="p-3 text-right">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = prodVariantsMatrix.filter((_, i) => i !== idx);
                                          setProdVariantsMatrix(updated);
                                          const total = updated.reduce((s, v) => s + (Number(v.stockCount) || 0), 0);
                                          setProdStock(total);
                                        }}
                                        className="p-1 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                                        title="Delete variant"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-6 text-center bg-zinc-50 rounded-xl border border-dashed border-zinc-300 space-y-2">
                          <p className="text-zinc-600 font-bold">No variants matrix generated yet.</p>
                          <p className="text-[11px] text-zinc-400">Click below to generate all combinations of your selected colors and sizes.</p>
                          <button
                            type="button"
                            onClick={() => generateVariantCombinations()}
                            className="px-4 py-2 bg-zinc-900 text-white font-bold rounded-xl text-xs hover:bg-black transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5 mt-2"
                          >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>⚡ Generate Variants Matrix</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SPECIFICATIONS & FABRIC */}
              {productModalTab === 'specs' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-700 font-bold mb-1">
                        Materials & Fabric Composition
                      </label>
                      <input
                        type="text"
                        value={prodMaterials}
                        onChange={(e) => setProdMaterials(e.target.value)}
                        placeholder="e.g. 100% Super 130s Italian Virgin Wool from Biella"
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-zinc-900 text-xs focus:bg-white focus:border-zinc-900 focus:outline-none"
                      />
                      <p className="text-[10px] text-zinc-400 mt-1">Fiber pedigree, mill origin, weave density, or lining details.</p>
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-bold mb-1">
                        Care Instructions
                      </label>
                      <input
                        type="text"
                        value={prodCare}
                        onChange={(e) => setProdCare(e.target.value)}
                        placeholder="e.g. Dry clean only by luxury garment specialist. Cool iron on reverse."
                        className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-zinc-900 text-xs focus:bg-white focus:border-zinc-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">
                      Architectural Details & Craftsmanship Highlights (One per line)
                    </label>
                    <textarea
                      value={prodDetails}
                      onChange={(e) => setProdDetails(e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-zinc-900 text-xs focus:bg-white focus:border-zinc-900 focus:outline-none font-mono"
                      placeholder="Hand-finished Italian seams&#10;Architectural tailored cut&#10;Signature Cornus silk-blend lining"
                    />
                    <p className="text-[10px] text-zinc-400 mt-1">Enter key structural points shown in the product specifications drawer.</p>
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">
                      Full Editorial Garment Description
                    </label>
                    <textarea
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      rows={4}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3.5 text-zinc-900 text-xs focus:bg-white focus:border-zinc-900 focus:outline-none"
                      placeholder="Meticulously engineered in our European atelier, this garment reconciles timeless sartorial elegance with sharp modernist architectural geometry..."
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: PRE-ORDER ATELIER DROP */}
              {productModalTab === 'preorder' && (
                <div className="space-y-5">
                  <div className="p-4.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-amber-950 block">Pre-Order Reservation Mode</span>
                          <p className="text-[11px] text-amber-800/80">
                            Allow clientele to reserve made-to-order garments, runway previews, or high-demand releases before production closes.
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prodIsPreOrder}
                          onChange={(e) => {
                            setProdIsPreOrder(e.target.checked);
                            if (e.target.checked && !prodPreOrderReleaseDate) {
                              const date = new Date();
                              date.setDate(date.getDate() + 21);
                              setProdPreOrderReleaseDate(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                      </label>
                    </div>

                    {prodIsPreOrder && (
                      <div className="pt-3 border-t border-amber-200/80 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-amber-900 font-bold text-xs mb-1">
                              Expected Dispatch Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={prodPreOrderReleaseDate}
                              onChange={(e) => setProdPreOrderReleaseDate(e.target.value)}
                              placeholder="e.g. Nov 25, 2026"
                              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none font-mono ${
                                formErrors.preOrderReleaseDate ? 'border-red-500 ring-1 ring-red-500' : 'border-amber-300 focus:border-amber-600'
                              }`}
                              required={prodIsPreOrder}
                            />
                            {formErrors.preOrderReleaseDate && (
                              <p className="text-[11px] text-red-600 font-semibold mt-1">{formErrors.preOrderReleaseDate}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-amber-900 font-bold text-xs mb-1">
                              Production Allocation Cap
                            </label>
                            <input
                              type="number"
                              value={prodPreOrderLimit}
                              onChange={(e) => setProdPreOrderLimit(Number(e.target.value))}
                              placeholder="50"
                              min="0"
                              className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-amber-600 font-mono font-bold"
                            />
                            <p className="text-[10px] text-amber-800/70 mt-1">Maximum pre-orders allowed before sold out</p>
                          </div>

                          <div>
                            <label className="block text-amber-900 font-bold text-xs mb-1">
                              Pre-Orders Already Booked
                            </label>
                            <input
                              type="number"
                              value={prodPreOrderCount}
                              onChange={(e) => setProdPreOrderCount(Number(e.target.value))}
                              placeholder="0"
                              min="0"
                              className="w-full bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-amber-600 font-mono font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-amber-900 font-bold text-xs mb-1">
                            Atelier Pre-Order Dispatch Promise & Guarantee
                          </label>
                          <textarea
                            value={prodPreOrderMessage}
                            onChange={(e) => setProdPreOrderMessage(e.target.value)}
                            rows={2}
                            placeholder="Handcrafted to order by master tailors in our European atelier. Full refund guarantee if not dispatched on schedule."
                            className="w-full bg-white border border-amber-300 rounded-xl p-3 text-xs text-zinc-900 focus:outline-none focus:border-amber-600 placeholder:text-amber-800/40"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: COMPLETE THE LOOK */}
              {productModalTab === 'ensemble' && (
                <div className="space-y-5">
                  <div className="p-4.5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-xs">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-purple-950 block">Complete The Look (Curated Ensemble Bundling)</span>
                          <p className="text-[11px] text-purple-800/80">
                            Pair this garment with complementary footwear, trousers, or jewelry to increase Average Order Value (AOV).
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-300">
                        {prodCompleteLookIds.length} Companion Pieces
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      <div className="sm:col-span-2">
                        <label className="block text-purple-900 font-bold text-xs mb-1">
                          Search Catalog to Pair Companion Garment
                        </label>
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={completeLookSearch}
                            onChange={(e) => setCompleteLookSearch(e.target.value)}
                            placeholder="Type garment name or category to search..."
                            className="w-full bg-white border border-purple-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-purple-600"
                          />
                        </div>

                        {/* Search Results Dropdown */}
                        {completeLookSearch.trim().length > 0 && (
                          <div className="mt-2 bg-white border border-purple-200 rounded-xl max-h-48 overflow-y-auto p-2 space-y-1 shadow-md">
                            {products
                              .filter(p =>
                                (!editingProduct || p.id !== editingProduct.id) &&
                                !prodCompleteLookIds.includes(p.id) &&
                                (p.name.toLowerCase().includes(completeLookSearch.toLowerCase()) ||
                                 p.category.toLowerCase().includes(completeLookSearch.toLowerCase()))
                              )
                              .slice(0, 5)
                              .map(item => (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    setProdCompleteLookIds([...prodCompleteLookIds, item.id]);
                                    setCompleteLookSearch('');
                                  }}
                                  className="flex items-center justify-between p-2 hover:bg-purple-50 rounded-lg cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <img
                                      src={item.images[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=100&q=80'}
                                      alt={item.name}
                                      className="w-8 h-10 object-cover rounded border border-zinc-200"
                                    />
                                    <div>
                                      <p className="text-xs font-bold text-zinc-900">{item.name}</p>
                                      <p className="text-[10px] text-zinc-500 font-mono">
                                        {item.category} • {storeSettings.currencySymbol}{item.price.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Pair</span>
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-purple-900 font-bold text-xs mb-1">
                          Ensemble Bundle Discount (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max="80"
                            value={prodCompleteLookDiscount}
                            onChange={(e) => setProdCompleteLookDiscount(Number(e.target.value))}
                            className="w-full bg-white border border-purple-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-mono font-bold focus:outline-none focus:border-purple-600"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-purple-700">% OFF</span>
                        </div>
                      </div>
                    </div>

                    {/* Selected Companion Pieces Grid */}
                    {prodCompleteLookIds.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-purple-950 font-bold block">
                          Paired Ensemble Pieces ({prodCompleteLookIds.length}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {prodCompleteLookIds.map((lookId) => {
                            const companion = products.find(p => p.id === lookId);
                            if (!companion) return null;
                            return (
                              <div key={lookId} className="flex items-center justify-between bg-white p-3 rounded-xl border border-purple-200 shadow-2xs">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={companion.images[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=100&q=80'}
                                    alt={companion.name}
                                    className="w-9 h-11 object-cover rounded-lg border border-zinc-200"
                                  />
                                  <div>
                                    <p className="text-xs font-bold text-zinc-900 truncate max-w-[160px]">{companion.name}</p>
                                    <p className="text-[11px] text-zinc-500 font-mono">
                                      {storeSettings.currencySymbol}{companion.price.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setProdCompleteLookIds(prodCompleteLookIds.filter(id => id !== lookId))}
                                  className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                                  title="Remove piece"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-purple-900 font-bold text-xs mb-1">
                        Atelier Stylist Directive & Silhouette Note
                      </label>
                      <textarea
                        value={prodCompleteLookNote}
                        onChange={(e) => setProdCompleteLookNote(e.target.value)}
                        rows={2}
                        placeholder="e.g. Pair with the Raw Silk Trouser and Calfskin Loafer for an understated architectural silhouette."
                        className="w-full bg-white border border-purple-300 rounded-xl p-3 text-xs text-zinc-900 focus:outline-none focus:border-purple-600 placeholder:text-purple-800/40"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Alert Footer Banner (if errors exist) */}
              {Object.keys(formErrors).filter(k => formErrors[k]).length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span className="font-semibold text-xs">
                    Please correct the following before saving: {Object.values(formErrors).filter(Boolean).join(' • ')}
                  </span>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-zinc-200 shrink-0">
                <div className="flex items-center gap-2 text-zinc-500 font-mono text-[11px]">
                  <span>Step: {productModalTab.toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProduct(null);
                      navigateAdminTab('catalog');
                    }}
                    className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="px-6 py-2.5 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl text-xs cursor-pointer shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isSavingProduct ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    ) : (
                      <Check className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>{editingProduct ? 'Update Garment in MySQL' : 'Publish Garment to MySQL'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIGHT MODAL: CSV / EXCEL IMPORT WITH FIELD MAPPING & AUTO-CATEGORY PROVISIONING --- */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-3xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Bulk Import Garments (CSV / Excel)</h3>
                  <p className="text-xs text-zinc-500">Import multiple products directly into MySQL with interactive field mapping.</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: File Upload Box */}
            <div className="p-4 bg-zinc-50 border border-dashed border-zinc-300 rounded-xl text-center space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
                id="spreadsheet-input"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="w-8 h-8 text-zinc-400" />
                <div>
                  <label
                    htmlFor="spreadsheet-input"
                    className="px-4 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Choose CSV or Excel File (.xlsx, .csv)</span>
                  </label>
                  <p className="text-[11px] text-zinc-500 mt-1.5">
                    {importFileName ? (
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {importFileName} ({importRawRows.length} rows detected)
                      </span>
                    ) : (
                      'Supported formats: CSV, XLSX, XLS with column headers.'
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1.5 underline decoration-zinc-300 hover:decoration-zinc-900 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV Template with All Fields</span>
                </button>
              </div>
            </div>

            {/* Smart Category Auto-Creation Callout Notice */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Automated Category Management:</span>
                <span className="text-amber-800 ml-1">
                  If your spreadsheet contains a Category column, any category that does not exist in MySQL will be automatically created on import, while existing categories will be instantly matched.
                </span>
              </div>
            </div>

            {/* Step 2: Interactive Field Mapping */}
            {importHeaders.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Map Spreadsheet Columns to MySQL Database Fields</h4>
                  <span className="text-[11px] font-mono text-zinc-500">{importHeaders.length} headers available</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-white border border-zinc-200 rounded-xl p-4 text-xs">
                  {[
                    { key: 'name', label: 'Garment Name *', required: true },
                    { key: 'price', label: 'Price (₹) *', required: true },
                    { key: 'category', label: 'Category (Auto-created if new)', required: false },
                    { key: 'gender', label: 'Gender (Men / Women / Kids / Unisex)', required: false },
                    { key: 'subcategory', label: 'Subcategory (e.g. Coats, Knitwear)', required: false },
                    { key: 'sku', label: 'SKU / Barcode', required: false },
                    { key: 'stock', label: 'Inventory / Stock Count', required: false },
                    { key: 'subtitle', label: 'Subtitle / Tagline', required: false },
                    { key: 'description', label: 'Description', required: false },
                    { key: 'materials', label: 'Materials Composition', required: false },
                    { key: 'images', label: 'Images (URL or Comma-separated)', required: false },
                    { key: 'sizes', label: 'Sizes (e.g. S, M, L, XL)', required: false },
                    { key: 'colors', label: 'Colors (e.g. Black, Camel)', required: false },
                  ].map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="block text-[11px] font-bold text-zinc-700 truncate">
                        {field.label}
                      </label>
                      <select
                        value={fieldMappings[field.key] || ''}
                        onChange={(e) => setFieldMappings({ ...fieldMappings, [field.key]: e.target.value })}
                        className={`w-full bg-zinc-50 border rounded-xl px-2.5 py-1.5 text-xs text-zinc-900 focus:bg-white focus:outline-none cursor-pointer ${
                          field.required && !fieldMappings[field.key]
                            ? 'border-red-300 bg-red-50/30'
                            : fieldMappings[field.key]
                            ? 'border-emerald-300 font-semibold bg-emerald-50/20'
                            : 'border-zinc-200'
                        }`}
                      >
                        <option value="">-- None / Default --</option>
                        {importHeaders.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Step 3: Preview First 3 Mapped Rows */}
                {importRawRows.length > 0 && fieldMappings.name && (
                  <div className="space-y-2 pt-2">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Live Mapping Preview (First 3 Rows)</h5>
                    <div className="overflow-x-auto border border-zinc-200 rounded-xl">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-zinc-100 text-zinc-600 font-mono text-[10px] font-bold uppercase">
                          <tr>
                            <th className="p-2.5">Name</th>
                            <th className="p-2.5">Price</th>
                            <th className="p-2.5">Category</th>
                            <th className="p-2.5">Gender</th>
                            <th className="p-2.5">SKU</th>
                            <th className="p-2.5">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {importRawRows.slice(0, 3).map((r, i) => (
                            <tr key={i} className="hover:bg-zinc-50">
                              <td className="p-2.5 font-bold text-zinc-900">{r[fieldMappings.name] || 'N/A'}</td>
                              <td className="p-2.5 font-mono text-zinc-800">₹{r[fieldMappings.price] || '0'}</td>
                              <td className="p-2.5">
                                <span className="bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded font-mono font-semibold">
                                  {r[fieldMappings.category] || 'Outerwear'}
                                </span>
                              </td>
                              <td className="p-2.5 text-zinc-600">{r[fieldMappings.gender] || 'Unisex'}</td>
                              <td className="p-2.5 font-mono text-zinc-500">{r[fieldMappings.sku] || `AUTO-${i + 1}`}</td>
                              <td className="p-2.5 font-mono text-zinc-700">{r[fieldMappings.stock] || 10}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Import Execution Result Feedback */}
            {importResult && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Database Import Successful!</span>
                </div>
                <p>
                  Inserted <strong>{importResult.imported}</strong> new garments and updated <strong>{importResult.updated}</strong> existing products in MySQL.
                </p>
                {importResult.categoriesCreated.length > 0 && (
                  <p className="font-mono text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-1">
                    Auto-created {importResult.categoriesCreated.length} new categories: <strong>{importResult.categoriesCreated.join(', ')}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
              <span className="text-xs text-zinc-500 font-mono">
                {importRawRows.length > 0 ? `${importRawRows.length} total rows ready` : 'Upload a file to begin'}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={isExecutingImport || importRawRows.length === 0 || !fieldMappings.name || !fieldMappings.price}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-200 disabled:text-zinc-400 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md flex items-center gap-2 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{isExecutingImport ? 'Importing into MySQL...' : `Import ${importRawRows.length} Products to MySQL`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LIGHT MODAL 2: CATEGORY FORM --- */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-900">{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-600 font-bold mb-1">Category Title</label>
                <input
                  type="text"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Outerwear & Coats"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">Slug</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="outerwear-coats"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">Subtitle Tagline</label>
                <input
                  type="text"
                  value={catSubtitle}
                  onChange={(e) => setCatSubtitle(e.target.value)}
                  placeholder="Tailored Virgin Wool Coats"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white"
                />
              </div>

              <CloudImageUploader
                label="Category Cover Imagery"
                sublabel="Featured navigation background and catalog collection cover"
                value={catImage}
                onChange={setCatImage}
                adminPin={adminPin}
                showToast={showToast}
                cloudWorkspaceId={cloudWorkspaceId}
                aspectRatio="wide"
              />

              <div>
                <label className="block text-zinc-600 font-bold mb-1">Menu Order</label>
                <input
                  type="number"
                  value={catOrder}
                  onChange={(e) => setCatOrder(parseInt(e.target.value) || 1)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIGHT MODAL 3: CUSTOMER PROFILE --- */}
      {selectedCustomerDetail && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">{selectedCustomerDetail.name}</h3>
                <p className="text-xs text-zinc-500 font-mono">{selectedCustomerDetail.email}</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                selectedCustomerDetail.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {selectedCustomerDetail.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-50 p-4 rounded-xl border border-zinc-200/80">
              <div>
                <span className="text-zinc-500 block font-mono">Total Spend</span>
                <span className="text-lg font-black text-zinc-900 font-mono">{storeSettings.currencySymbol}{selectedCustomerDetail.totalSpent.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-zinc-500 block font-mono font-bold">Orders Placed</span>
                <span className="text-lg font-black text-zinc-900 font-mono">{selectedCustomerDetail.ordersCount} orders</span>
              </div>
              <div>
                <span className="text-zinc-500 block font-mono">Phone Line</span>
                <span className="text-zinc-800 font-semibold">{selectedCustomerDetail.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block font-mono">Customer Since</span>
                <span className="text-zinc-800 font-semibold">{selectedCustomerDetail.createdAt}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCustomerDetail(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- PERSISTENT CART INSPECTION MODAL --- */}
      {selectedPersistentCartModal && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    {selectedPersistentCartModal.userName || selectedPersistentCartModal.userEmail || 'Guest Shopper Bag'}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Session: {selectedPersistentCartModal.sessionId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPersistentCartModal(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs bg-zinc-50 p-3 rounded-xl border border-zinc-200/80 font-mono">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Total Basket Value</span>
                <span className="text-base font-black text-zinc-900">
                  {storeSettings.currencySymbol}{selectedPersistentCartModal.cartSubtotal.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Garments Saved</span>
                <span className="text-sm font-bold text-zinc-900">
                  {selectedPersistentCartModal.itemCount} items
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Status</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  selectedPersistentCartModal.isAbandoned 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  {selectedPersistentCartModal.isAbandoned ? 'Abandoned' : 'Active Browsing'}
                </span>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                Itemized Basket Contents:
              </span>
              {selectedPersistentCartModal.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between bg-zinc-50 p-3 rounded-xl border border-zinc-200/60">
                  <div className="flex items-center gap-3">
                    <img
                      src={it.product?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80'}
                      alt={it.product?.name || 'Garment'}
                      className="w-10 h-12 object-cover rounded-lg border border-zinc-200"
                    />
                    <div>
                      <p className="font-bold text-zinc-900 text-xs">{it.product?.name}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        Size: {it.selectedSize} | Color: {it.selectedColor?.name || 'Default'} | Qty: {it.quantity}
                      </p>
                      {it.isPreOrder && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-mono font-bold mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          Pre-Order (Ships {it.preOrderReleaseDate || 'Soon'})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-black text-zinc-900 text-xs">
                      {storeSettings.currencySymbol}{((it.product?.price || 0) * it.quantity).toLocaleString()}
                    </span>
                    <p className="text-[10px] text-zinc-400">{storeSettings.currencySymbol}{(it.product?.price || 0).toLocaleString()} ea</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  handleDeletePersistentCart(selectedPersistentCartModal.id);
                  setSelectedPersistentCartModal(null);
                }}
                className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors font-bold cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Cart</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPersistentCartModal(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- LIGHT MODAL 4: DISCOUNT FORM --- */}
      {isAddingDiscount && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Create Promotional Coupon</h3>
                  <p className="text-[11px] text-zinc-500">Save new promo voucher directly to MySQL database</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingDiscount(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDiscount} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 font-bold mb-1">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={discCode}
                  onChange={(e) => setDiscCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                  placeholder="e.g. VIP2026, FESTIVE25, FLAT1000"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono font-black text-sm tracking-wider uppercase"
                  required
                  autoFocus
                />
                <p className="text-[10px] text-zinc-400 mt-1 font-mono">Clients will type this exact code during checkout</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Deduction Type</label>
                  <select
                    value={discType}
                    onChange={(e) => setDiscType(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 focus:bg-white focus:border-zinc-900 font-medium cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Flat Deduction ({storeSettings.currencySymbol})</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    {discType === 'percentage' ? 'Discount Rate (%)' : `Deduction (${storeSettings.currencySymbol})`} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={discValue}
                    onChange={(e) => setDiscValue(Math.max(1, Number(e.target.value)))}
                    min={1}
                    max={discType === 'percentage' ? 100 : 500000}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono font-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    Min Bag Spend ({storeSettings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={discMinSpend}
                    onChange={(e) => setDiscMinSpend(Math.max(0, Number(e.target.value)))}
                    min={0}
                    placeholder="0"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono font-medium"
                  />
                  <span className="text-[10px] text-zinc-400">0 = No minimum</span>
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    value={discMaxUses}
                    onChange={(e) => setDiscMaxUses(Math.max(1, Number(e.target.value)))}
                    min={1}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono font-medium"
                  />
                  <span className="text-[10px] text-zinc-400">Usage limit cap</span>
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={discExpiresAt}
                  onChange={(e) => setDiscExpiresAt(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-900 focus:bg-white focus:border-zinc-900 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddingDiscount(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingDiscount}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl cursor-pointer shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingDiscount ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to MySQL...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Coupon Code</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIGHT MODAL 5: REFUND PROCESSOR --- */}
      {refundingOrder && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-900">Process Client Refund</h3>
            <p className="text-xs text-zinc-500">Refunding Order <span className="font-mono font-bold text-zinc-900">#{refundingOrder.id}</span> placed by {refundingOrder.shippingAddress.fullName}.</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 font-bold mb-1">Refund Amount ($)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  max={refundingOrder.total}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white font-mono text-base font-bold text-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">Reason</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-zinc-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRefundingOrder(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl cursor-pointer text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessRefund}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl cursor-pointer text-xs"
              >
                Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- LIGHT MODAL 6: STAFF FORM --- */}
      {isAddingStaff && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-900">Add Staff Member</h3>

            <form onSubmit={handleSaveStaff} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-600 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="Victoria Sterling"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">Email</label>
                <input
                  type="email"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="victoria@cornus.io"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">Staff Role</label>
                <select
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value as any)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Customer Support">Customer Support</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">Security PIN Code</label>
                <input
                  type="password"
                  value={staffPin}
                  onChange={(e) => setStaffPin(e.target.value)}
                  placeholder="4-digit PIN"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-zinc-900 focus:bg-white font-mono font-bold"
                  maxLength={10}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingStaff(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl cursor-pointer"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- BULK EDIT DIALOG MODAL --- */}
      {showBulkPanel && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-left">
          <div className="bg-white border border-zinc-200 shadow-2xl rounded-2xl max-w-lg w-full overflow-hidden animate-scaleIn">
            <div className="p-5 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Bulk Update Selected Garments</h3>
                <p className="text-[11px] text-zinc-500 font-medium">Modifying {selectedProductIds.length} checked garments in live catalog</p>
              </div>
              <button 
                onClick={() => setShowBulkPanel(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBatchUpdateProducts} className="p-6 space-y-4">
              <p className="text-[11px] text-zinc-500 bg-amber-50 border border-amber-200/50 p-3 rounded-xl font-medium leading-relaxed">
                Leave any field empty if you do not want to change it. Only filled fields will be applied across all selected garments.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category select */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 block mb-0.5">Category Override</label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-850 focus:outline-none focus:border-zinc-900 cursor-pointer"
                  >
                    <option value="">-- No Change --</option>
                    {categoriesList.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 block mb-0.5">Subcategory Override</label>
                  <input
                    type="text"
                    placeholder="e.g. Knitwear"
                    value={bulkSubcategory}
                    onChange={(e) => setBulkSubcategory(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-semibold"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 block mb-0.5">New Price ({storeSettings.currencySymbol})</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 12900"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
                  />
                </div>

                {/* Stock Count */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 block mb-0.5">Stock Count</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 25"
                    value={bulkStockCount}
                    onChange={(e) => setBulkStockCount(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 font-mono"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 block mb-0.5">Gender Focus</label>
                  <select
                    value={bulkGender}
                    onChange={(e) => setBulkGender(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-850 focus:outline-none focus:border-zinc-900 cursor-pointer"
                  >
                    <option value="">-- No Change --</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>

                {/* In Stock */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 block mb-0.5">In Stock Status</label>
                  <select
                    value={bulkInStock}
                    onChange={(e) => setBulkInStock(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-850 focus:outline-none focus:border-zinc-900 cursor-pointer"
                  >
                    <option value="">-- No Change --</option>
                    <option value="true">Force In Stock (Active)</option>
                    <option value="false">Force Out of Stock (Sold Out)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowBulkPanel(false)}
                  className="flex-1 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBulkUpdating}
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isBulkUpdating ? 'Updating...' : `Apply Bulk Changes`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIGHT MODAL 7: MENUS FORM --- */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-base font-bold text-zinc-900">
                {editingMenu ? 'Edit Store Navigation Menu' : 'Create Store Navigation Menu'}
              </h3>
              <button 
                onClick={() => setIsMenuModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenu} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-600 font-bold mb-1">Menu Title</label>
                <input
                  type="text"
                  value={menuTitle}
                  onChange={(e) => setMenuTitle(e.target.value)}
                  placeholder="e.g. Men, Accessories, Outlet"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">Fallback Route / Redirect Link</label>
                <input
                  type="text"
                  value={menuLink}
                  onChange={(e) => setMenuLink(e.target.value)}
                  placeholder="e.g. gender/Men, collection/Atelier Edition, sale"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 font-mono"
                />
                <p className="text-[10px] text-zinc-400 mt-1">Route where users land if they click this navigation header menu tab directly.</p>
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">Display Order Priority</label>
                <input
                  type="number"
                  min="1"
                  value={menuDisplayOrder}
                  onChange={(e) => setMenuDisplayOrder(Number(e.target.value))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">Assign Storefront Categories (For Mega Dropdown Hover)</label>
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1.5">
                  {categoriesList.map((cat) => {
                    const isChecked = menuAssignedCategories.includes(cat.name);
                    return (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer py-1 px-1.5 hover:bg-zinc-100 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMenuAssignedCategories(prev => [...prev, cat.name]);
                            } else {
                              setMenuAssignedCategories(prev => prev.filter(c => c !== cat.name));
                            }
                          }}
                          className="rounded border-zinc-300 text-zinc-950 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-zinc-800 font-semibold">{cat.name}</span>
                        <span className="text-[10px] text-zinc-400 ml-auto italic">({cat.subtitle})</span>
                      </label>
                    );
                  })}
                  {categoriesList.length === 0 && (
                    <p className="text-[11px] text-zinc-400 italic">Please create store categories first before mapping hover links.</p>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 mt-1.5">Select multiple categories to build a multi-column Mega Menu layout loaded with active database products on hover.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl cursor-pointer"
                >
                  {editingMenu ? 'Save Menu Settings' : 'Create Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
