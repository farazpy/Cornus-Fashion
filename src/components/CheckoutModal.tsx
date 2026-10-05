import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Truck, ArrowRight, CreditCard, DollarSign, Loader2, Sparkles, Lock, Tag, Trash2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { FashionImage } from './FashionImage';
import { Order } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    hasFreeShipping,
    placeOrder,
    setActivePage,
    currentUser,
    storeSettings
  } = useShop();

  const defaultAddr = currentUser?.addresses.find((a) => a.isDefault) || currentUser?.addresses[0];

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'card' | 'cod'>('razorpay');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Promo Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountType: string;
  } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

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

  // Fetch live payment gateway settings
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
  }, [isCheckoutOpen]);

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
  }, [currentUser, isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingCost = hasFreeShipping ? 0 : 250;
  const orderTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);
  const currencySymbol = storeSettings?.currencySymbol || '₹';

  // Apply Promo Coupon via MySQL validation endpoint
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean, cartSubtotal })
      });
      const data = await res.json();
      if (data.success && data.discountAmount !== undefined) {
        setAppliedCoupon({
          code: data.code || clean,
          discountAmount: Number(data.discountAmount),
          discountType: data.discountTypeDesc || (data.type === 'percentage' ? `${data.value}% Discount` : `${currencySymbol}${data.value} Off`)
        });
        setCouponCode('');
      } else {
        setCouponError(data.error || 'Invalid promotional voucher code.');
      }
    } catch {
      setCouponError('Could not validate coupon code.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
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
        throw new Error('Razorpay Checkout SDK failed to load. Please check your internet connection.');
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
                shippingCost,
                total: orderTotal,
                userId: currentUser?.id || null
              })
            });

            const verifyData = await verifyRes.json();
            
            // 4. Update Client State & Show Confirmation
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
              shippingCost
            );

            if (verifyData.success && verifyData.orderId) {
              localOrder.id = verifyData.orderId;
              if (verifyData.trackingNumber) localOrder.trackingNumber = verifyData.trackingNumber;
            }

            setConfirmedOrder(localOrder);
          } catch (err: any) {
            console.error('Order verification error:', err);
            const fallbackOrder = placeOrder(
              { fullName, email, phone, street, city, state, postalCode, country },
              `Razorpay (${response.razorpay_payment_id || 'RZP-VERIFIED'})`,
              discountAmount,
              appliedCoupon?.code,
              shippingCost
            );
            setConfirmedOrder(fallbackOrder);
          } finally {
            setIsProcessingPayment(false);
          }
        }
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', (response: any) => {
        setIsProcessingPayment(false);
        setPaymentError(response.error?.description || 'Payment failed. Please try an alternate card or UPI.');
      });

      rzpInstance.open();
    } catch (err: any) {
      setIsProcessingPayment(false);
      setPaymentError(err.message || 'Razorpay checkout error occurred. Please try again.');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

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
      paymentMethod === 'card'
        ? 'Credit Card •••• 4092'
        : 'Cash on Delivery (COD)',
      discountAmount,
      appliedCoupon?.code,
      shippingCost
    );
    setConfirmedOrder(order);
  };

  const handleCloseAndGoToOrders = () => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(null);
    setActivePage('account');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-200/80 my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg tracking-widest uppercase font-bold text-zinc-900">
              {storeSettings?.storeName || 'CORNUS'}
            </span>
            <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-mono px-2 py-0.5 bg-zinc-200/60 rounded">
              Secure Checkout
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsCheckoutOpen(false);
                setActivePage('checkout');
              }}
              className="text-xs font-semibold text-zinc-600 hover:text-black hover:underline cursor-pointer hidden sm:block"
            >
              Open Full Page Checkout &rarr;
            </button>
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-1.5 rounded-full hover:bg-zinc-200/60 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {confirmedOrder ? (
          /* Confirmation View */
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-mono text-emerald-700 font-bold">
                Order Confirmed
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-zinc-900">
                Thank you for your patronage.
              </h2>
              <p className="text-xs text-zinc-600 max-w-md mx-auto">
                An official atelier confirmation and digital invoice have been dispatched to{' '}
                <span className="font-bold text-zinc-900">{confirmedOrder.shippingAddress.email}</span>.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-zinc-50 p-6 rounded-2xl text-left max-w-lg mx-auto border border-zinc-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-200 text-xs">
                <span className="text-zinc-500">Order Identifier:</span>
                <span className="font-mono font-bold text-zinc-950">{confirmedOrder.id}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Tracking Code:</span>
                <span className="font-mono text-zinc-950 bg-white px-2 py-0.5 rounded border border-zinc-200">{confirmedOrder.trackingNumber}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Estimated Delivery:</span>
                <span className="font-semibold text-zinc-950">{confirmedOrder.estimatedDelivery}</span>
              </div>

              {confirmedOrder.discount > 0 && (
                <div className="flex justify-between items-center text-xs text-emerald-700 font-semibold">
                  <span>Discount Applied ({confirmedOrder.discountCode || 'Promo'}):</span>
                  <span>-{currencySymbol}{confirmedOrder.discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500">Payment Gateway:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{confirmedOrder.paymentMethod}</span>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-between items-center text-sm font-bold text-zinc-950">
                <span>Total Settled</span>
                <span className="tabular-nums font-mono">{currencySymbol}{confirmedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                onClick={handleCloseAndGoToOrders}
                className="px-8 py-3.5 bg-zinc-950 text-white text-xs uppercase tracking-widest font-bold hover:bg-black rounded-xl transition-all shadow-md cursor-pointer"
              >
                Track in Client Dashboard
              </button>
              <button
                onClick={() => {
                  setIsCheckoutOpen(false);
                  setConfirmedOrder(null);
                  setActivePage('shop');
                }}
                className="px-6 py-3.5 border border-zinc-300 bg-white text-zinc-900 text-xs uppercase tracking-widest font-bold hover:bg-zinc-50 rounded-xl transition-all cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-8">
            {paymentError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
                <span>{paymentError}</span>
                <button
                  type="button"
                  onClick={() => setPaymentError(null)}
                  className="text-red-500 hover:text-red-900 font-bold ml-3"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Left Column: Form Details */}
              <div className="md:col-span-7 space-y-6">
                {/* 1. Contact & Shipping */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-900 mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-zinc-700" />
                    <span>1. Delivery Destination</span>
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 bg-white focus:outline-none focus:border-zinc-900 rounded-xl"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="email"
                        required
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="px-3.5 py-2.5 text-xs border border-zinc-200 bg-white focus:outline-none focus:border-zinc-900 rounded-xl"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="px-3.5 py-2.5 text-xs border border-zinc-200 bg-white focus:outline-none focus:border-zinc-900 rounded-xl"
                      />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Street Address, Apt / Suite"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-zinc-200 bg-white focus:outline-none focus:border-zinc-900 rounded-xl"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="px-3.5 py-2.5 text-xs border border-zinc-200 bg-white focus:outline-none focus:border-zinc-900 rounded-xl"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="px-3.5 py-2.5 text-xs border border-zinc-200 bg-white focus:outline-none focus:border-zinc-900 rounded-xl"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Postal Code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="px-3.5 py-2.5 text-xs border border-zinc-200 bg-white focus:outline-none focus:border-zinc-900 rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Payment Gateway Selection */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-bold text-zinc-900 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-zinc-700" />
                      <span>2. Payment Mode</span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>256-Bit Encrypted</span>
                    </span>
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Razorpay Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`p-3.5 border rounded-xl text-left transition-all relative cursor-pointer ${
                        paymentMethod === 'razorpay'
                          ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono">
                          Razorpay
                        </span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <span className="text-xs font-bold text-zinc-900 block">UPI / Cards</span>
                      <span className="text-[10px] text-zinc-500 block leading-tight mt-0.5">Instant gateway</span>
                    </button>

                    {/* Direct Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3.5 border rounded-xl text-left transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800'
                      }`}
                    >
                      <CreditCard className={`w-4 h-4 mb-1.5 ${paymentMethod === 'card' ? 'text-white' : 'text-zinc-600'}`} />
                      <span className="text-xs font-bold block">Credit Card</span>
                      <span className={`text-[10px] block leading-tight mt-0.5 ${paymentMethod === 'card' ? 'text-zinc-300' : 'text-zinc-500'}`}>Direct card</span>
                    </button>

                    {/* Cash on Delivery */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3.5 border rounded-xl text-left transition-all cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                          : 'border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800'
                      }`}
                    >
                      <DollarSign className={`w-4 h-4 mb-1.5 ${paymentMethod === 'cod' ? 'text-white' : 'text-zinc-600'}`} />
                      <span className="text-xs font-bold block">COD</span>
                      <span className={`text-[10px] block leading-tight mt-0.5 ${paymentMethod === 'cod' ? 'text-zinc-300' : 'text-zinc-500'}`}>Pay on delivery</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Items, Promo Coupon & Subtotal */}
              <div className="md:col-span-5 bg-zinc-50 p-5 rounded-2xl border border-zinc-200 flex flex-col justify-between space-y-4 shadow-xs">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 pb-3 border-b border-zinc-200">
                    Order Summary ({cart.length})
                  </h4>

                  <div className="max-h-44 overflow-y-auto divide-y divide-zinc-200/60 my-2">
                    {cart.map((item) => (
                      <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-11 bg-white rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                            <FashionImage
                              src={item.product.images[item.selectedColor.imageIndex] || item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                              aspectRatio="aspect-auto"
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-zinc-900 line-clamp-1">{item.product.name}</span>
                            <span className="text-[10px] text-zinc-500">
                              {item.selectedColor.name} &bull; {item.selectedSize} &bull; x{item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-zinc-950 tabular-nums shrink-0 font-mono">
                          {currencySymbol}{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Promo Coupon Entry */}
                  <div className="pt-3 border-t border-zinc-200 space-y-2">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-emerald-600" />
                          <div>
                            <span className="font-mono font-bold text-emerald-900">{appliedCoupon.code}</span>
                            <span className="text-[10px] text-emerald-700 block">{appliedCoupon.discountType}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-700">-{currencySymbol}{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="p-1 text-emerald-600 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter promo coupon code..."
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 uppercase font-mono placeholder:normal-case focus:border-zinc-900"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={isApplyingCoupon || !couponCode.trim()}
                            className="px-3.5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black cursor-pointer disabled:opacity-50 transition-colors"
                          >
                            {isApplyingCoupon ? '...' : 'Apply'}
                          </button>
                        </div>
                        {couponError && (
                          <p className="text-[11px] text-red-600 mt-1 font-medium">{couponError}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Totals Breakdown */}
                  <div className="space-y-1.5 text-xs text-zinc-600 pt-3 border-t border-zinc-200">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-zinc-950 font-mono font-semibold">{currencySymbol}{cartSubtotal.toLocaleString()}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Coupon Savings</span>
                        <span className="font-mono">-{currencySymbol}{discountAmount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-zinc-950 font-semibold">
                        {shippingCost === 0 ? <span className="text-emerald-700">Complimentary</span> : `${currencySymbol}${shippingCost.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-base font-bold text-zinc-950 pt-2 border-t border-zinc-200">
                      <span>Total Amount</span>
                      <span className="tabular-nums font-mono text-zinc-950">{currencySymbol}{orderTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

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
                      <span>Initializing Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {paymentMethod === 'razorpay'
                          ? `Pay via Razorpay • ${currencySymbol}${orderTotal.toLocaleString()}`
                          : `Confirm Order • ${currencySymbol}${orderTotal.toLocaleString()}`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
