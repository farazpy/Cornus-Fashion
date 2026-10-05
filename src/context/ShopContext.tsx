import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductColor, CartItem, Order, ShippingAddress, ActivePageType, PolicyTab, UserProfile, UserAddress, StoreSettings, CategoryItem, StoreMenu } from '../types';
import { updatePageSEO, getProductSEO } from '../utils/seo';
import { signInWithGoogleOAuth, logoutFirebaseAuth, initAuthListener } from '../utils/firebaseAuth';

interface Toast {
  id: string;
  message: string;
}

interface ShopContextType {
  storeSettings: StoreSettings;
  refreshStoreSettings: () => Promise<void>;
  products: Product[];
  refreshProducts: () => Promise<void>;
  categories: CategoryItem[];
  refreshCategories: () => Promise<void>;
  menus: StoreMenu[];
  refreshMenus: () => Promise<void>;

  addLocalProducts: (newProds: Product[]) => void;
  // Navigation & Page views
  activePage: ActivePageType;
  setActivePage: (page: ActivePageType) => void;
  activePolicyTab: PolicyTab;
  setActivePolicyTab: (tab: PolicyTab) => void;
  navigateToPolicy: (tab: PolicyTab) => void;
  navigateToContact: () => void;
  selectedProductId: string | null;
  navigateToProduct: (productId: string) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  activeGender: 'Men' | 'Women' | 'All' | 'Kids';
  setActiveGender: (gender: 'Men' | 'Women' | 'All' | 'Kids') => void;
  activeCollection: string | null;
  setActiveCollection: (collection: string | null) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, color: ProductColor, size: string, quantity?: number, isPreOrder?: boolean, preOrderReleaseDate?: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
  hasFreeShipping: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Recently Viewed
  recentlyViewed: Product[];
  recordRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;

  // Wishlist
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;

  // Search
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Modals & Panels
  quickViewProduct: Product | null;
  setQuickViewProduct: (p: Product | null) => void;
  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;

  // Orders & Account
  orders: Order[];
  placeOrder: (shipping: ShippingAddress, paymentMethod: string, discount?: number, discountCode?: string, customShippingCost?: number) => Order;
  recentlyPlacedOrder: Order | null;
  setRecentlyPlacedOrder: (o: Order | null) => void;

