import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingBag, ArrowRight, Share2, Copy, Check, Sparkles, MessageSquare, Zap, Shield, Bookmark, Star } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { FashionImage } from './FashionImage';
import { Product, ProductColor } from '../types';

export const WishlistPage: React.FC = () => {
  const { 
    products, 
    wishlistIds, 
    toggleWishlist, 
    addToCart, 
    navigateToProduct, 
    setActivePage,
    showToast,
    storeSettings 
  } = useShop();

  const savedProducts = products.filter((p) => wishlistIds.includes(p.id));

  // Local state for selected size and color per product card
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, ProductColor>>({});
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('cornus_wishlist_notes');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  const [activeEditingNoteId, setActiveEditingNoteId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Currency symbol
  const currency = storeSettings?.currencySymbol || '₹';

  // Save notes to localStorage
  const handleSaveNote = (productId: string, text: string) => {
    const updated = { ...notes, [productId]: text };
    setNotes(updated);
    try {
      localStorage.setItem('cornus_wishlist_notes', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate totals
  const totalValue = savedProducts.reduce((sum, p) => sum + p.price, 0);
  const totalRewardPoints = Math.round(totalValue * 0.05);

  const handleMoveAllToBag = () => {
    if (savedProducts.length === 0) return;
    let addedCount = 0;
    savedProducts.forEach((p) => {
      const color = selectedColors[p.id] || p.colors[0];
      const size = selectedSizes[p.id] || p.sizes[0] || 'M';
      addToCart(p, color, size, 1);
      addedCount++;
    });
    showToast(`Added ${addedCount} wishlist garments to your shopping bag!`);
  };

  const handleShareCopy = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    showToast('Wishlist link copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen flex flex-col flex-grow">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-3 sm:mb-4 font-light">
        <button onClick={() => setActivePage('home')} className="hover:text-black transition-colors">
          Home
        </button>
        <span>/</span>
        <span className="text-black font-semibold">Wishlist & Saved Lookbook</span>
      </nav>

      {/* Editorial Header Banner */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-stone-900 text-white rounded-3xl p-6 sm:p-10 mb-6 sm:mb-8 shadow-xl relative overflow-hidden">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase text-amber-300 border border-white/15 mb-4">
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>Curated Uniform Workspace</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-white mb-3">
              Your Saved Wardrobe
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 font-light max-w-xl leading-relaxed">
              Bookmark seasonal silhouettes, assemble architectural fits, and transition deliberate pieces directly into your bag.
            </p>
          </div>

          {/* Wardrobe Metrics & Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white/5 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10">
            <div className="pr-0 sm:pr-6 border-b sm:border-b-0 sm:border-r border-white/15 pb-3 sm:pb-0">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono block mb-0.5">
                Saved Items
              </span>
              <span className="text-2xl font-bold font-mono text-white">
                {savedProducts.length} <span className="text-xs font-normal text-neutral-400">Pieces</span>
              </span>
            </div>

            <div className="pr-0 sm:pr-6 border-b sm:border-b-0 sm:border-r border-white/15 pb-3 sm:pb-0">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono block mb-0.5">
                Total Value
              </span>
              <span className="text-2xl font-bold font-mono text-amber-300">
                {currency}{totalValue.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-2 sm:pt-0">
              <button
                onClick={handleMoveAllToBag}
                disabled={savedProducts.length === 0}
                className="px-5 py-2.5 bg-white text-neutral-950 text-xs font-semibold tracking-wider uppercase rounded-xl hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                <span>Move All to Bag</span>
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                disabled={savedProducts.length === 0}
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wider uppercase rounded-xl transition-all flex items-center justify-center gap-2 border border-white/15 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Wishlist</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Wishlist Content */}
      {savedProducts.length === 0 ? (
        <div className="py-16 text-center max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-neutral-200/80 shadow-xs">
          <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mx-auto mb-6 shadow-xs">
            <Heart className="w-9 h-9 stroke-[1.5] fill-rose-100" />
          </div>
          <h2 className="font-serif text-3xl font-normal text-neutral-900 mb-3">
            Your Wishlist is Empty
          </h2>
          <p className="text-sm text-neutral-600 font-light leading-relaxed max-w-md mx-auto mb-8">
            Start building your personal wardrobe by clicking the heart icon on any garment in our collection.
          </p>

          <button
            onClick={() => setActivePage('shop')}
            className="px-8 py-4 bg-neutral-900 text-white text-xs font-semibold tracking-widest uppercase hover:bg-neutral-800 transition-all inline-flex items-center gap-2 rounded-xl shadow-md cursor-pointer active:scale-95"
          >
            <span>Explore Full Collection</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Quick Recommendations Section */}
          <div className="mt-16 pt-12 border-t border-neutral-200/80 text-left">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-normal text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Recommended Archival Pieces</span>
              </h3>
              <span className="text-xs text-neutral-500">Tap heart to bookmark</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {products.slice(0, 3).map((prod) => (
                <div 
                  key={prod.id} 
                  className="group bg-neutral-50 rounded-2xl p-3 border border-neutral-200/60 hover:shadow-md transition-all relative flex flex-col justify-between"
                >
                  <div 
                    onClick={() => navigateToProduct(prod.id)}
                    className="aspect-[3/4] rounded-xl overflow-hidden bg-neutral-200 mb-3 cursor-pointer relative"
                  >
                    <FashionImage
                      src={prod.images[0]}
                      alt={prod.name}
                      categoryHint={prod.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(prod.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 backdrop-blur-md text-neutral-400 hover:text-rose-500 shadow-xs transition-colors"
                      title="Save to wishlist"
                    >
                      <Heart className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] tracking-wider uppercase font-semibold text-neutral-500 block">
                      {prod.category} · {prod.gender}
                    </span>
                    <h4 
                      onClick={() => navigateToProduct(prod.id)}
                      className="text-xs font-semibold text-neutral-900 truncate mt-0.5 cursor-pointer hover:underline"
                    >
                      {prod.name}
                    </h4>
                    <span className="text-xs font-bold font-mono text-neutral-900 block mt-1">
                      {currency}{prod.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {savedProducts.map((product) => {
            const activeColor = selectedColors[product.id] || product.colors[0];
            const activeSize = selectedSizes[product.id] || product.sizes[0] || 'M';
            const userNote = notes[product.id] || '';

            return (
              <div
                key={product.id}
                className="group relative bg-white border border-neutral-200/90 rounded-3xl p-4 sm:p-5 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image & Quick Remove */}
                <div>
                  <div className="relative aspect-[3/4] bg-neutral-100 rounded-2xl overflow-hidden cursor-pointer mb-4">
                    <FashionImage
                      src={product.images[0]}
                      alt={product.name}
                      categoryHint={product.category}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      aspectRatio="aspect-auto"
                    />

                    {/* Stock Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full backdrop-blur-md shadow-xs ${
                        product.inStock 
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Pre-Order'}
                      </span>
                    </div>

                    {/* Trash Button */}
                    <button
                      onClick={() => {
                        toggleWishlist(product.id);
                        showToast(`Removed "${product.name}" from your wishlist`);
                      }}
                      className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur-md text-neutral-500 hover:text-rose-600 hover:bg-white shadow-sm transition-all cursor-pointer"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2]" />
                    </button>
                  </div>

                  {/* Garment Details */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] tracking-widest uppercase font-bold text-neutral-400">
                        {product.category} · {product.gender}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => navigateToProduct(product.id)}
                      className="font-serif text-lg font-medium text-neutral-900 cursor-pointer hover:text-neutral-600 transition-colors truncate"
                    >
                      {product.name}
                    </h3>

                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-bold font-mono text-neutral-900">
                        {currency}{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-neutral-400 line-through font-mono">
                          {currency}{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Color Palette Picker */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1.5">
                        Color: <span className="text-neutral-900">{activeColor.name}</span>
                      </span>
                      <div className="flex items-center gap-2">
                        {product.colors.map((c) => {
                          const isSelected = activeColor.name === c.name;
                          return (
                            <button
                              key={c.name}
                              onClick={() => setSelectedColors({ ...selectedColors, [product.id]: c })}
                              className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                                isSelected ? 'ring-2 ring-neutral-900 ring-offset-2 scale-110' : 'border-neutral-300 hover:scale-105'
                              }`}
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Size Selector Bar */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 block mb-1.5">
                        Select Size:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.sizes.map((sz) => {
                          const isSelected = activeSize === sz;
                          return (
                            <button
                              key={sz}
                              onClick={() => setSelectedSizes({ ...selectedSizes, [product.id]: sz })}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                  : 'border-neutral-200 text-neutral-700 hover:border-neutral-900 bg-white'
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Styling Memo / Personal Note */}
                  <div className="mb-4 bg-neutral-50 p-3 rounded-2xl border border-neutral-200/70">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Style Note</span>
                      </span>
                      {activeEditingNoteId !== product.id && (
                        <button
                          onClick={() => setActiveEditingNoteId(product.id)}
                          className="text-neutral-900 hover:underline text-[10px]"
                        >
                          {userNote ? 'Edit' : '+ Add Note'}
                        </button>
                      )}
                    </div>

                    {activeEditingNoteId === product.id ? (
                      <div className="space-y-2 mt-1">
                        <input
                          type="text"
                          value={userNote}
                          onChange={(e) => handleSaveNote(product.id, e.target.value)}
                          placeholder="e.g. Style with charcoal suit for autumn event"
                          className="w-full text-xs bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-900 text-neutral-900"
                          autoFocus
                        />
                        <button
                          onClick={() => setActiveEditingNoteId(null)}
                          className="px-3 py-1 bg-neutral-900 text-white text-[10px] font-semibold uppercase tracking-wider rounded-md hover:bg-neutral-800"
                        >
                          Save Memo
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-600 font-light italic truncate">
                        {userNote ? `"${userNote}"` : 'No styling notes added yet.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Move to Bag Action */}
                <button
                  onClick={() => {
                    addToCart(product, activeColor, activeSize, 1);
                    showToast(`Added ${product.name} (${activeSize}) to your bag!`);
                  }}
                  className="w-full py-3 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-2 rounded-xl shadow-xs cursor-pointer active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Bag ({activeSize})</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Wishlist Modal Overlay */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-2xl font-normal text-neutral-900">Share Your Wishlist</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-full text-neutral-400 hover:text-black hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 mb-6 leading-relaxed">
              Share your curated wardrobe with friends, family, or your personal stylist.
            </p>

            <div className="flex items-center gap-2 bg-neutral-100 p-2 rounded-xl border border-neutral-200 mb-6">
              <input
                type="text"
                readOnly
                value={typeof window !== 'undefined' ? window.location.href : 'https://cornusfashion.com/wishlist'}
                className="w-full bg-transparent text-xs text-neutral-800 font-mono focus:outline-none px-2"
              />
              <button
                onClick={handleShareCopy}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800 transition-colors shrink-0 flex items-center gap-1.5"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={() => setIsShareModalOpen(false)}
              className="w-full py-3 border border-neutral-300 rounded-xl text-xs font-semibold uppercase tracking-wider text-neutral-700 hover:bg-neutral-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
};
