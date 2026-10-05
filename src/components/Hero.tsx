import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles, Layers, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';

interface HeroLook {
  id: string;
  number: string;
  title: string;
  season: string;
  tagline: string;
  bgColor: string;
  accentColor: string;
  productIds: string[];
}

const HERO_LOOKS: HeroLook[] = [
  {
    id: 'look-1',
    number: '01',
    title: 'Sunny Atelier Collection',
    season: 'Spring / Summer Bloom',
    tagline: 'Delightful mustard wool jackets, sky blue tailored coats, and cozy cotton layers.',
    bgColor: 'bg-[#fef9c3]',
    accentColor: 'border-[#facc15]',
    productIds: ['cornus-01', 'cornus-02', 'cornus-04']
  },
  {
    id: 'look-2',
    number: '02',
    title: 'Pastel Garden Edit',
    season: 'Atelier Botanical',
    tagline: 'Cozy sage knits, strawberry blossom shirts, and comfortable organic denim.',
    bgColor: 'bg-[#fecdd3]',
    accentColor: 'border-[#fb7185]',
    productIds: ['cornus-09', 'cornus-08', 'cornus-03']
  },
  {
    id: 'look-3',
    number: '03',
    title: 'Sky Breezy Silhouettes',
    season: 'Ocean Air Capsule',
    tagline: 'Lightweight linen overshirts, comfortable active drapes, and organic cotton wear.',
    bgColor: 'bg-[#e0f2fe]',
    accentColor: 'border-[#38bdf8]',
    productIds: ['cornus-07', 'cornus-05', 'cornus-10']
  }
];

