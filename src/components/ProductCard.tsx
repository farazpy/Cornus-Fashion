import React, { useState } from 'react';
import { Heart, Plus, Check, Star, Eye } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';
import { FashionImage } from './FashionImage';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { navigateToProduct, addToCart, isInWishlist, toggleWishlist, storeSettings, setQuickViewProduct } = useShop();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickSizes, setShowQuickSizes] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [hoveredColorIndex, setHoveredColorIndex] = useState<number | null>(null);

  const selectedColor = product.colors[selectedColorIndex] || product.colors[0];
  
  // Use the image corresponding to the selected color if configured, else default to index 0
  const primaryImage = product.images[selectedColor.imageIndex] || product.images[0];
  const secondaryImage = product.images[1] || primaryImage;
  const isSaved = isInWishlist(product.id);

  const handleTriggerQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      setQuickViewProduct(product);
    }
  };

  const handleQuickAdd = (size: string, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedColor, size, 1, product.isPreOrder, product.preOrderReleaseDate);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setShowQuickSizes(false);
    }, 1500);
  };

  const activeColorLabel = hoveredColorIndex !== null 
    ? product.colors[hoveredColorIndex]?.name 
    : product.colors[selectedColorIndex]?.name;

  return (
    <div
      onClick={() => navigateToProduct(product.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowQuickSizes(false);
        setHoveredColorIndex(null);
      }}
      className="group relative flex flex-col cursor-pointer bg-white border border-neutral-900/12 p-3.5 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* 1. Main Image Showcase Box with creative lift and inner border */}
      <div className="relative w-full aspect-[3/4] bg-[#fcfbfa]/30 overflow-hidden rounded-xl border border-neutral-900/10 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] transform-gpu [backface-visibility:hidden]">
        {/* Primary Image with smooth zoom on card hover */}
        <div
          className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] transform-gpu [backface-visibility:hidden] ${
            isHovered && product.images.length > 1 ? 'opacity-0 scale-102 blur-xs' : 'opacity-100 scale-100'
          }`}
        >
          <FashionImage
            src={primaryImage}
            alt={product.name}
            categoryHint={product.category}
            aspectRatio="aspect-[3/4]"
          />
        </div>

        {/* Alternate Image on Hover with slight scale up */}
        {product.images.length > 1 && (
          <div
            className={`absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] transform-gpu [backface-visibility:hidden] ${
              isHovered ? 'opacity-100 scale-103' : 'opacity-0 scale-100'
            }`}
          >
            <FashionImage
              src={secondaryImage}
              alt={`${product.name} editorial view`}
              categoryHint={product.category}
              aspectRatio="aspect-[3/4]"
            />
          </div>
        )}

        {/* Soft elegant gradient overlay to ensure legibility of bottom items */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />

        {/* 2. Sophisticated Unboxed Header Tags (Anti-badge styling) */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.isNew && (
            <span className="text-[8px] tracking-[0.2em] font-extrabold uppercase text-white bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-md shadow-xs">
              New Season
            </span>
          )}
          {product.isBestSeller && (
            <span className="text-[8px] tracking-[0.2em] font-extrabold uppercase text-amber-900 bg-amber-50/90 backdrop-blur-xs border border-amber-200/50 px-2.5 py-1 rounded-md shadow-xs">
              Best Seller
            </span>
          )}
          {product.isTrending && (
            <span className="text-[8px] tracking-[0.2em] font-extrabold uppercase text-indigo-900 bg-indigo-50/90 backdrop-blur-xs border border-indigo-100/50 px-2.5 py-1 rounded-md shadow-xs">
              Trending
            </span>
          )}
          {product.isPreOrder && (
            <span className="text-[8px] tracking-[0.2em] font-extrabold uppercase text-amber-950 bg-amber-50/95 backdrop-blur-xs border border-amber-300 px-2.5 py-1 rounded-md shadow-xs">
              Pre-Order
            </span>
          )}
          {!product.isPreOrder && !product.inStock && (
            <span className="text-[8px] tracking-[0.2em] font-extrabold uppercase text-zinc-600 bg-zinc-100/90 backdrop-blur-xs border border-zinc-200 px-2.5 py-1 rounded-md">
              Sold Out
            </span>
          )}
        </div>

        {/* Floating Utilities Panel with responsive blur elements */}
        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
          {/* Quick View Button */}
          <button
            onClick={handleTriggerQuickView}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-zinc-800 hover:text-black flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md border border-white/80 hover:scale-110 active:scale-95 cursor-pointer"
            title="Quick View Garment"
          >
            <Eye className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Premium Wishlist Action with pop effect */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-xs ${
              isSaved
                ? 'bg-black text-white scale-110'
                : 'bg-white/70 hover:bg-white text-zinc-600 hover:text-black hover:scale-105 active:scale-95 border border-white/60 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 backdrop-blur-md'
            }`}
            aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 stroke-[2] ${isSaved ? 'fill-white text-white' : ''}`} />
          </button>
        </div>

        {/* 3. Slider Quick-Shop & Quick View Box (Glassmorphic slide up on hover) */}
        {product.inStock && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute bottom-0 left-0 right-0 p-2.5 z-20 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
              isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
            }`}
          >
            {!showQuickSizes ? (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={handleTriggerQuickView}
                  className="py-2 px-2 bg-white/95 hover:bg-white text-black text-[9px] tracking-[0.14em] uppercase font-extrabold transition-all duration-200 border border-black/10 shadow-md flex items-center justify-center gap-1 rounded-xl backdrop-blur-md cursor-pointer hover:scale-[1.02]"
                >
                  <Eye className="w-3.5 h-3.5 stroke-[2]" />
                  Quick View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product.sizes.length === 1) {
                      addToCart(product, selectedColor, product.sizes[0], 1);
                      setJustAdded(true);
                      setTimeout(() => setJustAdded(false), 1200);
                    } else {
                      setShowQuickSizes(true);
                    }
                  }}
                  className="py-2 px-2 bg-black hover:bg-neutral-800 text-white text-[9px] tracking-[0.14em] uppercase font-extrabold transition-all duration-200 border border-white/20 shadow-md flex items-center justify-center gap-1 rounded-xl backdrop-blur-md cursor-pointer hover:scale-[1.02]"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  Quick Add
                </button>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-md p-2.5 border border-white/60 shadow-xl rounded-xl animate-fadeIn text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[8px] tracking-widest uppercase text-zinc-400 font-extrabold">
                    Select Size
                  </span>
                  <button 
                    onClick={() => setShowQuickSizes(false)}
                    className="text-[8px] uppercase tracking-wider text-zinc-900 hover:underline font-extrabold"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={(e) => handleQuickAdd(size, e)}
                      className="py-1.5 text-[9px] font-bold border border-zinc-200 bg-white/50 hover:border-black hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center rounded-lg"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Just Added Full-Screen Overlay Confirmation */}
        {justAdded && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs z-30 flex flex-col items-center justify-center gap-1.5 text-white animate-fadeIn rounded-2xl">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
              <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
            </div>
            <span className="text-[9px] tracking-[0.25em] font-bold uppercase text-white">
              Added to Bag
            </span>
            <span className="text-[8px] text-zinc-400 tracking-wider truncate max-w-[85%]">
              {product.name}
            </span>
          </div>
        )}
      </div>

      {/* 4. Elegant Product Metadata Block with micro spacing details */}
      <div className="pt-3 pb-1 flex flex-col gap-1 px-1 text-left">
        {/* Category & Materials Double-Row Header */}
        <div className="flex items-center justify-between gap-2.5 text-[10px] uppercase text-neutral-500 font-extrabold">
          <div className="truncate flex items-center gap-1.5">
            <span>{product.category}</span>
            <span>·</span>
            <span>{product.gender}</span>
          </div>
          {/* Subtle Materials Callout on Luxury card */}
          {product.materials && (
            <span className="text-neutral-500 font-bold normal-case italic truncate max-w-[45%]">
              {product.materials}
            </span>
          )}
        </div>

        {/* Primary Product Name with elegant hover color transition */}
        <h3 className="text-xs sm:text-sm font-black text-neutral-900 group-hover:text-amber-500 transition-colors duration-200 truncate leading-snug">
          {product.name}
        </h3>

        {/* Price Tag & Reviews alignment row */}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          {/* Detailed Pricing breakdown */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-neutral-900 tabular-nums">
              {storeSettings?.currencySymbol || 'INR '}{Number(product.price).toLocaleString('en-IN')}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-neutral-400 font-bold line-through tabular-nums">
                {storeSettings?.currencySymbol || 'INR '}{Number(product.originalPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Luxury Swatch & Active Palette Manager */}
          {product.colors.length > 0 && (
            <div className="flex items-center gap-1.5">
              {/* Active Color Name Micro-Indicator on Swatch Hover */}
              {activeColorLabel && (
                <span className="hidden sm:inline text-[8px] tracking-wider text-zinc-400 font-extrabold normal-case truncate max-w-[65px]">
                  {activeColorLabel}
                </span>
              )}
              <div className="flex items-center -space-x-1 hover:space-x-1 transition-all duration-300">
                {product.colors.map((c, i) => (
                  <button
                    key={c.name}
                    onMouseEnter={() => setHoveredColorIndex(i)}
                    onMouseLeave={() => setHoveredColorIndex(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedColorIndex(i);
                    }}
                    className={`w-3 h-3 rounded-full border transition-all ${
                      selectedColorIndex === i 
                        ? 'ring-1 ring-black ring-offset-1 scale-110 z-10 shadow-xs' 
                        : 'border-zinc-200 hover:scale-105 hover:z-10'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    aria-label={`Select ${c.name} color`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Premium Ratings Indicator */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-0.5 text-[9px] text-zinc-500 font-medium">
            <div className="flex items-center text-amber-400">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={`w-2.5 h-2.5 ${
                    index < Math.floor(product.rating) 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-zinc-100'
                  }`}
                />
              ))}
            </div>
            <span className="tabular-nums font-bold text-zinc-700 ml-0.5">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-zinc-400">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
