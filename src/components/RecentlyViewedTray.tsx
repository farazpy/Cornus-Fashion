import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Eye, 
  X, 
  ShoppingBag, 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  Sparkles,
  ExternalLink 
} from 'lucide-react';

export const RecentlyViewedTray: React.FC = () => {
  const { 
    recentlyViewed, 
    clearRecentlyViewed, 
    navigateToProduct, 
    addToCart, 
    storeSettings, 
    setQuickViewProduct 
  } = useShop();

  const [isExpanded, setIsExpanded] = useState(false);

  // If disabled in store settings or no items viewed yet, don't render
  if (storeSettings?.enableRecentlyViewed === false || recentlyViewed.length === 0) {
    return null;
  }

  const currencySymbol = storeSettings?.currencySymbol || 'INR ';
  const title = storeSettings?.recentlyViewedTitle || 'Recently Viewed by You';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none print:hidden">
      {/* Floating Pill Trigger (when collapsed) */}
      {!isExpanded && (
        <div className="max-w-7xl mx-auto px-4 pb-3 flex justify-end">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="pointer-events-auto px-4 py-2 bg-zinc-950 hover:bg-black text-white text-xs font-bold rounded-full shadow-xl flex items-center gap-2 border border-white/10 hover:border-amber-500/50 transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Recently Viewed</span>
            <span className="w-5 h-5 rounded-full bg-white/20 text-[10px] font-mono flex items-center justify-center font-bold">
              {recentlyViewed.length}
            </span>
          </button>
        </div>
      )}

      {/* Expanded Luxury Tray */}
      {isExpanded && (
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md border-t border-zinc-200/90 shadow-2xl transition-all animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <span>{title}</span>
                  <span className="text-[10px] font-mono text-zinc-400 font-normal">
                    ({recentlyViewed.length} {recentlyViewed.length === 1 ? 'garment' : 'garments'})
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearRecentlyViewed}
                  className="text-[10px] text-zinc-400 hover:text-red-600 transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-100 cursor-pointer"
                  title="Clear viewed history"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Clear History</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-950 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
                  title="Minimize tray"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll of Recently Viewed Cards */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-300">
              {recentlyViewed.map((prod) => {
                const primaryImage = prod.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80';
                const isPreOrder = !!prod.isPreOrder;

                return (
                  <div
                    key={prod.id}
                    className="flex-shrink-0 w-44 sm:w-48 bg-white border border-zinc-200/80 rounded-xl p-2 shadow-2xs hover:shadow-md hover:border-zinc-400 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Image Thumbnail with Overlay */}
                      <div 
                        onClick={() => navigateToProduct(prod.id)}
                        className="relative aspect-3/4 rounded-lg overflow-hidden bg-zinc-100 mb-2 cursor-pointer"
                      >
                        <img
                          src={primaryImage}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isPreOrder && (
                          <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-amber-600 text-white shadow-xs">
                            Pre-Order
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuickViewProduct(prod);
                            }}
                            className="px-2 py-1 bg-white text-zinc-900 rounded-md text-[10px] font-bold shadow-xs hover:bg-zinc-100"
                          >
                            Quick View
                          </button>
                        </div>
                      </div>

                      {/* Product Title & Category */}
                      <p 
                        onClick={() => navigateToProduct(prod.id)}
                        className="text-xs font-bold text-zinc-900 truncate hover:text-black cursor-pointer"
                        title={prod.name}
                      >
                        {prod.name}
                      </p>
                      <p className="text-[10px] text-zinc-400 truncate mb-1">
                        {prod.subtitle || prod.category}
                      </p>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-100 mt-1">
                      <span className="text-xs font-serif font-bold text-zinc-900">
                        {currencySymbol}{prod.price.toLocaleString('en-IN')}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          const firstColor = prod.colors?.[0] || { name: 'Standard', hex: '#000', imageIndex: 0 };
                          const firstSize = prod.sizes?.[0] || 'M';
                          addToCart(prod, firstColor, firstSize, 1, prod.isPreOrder, prod.preOrderReleaseDate);
                        }}
                        className="p-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title={isPreOrder ? 'Pre-Order Now' : 'Add to Bag'}
                      >
                        <ShoppingBag className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