  // USER AUTH & ADDRESS BOOK
  currentUser: UserProfile | null;
  userToken: string | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup' | 'forgot';
  setAuthModalMode: (mode: 'login' | 'signup' | 'forgot') => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string, phone?: string) => Promise<void>;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; resetCode?: string }>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<void>;
  userOrders: Order[];
  fetchUserOrders: () => Promise<void>;
  addAddress: (addrData: Omit<UserAddress, 'id' | 'userId'>) => Promise<void>;
  updateAddress: (id: string, addrData: Partial<UserAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;

  // Toast
  toasts: Toast[];
  showToast: (msg: string) => void;
  removeToast: (id: string) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const parsePathToState = (pathname: string): {
  page: ActivePageType;
  policyTab?: PolicyTab;
  productId?: string;
  gender?: 'Men' | 'Women' | 'All' | 'Kids';
  category?: string;
} => {
  const clean = pathname.replace(/\/+$/, '') || '/';

  if (clean === '/' || clean === '') {
    return { page: 'home' };
  }
  if (clean === '/shop') {
    return { page: 'shop', gender: 'All' };
  }
  if (clean === '/shop/men' || clean === '/men') {
    return { page: 'shop', gender: 'Men' };
  }
  if (clean === '/shop/women' || clean === '/women') {
    return { page: 'shop', gender: 'Women' };
  }
  if (clean === '/shop/kids' || clean === '/kids') {
    return { page: 'shop', gender: 'Kids' };
  }
  if (clean === '/wishlist') {
    return { page: 'wishlist' };
  }
  if (
    clean === '/account' || 
    clean === '/orders' || 
    clean === '/account/orders' ||
    clean === '/addresses' || 
    clean === '/account/addresses' ||
    clean === '/security' || 
    clean === '/account/security' ||
    clean === '/rewards' || 
    clean === '/account/rewards' ||
    clean === '/profile' ||
    clean === '/account/profile'
  ) {
    return { page: 'account' };
  }
  if (clean === '/story' || clean === '/our-story') {
    return { page: 'story' };
  }
  if (clean === '/checkout') {
    return { page: 'checkout' };
  }
  if (clean === '/contact' || clean === '/contact-us' || clean === '/concierge') {
    return { page: 'contact' };
  }
  if (clean === '/cart') {
    return { page: 'home' };
  }
  if (clean === '/admin' || clean.startsWith('/admin/')) {
    return { page: 'admin' };
  }

  // Policy routes
  if (clean.startsWith('/policy/')) {
    const tab = clean.replace('/policy/', '') as PolicyTab;
    return { page: 'policy', policyTab: tab };
  }

  // Product detail routes e.g. /product/cornus-01 or /p/cornus-01
  if (clean.startsWith('/product/') || clean.startsWith('/p/')) {
    const productId = clean.replace('/product/', '').replace('/p/', '');
    return { page: 'product', productId };
  }

  // Category routes
  if (clean.startsWith('/category/') || clean.startsWith('/shop/category/')) {
    const catSlug = clean.replace('/category/', '').replace('/shop/category/', '');
    return { page: 'shop', gender: 'All', category: catSlug };
  }

  return { page: 'home' };
};

const defaultStoreSettings: StoreSettings = {
  storeName: 'CORNUS',
  storeLogoUrl: 'https://i.ibb.co/SwmnN7pz/Cornus-Logo.png',
  supportEmail: 'concierge@cornus.com',
  supportPhone: '+1 (800) 555-CORNUS',
  physicalAddress: '740 Madison Avenue, New York, NY 10065',
  currencySymbol: 'INR ',
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
  cloudApiEndpoint: 'https://ais-dev-y6wlfhoudz3f6xc5ep2uxc-384474894487.asia-east1.run.app/api/v1/upload',
  cloudApiKey: 'tc_live_92094a5f46b81b5fae1bc5725bb47ab1aa42f089ce1f8543',
  cloudWorkspaceId: '8'
};

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Store Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);

  const refreshStoreSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const rawSymbol = data.settings.currencySymbol;
        const cleanedSettings = {
          ...data.settings,
          currencySymbol: (!rawSymbol || rawSymbol === '?' || rawSymbol === '$') ? 'INR ' : (rawSymbol.trim() === 'INR' ? 'INR ' : rawSymbol)
        };
        setStoreSettings(cleanedSettings);
      }
    } catch (err) {
      console.error('Failed to load store settings:', err);
    }
  };

  useEffect(() => {
    refreshStoreSettings();
  }, []);

  // Navigation & Page State - Initialize directly from browser pathname
  const [activePage, setActivePage] = useState<ActivePageType>(() => {
    if (typeof window !== 'undefined') {
      return parsePathToState(window.location.pathname).page;
    }
    return 'home';
  });
  const [activePolicyTab, setActivePolicyTab] = useState<PolicyTab>(() => {
    if (typeof window !== 'undefined') {
      return parsePathToState(window.location.pathname).policyTab || 'privacy';
    }
    return 'privacy';
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return parsePathToState(window.location.pathname).productId || null;
    }
    return null;
  });
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeGender, setActiveGender] = useState<'Men' | 'Women' | 'All' | 'Kids'>(() => {
    if (typeof window !== 'undefined') {
      return parsePathToState(window.location.pathname).gender || 'All';
    }
    return 'All';
  });
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  // Products
  const [products, setProducts] = useState<Product[]>([]);

  // Categories
  const [categories, setCategories] = useState<CategoryItem[]>([]);

  // Menus
  const [menus, setMenus] = useState<StoreMenu[]>([]);

  // User Auth & Address States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userToken, setUserToken] = useState<string | null>(() => localStorage.getItem('cornus_user_token'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  const refreshProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error fetching live products:', err);
    }
  };

  const refreshCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching live categories:', err);
    }
  };

  const refreshMenus = async () => {
    try {
      const response = await fetch('/api/menus');
      const data = await response.json();
      if (data.success && Array.isArray(data.menus)) {
        setMenus(data.menus);
      }
    } catch (err) {
      console.error('Error fetching live menus:', err);
    }
  };

  const addLocalProducts = (newProds: Product[]) => {
    setProducts((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      newProds.forEach((p) => map.set(p.id, p));
      return Array.from(map.values());
    });
  };

  useEffect(() => {
    refreshProducts();
    refreshCategories();
    refreshMenus();
  }, []);

  // Fetch User Profile if Token Exists
  const fetchUserProfile = async (tokenToUse?: string) => {
    const token = tokenToUse || userToken;
    if (!token) return;

    try {
      const res = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      } else {
        // Clear stale token if unauthorized
        localStorage.removeItem('cornus_user_token');
        setUserToken(null);
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Fetch User Orders
  const fetchUserOrders = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/user/orders?email=${encodeURIComponent(currentUser.email)}`, {
        headers: { Authorization: `Bearer ${currentUser.id}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setUserOrders(data.orders);
      }
    } catch (err) {
      console.error('Error fetching user orders:', err);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchUserProfile(userToken);
    }
  }, [userToken]);

  useEffect(() => {
    if (currentUser) {
      fetchUserOrders();
    }
  }, [currentUser]);

  // Auth Functions
  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success && data.user && data.token) {
      setCurrentUser(data.user);
      setUserToken(data.token);
      localStorage.setItem('cornus_user_token', data.token);
    } else {
      throw new Error(data.error || 'Login failed.');
    }
  };

  const signup = async (fullName: string, email: string, password: string, phone?: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, phone })
    });
    const data = await res.json();
    if (data.success && data.user && data.token) {
      setCurrentUser(data.user);
      setUserToken(data.token);
      localStorage.setItem('cornus_user_token', data.token);
    } else {
      throw new Error(data.error || 'Registration failed.');
    }
  };

  const googleLogin = async () => {
    const googleRes = await signInWithGoogleOAuth();
    if (!googleRes || !googleRes.email) {
      throw new Error('Google sign in failed.');
    }

    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: googleRes.email,
        name: googleRes.displayName,
        photoUrl: googleRes.photoURL,
        googleId: googleRes.uid,
        phone: googleRes.phoneNumber || ''
      })
    });

    const data = await res.json();
    if (data.success && data.user && data.token) {
      setCurrentUser(data.user);
      setUserToken(data.token);
      localStorage.setItem('cornus_user_token', data.token);
    } else {
      throw new Error(data.error || 'Google authentication sync failed.');
    }
  };

  const logout = async () => {
    await logoutFirebaseAuth();
    localStorage.removeItem('cornus_user_token');
    setUserToken(null);
    setCurrentUser(null);
    setUserOrders([]);
  };

  const forgotPassword = async (email: string) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.success) {
      return { success: true, message: data.message, resetCode: data.resetCode };
    } else {
      throw new Error(data.error || 'Password reset request failed.');
    }
  };

  const resetPassword = async (email: string, resetCode: string, newPassword: string) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, resetCode, newPassword })
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Password reset failed.');
    }
  };

  // Address CRUD
  const addAddress = async (addrData: Omit<UserAddress, 'id' | 'userId'>) => {
    if (!currentUser) return;
    const res = await fetch('/api/user/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.id}`
      },
      body: JSON.stringify(addrData)
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.addresses)) {
      setCurrentUser({ ...currentUser, addresses: data.addresses });
    } else {
      throw new Error(data.error || 'Failed to save address.');
    }
  };

  const updateAddress = async (id: string, addrData: Partial<UserAddress>) => {
    if (!currentUser) return;
    const res = await fetch(`/api/user/addresses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentUser.id}`
      },
      body: JSON.stringify(addrData)
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.addresses)) {
      setCurrentUser({ ...currentUser, addresses: data.addresses });
    } else {
      throw new Error(data.error || 'Failed to update address.');
    }
  };

  const deleteAddress = async (id: string) => {
    if (!currentUser) return;
    const res = await fetch(`/api/user/addresses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${currentUser.id}`
      }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.addresses)) {
      setCurrentUser({ ...currentUser, addresses: data.addresses });
    } else {
      throw new Error(data.error || 'Failed to delete address.');
    }
  };

  const setDefaultAddress = async (id: string) => {
    if (!currentUser) return;
    const res = await fetch(`/api/user/addresses/${id}/default`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${currentUser.id}`
      }
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.addresses)) {
      setCurrentUser({ ...currentUser, addresses: data.addresses });
    } else {
      throw new Error(data.error || 'Failed to set default address.');
    }
  };

  // SEO & Route Sync popstate listener
  useEffect(() => {
    const handlePopState = () => {
      const state = parsePathToState(window.location.pathname);
      setActivePage(state.page);
      if (state.policyTab) setActivePolicyTab(state.policyTab);
      if (state.productId) setSelectedProductId(state.productId);
      if (state.gender) setActiveGender(state.gender);
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Synchronize State changes back to Address Bar URLs!
  useEffect(() => {
    let targetPath = '/';
    if (activePage === 'home') {
      targetPath = '/';
    } else if (activePage === 'shop') {
      if (activeCategory && activeCategory !== 'All') {
        const catSlug = activeCategory.toLowerCase().replace(/\s+/g, '-');
        targetPath = `/category/${catSlug}`;
      } else if (activeGender && activeGender !== 'All') {
        targetPath = `/shop/${activeGender.toLowerCase()}`;
      } else {
        targetPath = '/shop';
      }
    } else if (activePage === 'product' && selectedProductId) {
      const selectedProd = products.find((p) => p.id === selectedProductId);
      const slug = selectedProd?.slug || selectedProductId;
      targetPath = `/product/${slug}`;
    } else if (activePage === 'account') {
      if (
        window.location.pathname === '/orders' ||
        window.location.pathname === '/addresses' ||
        window.location.pathname === '/security' ||
        window.location.pathname === '/rewards' ||
        window.location.pathname === '/profile'
      ) {
        targetPath = window.location.pathname;
      } else {
        targetPath = '/account';
      }
    } else if (activePage === 'wishlist') {
      targetPath = '/wishlist';
    } else if (activePage === 'checkout') {
      targetPath = '/checkout';
    } else if (activePage === 'story') {
      targetPath = '/story';
    } else if (activePage === 'admin') {
      if (window.location.pathname.startsWith('/admin')) {
        targetPath = window.location.pathname;
      } else {
        targetPath = '/admin/analytics';
      }
    } else if (activePage === 'contact') {
      targetPath = '/contact';
    } else if (activePage === 'policy') {
      targetPath = `/policy/${activePolicyTab}`;
    }

    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, [activePage, selectedProductId, activeCategory, activeGender, activePolicyTab, products]);

  // Resolve Product Slugs Asynchronously when loaded from database
  useEffect(() => {
    if (products.length === 0) return;
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (path.startsWith('/product/') || path.startsWith('/p/')) {
      const slugOrId = path.replace('/product/', '').replace('/p/', '');
      const found = products.find((p) => p.slug === slugOrId || p.id === slugOrId);
      if (found && selectedProductId !== found.id) {
        setSelectedProductId(found.id);
        setActivePage('product');
      }
    }
  }, [products]);

  // Resolve Category Slugs Asynchronously when loaded from database
  useEffect(() => {
    if (categories.length === 0) return;
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (path.startsWith('/category/') || path.startsWith('/shop/category/')) {
      const catSlug = path.replace('/category/', '').replace('/shop/category/', '');
      const found = categories.find((c) => c.slug === catSlug || c.name.toLowerCase().replace(/\s+/g, '-') === catSlug);
      if (found && activeCategory !== found.name) {
        setActiveCategory(found.name);
        setActivePage('shop');
      }
    }
  }, [categories]);

  useEffect(() => {
    if (activePage === 'home') {
      updatePageSEO({
        title: 'CORNUS — Contemporary Silhouettes & Atelier Archive',
        description: 'Explore CORNUS contemporary garments, Italian virgin wools, selvedge denim, and refined architectural tailoring.',
        canonicalPath: '/'
      });
    } else if (activePage === 'shop') {
      updatePageSEO({
        title: 'Boutique Collection — CORNUS',
        description: 'Shop the complete CORNUS capsule collection, outerwear, tops, bottoms, and curated leather goods.',
        canonicalPath: '/shop'
      });
    } else if (activePage === 'product' && selectedProductId) {
      const selectedProd = products.find((p) => p.id === selectedProductId);
      if (selectedProd) {
        updatePageSEO(getProductSEO(selectedProd));
      }
    } else if (activePage === 'account') {
      updatePageSEO({
        title: 'Client Portal — CORNUS Account Dashboard',
        description: 'Manage your CORNUS client membership, saved delivery addresses, and live order tracking.',
        canonicalPath: '/account'
      });
    } else if (activePage === 'wishlist') {
      updatePageSEO({
        title: 'Curated Wishlist — CORNUS',
        description: 'Your saved wardrobe silhouettes and editorial garments.',
        canonicalPath: '/wishlist'
      });
    } else if (activePage === 'checkout') {
      updatePageSEO({
        title: 'Express Checkout — CORNUS Haute Couture',
        description: 'Complete your CORNUS atelier garment order with secure 256-bit encrypted checkout and bespoke white-glove shipping.',
        canonicalPath: '/checkout'
      });
    } else if (activePage === 'story') {
      updatePageSEO({
        title: 'Our Story & Atelier Manifesto — CORNUS',
        description: 'Discover the architectural craftsmanship, material purity, and design ethos behind CORNUS.',
        canonicalPath: '/story'
      });
    } else if (activePage === 'contact') {
      updatePageSEO({
        title: 'Concierge & Private Atelier Appointments — CORNUS Haute Couture',
        description: 'Connect directly with CORNUS master tailors, client care concierge, and showroom liaisons in Tathawade, Pune for bespoke garment consultations.',
        canonicalPath: '/contact'
      });
    } else if (activePage === 'policy') {
      updatePageSEO({
        title: `${activePolicyTab.toUpperCase()} — Client Care & Atelier Policies | CORNUS`,
        description: 'CORNUS client care, delivery terms, returns policy, and direct boutique concierge support.',
        canonicalPath: `/policy/${activePolicyTab}`
      });
    }
  }, [activePage, selectedProductId, activePolicyTab, products]);

  const navigateToPolicy = (tab: PolicyTab) => {
    setActivePolicyTab(tab);
    setActivePage('policy');
    window.history.pushState(null, '', `/policy/${tab}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToContact = () => {
    setActivePage('contact');
    window.history.pushState(null, '', '/contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProduct = (productId: string) => {
    setSelectedProductId(productId);
    setActivePage('product');
    window.history.pushState(null, '', `/product/${productId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const target = products.find((p) => p.id === productId);
    if (target) {
      recordRecentlyViewed(target);
    }
  };

  // Recently Viewed State
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('cornus_recently_viewed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const recordRecentlyViewed = (product: Product) => {
    if (!product || !product.id) return;
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 12);
      try {
        localStorage.setItem('cornus_recently_viewed', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist recently viewed');
      }
      return updated;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem('cornus_recently_viewed');
    } catch {}
  };

  // Cart State & Persistent Synchronization
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cornus_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasServerSynced, setHasServerSynced] = useState(false);

  const getCartSessionId = () => {
    let sid = localStorage.getItem('cornus_cart_session_id');
    if (!sid) {
      sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('cornus_cart_session_id', sid);
    }
    return sid;
  };

  // Sync cart from server on initial mount / login if local is empty or to merge across devices
  useEffect(() => {
    const syncCartFromServer = async () => {
      try {
        const sid = getCartSessionId();
        const headers: Record<string, string> = {};
        if (currentUser?.id) {
          headers['Authorization'] = `Bearer ${currentUser.id}`;
        }
        const res = await fetch(`/api/cart/sync?sessionId=${encodeURIComponent(sid)}`, { headers });
        const data = await res.json();
        if (data.success && Array.isArray(data.items) && data.items.length > 0) {
          setCart((localCart) => {
            if (localCart.length === 0) {
              return data.items;
            }
            // Merge server items not already in local cart
            const merged = [...localCart];
            for (const sItem of data.items) {
              if (!merged.some(m => m.id === sItem.id)) {
                merged.push(sItem);
              }
            }
            return merged;
          });
        }
      } catch (err) {
        console.warn('Persistent cart sync check skipped:', err);
      } finally {
        setHasServerSynced(true);
      }
    };

    syncCartFromServer();
  }, [currentUser?.id]);

  // Sync to localStorage and server database whenever cart changes
  useEffect(() => {
    localStorage.setItem('cornus_cart', JSON.stringify(cart));

    if (!hasServerSynced) return;

    const timer = setTimeout(() => {
      const sid = getCartSessionId();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentUser?.id) {
        headers['Authorization'] = `Bearer ${currentUser.id}`;
      }

      fetch('/api/cart/sync', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sessionId: sid,
          items: cart,
          cartSubtotal: cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
          userEmail: currentUser?.email || null
        })
      }).catch(() => {});
    }, 600);

    return () => clearTimeout(timer);
  }, [cart, currentUser, hasServerSynced]);

  const addToCart = (
    product: Product, 
    color: ProductColor, 
    size: string, 
    quantity = 1,
    isPreOrder?: boolean,
    preOrderReleaseDate?: string
  ) => {
    const isItemPreOrder = isPreOrder ?? (!!product.isPreOrder || (!product.inStock && !!product.preOrderReleaseDate));
    const releaseDate = preOrderReleaseDate || product.preOrderReleaseDate || '';

    setCart((prevCart) => {
      const itemId = `${product.id}-${color.name}-${size}${isItemPreOrder ? '-preorder' : ''}`;
      const existingIndex = prevCart.findIndex((item) => item.id === itemId);

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [
        ...prevCart,
        {
          id: itemId,
          productId: product.id,
          product,
          selectedColor: color,
          selectedSize: size,
          quantity,
          isPreOrder: isItemPreOrder,
          preOrderReleaseDate: releaseDate
        }
      ];
    });

    setIsCartOpen(true);
    if (isItemPreOrder) {
      showToast(`Pre-Order Confirmed: ${product.name} (${size}) reserved in bag`);
    } else {
      showToast(`Added ${product.name} (${size}) to your bag`);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
    showToast('Item removed from shopping bag');
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cornus_cart');
    const sid = getCartSessionId();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (currentUser?.id) {
      headers['Authorization'] = `Bearer ${currentUser.id}`;
    }
    fetch('/api/cart/clear', {
      method: 'POST',
      headers,
      body: JSON.stringify({ sessionId: sid })
    }).catch(() => {});
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const freeShippingThreshold = 3000;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - cartSubtotal);
  const hasFreeShipping = cartSubtotal >= freeShippingThreshold;

  // Wishlist State
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('cornus_wishlist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cornus_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from your wishlist');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your wishlist');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);
  const wishlistCount = wishlistIds.length;

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cornus_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [recentlyPlacedOrder, setRecentlyPlacedOrder] = useState<Order | null>(null);

  useEffect(() => {
    localStorage.setItem('cornus_orders', JSON.stringify(orders));
  }, [orders]);

  const placeOrder = (
    shipping: ShippingAddress,
    paymentMethod: string,
    discount = 0,
    discountCode?: string,
    customShippingCost?: number
  ): Order => {
    const finalShipping = customShippingCost !== undefined ? customShippingCost : (hasFreeShipping ? 0 : 250);
    const finalTotal = Math.max(0, cartSubtotal - discount + finalShipping);
    const newOrder: Order = {
      id: `CRN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        color: item.selectedColor.name,
        size: item.selectedSize,
        quantity: item.quantity,
        image: item.product.images[0],
        isPreOrder: item.isPreOrder,
        preOrderReleaseDate: item.preOrderReleaseDate
      })),
      subtotal: cartSubtotal,
      discount: discount || 0,
      discountCode: discountCode || undefined,
      shipping: finalShipping,
      total: finalTotal,
      status: 'Processing',
      trackingNumber: `TRK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      shippingAddress: shipping,
      paymentMethod,
      userId: currentUser?.id
    };

    setOrders((prev) => [newOrder, ...prev]);
    if (currentUser) {
      setUserOrders((prev) => [newOrder, ...prev]);
    }
    setRecentlyPlacedOrder(newOrder);
    clearCart();

    // Persist order to backend Express / MySQL
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shippingAddress: shipping,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        discount: newOrder.discount,
        discountCode: newOrder.discountCode,
        shipping: newOrder.shipping,
        total: newOrder.total,
        paymentMethod,
        userId: currentUser?.id,
        sessionId: getCartSessionId()
      })
    }).catch((err) => console.error('Error persisting order to backend:', err));

    return newOrder;
  };

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => removeToast(id), 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ShopContext.Provider
      value={{
        storeSettings,
        refreshStoreSettings,
        products,
        refreshProducts,
        categories,
        refreshCategories,
        menus,
        refreshMenus,
        addLocalProducts,

        activePage,
        setActivePage,
        activePolicyTab,
        setActivePolicyTab,
        navigateToPolicy,
        navigateToContact,
        selectedProductId,
        navigateToProduct,
        activeCategory,
        setActiveCategory,
        activeGender,
        setActiveGender,
        activeCollection,
        setActiveCollection,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        freeShippingThreshold,
        freeShippingRemaining,
        hasFreeShipping,
        isCartOpen,
        setIsCartOpen,
        recentlyViewed,
        recordRecentlyViewed,
        clearRecentlyViewed,
        wishlistIds,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        quickViewProduct,
        setQuickViewProduct,
        isSizeGuideOpen,
        setIsSizeGuideOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        orders,
        placeOrder,
        recentlyPlacedOrder,
        setRecentlyPlacedOrder,
        currentUser,
        userToken,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        login,
        signup,
        googleLogin,
        logout,
        forgotPassword,
        resetPassword,
        userOrders,
        fetchUserOrders,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = (): ShopContextType => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
