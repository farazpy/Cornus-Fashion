import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, Star, ArrowRight, ShieldCheck, Truck, Check, Plus, Minus } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { FashionImage } from './FashionImage';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, isInWishlist, toggleWishlist, navigateToProduct, storeSettings } = useShop();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Sync state whenever quickViewProduct changes
  useEffect(() => {
    if (quickViewProduct) {
      setActiveImageIndex(0);
      setSelectedColorIndex(0);
      setSelectedSize(quickViewProduct.sizes?.[0] || 'M');
      setQuantity(1);
      setAddedSuccess(false);
    }
  }, [quickViewProduct]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && quickViewProduct) {
        setQuickViewProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickViewProduct, setQuickViewProduct]);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const currentColor = product.colors[selectedColorIndex] || product.colors[0];
  const isSaved = isInWishlist(product.id);
  const isOutOfStock = !product.inStock || (typeof product.stockCount === 'number' && product.stockCount <= 0);

  const handleColorChange = (index: number) => {
    setSelectedColorIndex(index);
    if (product.colors[index] && product.colors[index].imageIndex < product.images.length) {
      setActiveImageIndex(product.colors[index].imageIndex);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, currentColor, selectedSize, quantity);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      setQuickViewProduct(null);
    }, 1200);
  };

  const handleGoToDetailPage = () => {
    navigateToProduct(product.id);
    setQuickViewProduct(null);
  };

  const currencySymbol = storeSettings?.currencySymbol === '?' ? '₹' : (storeSettings?.currencySymbol || '₹');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      {/* Backdrop Blur Overlay */}
      <div
        onClick={() => setQuickViewProduct(null)}
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-900/15 text-left transform-gpu transition-all">
        {/* Top Header / Close Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-neutral-50/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">
              Quick View Preview
            </span>
          </div>

          <button
            onClick={() => setQuickViewProduct(null)}
            className="w-9 h-9 rounded-full bg-white hover:bg-neutral-200 text-neutral-800 flex items-center justify-center transition-all border border-black/10 shadow-xs cursor-pointer hover:rotate-90"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Left Column: Image Gallery (5/12) */}
          <div className="md:col-span-6 bg-[#fbf9f6] p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-black/10">
            {/* Primary Showcase Image */}
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-black/10 shadow-md bg-white">
              <FashionImage
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                categoryHint={product.category}
                aspectRatio="aspect-[3/4]"
              />

              {/* Status Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                {product.isNew && (
                  <span className="text-[8px] font-black uppercase tracking-widest text-white bg-black/90 px-2.5 py-1 rounded-md shadow-xs">
                    New Season
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="text-[8px] font-black uppercase tracking-widest text-amber-900 bg-amber-100/90 border border-amber-300/60 px-2.5 py-1 rounded-md shadow-xs">
                    Best Seller
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-2.5 mt-4 overflow-x-auto no-scrollbar w-full justify-center">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 aspect-[3/4] rounded-lg overflow-hidden border transition-all ${
                      activeImageIndex === idx
                        ? 'border-black ring-2 ring-black ring-offset-1 scale-105 shadow-sm'
                        : 'border-black/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <FashionImage
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      categoryHint={product.category}
                      aspectRatio="aspect-[3/4]"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Garment Information & Quick Purchase (6/12) */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Rating Bar */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-neutral-600">
                  {product.category} · {product.gender}
                </span>

                {product.rating > 0 && (
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 text-amber-900 text-[10px] font-bold">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-neutral-600 font-normal">({product.reviewCount || 0})</span>
                  </div>
                )}
              </div>

              {/* Product Title */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight leading-snug mb-3">
                {product.name}
              </h2>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-xl sm:text-2xl font-black text-neutral-900 tabular-nums">
                  {currencySymbol}{Number(product.price).toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="text-sm font-bold text-neutral-400 line-through tabular-nums">
                    {currencySymbol}{Number(product.originalPrice).toLocaleString()}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Description excerpt */}
              <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3 mb-5 font-normal">
                {product.description}
              </p>

              {/* Color Swatch Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-900">
                      Color Variant
                    </span>
                    <span className="text-xs font-semibold text-neutral-600">
                      {currentColor?.name || 'Standard'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.colors.map((c, idx) => (
                      <button
                        key={c.name}
                        onClick={() => handleColorChange(idx)}
                        className={`group relative w-8 h-8 rounded-full border transition-all flex items-center justify-center ${
                          selectedColorIndex === idx
                            ? 'ring-2 ring-black ring-offset-2 scale-110 shadow-sm'
                            : 'border-neutral-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {selectedColorIndex === idx && (
                          <span className="w-2 h-2 rounded-full bg-white shadow-xs border border-black/20" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-900">
                      Select Size
                    </span>
                    <span className="text-[10px] text-neutral-600 font-medium">True to size</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                          selectedSize === sz
                            ? 'bg-black text-white border-black shadow-sm'
                            : 'bg-white text-neutral-800 border-neutral-200 hover:border-black'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Counter */}
              <div className="flex items-center justify-between mb-6 pt-2 border-t border-black/10">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-900">
                  Quantity
                </span>
                <div className="flex items-center border border-black/15 rounded-xl overflow-hidden bg-neutral-50 shadow-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 hover:bg-neutral-200 text-neutral-800 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-mono font-bold text-neutral-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1.5 hover:bg-neutral-200 text-neutral-800 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-grow py-3.5 px-6 rounded-2xl text-xs font-extrabold uppercase tracking-[0.16em] transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : isOutOfStock
                      ? 'bg-neutral-200 text-neutral-600 cursor-not-allowed'
                      : 'bg-black text-white hover:bg-neutral-800 active:scale-[0.99]'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-white stroke-[2.5]" />
                      <span>Added to Shopping Bag</span>
                    </>
                  ) : isOutOfStock ? (
                    <span>Currently Out of Stock</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 stroke-[2]" />
                      <span>Add To Bag · {currencySymbol}{(Number(product.price) * quantity).toLocaleString()}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-neutral-700 border-neutral-200 hover:border-black'
                  }`}
                  title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart className={`w-5 h-5 stroke-[2] ${isSaved ? 'fill-white text-white' : ''}`} />
                </button>
              </div>

              {/* View Full Product Link */}
              <button
                onClick={handleGoToDetailPage}
                className="w-full py-2.5 text-center text-xs font-bold tracking-wider text-neutral-900 hover:text-black hover:underline transition-all flex items-center justify-center gap-1.5"
              >
                <span>View Full Garment Details & Specs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Shipping Guarantee Bullet */}
              <div className="flex items-center justify-center gap-4 pt-2 text-[10px] text-neutral-600 border-t border-black/5">
                <span className="flex items-center gap-1 font-medium">
                  <Truck className="w-3 h-3 text-neutral-700" /> Express Dispatch
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3 text-neutral-700" /> Guaranteed Authentic
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
