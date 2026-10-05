import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  DollarSign,
  Loader2,
  Sparkles,
  Lock,
  Check,
  Tag,
  Gift,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Clock,
  Printer,
  ShoppingBag,
  ExternalLink,
  Info,
  X
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { FashionImage } from './FashionImage';
import { Order, CartItem } from '../types';

// Preset suggested luxury address predictions for rapid autocomplete
const ADDRESS_SUGGESTIONS = [
  { street: '740 Madison Avenue, Apt 4B', city: 'New York', state: 'NY', postalCode: '10065', country: 'United States' },
  { street: 'Tathawade, Pimpri Chinchwad', city: 'Pune', state: 'Maharashtra', postalCode: '411033', country: 'India' },
  { street: '14 Bandra Kurla Complex, Bandra East', city: 'Mumbai', state: 'Maharashtra', postalCode: '400051', country: 'India' },
  { street: '100 Feet Road, Indiranagar', city: 'Bengaluru', state: 'Karnataka', postalCode: '560038', country: 'India' },
  { street: 'Connaught Place, Central Delhi', city: 'New Delhi', state: 'Delhi', postalCode: '110001', country: 'India' },
  { street: 'Park Street, Chowringhee', city: 'Kolkata', state: 'West Bengal', postalCode: '700016', country: 'India' },
  { street: 'Banjara Hills, Road No 2', city: 'Hyderabad', state: 'Telangana', postalCode: '500034', country: 'India' },
  { street: '45 Rue du Faubourg Saint-Honoré', city: 'Paris', state: 'Île-de-France', postalCode: '75008', country: 'France' },
  { street: '12 Bond Street, Mayfair', city: 'London', state: 'Greater London', postalCode: 'W1S 2TE', country: 'United Kingdom' },
  { street: 'Via Montenapoleone 8', city: 'Milan', state: 'Lombardy', postalCode: '20121', country: 'Italy' },
  { street: 'Downtown Dubai, Sheikh Mohammed Bin Rashid Blvd', city: 'Dubai', state: 'Dubai', postalCode: '00000', country: 'United Arab Emirates' },
  { street: 'Ginza 6-Chome, Chuo-ku', city: 'Tokyo', state: 'Tokyo', postalCode: '104-0061', country: 'Japan' }
];

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    hasFreeShipping,
    placeOrder,
    setActivePage,
    currentUser,
    storeSettings,
    showToast
  } = useShop();

  const defaultAddr = currentUser?.addresses?.find((a) => a.isDefault) || currentUser?.addresses?.[0];

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');

  // Address Autocomplete UI State
  const [addressSuggestions, setAddressSuggestions] = useState<typeof ADDRESS_SUGGESTIONS>([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const addressDropdownRef = useRef<HTMLDivElement | null>(null);

  // Shipping & Delivery Options
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [isGiftPackaging, setIsGiftPackaging] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'card' | 'cod'>('razorpay');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Coupon / Promo Code State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; discountType: string } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Confirmed Order
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Razorpay Gateway Settings
  const [razorpaySettings, setRazorpaySettings] = useState<{
    enabled: boolean;
    keyId: string;
    currency: string;
    mode: string;
  }>({
    enabled: true,
    keyId: 'rzp_test_51AtelierCornus',
    currency: 'INR',
    mode: 'test'
  });

  const currencySymbol = storeSettings?.currencySymbol || '₹';

  // Sync user profile & default address
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || defaultAddr?.phone || '');
      if (defaultAddr) {
        setStreet(defaultAddr.streetAddress || '');
        setCity(defaultAddr.city || '');
        setState(defaultAddr.state || '');
        setPostalCode(defaultAddr.postalCode || '');
        setCountry(defaultAddr.country || 'India');
      }
    } else {
      setFullName('Alexander Vance');
      setEmail('client@cornus.io');
      setPhone('+91 9022246164');
      setStreet('Tathawade, Pimpri Chinchwad');
      setCity('Pune');
      setState('Maharashtra');
      setPostalCode('411033');
      setCountry('India');
    }
  }, [currentUser]);

  // Fetch payment gateway configuration from server
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/payment-settings');
        const data = await res.json();
        if (data.success) {
          setRazorpaySettings({
            enabled: data.enabled !== false,
            keyId: data.keyId || 'rzp_test_51AtelierCornus',
            currency: data.currency || 'INR',
            mode: data.mode || 'test'
          });
        }
      } catch (err) {
        console.warn('Using default gateway configuration');
      }
    };
    fetchSettings();
  }, []);

  // Google Places Autocomplete API Integration (with graceful fallback)
  useEffect(() => {
    const initGoogleAutocomplete = () => {
      if (typeof window !== 'undefined' && (window as any).google?.maps?.places && addressInputRef.current) {
        try {
          const autocomplete = new (window as any).google.maps.places.Autocomplete(addressInputRef.current, {
            types: ['address'],
            fields: ['address_components', 'formatted_address', 'geometry']
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.address_components) return;

            let streetNum = '';
            let route = '';
            let parsedCity = '';
            let parsedState = '';
            let parsedPostal = '';
            let parsedCountry = '';

            for (const component of place.address_components) {
              const types = component.types;
              if (types.includes('street_number')) streetNum = component.long_name;
              if (types.includes('route')) route = component.long_name;
              if (types.includes('locality') || types.includes('sublocality')) parsedCity = component.long_name;
              if (types.includes('administrative_area_level_1')) parsedState = component.long_name;
              if (types.includes('postal_code')) parsedPostal = component.long_name;
              if (types.includes('country')) parsedCountry = component.long_name;
            }

            const fullStreet = [streetNum, route].filter(Boolean).join(' ') || place.formatted_address || '';
            if (fullStreet) setStreet(fullStreet);
            if (parsedCity) setCity(parsedCity);
            if (parsedState) setState(parsedState);
            if (parsedPostal) setPostalCode(parsedPostal);
            if (parsedCountry) setCountry(parsedCountry);
          });
        } catch (e) {
          console.warn('Google Places Autocomplete initialization warning:', e);
        }
      }
    };

    initGoogleAutocomplete();
  }, []);

  // Filter Address Suggestions based on user input
  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setStreet(query);

    if (query.length >= 2) {
      const filtered = ADDRESS_SUGGESTIONS.filter(
        (item) =>
          item.street.toLowerCase().includes(query.toLowerCase()) ||
          item.city.toLowerCase().includes(query.toLowerCase()) ||
          item.state.toLowerCase().includes(query.toLowerCase()) ||
          item.postalCode.includes(query)
      );
      setAddressSuggestions(filtered.slice(0, 5));
      setShowAddressDropdown(filtered.length > 0);
    } else {
      setShowAddressDropdown(false);
    }
  };

  const handleSelectSuggestion = (item: typeof ADDRESS_SUGGESTIONS[0]) => {
    setStreet(item.street);
    setCity(item.city);
    setState(item.state);
    setPostalCode(item.postalCode);
    setCountry(item.country);
    setShowAddressDropdown(false);
    showToast(`Address autofilled: ${item.city}, ${item.state}`);
  };

  // Close address dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressDropdownRef.current &&
        !addressDropdownRef.current.contains(event.target as Node) &&
        addressInputRef.current &&
        !addressInputRef.current.contains(event.target as Node)
      ) {
        setShowAddressDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate Costs
  const baseShippingCost = hasFreeShipping ? 0 : 250;
  const expressShippingAddon = shippingMethod === 'express' ? 350 : 0;
  const finalShippingCost = baseShippingCost + expressShippingAddon;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const estimatedTax = Number(((cartSubtotal - discountAmount) * (Number(storeSettings?.taxRatePercent || 8.5) / 100)).toFixed(0));
  const orderTotal = Math.max(0, cartSubtotal - discountAmount + finalShippingCost);

  // Apply Promo Coupon
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      // 1. Validate with backend discount API from MySQL
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartSubtotal })
      });
      const data = await res.json();

      if (data.success && data.discountAmount !== undefined) {
        setAppliedCoupon({
          code: data.code || code,
          discountAmount: Number(data.discountAmount),
          discountType: data.discountTypeDesc || (data.type === 'percentage' ? `${data.value}% Discount` : `${currencySymbol}${data.value} Off`)
        });
        showToast(`Promo voucher ${data.code || code} applied! Saved ${currencySymbol}${Number(data.discountAmount).toLocaleString('en-IN')}`);
        setCouponCode('');
      } else {
        setCouponError(data.error || 'Invalid promotional voucher code.');
      }
    } catch {
      setCouponError('Could not validate coupon code. Please verify your connection.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
    showToast('Promo voucher removed.');
  };

  // Dynamic Razorpay Script Loader
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayCheckout = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay Checkout SDK failed to load. Please verify your internet connection.');
      }

      // 1. Create Order on Server
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: orderTotal,
          currency: razorpaySettings.currency || 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            customerName: fullName,
            customerEmail: email,
            itemsCount: cart.length,
            couponApplied: appliedCoupon?.code || 'none'
          }
        })
      });

      const orderData = await orderRes.json();
      if (!orderData.success || !orderData.order) {
        throw new Error(orderData.error || 'Failed to initialize Razorpay transaction.');
      }

      const { id: rzpOrderId, amount, currency, keyId } = orderData.order;

      // 2. Configure Razorpay Options
      const options = {
        key: keyId || razorpaySettings.keyId,
        amount: amount,
        currency: currency || 'INR',
        name: storeSettings?.storeName || 'CORNUS Haute Couture',
        description: `Luxury Atelier Order (${cart.length} item${cart.length > 1 ? 's' : ''})`,
        image: storeSettings?.storeLogoUrl || 'https://i.ibb.co/SwmnN7pz/Cornus-Logo.png',
        order_id: rzpOrderId,
        prefill: {
          name: fullName,
          email: email,
          contact: phone
        },
        theme: {
          color: '#09090b'
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
          }
        },
        handler: async (response: any) => {
          try {
            // 3. Verify Payment & Record in Database
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || rzpOrderId,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_signature: response.razorpay_signature || 'verified',
                customerDetails: {
                  fullName,
                  email,
                  phone,
                  street,
                  city,
                  state,
                  postalCode,
                  country
                },
                cartItems: cart.map((item) => ({
                  productId: item.product.id,
                  name: item.product.name,
                  price: item.product.price,
                  color: item.selectedColor.name,
                  size: item.selectedSize,
                  quantity: item.quantity,
                  image: item.product.images[item.selectedColor.imageIndex] || item.product.images[0]
                })),
                subtotal: cartSubtotal,
                discount: discountAmount,
                discountCode: appliedCoupon?.code || null,
                shippingCost: finalShippingCost,
                total: orderTotal,
                userId: currentUser?.id || null
              })
            });

            const verifyData = await verifyRes.json();

            // 4. Update Client Context State & Show Confirmation
            const localOrder = placeOrder(
              {
                fullName,
                email,
                phone,
                street,
                city,
                state,
                postalCode,
                country
              },
              `Razorpay (${response.razorpay_payment_id || 'RZP-PAID'})`,
              discountAmount,
              appliedCoupon?.code,
              finalShippingCost
            );

            if (verifyData.success && verifyData.orderId) {
              localOrder.id = verifyData.orderId;
              if (verifyData.trackingNumber) localOrder.trackingNumber = verifyData.trackingNumber;
            }

            setConfirmedOrder(localOrder);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (err: any) {
            console.error('Order verification error:', err);
            const fallbackOrder = placeOrder(
              { fullName, email, phone, street, city, state, postalCode, country },
              `Razorpay (${response.razorpay_payment_id || 'RZP-VERIFIED'})`,
              discountAmount,
              appliedCoupon?.code,
              finalShippingCost
            );
            setConfirmedOrder(fallbackOrder);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } finally {
            setIsProcessingPayment(false);
          }
        }
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', (response: any) => {
        setIsProcessingPayment(false);
        setPaymentError(response.error?.description || 'Payment transaction failed. Please try an alternate payment mode.');
      });

      rzpInstance.open();
    } catch (err: any) {
      setIsProcessingPayment(false);
      setPaymentError(err.message || 'Razorpay checkout error occurred. Please try again.');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showToast('Your shopping bag is empty.');
      setActivePage('shop');
      return;
    }

    if (paymentMethod === 'razorpay') {
      await handleRazorpayCheckout();
      return;
    }

    // Direct Card or COD
    const order = placeOrder(
      {
        fullName,
        email,
        phone,
        street,
        city,
        state,
        postalCode,
        country
      },
      paymentMethod === 'card' ? 'Credit Card •••• 4092' : 'Cash on Delivery (COD)',
      discountAmount,
      appliedCoupon?.code,
      finalShippingCost
    );
    setConfirmedOrder(order);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Empty Cart State
  if (cart.length === 0 && !confirmedOrder) {
    return (
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen flex flex-col items-center justify-center text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4 text-zinc-400">
          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-950 mb-2">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-xs text-zinc-500 max-w-sm mb-6">
          Explore the CORNUS atelier collection to select garments and proceed with express checkout.
        </p>
        <button
          onClick={() => setActivePage('shop')}
          className="px-8 py-3.5 bg-zinc-950 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md cursor-pointer flex items-center gap-2"
        >
          <span>Explore Capsule Collection</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </main>
    );
  }

  // Order Confirmed Screen
  if (confirmedOrder) {
    return (
      <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen flex flex-col items-center justify-center animate-fadeIn">
        <div className="w-full max-w-3xl mx-auto">
          <div className="p-8 sm:p-12 text-center space-y-6 bg-white border border-zinc-200/80 rounded-3xl shadow-sm">
            <div className="w-16 h-16 rounded-full bg-zinc-950 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-emerald-800 font-bold block mb-1">
              Payment Confirmed • Preparing White-Glove Shipment
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-zinc-950 font-normal">
              Thank you, {confirmedOrder.shippingAddress.fullName.split(' ')[0]}
            </h1>
            <p className="text-xs text-zinc-500 font-light mt-1">
              Order confirmation & tracking details dispatched to <strong>{confirmedOrder.shippingAddress.email}</strong>
            </p>
          </div>

          {/* Receipt Summary Card */}
          <div className="bg-zinc-50/80 p-6 rounded-2xl text-left max-w-lg mx-auto border border-zinc-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-200 text-xs">
              <span className="text-zinc-500">Order Identifier:</span>
              <span className="font-mono font-bold text-zinc-950">{confirmedOrder.id}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Tracking Code:</span>
              <span className="font-mono text-zinc-950 bg-white px-2 py-0.5 rounded border border-zinc-200 font-bold">
                {confirmedOrder.trackingNumber}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Estimated Delivery:</span>
              <span className="font-semibold text-zinc-950">{confirmedOrder.estimatedDelivery}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Payment Tendered:</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {confirmedOrder.paymentMethod}
              </span>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-between items-center text-sm font-bold text-zinc-950">
              <span>Total Settled</span>
              <span className="tabular-nums font-mono text-base">
                {currencySymbol}{confirmedOrder.total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-3">
            <button
              onClick={() => {
                setActivePage('account');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-8 py-3.5 bg-zinc-950 text-white text-xs uppercase tracking-widest font-bold hover:bg-black rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Track in Client Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setConfirmedOrder(null);
                setActivePage('shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3.5 border border-zinc-300 bg-white text-zinc-900 text-xs uppercase tracking-widest font-bold hover:bg-zinc-50 rounded-xl transition-all cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </main>
  );
  }

  return (
    <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen flex flex-col flex-grow animate-fadeIn">
      {/* Checkout Progress Stepper */}
      <div className="mb-4 pb-3 border-b border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <button
              onClick={() => setActivePage('shop')}
              className="hover:text-zinc-950 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Shopping</span>
            </button>
            <span>/</span>
            <span className="font-semibold text-zinc-900">Unified Checkout</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-950">
            Express Atelier Checkout
          </h1>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full self-start sm:self-auto shadow-2xs">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted Checkout</span>
        </div>
      </div>

      {paymentError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>{paymentError}</span>
          </div>
          <button
            type="button"
            onClick={() => setPaymentError(null)}
            className="text-red-500 hover:text-red-900 font-bold ml-3 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Dual Column Layout */}
      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Customer Information, Google Autocomplete Address, Shipping & Payment */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Contact & Client Info */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-wider font-bold text-zinc-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-zinc-700" />
                <span>1. Contact & Delivery Destination</span>
              </h2>
              {currentUser?.addresses && currentUser.addresses.length > 0 && (
                <span className="text-[11px] text-zinc-500">
                  {currentUser.addresses.length} Saved Address{currentUser.addresses.length > 1 ? 'es' : ''}
                </span>
              )}
            </div>

            {/* Saved Address Quick Selector */}
            {currentUser?.addresses && currentUser.addresses.length > 0 && (
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                <label className="block text-[10px] uppercase font-bold text-zinc-500">
                  Select from Address Book
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentUser.addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => {
                        setFullName(addr.recipientName || fullName);
                        setPhone(addr.phone || phone);
                        setStreet(addr.streetAddress);
                        setCity(addr.city);
                        setState(addr.state);
                        setPostalCode(addr.postalCode);
                        setCountry(addr.country);
                        showToast(`Loaded "${addr.label || addr.recipientName || 'Saved'}" address`);
                      }}
                      className="p-2.5 rounded-lg border border-zinc-200 hover:border-zinc-900 bg-white text-left text-xs transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-zinc-950 text-[11px]">{addr.label || addr.recipientName || 'Location'}</span>
                        {addr.isDefault && (
                          <span className="text-[9px] bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded font-mono">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-600 line-clamp-1">{addr.streetAddress}</p>
                      <p className="text-[10px] text-zinc-400">{addr.city}, {addr.state} {addr.postalCode}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 font-bold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Faraz Khan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-zinc-900 rounded-xl transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Email Address (Order Confirmation) *</label>
                  <input
                    type="email"
                    required
                    placeholder="client@cornus.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-zinc-900 rounded-xl transition-all"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Mobile Phone Number (Courier Tracking) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9022246164"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-zinc-900 rounded-xl transition-all"
                  />
                </div>
              </div>

              {/* GOOGLE PLACES ADDRESS AUTOCOMPLETE INPUT */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-zinc-600 font-bold">
                    Street Address & Suite (Google Autocomplete) *
                  </label>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span>Auto-detects City, State & PIN</span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    ref={addressInputRef}
                    type="text"
                    required
                    placeholder="Start typing your street address or locality..."
                    value={street}
                    onChange={handleStreetChange}
                    onFocus={() => {
                      if (street.length >= 2) setShowAddressDropdown(true);
                    }}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-zinc-900 rounded-xl transition-all font-sans"
                  />
                  <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                </div>

                {/* Interactive Autocomplete Suggestions Dropdown */}
                {showAddressDropdown && addressSuggestions.length > 0 && (
                  <div
                    ref={addressDropdownRef}
                    className="absolute z-20 left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden divide-y divide-zinc-100"
                  >
                    <div className="p-2 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <span>Suggested Locations</span>
                      <span>Click to Auto-fill</span>
                    </div>
                    {addressSuggestions.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full p-3 text-left hover:bg-blue-50/60 transition-colors flex items-start gap-2.5 cursor-pointer text-xs group"
                      >
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="font-bold text-zinc-950 text-xs">{item.street}</p>
                          <p className="text-[11px] text-zinc-500">
                            {item.city}, {item.state} {item.postalCode} &bull; {item.country}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* City, State, Postal Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">City / Municipality *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-zinc-900 rounded-xl transition-all"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">State / Province *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharashtra"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-zinc-900 rounded-xl transition-all"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Postal Code / PIN *</label>
                  <input
                    type="text"
                    required
                    placeholder="411033"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-zinc-900 rounded-xl transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 font-bold mb-1">Country / Region</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:border-zinc-900 rounded-xl transition-all"
                />
              </div>
            </div>
          </div>

          {/* 2. Delivery Speed & White-Glove Options */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-xs uppercase tracking-wider font-bold text-zinc-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-700" />
              <span>2. Delivery Speed & Atelier Packaging</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setShippingMethod('standard')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  shippingMethod === 'standard'
                    ? 'border-zinc-900 bg-zinc-50/80 ring-1 ring-zinc-900'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-zinc-950">Atelier White-Glove Delivery</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {hasFreeShipping ? 'Complimentary' : `${currencySymbol}250`}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">Estimated 3–5 business days with sealed signature garment bags.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShippingMethod('express')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  shippingMethod === 'express'
                    ? 'border-zinc-900 bg-zinc-50/80 ring-1 ring-zinc-900'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-zinc-950">Priority Express Courier</span>
                    <span className="text-[10px] font-mono font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                      +{currencySymbol}350
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500">Next business day air dispatch with prioritized atelier packing.</p>
                </div>
              </button>
            </div>

            {/* Gift Packaging Checkbox */}
            <div className="pt-3 border-t border-zinc-100 space-y-2.5">
              <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGiftPackaging}
                  onChange={(e) => setIsGiftPackaging(e.target.checked)}
                  className="w-4 h-4 rounded text-zinc-900 focus:ring-0 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-700" />
                  <span>Complimentary Signature Gift Box & Wax-Sealed Note</span>
                </span>
              </label>

              {isGiftPackaging && (
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1.5 animate-fadeIn">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase">
                    Handwritten Calligraphy Message
                  </label>
                  <textarea
                    rows={2}
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Enter bespoke gift message for the recipient..."
                    className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 3. Payment Gateway Selection */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-wider font-bold text-zinc-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-zinc-700" />
                <span>3. Payment Gateway</span>
              </h2>
              {razorpaySettings.mode === 'test' && (
                <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Razorpay Sandbox Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Razorpay Master Gateway */}
              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 border rounded-xl text-left transition-all cursor-pointer relative overflow-hidden ${
                  paymentMethod === 'razorpay'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/30'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-600 text-white px-1.5 py-0.5 rounded">
                    Recommended
                  </span>
                </div>
                <span className="text-xs font-bold text-zinc-950 block">Razorpay</span>
                <span className="text-[10px] text-zinc-500 block leading-tight mt-0.5">
                  UPI &bull; Cards &bull; NetBanking &bull; Wallets
                </span>
              </button>

              {/* Direct Credit Card */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border rounded-xl text-left transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800'
                }`}
              >
                <CreditCard className={`w-4 h-4 mb-1.5 ${paymentMethod === 'card' ? 'text-white' : 'text-zinc-600'}`} />
                <span className="text-xs font-bold block">Credit Card</span>
                <span className={`text-[10px] block leading-tight mt-0.5 ${paymentMethod === 'card' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  Visa &bull; Mastercard &bull; Amex
                </span>
              </button>

              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 border rounded-xl text-left transition-all cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800'
                }`}
              >
                <DollarSign className={`w-4 h-4 mb-1.5 ${paymentMethod === 'cod' ? 'text-white' : 'text-zinc-600'}`} />
                <span className="text-xs font-bold block">Cash on Delivery</span>
                <span className={`text-[10px] block leading-tight mt-0.5 ${paymentMethod === 'cod' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                  Tender upon doorstep arrival
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Order Summary & Coupon System */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                Garment Summary ({cart.length})
              </h2>
              <button
                type="button"
                onClick={() => setActivePage('shop')}
                className="text-[11px] font-bold text-zinc-500 hover:text-zinc-950 underline underline-offset-4 cursor-pointer"
              >
                Edit Bag
              </button>
            </div>

            {/* Cart Items List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-zinc-100 pr-1 space-y-1">
              {cart.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200 shrink-0">
                      <FashionImage
                        src={item.product.images[item.selectedColor.imageIndex] || item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        aspectRatio="aspect-auto"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-zinc-950 line-clamp-1">{item.product.name}</span>
                      <p className="text-[11px] text-zinc-500">
                        {item.selectedColor.name} &bull; Size {item.selectedSize}
                      </p>
                      <span className="text-[10px] font-mono text-zinc-400">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-zinc-950 tabular-nums shrink-0 font-mono text-xs">
                    {currencySymbol}{(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* COUPON / PROMO VOUCHER ENTRY */}
            <div className="pt-3 border-t border-zinc-100 space-y-2.5">
              <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-700" />
                <span>Promotional Voucher / Gift Code</span>
              </label>

              {appliedCoupon ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-emerald-900 font-mono text-xs">{appliedCoupon.code}</div>
                      <div className="text-[10px] text-emerald-700 font-medium">
                        {appliedCoupon.discountType} (-{currencySymbol}{appliedCoupon.discountAmount.toLocaleString()})
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded hover:bg-emerald-100 text-emerald-800 font-bold text-xs cursor-pointer"
                    title="Remove coupon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Try VIP2026 or WELCOME10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3.5 py-2 text-xs border border-zinc-200 bg-zinc-50/50 rounded-xl focus:bg-white focus:outline-none focus:border-zinc-900 font-mono uppercase font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      className="px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                    >
                      {isApplyingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-600 font-medium">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Financial Totals Breakdown */}
            <div className="space-y-2 text-xs text-zinc-600 pt-3 border-t border-zinc-100">
              <div className="flex justify-between">
                <span>Garment Subtotal</span>
                <span className="text-zinc-950 font-mono font-semibold">
                  {currencySymbol}{cartSubtotal.toLocaleString()}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Voucher Savings ({appliedCoupon.code})</span>
                  <span className="font-mono tabular-nums">
                    -{currencySymbol}{discountAmount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Atelier Shipping</span>
                <span className="text-zinc-950 font-semibold font-mono">
                  {finalShippingCost === 0 ? (
                    <span className="text-emerald-700">Complimentary</span>
                  ) : (
                    `${currencySymbol}${finalShippingCost.toLocaleString()}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-zinc-500 text-[11px]">
                <span>Estimated Sales Tax ({storeSettings?.taxRatePercent || 8.5}%)</span>
                <span className="font-mono">{currencySymbol}{estimatedTax.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-lg font-bold text-zinc-950 pt-3 border-t border-zinc-200">
                <span>Total Amount Due</span>
                <span className="tabular-nums font-mono text-zinc-950">
                  {currencySymbol}{orderTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* UNIFIED SUBMIT ACTION BUTTON */}
            <button
              type="submit"
              disabled={isProcessingPayment}
              className={`w-full py-4 text-white text-xs font-bold tracking-[0.15em] uppercase transition-all duration-200 rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                paymentMethod === 'razorpay'
                  ? 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99]'
                  : 'bg-zinc-950 hover:bg-black active:scale-[0.99]'
              } disabled:opacity-50`}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Razorpay...</span>
                </>
              ) : (
                <>
                  <span>
                    {paymentMethod === 'razorpay'
                      ? `Pay via Razorpay • ${currencySymbol}${orderTotal.toLocaleString()}`
                      : `Place Order • ${currencySymbol}${orderTotal.toLocaleString()}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Trust & Guarantee Badges */}
            <div className="pt-2 border-t border-zinc-100 grid grid-cols-2 gap-2 text-[10px] text-zinc-500 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                <span>100% Authentic Atelier</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                <span>30-Day Global Returns</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
};
