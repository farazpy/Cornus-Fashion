import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SlidersHorizontal, ChevronDown, X, Grid3X3, LayoutGrid, Check, ArrowUpDown, Sparkles, TrendingUp, Star, RotateCcw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'rating';

interface SortItem {
  id: SortOption;
  label: string;
  shortLabel?: string;
  icon?: React.FC<{ className?: string }>;
}

const SORT_OPTIONS: SortItem[] = [
  { id: 'featured', label: 'Featured', shortLabel: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High', shortLabel: 'Price: Low-High' },
  { id: 'price-desc', label: 'Price: High to Low', shortLabel: 'Price: High-Low' },
  { id: 'newest', label: 'Newest Arrivals', shortLabel: 'Newest' },
  { id: 'rating', label: 'Highest Rated', shortLabel: 'Top Rated' }
];

const COLOR_SWATCH_MAP: Record<string, string> = {
  Black: '#111111',
  White: '#FFFFFF',
  Ecru: '#F5F2EB',
  Charcoal: '#333333',
  Camel: '#C19A6B',
  Olive: '#556B2F',
  Blue: '#1E3A8A',
  Grey: '#808080'
};

const PRICE_PRESETS = [
  { label: 'All', max: 100000 },
  { label: '< ₹2.5k', max: 2500 },
  { label: '< ₹5k', max: 5000 },
  { label: '< ₹15k', max: 15000 },
  { label: '< ₹50k', max: 50000 }
];

export const ProductListingPage: React.FC = () => {
  const {
    products,
    activeCategory,
    setActiveCategory,
    activeGender,
    setActiveGender,
    activeCollection,
    setActiveCollection,
    setActivePage,
    storeSettings
  } = useShop();

  const currencySymbol = storeSettings?.currencySymbol || 'INR ';

  // Desktop sidebar visibility toggle
  const [showSidebar, setShowSidebar] = useState(true);

  // Collapsible sidebar accordion sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    collections: false,
    sizes: false,
    colors: false,
    price: false,
    categories: false,
    division: false
  });

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Filter drawer state (mobile)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [gridColumns, setGridColumns] = useState<3 | 4>(4);

  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Available options
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '29', '30', '31', '32', '34', '36', '2Y', '4Y', '6Y', '8Y', '10Y', '12Y', 'One Size'];
  const allColorNames = ['Black', 'White', 'Ecru', 'Charcoal', 'Camel', 'Olive', 'Blue', 'Grey'];

  // Dynamic collections from product catalog
  const availableCollections = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.collection && p.collection.trim()) {
        set.add(p.collection.trim());
      }
    });
    if (set.size === 0) {
      return ['Essential Collection', 'Urban Collection', 'Weekend Collection', 'Monochrome Collection'];
    }
    return Array.from(set).sort();
  }, [products]);

  // Product counts per collection
  const collectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.collection) {
        counts[p.collection] = (counts[p.collection] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Product counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  // Filter and sort products logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Gender filter
      if (activeGender !== 'All' && p.gender !== activeGender && p.gender !== 'Unisex') {
        return false;
      }
      // Category filter
      if (activeCategory !== 'All' && p.category !== activeCategory) {
        return false;
      }
      // Collection filter
      if (activeCollection && p.collection !== activeCollection) {
        return false;
      }
      // Size filter
      if (selectedSizes.length > 0 && !p.sizes.some((s) => selectedSizes.includes(s))) {
        return false;
      }
      // Color filter
      if (
        selectedColors.length > 0 &&
        !p.colors.some((c) =>
          selectedColors.some((sc) => c.name.toLowerCase().includes(sc.toLowerCase()))
        )
      ) {
        return false;
      }
      // Price filter
      if (p.price > maxPrice) {
        return false;
      }
      // Stock filter
      if (inStockOnly && !p.inStock) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      if (sortBy === 'newest') {
        if (b.isNew !== a.isNew) {
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        }
        // Secondary sort by product ID descending for newly added items
        const aNum = parseInt(a.id.replace(/\D/g, '') || '0', 10);
        const bNum = parseInt(b.id.replace(/\D/g, '') || '0', 10);
        if (aNum !== bNum) return bNum - aNum;
        return b.id.localeCompare(a.id);
      }
      if (sortBy === 'rating') {
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      }
      return 0; // featured default curation order
    });
  }, [products, activeGender, activeCategory, activeCollection, selectedSizes, selectedColors, inStockOnly, maxPrice, sortBy]);

  const currentSortItem = SORT_OPTIONS.find((opt) => opt.id === sortBy) || SORT_OPTIONS[0];

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const resetFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setInStockOnly(false);
    setMaxPrice(100000);
    setActiveCategory('All');
    setActiveGender('All');
    setActiveCollection(null);
  };

  const hasActiveFilters =
    activeCategory !== 'All' ||
    activeGender !== 'All' ||
    activeCollection !== null ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    inStockOnly ||
    maxPrice < 100000;

  return (
    <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen flex flex-col flex-grow">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-black/50 mb-3 sm:mb-4 font-light">
        <button
          onClick={() => setActivePage('home')}
          className="hover:text-black transition-colors"
        >
          Home
        </button>
        <span>/</span>
        <button
          onClick={() => {
            setActiveCategory('All');
            setActiveGender('All');
            setActiveCollection(null);
          }}
          className="hover:text-black transition-colors"
        >
          Catalog
        </button>
        {activeGender !== 'All' && (
          <>
            <span>/</span>
            <span className="text-black font-normal">{activeGender}</span>
          </>
        )}
        {activeCategory !== 'All' && (
          <>
            <span>/</span>
            <span className="text-black font-normal">{activeCategory}</span>
          </>
        )}
        {activeCollection && (
          <>
            <span>/</span>
            <span className="text-black font-normal">{activeCollection}</span>
          </>
        )}
      </nav>

      {/* Collection Header Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-4 sm:pb-5 border-b border-black/10 gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div>
          <span className="text-[11px] tracking-[0.25em] uppercase font-semibold text-black/50 block mb-2">
            {activeCollection ? 'Collection Focus' : activeGender !== 'All' ? `${activeGender} Division` : 'All Garments'}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-black">
            {activeCollection || (activeCategory !== 'All' ? activeCategory : activeGender !== 'All' ? `${activeGender}'s Collection` : 'Full Collection')}
          </h1>
          <p className="text-xs sm:text-sm text-black/60 font-light mt-2 max-w-xl">
            {activeCollection
              ? 'Archival silhouettes engineered with tactile textures and structured minimal drape.'
              : 'Precision garments crafted from long-staple fibers, heavy virgin wools, and organic cottons.'}
          </p>
        </div>

        <div className="text-xs text-black/50 font-mono self-start md:self-end">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'Garment' : 'Garments'}
        </div>
      </div>

      {/* Controls Bar: Filter Toggle, Sort Dropdown, View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 mb-6 sm:mb-8 bg-white/90 backdrop-blur-md px-4 sm:px-5 rounded-2xl border border-black/[0.08] shadow-xs">
        <div className="flex items-center gap-3">
          {/* Mobile Drawer Trigger (< lg) */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold tracking-wider uppercase transition-colors rounded-xl shadow-xs cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-400 ml-0.5" />
            )}
          </button>

          {/* Desktop Sidebar Toggle (>= lg) */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-xs border cursor-pointer ${
              showSidebar 
                ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800' 
                : 'bg-white text-neutral-800 border-black/15 hover:border-black/35 hover:bg-neutral-50'
            }`}
            title={showSidebar ? 'Collapse filter sidebar' : 'Expand filter sidebar'}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showSidebar ? 'Hide Filters' : 'Show Filters'}</span>
            {hasActiveFilters && (
              <span className={`w-2 h-2 rounded-full ${showSidebar ? 'bg-amber-400' : 'bg-amber-500'} ml-0.5`} />
            )}
          </button>

          {/* Quick Division Badges */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            {(['All', 'Men', 'Women', 'Kids'] as const).map((gender) => (
              <button
                key={gender}
                onClick={() => setActiveGender(gender)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  activeGender === gender
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-black/60 hover:text-black hover:bg-black/5'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Sorting Dropdown Menu */}
          <div className="relative" ref={sortDropdownRef}>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-black/50 hidden md:inline font-medium">Sort:</span>
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center justify-between gap-2.5 bg-white border border-black/15 hover:border-black/40 px-3.5 py-2 text-xs font-semibold text-neutral-900 rounded-lg shadow-xs transition-all focus:outline-none focus:ring-1 focus:ring-black min-w-[170px]"
                aria-haspopup="listbox"
                aria-expanded={isSortDropdownOpen}
                title="Sort Products"
              >
                <div className="flex items-center gap-2 truncate">
                  <ArrowUpDown className="w-3.5 h-3.5 text-black/50 shrink-0" />
                  <span className="truncate">{currentSortItem.label}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-black/50 shrink-0 transition-transform duration-200 ${isSortDropdownOpen ? 'rotate-180 text-black' : ''}`} />
              </button>
            </div>

            {/* Custom Interactive Dropdown Menu */}
            {isSortDropdownOpen && (
              <div 
                className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-black/15 rounded-xl shadow-lg py-1.5 z-40 animate-fadeIn"
                role="listbox"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-black/40 border-b border-black/5 mb-1">
                  Sort Products By
                </div>
                {SORT_OPTIONS.map((option) => {
                  const isSelected = sortBy === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSortBy(option.id);
                        setIsSortDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-neutral-100 font-bold text-black' 
                          : 'text-neutral-700 hover:bg-neutral-50 hover:text-black font-medium'
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-black ml-2 shrink-0 stroke-[2.5]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column Layout Switcher */}
          <div className="hidden lg:flex items-center border border-black/15 rounded-lg p-0.5 bg-white shadow-xs">
            <button
              onClick={() => setGridColumns(3)}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${gridColumns === 3 ? 'bg-neutral-900 text-white' : 'text-black/40 hover:text-black'}`}
              aria-label="3 Column Grid"
              title="3 Columns"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridColumns(4)}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${gridColumns === 4 ? 'bg-neutral-900 text-white' : 'text-black/40 hover:text-black'}`}
              aria-label="4 Column Grid"
              title="4 Columns"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Filtering Sidebar + Product Grid */}
      <div className="flex items-start gap-8 xl:gap-10">
        {/* Desktop Filtering Sidebar */}
        {showSidebar && (
          <aside 
            className="hidden lg:block w-64 xl:w-72 shrink-0 sticky top-28 self-start max-h-[calc(100vh-8.5rem)] overflow-y-auto pr-3 scrollbar-thin space-y-6 animate-fadeIn"
            aria-label="Product filters"
          >
            {/* Sidebar Top Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-black/10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-neutral-900" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                  Refine Results
                </h2>
                {hasActiveFilters && (
                  <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[10px] font-mono flex items-center justify-center font-bold">
                    {(activeCategory !== 'All' ? 1 : 0) +
                     (activeGender !== 'All' ? 1 : 0) +
                     (activeCollection !== null ? 1 : 0) +
                     selectedSizes.length +
                     selectedColors.length +
                     (inStockOnly ? 1 : 0) +
                     (maxPrice < 100000 ? 1 : 0)}
                  </span>
                )}
              </div>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-[11px] font-semibold text-neutral-500 hover:text-black transition-colors underline cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* 1. COLLECTIONS FILTER */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => toggleSection('collections')}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-black cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>Collections</span>
                  {activeCollection && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-black/40 transition-transform duration-200 ${collapsedSections.collections ? '-rotate-90' : ''}`} />
              </button>

              {!collapsedSections.collections && (
                <div className="space-y-1 pt-1">
                  <button
                    onClick={() => setActiveCollection(null)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      activeCollection === null
                        ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                        : 'text-neutral-700 hover:bg-neutral-100 font-medium'
                    }`}
                  >
                    <span>All Collections</span>
                    <span className={`text-[10px] font-mono ${activeCollection === null ? 'text-white/70' : 'text-neutral-400'}`}>
                      {products.length}
                    </span>
                  </button>
                  {availableCollections.map((col) => {
                    const isSelected = activeCollection === col;
                    const count = collectionCounts[col] || 0;
                    return (
                      <button
                        key={col}
                        onClick={() => setActiveCollection(isSelected ? null : col)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                            : 'text-neutral-700 hover:bg-neutral-100 font-medium'
                        }`}
                      >
                        <span className="truncate pr-2">{col}</span>
                        <span className={`text-[10px] font-mono shrink-0 ${isSelected ? 'text-white/70' : 'text-neutral-400'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. SIZES FILTER */}
            <div className="space-y-3 pt-3 border-t border-black/5">
              <button
                type="button"
                onClick={() => toggleSection('sizes')}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-black cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>Sizes</span>
                  {selectedSizes.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-900 text-white font-bold">
                      {selectedSizes.length}
                    </span>
                  )}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-black/40 transition-transform duration-200 ${collapsedSections.sizes ? '-rotate-90' : ''}`} />
              </button>

              {!collapsedSections.sizes && (
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {allSizes.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`py-1.5 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-900 text-white border-neutral-900 font-semibold shadow-xs'
                            : 'bg-white border-black/15 text-neutral-800 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. COLOR PALETTE FILTER */}
            <div className="space-y-3 pt-3 border-t border-black/5">
              <button
                type="button"
                onClick={() => toggleSection('colors')}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-black cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>Color Palette</span>
                  {selectedColors.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-900 text-white font-bold">
                      {selectedColors.length}
                    </span>
                  )}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-black/40 transition-transform duration-200 ${collapsedSections.colors ? '-rotate-90' : ''}`} />
              </button>

              {!collapsedSections.colors && (
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  {allColorNames.map((color) => {
                    const isSelected = selectedColors.includes(color);
                    const hex = COLOR_SWATCH_MAP[color] || '#444444';
                    return (
                      <button
                        key={color}
                        onClick={() => toggleColor(color)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-neutral-900 text-white border-neutral-900 font-semibold shadow-xs'
                            : 'bg-white border-black/12 text-neutral-800 hover:border-black/30'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0 shadow-2xs"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="truncate flex-1">{color}</span>
                        {isSelected && <Check className="w-3 h-3 shrink-0 stroke-[2.5]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. PRICE RANGE FILTER */}
            <div className="space-y-3 pt-3 border-t border-black/5">
              <button
                type="button"
                onClick={() => toggleSection('price')}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-black cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>Price Range</span>
                  {maxPrice < 100000 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-black/40 transition-transform duration-200 ${collapsedSections.price ? '-rotate-90' : ''}`} />
              </button>

              {!collapsedSections.price && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-neutral-500">Max Budget:</span>
                    <span className="text-xs font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                      {maxPrice >= 100000 ? 'Any Price' : `${currencySymbol}${maxPrice.toLocaleString('en-IN')}`}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="500"
                    max="100000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200 rounded-lg appearance-none"
                  />

                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span>{currencySymbol}500</span>
                    <span>{currencySymbol}1,00,000+</span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {PRICE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setMaxPrice(preset.max)}
                        className={`px-2 py-1 text-[10px] font-medium rounded border transition-colors cursor-pointer ${
                          maxPrice === preset.max
                            ? 'bg-neutral-900 text-white border-neutral-900'
                            : 'bg-white border-black/10 text-neutral-600 hover:border-black/30'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5. CATEGORIES FILTER */}
            <div className="space-y-3 pt-3 border-t border-black/5">
              <button
                type="button"
                onClick={() => toggleSection('categories')}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-black cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>Categories</span>
                  {activeCategory !== 'All' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-black/40 transition-transform duration-200 ${collapsedSections.categories ? '-rotate-90' : ''}`} />
              </button>

              {!collapsedSections.categories && (
                <div className="space-y-1 pt-1">
                  {['All', 'Outerwear', 'Tops', 'Bottoms', 'Accessories'].map((cat) => {
                    const isSelected = activeCategory === cat;
                    const count = cat === 'All' ? products.length : (categoryCounts[cat] || 0);
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                          isSelected
                            ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                            : 'text-neutral-700 hover:bg-neutral-100 font-medium'
                        }`}
                      >
                        <span>{cat}</span>
                        <span className={`text-[10px] font-mono ${isSelected ? 'text-white/70' : 'text-neutral-400'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. IN-STOCK TOGGLE */}
            <div className="pt-3 border-t border-black/5">
              <label className="flex items-center justify-between cursor-pointer py-1">
                <div className="pr-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block">
                    In Stock Only
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    Hide made-to-order silhouettes
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-neutral-900 rounded cursor-pointer"
                />
              </label>
            </div>
          </aside>
        )}

        {/* Product Grid Area */}
        <div className="flex-1 min-w-0">
          {/* Active Filter Pills Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6 text-xs bg-white/60 p-3 rounded-xl border border-black/5">
              <span className="text-black/50 font-medium">Active:</span>
              {activeCategory !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/5 text-black rounded-lg border border-black/10">
                  Category: {activeCategory}
                  <button onClick={() => setActiveCategory('All')} className="cursor-pointer"><X className="w-3 h-3 hover:text-red-500" /></button>
                </span>
              )}
              {activeGender !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/5 text-black rounded-lg border border-black/10">
                  Gender: {activeGender}
                  <button onClick={() => setActiveGender('All')} className="cursor-pointer"><X className="w-3 h-3 hover:text-red-500" /></button>
                </span>
              )}
              {activeCollection && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/5 text-black rounded-lg border border-black/10">
                  Collection: {activeCollection}
                  <button onClick={() => setActiveCollection(null)} className="cursor-pointer"><X className="w-3 h-3 hover:text-red-500" /></button>
                </span>
              )}
              {selectedSizes.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/5 text-black rounded-lg border border-black/10">
                  Size: {s}
                  <button onClick={() => toggleSize(s)} className="cursor-pointer"><X className="w-3 h-3 hover:text-red-500" /></button>
                </span>
              ))}
              {selectedColors.map((c) => (
                <span key={c} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/5 text-black rounded-lg border border-black/10">
                  Color: {c}
                  <button onClick={() => toggleColor(c)} className="cursor-pointer"><X className="w-3 h-3 hover:text-red-500" /></button>
                </span>
              ))}
              {maxPrice < 100000 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/5 text-black rounded-lg border border-black/10">
                  Max: {currencySymbol}{maxPrice.toLocaleString('en-IN')}
                  <button onClick={() => setMaxPrice(100000)} className="cursor-pointer"><X className="w-3 h-3 hover:text-red-500" /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/5 text-black rounded-lg border border-black/10">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)} className="cursor-pointer"><X className="w-3 h-3 hover:text-red-500" /></button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-xs text-black/60 hover:text-black underline ml-auto font-medium cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-24 text-center glass-panel bg-white/70 max-w-xl mx-auto rounded-2xl p-10 border border-black/10 shadow-xs">
              <p className="font-serif text-2xl text-black mb-2">No garments match current criteria</p>
              <p className="text-xs text-black/60 font-light max-w-sm mx-auto mb-6">
                Try loosening your price, sorting, or size filters to view more items from the collection.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-2 md:grid-cols-2 ${
                showSidebar
                  ? (gridColumns === 4 ? 'lg:grid-cols-3 xl:grid-cols-3' : 'lg:grid-cols-2 xl:grid-cols-3')
                  : (gridColumns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3')
              } gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12`}
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Glassmorphism Filters Side Panel Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
          <div
            onClick={() => setIsFilterOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
            <div className="w-screen max-w-md glass-modal bg-white/95 backdrop-blur-2xl border-l border-black/10 flex flex-col shadow-2xl">
              {/* Header */}
              <div className="p-6 border-b border-black/10 flex items-center justify-between">
                <h3 className="font-serif text-2xl font-normal text-black">Refine Selection</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 text-black/60 hover:text-black rounded-full hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 divide-y divide-black/10">
                {/* Sort By Selection in Drawer */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-black flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-black/60" />
                    <span>Sort Order</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {SORT_OPTIONS.map((option) => {
                      const isSelected = sortBy === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSortBy(option.id)}
                          className={`flex items-center justify-between px-3.5 py-2.5 text-xs rounded-lg border transition-all text-left ${
                            isSelected
                              ? 'bg-neutral-900 text-white border-neutral-900 font-semibold shadow-xs'
                              : 'border-black/15 hover:border-black text-neutral-800 bg-white'
                          }`}
                        >
                          <span>{option.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Collection */}
                <div className="pt-6 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-black">Collection</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveCollection(null)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                        activeCollection === null
                          ? 'bg-neutral-900 text-white border-neutral-900 font-semibold shadow-xs'
                          : 'border-black/15 hover:border-black text-black bg-white'
                      }`}
                    >
                      All Collections
                    </button>
                    {availableCollections.map((col) => {
                      const isSelected = activeCollection === col;
                      return (
                        <button
                          key={col}
                          onClick={() => setActiveCollection(isSelected ? null : col)}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-neutral-900 text-white border-neutral-900 font-semibold shadow-xs'
                              : 'border-black/15 hover:border-black text-black bg-white'
                          }`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category */}
                <div className="pt-6 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-black">Category</h4>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Outerwear', 'Tops', 'Bottoms', 'Accessories'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                          activeCategory === cat
                            ? 'bg-neutral-900 text-white border-neutral-900 font-semibold shadow-xs'
                            : 'border-black/15 hover:border-black text-black bg-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Division / Gender */}
                <div className="pt-6 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-black">Division</h4>
                  <div className="flex gap-2">
                    {(['All', 'Men', 'Women', 'Kids'] as const).map((gender) => (
                      <button
                        key={gender}
                        onClick={() => setActiveGender(gender)}
                        className={`flex-1 py-2 text-xs rounded-lg border text-center transition-colors cursor-pointer ${
                          activeGender === gender
                            ? 'bg-neutral-900 text-white border-neutral-900 font-semibold shadow-xs'
                            : 'border-black/15 hover:border-black text-black bg-white'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                <div className="pt-6 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-black">Size</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {allSizes.map((size) => {
                      const selected = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`py-2 text-xs font-medium border rounded-lg transition-colors cursor-pointer ${
                            selected
                              ? 'bg-neutral-900 text-white border-neutral-900 font-semibold shadow-xs'
                              : 'border-black/15 hover:border-black text-black bg-white'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="pt-6 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-black">Color Palette</h4>
                  <div className="flex flex-wrap gap-2">
                    {allColorNames.map((color) => {
                      const selected = selectedColors.includes(color);
                      const hex = COLOR_SWATCH_MAP[color] || '#444444';
                      return (
                        <button
                          key={color}
                          onClick={() => toggleColor(color)}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                            selected
                              ? 'bg-neutral-900 text-white border-neutral-900 font-semibold shadow-xs'
                              : 'border-black/15 hover:border-black text-black bg-white'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                            style={{ backgroundColor: hex }}
                          />
                          <span>{color}</span>
                          {selected && <Check className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range */}
                <div className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-black">Maximum Price</h4>
                    <span className="text-xs font-mono font-semibold text-black">{currencySymbol}{maxPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="100000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-black cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-black/40 font-mono">
                    <span>{currencySymbol}500</span>
                    <span>{currencySymbol}1,00,000+</span>
                  </div>
                </div>

                {/* In Stock Toggle */}
                <div className="pt-6 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-black">In Stock Only</h4>
                    <p className="text-[11px] text-black/50">Hide made-to-order archival silhouettes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="p-6 border-t border-black/10 bg-white flex gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-3 border border-black/20 text-xs font-semibold uppercase tracking-wider hover:bg-black/5 transition-colors rounded-lg"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 py-3 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors rounded-lg shadow-xs"
                >
                  Apply Filters ({filteredProducts.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