export const Hero: React.FC = () => {
  const { products: dbProducts, setActivePage, setActiveGender, setActiveCategory, navigateToProduct, storeSettings } = useShop();
  const [currentLookIndex, setCurrentLookIndex] = useState(0);
  const [showAllProductsDrawer, setShowAllProductsDrawer] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Resolve dynamic slide images list configured in Admin Settings Panel
  const heroSlideUrls = React.useMemo(() => {
    if (storeSettings.heroSlideUrls && storeSettings.heroSlideUrls.length > 0) {
      return storeSettings.heroSlideUrls;
    }
    const legacy = [storeSettings.heroSlide1Url, storeSettings.heroSlide2Url, storeSettings.heroSlide3Url].filter(Boolean);
    if (legacy.length > 0) return legacy as string[];
    return [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80'
    ];
  }, [storeSettings]);

  const slideCount = heroSlideUrls.length;
  const currentLook = HERO_LOOKS[currentLookIndex % HERO_LOOKS.length];
  const currentSlideImage = heroSlideUrls[currentLookIndex % slideCount];
  const products = dbProducts && dbProducts.length > 0 ? dbProducts : [];

  // Auto-cycle through editorial looks smoothly
  useEffect(() => {
    if (!isAutoPlaying || showAllProductsDrawer || slideCount === 0) return;
    const interval = setInterval(() => {
      setCurrentLookIndex((prev) => (prev + 1) % slideCount);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, showAllProductsDrawer, slideCount]);

  const handleShop = (gender: 'Men' | 'Women' | 'All') => {
    setActiveGender(gender === 'All' ? 'All' : gender);
    setActiveCategory('All');
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextLook = () => {
    setIsAutoPlaying(false);
    setCurrentLookIndex((prev) => (prev + 1) % slideCount);
  };

  const handlePrevLook = () => {
    setIsAutoPlaying(false);
    setCurrentLookIndex((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const featuredProductsInLook: Product[] = currentLook.productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const currencySymbol = storeSettings.currencySymbol === '?' ? '₹' : (storeSettings.currencySymbol || '₹');

  return (
    <section className="relative w-full rounded-3xl flex flex-col justify-center overflow-hidden bg-[#fffdf9] py-8 sm:py-12 mb-12 text-neutral-900 border border-neutral-100 shadow-xs">
      
      {/* 1. Subtle Vector Art Shapes Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-25">
        <div className="absolute top-16 left-10 w-80 h-80 rounded-full bg-rose-200 blur-3xl" />
        <div className="absolute bottom-6 right-16 w-80 h-80 rounded-full bg-sky-200 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-60 h-60 rounded-full bg-amber-200 blur-3xl" />
      </div>

      <div className="relative z-10 w-full my-auto flex-1 flex flex-col justify-center px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-center">
          
          {/* LEFT PANEL: Brand Statement, Highlights & Controls */}
          <div className="lg:col-span-7 space-y-3 sm:space-y-4 text-left">
            <div className="inline-flex items-center gap-2 bg-[#fecaca] text-[#991b1b] border border-neutral-900 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider shadow-xs animate-bounce">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{currentLook.season}</span>
            </div>

            <div className="space-y-2 sm:space-y-2.5">
              <h1 className="sr-only">CORNUS</h1>
              <div className="relative inline-block w-[60%] sm:w-[60%] max-w-[360px] select-none py-1">
                <img
                  src="https://i.ibb.co/9087xpT/CORNUS-transparent.png"
                  alt="CORNUS"
                  className="w-full h-auto object-contain drop-shadow-xs hover:scale-[1.01] transition-transform duration-300"
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-[#4338ca] bg-[#e0e7ff] border border-neutral-900 inline-block px-3.5 py-1 rounded-xl tracking-wider uppercase">
                  {currentLook.title}
                </h2>
              </div>
            </div>

            <p className="text-base sm:text-lg text-neutral-800 font-medium tracking-wide max-w-xl leading-snug">
              "Fabulous hand-drawn tailoring and happy fits for creative souls!"
            </p>

            <p className="text-xs sm:text-sm text-neutral-600 max-w-lg font-normal leading-relaxed line-clamp-2">
              {currentLook.tagline}
            </p>

            {/* Tactile Illustrated Button Rows */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1">
              <button
                onClick={() => handleShop('All')}
                className="illus-btn px-5 sm:px-6 py-2 sm:py-2.5 bg-amber-300 hover:bg-amber-400 text-black font-extrabold uppercase text-xs tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <span>Shop Catalogue</span>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              <button
                onClick={() => handleShop('Women')}
                className="illus-btn px-5 sm:px-6 py-2 sm:py-2.5 bg-rose-200 hover:bg-rose-300 text-black font-extrabold uppercase text-xs tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <span>Shop Girls</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleShop('Men')}
                className="illus-btn px-5 sm:px-6 py-2 sm:py-2.5 bg-sky-200 hover:bg-sky-300 text-black font-extrabold uppercase text-xs tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <span>Shop Boys</span>
                <Layers className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Look Switchers & Showcase Drawer controls */}
            <div className="pt-3 sm:pt-4 border-t border-dashed border-neutral-900/15 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-white border border-neutral-900 rounded-xl shadow-xs">
                <button
                  onClick={handlePrevLook}
                  className="p-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-900 rounded-lg transition-all cursor-pointer"
                  aria-label="Previous look"
                >
                  <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
                <span className="text-xs font-mono font-black px-2.5 text-neutral-900">
                  {String((currentLookIndex % slideCount) + 1).padStart(2, '0')} / {String(slideCount).padStart(2, '0')}
                </span>
                <button
                  onClick={handleNextLook}
                  className="p-1.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-900 rounded-lg transition-all cursor-pointer"
                  aria-label="Next look"
                >
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
                {heroSlideUrls.map((_: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentLookIndex(idx);
                    }}
                    className={`w-8 sm:w-9 h-8 sm:h-9 rounded-lg border border-neutral-900 font-extrabold font-mono text-xs flex items-center justify-center transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer shrink-0 ${
                      idx === currentLookIndex % slideCount
                        ? 'bg-amber-300 text-black translate-y-0.5 shadow-none'
                        : 'bg-white hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    0{idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAllProductsDrawer(true)}
                className="illus-btn px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer bg-white text-black hover:bg-neutral-50"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Showcase ({products.length})</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: Sleek Editorial Image Slider linked to Admin Settings */}
          <div className="lg:col-span-5 w-full">
            <div className="illus-card bg-white p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden shadow-xs">
              <div className="relative w-full min-h-[340px] sm:min-h-[400px] lg:min-h-[440px] bg-[#fbf9f6] rounded-xl overflow-hidden shadow-xs border border-neutral-900/10 group flex items-center justify-center p-1">
                <img
                  src={currentSlideImage}
                  alt={currentLook.title}
                  className="w-full h-full max-h-[440px] object-contain transition-all duration-700 ease-out group-hover:scale-[1.02]"
                />
                
                {/* Clean, premium slide overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-3.5 sm:p-4 text-white pointer-events-none">
                  <span className="text-[10px] tracking-[0.2em] font-bold uppercase text-amber-300 block mb-0.5">
                    {currentLook.season}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-normal leading-tight uppercase text-white">
                    {currentLook.title}
                  </h3>
                </div>
              </div>

              {/* Showcase items list in this Look */}
              <div className="mt-2.5 sm:mt-3 bg-neutral-50/70 border border-neutral-900/10 p-2.5 sm:p-3 rounded-xl text-left">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-dashed border-neutral-900/10">
                  <div>
                    <span className="text-[9px] tracking-wider uppercase font-bold text-indigo-600 block">
                      Featured in Look {currentLook.number}
                    </span>
                    <h3 className="text-xs font-bold text-neutral-900">
                      {currentLook.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-900 px-2 py-0.5 border border-neutral-900/10 rounded-md">
                    {featuredProductsInLook.length} Fits
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[110px] overflow-y-auto no-scrollbar">
                  {featuredProductsInLook.length === 0 ? (
                    <p className="text-[10px] text-neutral-400 font-medium py-1">
                      Explore this season's complete catalogue above.
                    </p>
                  ) : (
                    featuredProductsInLook.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => navigateToProduct(product.id)}
                        className="group flex items-center justify-between p-1.5 rounded-lg hover:bg-white transition-all border border-transparent hover:border-neutral-900/10 cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-9 bg-neutral-100 overflow-hidden rounded-md shrink-0 border border-neutral-900/10">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-neutral-900 group-hover:underline truncate">
                              {product.name}
                            </p>
                            <p className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider">
                              {product.category} · {product.gender}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span className="text-xs font-bold text-neutral-900 font-mono block">
                            {currencySymbol}{Number(product.price).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Expanded illustrated catalog drawer modal */}
      {showAllProductsDrawer && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-[#e0f2fe] border-t-2 sm:border-2 border-neutral-900 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 text-neutral-900 shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-900/15">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black uppercase tracking-widest text-neutral-900">
                  Atelier Archive Handcrafted Catalog
                </span>
                <span className="text-xs font-mono font-black bg-white border border-neutral-900/15 px-2 py-0.5 rounded-lg">
                  {products.length} Curated Pieces
                </span>
              </div>
              <button
                onClick={() => setShowAllProductsDrawer(false)}
                className="p-1.5 bg-white hover:bg-neutral-50 border border-neutral-900/15 rounded-full transition-all cursor-pointer"
                aria-label="Close product drawer"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Scrollable list */}
            <div className="flex gap-4 overflow-x-auto pb-3 no-scrollbar snap-x overflow-y-hidden">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    setShowAllProductsDrawer(false);
                    navigateToProduct(prod.id);
                  }}
                  className="group shrink-0 w-36 sm:w-44 bg-white border border-neutral-900/12 p-2.5 rounded-2xl shadow-xs cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all snap-start"
                >
                  <div className="relative aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden mb-2 border border-neutral-900/10">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-amber-300 text-black text-[8px] font-black px-1.5 py-0.5 border border-neutral-900/15 rounded-md uppercase tracking-wider">
                      {prod.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-neutral-900 truncate group-hover:underline">
                    {prod.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-neutral-100">
                    <span className="text-xs font-black font-mono text-neutral-900">
                      {currencySymbol}{Number(prod.price).toLocaleString()}
                    </span>
                    <span className="text-[8px] text-neutral-500 font-extrabold uppercase bg-neutral-100 px-1 py-0.5 rounded-md border border-neutral-200">
                      {prod.gender}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
