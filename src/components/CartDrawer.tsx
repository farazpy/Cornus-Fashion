import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { FashionImage } from './FashionImage';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    cartCount,
    freeShippingThreshold,
    freeShippingRemaining,
    hasFreeShipping,
    setIsCheckoutOpen,
    setActivePage,
    showToast,
    storeSettings
  } = useShop();

  const currencySymbol = storeSettings?.currencySymbol || 'INR ';

  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const shippingFee = hasFreeShipping || cart.length === 0 ? 0 : 250;
  const totalAmount = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim(), cartSubtotal })
      });
      const data = await res.json();
      if (data.success) {
        setDiscountAmount(data.discountAmount);
        setAppliedCode(data.code);
        showToast(`Promo code ${data.code} applied! Saved ${currencySymbol}${data.discountAmount.toLocaleString('en-IN')}`);
      } else {
        showToast(data.error || 'Invalid promo code. Try CORNUS10 or WELCOME20.');
      }
    } catch {
      showToast('Validation failed.');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setActivePage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Dark backdrop with blur */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md glass-modal bg-white/95 backdrop-blur-2xl border-l border-black/10 flex flex-col shadow-2xl">
          {/* Drawer Header */}
          <div className="p-6 border-b border-black/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-normal text-black">
                Shopping Bag
              </h2>
              <span className="text-xs text-black/50 font-mono">
                ({cartCount} {cartCount === 1 ? 'item' : 'items'})
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-black/60 hover:text-black transition-colors rounded-full hover:bg-black/5"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Progress */}
          <div className="px-6 py-3.5 bg-black/[0.03] border-b border-black/5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-black/70 font-medium">
                {hasFreeShipping ? (
                  <span className="flex items-center gap-1.5 text-black font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Complimentary express shipping unlocked
                  </span>
                ) : (
                  <span>
                    <strong className="font-semibold text-black">{currencySymbol}{freeShippingRemaining.toLocaleString('en-IN')}</strong> away from free express shipping
                  </span>
                )}
              </span>
              <span className="text-[10px] text-black/40 font-mono">
                {currencySymbol}{cartSubtotal.toLocaleString('en-IN')} / {currencySymbol}{freeShippingThreshold.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-black transition-all duration-500 rounded-full"
                style={{
                  width: `${Math.min(100, (cartSubtotal / freeShippingThreshold) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-black/5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full border border-black/10 flex items-center justify-center text-black/40 mb-4 font-serif text-2xl">
                  C
                </div>
                <h3 className="font-serif text-xl font-normal text-black mb-2">
                  Your bag is empty
                </h3>
                <p className="text-xs text-black/60 font-light max-w-xs mb-6">
                  Explore our curated seasonal edits and permanent collection pieces.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setActivePage('shop');
                  }}
                  className="px-6 py-3 bg-black text-white text-xs font-semibold tracking-[0.16em] uppercase hover:bg-black/85 transition-colors"
                >
                  Discover Collections
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-24 shrink-0 bg-[#f4f4f2] overflow-hidden rounded-xs border border-black/5">
                    <FashionImage
                      src={item.product.images[item.selectedColor.imageIndex] || item.product.images[0]}
                      alt={item.product.name}
                      categoryHint={item.product.category}
                      className="w-full h-full object-cover"
                      aspectRatio="aspect-auto"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-black line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-black/40 hover:text-black p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-[11px] text-black/60">
                        <span>Color: {item.selectedColor.name}</span>
                        <span>·</span>
                        <span>Size: {item.selectedSize}</span>
                      </div>
                      {item.isPreOrder && (
                        <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-amber-50 text-amber-900 border border-amber-200">
                          <span>Atelier Pre-Order</span>
                          {item.preOrderReleaseDate && <span>• Ships {item.preOrderReleaseDate}</span>}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-black/15 rounded-xs">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-black/5 text-black transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium tabular-nums text-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-black/5 text-black transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-sm font-semibold text-black tabular-nums">
                        {currencySymbol}{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout Action */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-black/10 bg-white/90 backdrop-blur-md space-y-4">
              {/* Promo input */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code (try CORNUS10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-black/15 bg-white focus:border-black focus:outline-none uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-black/10 hover:bg-black hover:text-white text-black text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  Apply
                </button>
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-black/70">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-black tabular-nums">{currencySymbol}{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCode && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({appliedCode})</span>
                    <span className="tabular-nums">-{currencySymbol}{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-black tabular-nums">
                    {shippingFee === 0 ? 'Complimentary' : `${currencySymbol}${shippingFee.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-black pt-2 border-t border-black/10">
                  <span>Estimated Total</span>
                  <span className="tabular-nums">{currencySymbol}{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 bg-black text-white hover:bg-black/85 text-xs font-semibold tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-black/50 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-black/70" />
                  <span>Complimentary carbon-neutral shipping & returns</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
