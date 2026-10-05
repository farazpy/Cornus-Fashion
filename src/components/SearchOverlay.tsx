import React, { useEffect, useRef } from 'react';
import { Search, X, ArrowRight, TrendingUp } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { FashionImage } from './FashionImage';

export const SearchOverlay: React.FC = () => {
  const {
    products,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    navigateToProduct,
    setActivePage,
    setActiveCategory
  } = useShop();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredProducts = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.collection.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const popularSearches = ['Wool Overcoat', 'Cashmere Knit', 'Pleated Trousers', 'Leather Bag', 'Denim', 'Poplin Shirt'];

  const handleSelectProduct = (productId: string) => {
    setIsSearchOpen(false);
    navigateToProduct(productId);
  };

  const handleSearchTerm = (term: string) => {
    setSearchQuery(term);
  };

  const handleCategoryJump = (cat: string) => {
    setIsSearchOpen(false);
    setActiveCategory(cat);
    setActivePage('shop');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto glass-modal bg-white/95 backdrop-blur-3xl animate-fadeIn">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 py-8 min-h-screen flex flex-col">
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-8 border-b border-black/10">
          <span className="font-serif text-2xl tracking-[0.16em] font-medium text-black">
            CORNUS
          </span>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-2.5 rounded-full hover:bg-black/5 text-black/70 hover:text-black transition-colors"
            aria-label="Close search"
          >
            <X className="w-6 h-6 stroke-[1.5]" />
          </button>
        </div>

        {/* Big Search Input */}
        <div className="py-10 border-b border-black/10">
          <div className="relative flex items-center">
            <Search className="w-8 h-8 text-black/40 mr-4 stroke-[1.5]" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search garments, textures, collections..."
              className="w-full font-serif text-2xl sm:text-4xl md:text-5xl text-black placeholder:text-black/25 bg-transparent border-none focus:outline-none tracking-tight font-light"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-2 text-black/40 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search Results or Discovery Shortcuts */}
        <div className="flex-1 py-10">
          {searchQuery.trim() ? (
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs uppercase tracking-widest text-black/50 font-medium">
                  Search Results ({filteredProducts.length})
                </span>
                <span className="text-xs text-black/60 font-light">
                  Showing matches for "{searchQuery}"
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-serif text-2xl text-black mb-2">No matching silhouettes found</p>
                  <p className="text-xs text-black/60 font-light max-w-sm mx-auto mb-6">
                    Try searching for "Cashmere", "Trousers", "Overcoat", or explore our core categories.
                  </p>
                  <button
                    onClick={() => {
                      setIsSearchOpen(false);
                      setActivePage('shop');
                    }}
                    className="px-6 py-3 bg-black text-white text-xs uppercase tracking-widest font-semibold"
                  >
                    Browse All Products
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product.id)}
                      className="group cursor-pointer flex flex-col"
                    >
                      <div className="w-full aspect-[3/4] bg-[#f5f5f4] overflow-hidden rounded-xs border border-black/5 mb-3">
                        <FashionImage
                          src={product.images[0]}
                          alt={product.name}
                          categoryHint={product.category}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          aspectRatio="aspect-auto"
                        />
                      </div>
                      <span className="text-[10px] tracking-widest uppercase text-black/50 font-medium">
                        {product.category}
                      </span>
                      <h4 className="text-sm font-medium text-black group-hover:opacity-75 transition-opacity truncate">
                        {product.name}
                      </h4>
                      <span className="text-xs font-semibold text-black mt-0.5 tabular-nums">
                        ${product.price}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Popular Searches */}
              <div>
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-black/60 mb-5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Popular Inquiries
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearchTerm(term)}
                      className="px-3.5 py-1.5 bg-black/[0.04] hover:bg-black hover:text-white text-xs text-black/80 rounded-xs transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Core Taxonomy */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-black/60 mb-5">
                  Browse by Division
                </h3>
                <ul className="space-y-3 text-sm text-black/80 font-light">
                  {['Outerwear', 'Tops', 'Bottoms', 'Accessories'].map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => handleCategoryJump(cat)}
                        className="hover:text-black flex items-center justify-between w-full text-left group"
                      >
                        <span>{cat}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-black/30 group-hover:text-black group-hover:translate-x-1 transition-all" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Seasonal Curations */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-black/60 mb-5">
                  Curated Edits
                </h3>
                <ul className="space-y-3 text-sm text-black/80 font-light">
                  {['Monochrome Collection', 'Essential Collection', 'Urban Collection'].map((col) => (
                    <li key={col}>
                      <button
                        onClick={() => {
                          setIsSearchOpen(false);
                          setActivePage('shop');
                        }}
                        className="hover:text-black flex items-center justify-between w-full text-left group"
                      >
                        <span>{col}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-black/30 group-hover:text-black group-hover:translate-x-1 transition-all" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
