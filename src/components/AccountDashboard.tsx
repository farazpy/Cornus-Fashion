import React, { useState, useEffect } from 'react';
import {
  Package,
  User,
  MapPin,
  ChevronRight,
  Truck,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  ShieldCheck,
  Award,
  Gift,
  Sparkles,
  Copy,
  Check,
  ShoppingBag,
  ExternalLink,
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { FashionImage } from './FashionImage';
import { UserAddress } from '../types';

export const AccountDashboard: React.FC = () => {
  const {
    currentUser,
    logout,
    userOrders,
    fetchUserOrders,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    setIsAuthModalOpen,
    setAuthModalMode,
    setActivePage,
    setActiveCategory,
    showToast
  } = useShop();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'security' | 'rewards'>('orders');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<string | null>(null);

  // Rewards redemption states
  const [redeemPointsAmount, setRedeemPointsAmount] = useState<number>(100);
  const [isRedeemingPoints, setIsRedeemingPoints] = useState(false);
  const [newRedeemedCoupon, setNewRedeemedCoupon] = useState<{ code: string; value: number } | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // Address form states
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [recipientName, setRecipientName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [isDefault, setIsDefault] = useState(false);

  // Profile Edit states
  const [editFullName, setEditFullName] = useState(currentUser?.fullName || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setEditFullName(currentUser.fullName);
      setEditPhone(currentUser.phone || '');
      fetchUserOrders();
    }
  }, [currentUser]);

  // Sync tab with URL
  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/orders' || path === '/account/orders') {
      setActiveTab('orders');
    } else if (path === '/rewards' || path === '/account/rewards') {
      setActiveTab('rewards');
    } else if (path === '/addresses' || path === '/account/addresses') {
      setActiveTab('addresses');
    } else if (path === '/security' || path === '/account/security') {
      setActiveTab('security');
    } else if (path === '/profile' || path === '/account/profile') {
      setActiveTab('profile');
    }
  }, []);

  // Update URL when activeTab changes
  useEffect(() => {
    let target = '/account';
    if (activeTab === 'orders') target = '/orders';
    else if (activeTab === 'rewards') target = '/rewards';
    else if (activeTab === 'addresses') target = '/addresses';
    else if (activeTab === 'security') target = '/security';
    else if (activeTab === 'profile') target = '/profile';

    if (window.location.pathname !== target) {
      window.history.pushState(null, '', target);
    }
  }, [activeTab]);

  if (!currentUser) {
    return (
      <div className="py-24 max-w-xl mx-auto px-4 text-center min-h-[70vh] flex flex-col justify-center items-center">
        <div className="w-16 h-16 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md">
          <User className="w-8 h-8" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-2">
          VIP PORTAL ACCESS
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-950 mb-3">
          Atelier Client Account
        </h1>
        <p className="text-xs text-zinc-600 font-normal max-w-md mb-8 leading-relaxed">
          Please sign in to access your personal couture orders, saved global delivery addresses, and Atelier Club reward privileges.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-xs">
          <button
            onClick={() => {
              setAuthModalMode('login');
              setIsAuthModalOpen(true);
            }}
            className="w-full py-3.5 bg-zinc-950 text-white text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-black transition-all shadow-md"
          >
            Sign In To Account
          </button>
          <button
            onClick={() => {
              setAuthModalMode('signup');
              setIsAuthModalOpen(true);
            }}
            className="w-full py-3.5 bg-white text-zinc-900 text-xs font-bold tracking-widest uppercase border border-zinc-300 rounded-xl hover:bg-zinc-50 transition-all"
          >
            Create Membership
          </button>
        </div>
      </div>
    );
  }

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setRecipientName(currentUser.fullName || '');
    setAddressPhone(currentUser.phone || '');
    setStreetAddress('');
    setApartment('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('United States');
    setIsDefault(currentUser.addresses.length === 0);
    setIsAddingAddress(true);
  };

  const handleOpenEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setRecipientName(addr.recipientName);
    setAddressPhone(addr.phone);
    setStreetAddress(addr.streetAddress);
    setApartment(addr.apartment || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country);
    setIsDefault(addr.isDefault);
    setIsAddingAddress(true);
  };

  const handleSaveAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !addressPhone || !streetAddress || !city || !state || !postalCode) {
      showToast('Please complete all required address fields.');
      return;
    }

    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, {
          recipientName,
          phone: addressPhone,
          streetAddress,
          apartment,
          city,
          state,
          postalCode,
          country,
          isDefault
        });
        showToast('Address updated successfully.');
      } else {
        await addAddress({
          recipientName,
          phone: addressPhone,
          streetAddress,
          apartment,
          city,
          state,
          postalCode,
          country,
          isDefault
        });
        showToast('New delivery address saved.');
      }
      setIsAddingAddress(false);
    } catch {
      showToast('Failed to save address.');
    }
  };

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFullName.trim()) return;

    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editFullName.trim(),
          phone: editPhone.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        currentUser.fullName = editFullName;
        currentUser.phone = editPhone;
        showToast('Profile information saved.');
      } else {
        showToast(data.error || 'Failed to update profile.');
      }
    } catch {
      showToast('Server connection error.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleRedeemPoints = async () => {
    if (!currentUser || (currentUser.rewardPoints || 0) < redeemPointsAmount) {
      showToast('Insufficient Atelier points.');
      return;
    }

    setIsRedeemingPoints(true);
    try {
      const res = await fetch('/api/user/redeem-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: redeemPointsAmount })
      });
      const data = await res.json();
      if (data.success) {
        currentUser.rewardPoints = (currentUser.rewardPoints || 0) - redeemPointsAmount;
        setNewRedeemedCoupon({ code: data.couponCode, value: data.discountValue });
        showToast(`Redeemed ${redeemPointsAmount} points for $${data.discountValue} voucher!`);
      } else {
        showToast(data.error || 'Redemption failed.');
      }
    } catch {
      showToast('Redemption failed. Please try again.');
    } finally {
      setIsRedeemingPoints(false);
    }
  };

  return (
    <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen flex flex-col flex-grow bg-[#FAF9F6] text-zinc-900">
      <div className="w-full">
        
        {/* 1. Elevated Profile Hero Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200 shadow-xs mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left: User Avatar, Name & Badges */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-16 h-16 rounded-2xl border-2 border-zinc-900 object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-zinc-950 text-white font-serif text-2xl font-bold flex items-center justify-center shadow-md">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'C'}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white" title="Verified Account">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                    {currentUser.membershipTier || 'Privilege Gold Member'}
                  </span>
                  {currentUser.googleId && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold flex items-center gap-1">
                      <svg className="w-3 h-3" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      Google Verified
                    </span>
                  )}
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-950">
                  {currentUser.fullName}
                </h1>
                <p className="text-xs text-zinc-500 font-medium">{currentUser.email}</p>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActivePage('shop')}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Shop Capsule</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  showToast('Signed out of account.');
                  setActivePage('home');
                }}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 hover:border-zinc-400 bg-white text-zinc-700 hover:text-zinc-900 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Metric Stats Cards Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-zinc-100">
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block">Total Orders</span>
              <span className="font-serif text-2xl font-bold text-zinc-950">{userOrders.length}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block">Saved Addresses</span>
              <span className="font-serif text-2xl font-bold text-zinc-950">{currentUser.addresses?.length || 0}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block">Atelier Points</span>
              <span className="font-serif text-2xl font-bold text-amber-700">{currentUser.rewardPoints || 500} pts</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 block">Account Status</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Active VIP
              </span>
            </div>
          </div>
        </div>

        {/* 2. Main Grid Layout: Navigation Sidebar + Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Navigation Sidebar: Horizontal Scroll on Mobile, Vertical Sidebar on Desktop */}
          <div className="lg:col-span-3 bg-white p-2 sm:p-4 rounded-3xl border border-zinc-200 shadow-xs flex lg:flex-col overflow-x-auto gap-1.5 no-scrollbar shrink-0">
            {[
              { id: 'orders', label: 'Order History', icon: Package, count: userOrders.length },
              { id: 'profile', label: 'Profile Details', icon: User },
              { id: 'addresses', label: 'Address Book', icon: MapPin, count: currentUser.addresses?.length || 0 },
              { id: 'security', label: 'Security & Access', icon: ShieldCheck },
              { id: 'rewards', label: 'Atelier Club Rewards', icon: Award, highlight: true }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all border shrink-0 lg:w-full min-w-max lg:min-w-0 ${
                    isActive
                      ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                      : 'border-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 hover:border-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Icon className={`w-4 h-4 ${tab.highlight && !isActive ? 'text-amber-600' : ''}`} />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </div>
                  {typeof tab.count === 'number' && (
                    <span
                      className={`ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* TAB 1: ORDER HISTORY */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-2xl font-normal text-zinc-950">Your Order History</h2>
                    <p className="text-xs text-zinc-500 font-normal">Track ongoing dispatches, download invoices, and reorder favourite pieces.</p>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">{userOrders.length} records</span>
                </div>

                {userOrders.length === 0 ? (
                  <div className="p-12 sm:p-16 bg-white rounded-3xl border border-zinc-200 shadow-xs text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-xl text-zinc-950 mb-1.5">No Couture Orders Yet</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mb-6 leading-relaxed">
                      You have not placed any orders under this account. Explore our latest seasonal runway drop to start your collection.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setActiveCategory('All');
                          setActivePage('shop');
                        }}
                        className="px-6 py-3 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Discover Latest Collection</span>
                      </button>
                      <button
                        onClick={() => setActivePage('home')}
                        className="px-6 py-3 rounded-xl border border-zinc-200 hover:border-zinc-400 bg-white text-zinc-800 text-xs font-bold uppercase tracking-wider transition-all"
                      >
                        Return to Runway
                      </button>
                    </div>
                  </div>
                ) : (
                  userOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-xs space-y-5"
                    >
                      {/* Order Header Summary */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-mono font-bold text-zinc-950">{order.id}</span>
                            <span
                              className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full tracking-wider ${
                                order.status === 'Delivered'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : order.status === 'Shipped'
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-500 font-medium">Placed on {order.date}</span>
                        </div>

                        <div className="flex items-center gap-5">
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Total Amount</span>
                            <span className="text-base font-bold text-zinc-950 font-serif">
                              ${order.total.toLocaleString('en-US')}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setSelectedOrderDetails(selectedOrderDetails === order.id ? null : order.id)
                            }
                            className="px-4 py-2 rounded-xl border border-zinc-200 hover:border-zinc-900 text-zinc-900 text-xs font-bold uppercase tracking-wider transition-all"
                          >
                            {selectedOrderDetails === order.id ? 'Hide Details' : 'View Details'}
                          </button>
                        </div>
                      </div>

                      {/* Items Thumbnails and Summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2.5 rounded-2xl bg-zinc-50 border border-zinc-200">
                            <div className="w-14 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-zinc-200">
                              <FashionImage
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-zinc-900 truncate">{item.name}</h4>
                              <p className="text-[11px] text-zinc-500 font-medium">
                                {item.color} &bull; Size {item.size} &bull; Qty {item.quantity}
                              </p>
                              <span className="text-xs font-bold text-zinc-950 font-serif">${item.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Expandable Tracking & Delivery Specs */}
                      {selectedOrderDetails === order.id && (
                        <div className="pt-4 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                            <div className="flex items-center gap-2 text-zinc-900 font-bold uppercase tracking-wider text-[11px]">
                              <Truck className="w-4 h-4 text-amber-700" />
                              <span>Courier Tracking</span>
                            </div>
                            <p className="font-mono text-xs font-bold text-zinc-800">{order.trackingNumber}</p>
                            <p className="text-zinc-500 text-[11px]">Estimated Delivery: {order.estimatedDelivery}</p>
                          </div>

                          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1.5">
                            <div className="flex items-center gap-2 text-zinc-900 font-bold uppercase tracking-wider text-[11px]">
                              <MapPin className="w-4 h-4 text-amber-700" />
                              <span>Delivery Destination</span>
                            </div>
                            <p className="text-zinc-700 font-medium leading-relaxed">
                              {order.shippingAddress.fullName}<br />
                              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                              {order.shippingAddress.country}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: PROFILE DETAILS */}
            {activeTab === 'profile' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-xs space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-zinc-950">Personal Profile</h2>
                  <p className="text-xs text-zinc-500 font-normal">Manage your client credentials and communication details.</p>
                </div>

                <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        Email Address (Permanent)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={currentUser.email}
                        className="w-full px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-500 cursor-not-allowed font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        Client ID
                      </label>
                      <input
                        type="text"
                        disabled
                        value={currentUser.id}
                        className="w-full px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-500 font-mono cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="px-6 py-3 bg-zinc-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm disabled:opacity-50"
                    >
                      {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: ADDRESS BOOK */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-2xl font-normal text-zinc-950">Saved Address Book</h2>
                    <p className="text-xs text-zinc-500 font-normal">Manage global shipping destinations for 1-click express checkout.</p>
                  </div>
                  <button
                    onClick={handleOpenAddAddress}
                    className="px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                </div>

                {/* Add / Edit Address Form Modal / Box */}
                {isAddingAddress && (
                  <form
                    onSubmit={handleSaveAddressSubmit}
                    className="p-6 sm:p-8 bg-white rounded-3xl border border-zinc-300 shadow-md space-y-4"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                        {editingAddressId ? 'Edit Address' : 'New Shipping Address'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="text-xs text-zinc-400 hover:text-zinc-900 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                          Recipient Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="e.g. Faraz Khan"
                          className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:border-zinc-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={addressPhone}
                          onChange={(e) => setAddressPhone(e.target.value)}
                          placeholder="+1 (555) 019-2834"
                          className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:border-zinc-900"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={streetAddress}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          placeholder="Building, street, suite"
                          className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:border-zinc-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                          Apartment / Suite
                        </label>
                        <input
                          type="text"
                          value={apartment}
                          onChange={(e) => setApartment(e.target.value)}
                          placeholder="Apt 4B"
                          className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:border-zinc-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="New York / Los Angeles"
                          className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:border-zinc-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                          State / Province *
                        </label>
                        <input
                          type="text"
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder="NY / CA"
                          className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:border-zinc-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                          Postal / ZIP Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="10001"
                          className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:border-zinc-900 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                          Country *
                        </label>
                        <input
                          type="text"
                          required
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:border-zinc-900"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="isDefaultAddress"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="w-4 h-4 accent-zinc-900 rounded"
                      />
                      <label htmlFor="isDefaultAddress" className="text-xs text-zinc-700 font-semibold cursor-pointer">
                        Set as primary default address for express checkout
                      </label>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-zinc-950 hover:bg-black text-white text-xs font-bold tracking-wider uppercase rounded-xl transition-all shadow-sm"
                      >
                        {editingAddressId ? 'Save Changes' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-4 py-2.5 border border-zinc-200 text-zinc-700 text-xs font-bold tracking-wider uppercase rounded-xl hover:bg-zinc-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Addresses Grid */}
                {currentUser.addresses.length === 0 ? (
                  <div className="p-12 bg-white rounded-3xl border border-zinc-200 shadow-xs text-center flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mb-4">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <h3 className="font-serif text-xl text-zinc-950 mb-1">No Saved Delivery Locations</h3>
                    <p className="text-xs text-zinc-500 max-w-sm mb-6">
                      Add your shipping address now to enable expedited 1-click checkout for upcoming collection drops.
                    </p>
                    <button
                      onClick={handleOpenAddAddress}
                      className="px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider"
                    >
                      + Add New Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentUser.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            {addr.isDefault ? (
                              <span className="text-[10px] tracking-widest uppercase font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Primary Address
                              </span>
                            ) : (
                              <button
                                onClick={() => setDefaultAddress(addr.id)}
                                className="text-[10px] tracking-wider uppercase font-bold text-zinc-400 hover:text-zinc-900 underline underline-offset-4"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>

                          <h3 className="text-sm font-bold text-zinc-950 mb-1">{addr.recipientName}</h3>
                          <p className="text-xs text-zinc-600 leading-relaxed">
                            {addr.streetAddress} {addr.apartment ? `, ${addr.apartment}` : ''}<br />
                            {addr.city}, {addr.state} {addr.postalCode}<br />
                            {addr.country}
                          </p>
                          <p className="text-[11px] font-mono text-zinc-400 mt-2">Phone: {addr.phone}</p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
                          <button
                            onClick={() => handleOpenEditAddress(addr)}
                            className="text-zinc-700 hover:text-zinc-950 font-bold flex items-center gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => deleteAddress(addr.id)}
                            className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SECURITY & ACCESS */}
            {activeTab === 'security' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200 shadow-xs space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-normal text-zinc-950">Security & Authentication</h2>
                  <p className="text-xs text-zinc-500 font-normal">Manage your encrypted session and connected identity providers.</p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-xs text-emerald-950 mb-0.5">End-to-End Session Encryption</h3>
                    <p className="text-emerald-800 text-[11px]">
                      Your client session is protected using zero-trust token encryption with AES-256 standard.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 block">Connected Login Provider</span>
                    <span className="text-xs text-zinc-500 font-mono">{currentUser.email}</span>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    {currentUser.googleId ? 'Google OAuth 2.0 Connected' : 'Email & Password Auth'}
                  </span>
                </div>
              </div>
            )}

            {/* TAB 5: ATELIER CLUB REWARDS */}
            {activeTab === 'rewards' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-2xl font-normal text-zinc-950">Atelier Club Rewards</h2>
                    <p className="text-xs text-zinc-500 font-normal">Convert accrued tailoring points into instant boutique vouchers.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                    VIP Tier Privilege
                  </span>
                </div>

                {/* VIP Card */}
                <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-stone-900 text-white p-8 rounded-3xl shadow-xl border border-zinc-800 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 block mb-2">
                        NOIR ATELIER PRIVILEGE
                      </span>
                      <h3 className="font-serif text-3xl font-normal mb-1">{currentUser.fullName}</h3>
                      <p className="text-xs text-zinc-400">Member since Autumn 2026</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center sm:text-right">
                      <span className="text-[10px] text-zinc-300 uppercase font-bold tracking-wider block">Available Balance</span>
                      <span className="font-serif text-3xl font-bold text-amber-400">{currentUser.rewardPoints || 500}</span>
                      <span className="text-xs text-zinc-300 ml-1">pts</span>
                    </div>
                  </div>
                </div>

                {/* Redemption Box */}
                <div className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950">Convert Points to Checkout Discount</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { pts: 100, val: 10 },
                      { pts: 250, val: 30 },
                      { pts: 500, val: 75 }
                    ].map((opt) => (
                      <button
                        key={opt.pts}
                        onClick={() => setRedeemPointsAmount(opt.pts)}
                        className={`p-4 rounded-2xl text-left border transition-all ${
                          redeemPointsAmount === opt.pts
                            ? 'border-zinc-900 bg-zinc-900 text-white'
                            : 'border-zinc-200 hover:border-zinc-400 bg-zinc-50'
                        }`}
                      >
                        <span className="block text-base font-bold font-serif mb-0.5">${opt.val} Voucher</span>
                        <span className={`text-xs ${redeemPointsAmount === opt.pts ? 'text-zinc-300' : 'text-zinc-500'}`}>
                          {opt.pts} Atelier Points
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleRedeemPoints}
                    disabled={isRedeemingPoints || (currentUser.rewardPoints || 0) < redeemPointsAmount}
                    className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40"
                  >
                    {isRedeemingPoints ? 'Processing Voucher...' : `Redeem ${redeemPointsAmount} Points`}
                  </button>

                  {newRedeemedCoupon && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">Your Voucher Code</span>
                        <span className="font-mono text-sm font-bold text-zinc-900">{newRedeemedCoupon.code}</span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(newRedeemedCoupon.code);
                          setCopiedCoupon(true);
                          setTimeout(() => setCopiedCoupon(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-1"
                      >
                        {copiedCoupon ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCoupon ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </main>
  );
};
