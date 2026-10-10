import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  ArrowRight, 
  Shirt, 
  Sparkles, 
  Smile, 
  Compass, 
  Layers, 
  Tag,
  ChevronLeft,
  ChevronRight,
  Home,
  Phone,
  Info
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Header: React.FC = () => {
  const {
    activePage,
    setActivePage,
    setActiveCategory,
    setActiveGender,
    setActiveCollection,
    cartCount,
    wishlistCount,
    setIsCartOpen,
    setIsSearchOpen,
    currentUser,
    setIsAuthModalOpen,
    setAuthModalMode,
    storeSettings,
    menus,
    categories,
    products,
    navigateToProduct,
    activePolicyTab,
    navigateToPolicy
  } = useShop();

  const [hoveredMenuId, setHoveredMenuId] = useState<string | null>(null);
  const [sliderIndex, setSliderIndex] = useState(0);

  useEffect(() => {
    setSliderIndex(0);
  }, [hoveredMenuId]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (type: 'gender' | 'category' | 'collection' | 'sale' | 'new', value?: string) => {
    setMobileMenuOpen(false);
    if (type === 'gender') {
      setActiveGender(value as 'Men' | 'Women' | 'Kids');
      setActiveCategory('All');
      setActiveCollection(null);
    } else if (type === 'collection') {
      setActiveCollection(value || null);
      setActiveCategory('All');
      setActiveGender('All');
    } else if (type === 'new') {
      setActiveCategory('All');
      setActiveGender('All');
      setActiveCollection(null);
    } else if (type === 'sale') {
      setActiveCategory('All');
      setActiveGender('All');
      setActiveCollection(null);
    }
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Active hovered menu calculations
  const hoveredMenu = menus.find(m => m.id === hoveredMenuId);
  let validCatsForHoveredMenu: string[] = [];
  if (hoveredMenu) {
    let cats: string[] = [];
    try {
      cats = typeof hoveredMenu.assignedCategories === 'string'
        ? JSON.parse(hoveredMenu.assignedCategories)
        : (hoveredMenu.assignedCategories || []);
    } catch (e) {
      cats = [];
    }
    const dbCategoryNames = categories.map(c => c.name);
    validCatsForHoveredMenu = cats.filter(c => dbCategoryNames.includes(c));
  }

  const hoveredMenuProducts = products.filter(p => validCatsForHoveredMenu.includes(p.category));
  const topFourProducts = hoveredMenuProducts.slice(0, 4);
  const sliderProducts = hoveredMenuProducts.length > 4 ? hoveredMenuProducts.slice(4) : (hoveredMenuProducts.length > 0 ? hoveredMenuProducts : []);
  const sliderProduct = sliderProducts.length > 0 ? sliderProducts[sliderIndex % sliderProducts.length] : null;

  return (
    <>
      <div 
        className="fixed top-4 left-4 right-4 z-40 mx-auto max-w-[1380px]"
        onMouseLeave={() => setHoveredMenuId(null)}
      >
        <header
          className={`w-full transition-all duration-300 relative ${
            isScrolled
              ? 'bg-white/92 backdrop-blur-xl py-1.5 px-4 sm:px-5 shadow-[0_12px_30px_rgba(0,0,0,0.04)] border border-black/[0.06] rounded-full'
              : 'bg-white/85 backdrop-blur-lg py-2.5 px-5 border border-black/[0.03] rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.02)]'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Left Zone: CORNUS Logo + Version Badge */}
            <div className="flex items-center gap-3 pl-2">
              <button
                onClick={() => {
                  setActivePage('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group flex items-center gap-2 text-left focus-visible:outline-none cursor-pointer"
                aria-label={`${storeSettings?.storeName || 'CORNUS'} Home`}
              >
                <img 
                  src={storeSettings?.storeLogoUrl || "https://i.ibb.co/SwmnN7pz/Cornus-Logo.png"} 
                  alt={storeSettings?.storeName || 'CORNUS'} 
                  className="h-[20px] sm:h-[24px] w-auto object-contain transition-opacity group-hover:opacity-80"
                />
              </button>
              <span className="text-[10px] tracking-wider text-black/45 font-mono border border-black/10 px-1.5 py-0.5 rounded-sm">
                v2.71.0
              </span>
            </div>



            {/* Center Zone: Clean Navigation Links with Dynamic Hover Mega Menus */}
            <nav 
              className="hidden lg:flex items-center gap-5 xl:gap-7 text-[12px] tracking-[0.08em] uppercase font-semibold text-black/75 h-full"
            >
              {/* Home Link */}
              <button
                onClick={() => {
                  setActivePage('home');
                  window.history.pushState(null, '', '/');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 hover:text-black transition-all relative py-1.5 text-black/70 hover:scale-[1.02] active:scale-95 cursor-pointer border-b-2 ${
                  activePage === 'home' ? 'border-black text-black' : 'border-transparent'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-black/50" />
                <span>Home</span>
              </button>

              {menus.map((menu) => {
                const isHovered = hoveredMenuId === menu.id;

                return (
                  <div 
                    key={menu.id} 
                    className="relative h-full flex items-center"
                    onMouseEnter={() => setHoveredMenuId(menu.id)}
                  >
                    <button
                      onClick={() => {
                        if (menu.title === 'Men' || menu.title === 'Women' || menu.title === 'Kids') {
                          handleNavClick('gender', menu.title);
                        } else if (menu.link) {
                          const parts = menu.link.split('/');
                          if (parts[0] === 'gender' || parts[1] === 'Men' || parts[1] === 'Women' || parts[1] === 'Kids') {
                            handleNavClick('gender', parts[1] || parts[0]);
                          } else if (parts[0] === 'collection') {
                            handleNavClick('collection', parts[1]);
                          } else if (parts[0] === 'sale') {
                            handleNavClick('sale');
                          } else {
                            handleNavClick('gender', 'All');
                          }
                        } else {
                          handleNavClick('gender', 'All');
                        }
                      }}
                      className={`flex items-center gap-1.5 hover:text-black transition-all relative py-1.5 text-black/70 hover:scale-[1.02] active:scale-95 cursor-pointer border-b-2 ${
                        isHovered ? 'border-black text-black' : 'border-transparent'
                      }`}
                    >
                      {menu.title === 'Men' && <Shirt className="w-3.5 h-3.5 text-black/50" />}
                      {menu.title === 'Women' && <Sparkles className="w-3.5 h-3.5 text-black/50" />}
                      {menu.title === 'Kids' && <Smile className="w-3.5 h-3.5 text-black/50" />}
                      {menu.title !== 'Men' && menu.title !== 'Women' && menu.title !== 'Kids' && <Layers className="w-3.5 h-3.5 text-black/50" />}
                      <span>{menu.title}</span>
                    </button>
                  </div>
                );
              })}

              {/* About Link */}
              <button
                onClick={() => {
                  setActivePage('story');
                  window.history.pushState(null, '', '/story');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 hover:text-black transition-all relative py-1.5 text-black/70 hover:scale-[1.02] active:scale-95 cursor-pointer border-b-2 ${
                  activePage === 'story' ? 'border-black text-black' : 'border-transparent'
                }`}
              >
                <Info className="w-3.5 h-3.5 text-black/50" />
                <span>About</span>
              </button>

              {/* Contact Link */}
              <button
                onClick={() => {
                  setActivePage('contact');
                  window.history.pushState(null, '', '/contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 hover:text-black transition-all relative py-1.5 text-black/70 hover:scale-[1.02] active:scale-95 cursor-pointer border-b-2 ${
                  activePage === 'contact' ? 'border-black text-black' : 'border-transparent'
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-black/50" />
                <span>Contact</span>
              </button>

              <button
                onClick={() => handleNavClick('new')}
                className="group flex items-center gap-1.5 hover:text-black transition-colors relative py-1 text-black/70 hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-black/50 group-hover:text-black transition-colors" />
                <span>New Arrivals</span>
              </button>
              <button
                onClick={() => handleNavClick('sale')}
                className="group flex items-center gap-1.5 hover:text-black transition-colors relative py-1 text-black/50 hover:text-black hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer"
              >
                <Tag className="w-3.5 h-3.5 text-black/40 group-hover:text-black transition-colors" />
                <span>Sale</span>
              </button>
            </nav>

            {/* Right Zone: Interactive Utility Controls */}
            <div className="flex items-center gap-1 sm:gap-2 text-black/85 pr-1">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-xs tracking-wider uppercase font-medium hover:text-black hover:bg-black/5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
                aria-label="Search store"
              >
                <Search className="w-4 h-4 stroke-[1.5]" />
                <span className="hidden xl:inline text-[11px] font-semibold tracking-wider text-black/60">Search</span>
              </button>

              <button
                onClick={() => {
                  if (currentUser) {
                    setActivePage('account');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }
                }}
                className="p-2 text-xs tracking-wider uppercase font-medium hover:text-black hover:bg-black/5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
                aria-label="Account Dashboard"
              >
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-5 h-5 rounded-full object-cover border border-black/10" />
                ) : (
                  <User className="w-4 h-4 stroke-[1.5]" />
                )}
                <span className="hidden xl:inline text-[11px] font-semibold tracking-wider text-black/60">
                  {currentUser ? currentUser.fullName.split(' ')[0] : 'Account'}
                </span>
              </button>

              <button
                onClick={() => {
                  setActivePage('wishlist');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="relative p-2 text-xs tracking-wider uppercase font-medium hover:text-black hover:bg-black/5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4 stroke-[1.5]" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center tabular-nums">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 sm:px-3 sm:py-2 bg-black text-white rounded-full hover:bg-black/85 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                <span className="text-xs font-semibold tabular-nums hidden sm:inline">
                  {cartCount}
                </span>
                {cartCount > 0 && (
                  <span className="sm:hidden absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[9px] font-bold rounded-full border border-white flex items-center justify-center tabular-nums">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 ml-1 lg:hidden text-black/80 hover:text-black hover:bg-black/5 rounded-full cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 stroke-[1.5]" /> : <Menu className="w-5 h-5 stroke-[1.5]" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white/95 backdrop-blur-2xl border-t border-black/[0.06] mt-3 px-4 py-5 rounded-3xl space-y-2 animate-fadeIn shadow-[0_12px_24px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col gap-1.5 text-[13px] font-semibold tracking-wider uppercase">
                <button
                  onClick={() => handleNavClick('gender', 'Men')}
                  className="flex items-center justify-between text-left px-3 py-2.5 hover:bg-black/5 rounded-xl text-black hover:text-black/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Shirt className="w-4 h-4 text-black/50" />
                    <span>Men</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-black/30" />
                </button>
                <button
                  onClick={() => handleNavClick('gender', 'Women')}
                  className="flex items-center justify-between text-left px-3 py-2.5 hover:bg-black/5 rounded-xl text-black hover:text-black/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-black/50" />
                    <span>Women</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-black/30" />
                </button>
                <button
                  onClick={() => handleNavClick('gender', 'Kids')}
                  className="flex items-center justify-between text-left px-3 py-2.5 hover:bg-black/5 rounded-xl text-black hover:text-black/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Smile className="w-4 h-4 text-black/50" />
                    <span>Kids</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-black/30" />
                </button>
                <button
                  onClick={() => handleNavClick('new')}
                  className="flex items-center justify-between text-left px-3 py-2.5 hover:bg-black/5 rounded-xl text-black hover:text-black/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-black/50" />
                    <span>New Arrivals</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-black/30" />
                </button>
                <button
                  onClick={() => handleNavClick('collection', 'Monochrome Collection')}
                  className="flex items-center justify-between text-left px-3 py-2.5 hover:bg-black/5 rounded-xl text-black hover:text-black/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-black/50" />
                    <span>Collections</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-black/30" />
                </button>
                <button
                  onClick={() => handleNavClick('sale')}
                  className="flex items-center justify-between text-left px-3 py-2.5 hover:bg-black/5 rounded-xl text-black/60 hover:text-black transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4 text-black/40" />
                    <span>Sale</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-black/30" />
                </button>
              </div>
            </div>
          )}
        </header>

        {/* --- CENTRALIZED NAVBAR-WIDTH MEGA MENU --- */}
        {hoveredMenu && validCatsForHoveredMenu.length > 0 && (
          <div 
            className="absolute top-full left-0 right-0 w-full mt-2.5 bg-white/95 backdrop-blur-xl border border-black/[0.08] shadow-[0_24px_50px_rgba(0,0,0,0.12)] rounded-3xl p-6 grid grid-cols-12 gap-6 animate-fadeIn z-50 text-left"
            onMouseEnter={() => setHoveredMenuId(hoveredMenu.id)}
          >
            {/* Left Zone (Col span 8): 2x2 Grid of Top 4 Products in category */}
            <div className="col-span-12 md:col-span-8 flex flex-col justify-between">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-black/45 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-black/60" />
                    Featured In {hoveredMenu.title}
                  </h3>
                  <button
                    onClick={() => {
                      if (validCatsForHoveredMenu[0]) {
                        setActiveCategory(validCatsForHoveredMenu[0]);
                        setActiveGender('All');
                        setActiveCollection(null);
                        setActivePage('shop');
                        setHoveredMenuId(null);
                      }
                    }}
                    className="text-[10px] uppercase font-bold tracking-widest text-black/50 hover:text-black transition-colors"
                  >
                    View All &rarr;
                  </button>
                </div>
                <div className="h-[1px] bg-black/[0.05] mt-2.5" />
              </div>

              {topFourProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {topFourProducts.map((prod) => {
                    const isSale = prod.originalPrice && prod.originalPrice > prod.price;
                    const displayImg = (prod.images && prod.images[0]) || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200";
                    return (
                      <div 
                        key={prod.id}
                        onClick={() => {
                          navigateToProduct(prod.id);
                          setHoveredMenuId(null);
                        }}
                        className="group/card bg-black/[0.02] border border-black/[0.04] hover:border-black/[0.08] hover:bg-white p-3 rounded-2xl flex gap-3.5 transition-all duration-300 hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] cursor-pointer"
                      >
                        <div className="w-14 h-18 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 relative">
                          <img 
                            src={displayImg} 
                            alt={prod.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                          />
                          {isSale && (
                            <span className="absolute top-1 left-1 bg-red-600 text-[7px] font-black tracking-widest text-white px-1.5 py-0.5 rounded uppercase">
                              Sale
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col justify-between py-1 min-w-0 flex-1 text-left">
                          <div className="min-w-0">
                            <p className="text-[8px] tracking-wider uppercase font-bold text-black/35 mb-0.5">
                              {prod.gender} · {prod.category}
                            </p>
                            <h4 className="font-extrabold text-[12px] text-zinc-950 leading-tight truncate group-hover/card:text-zinc-600 transition-colors">
                              {prod.name}
                            </h4>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-[12px] font-black text-black/90 font-mono">
                              {storeSettings?.currencySymbol || '$'}{prod.price.toLocaleString()}
                            </span>
                            {isSale && (
                              <span className="text-[9px] text-black/35 line-through font-medium font-mono">
                                {storeSettings?.currencySymbol || '$'}{prod.originalPrice?.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center bg-black/[0.01] border border-dashed border-black/[0.06] rounded-2xl">
                  <p className="text-[10px] italic text-zinc-400">No showcase products loaded for this curation.</p>
                </div>
              )}
            </div>

            {/* Right Zone (Col span 4): Interactive Product Slider Spotlight */}
            <div className="col-span-12 md:col-span-4 border-t md:border-t-0 md:border-l border-black/[0.06] pt-5 md:pt-0 md:pl-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-black/45 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Spotlight Style
                  </h3>
                  {/* Slide controls */}
                  {sliderProducts.length > 1 && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSliderIndex(prev => (prev - 1 + sliderProducts.length) % sliderProducts.length);
                        }}
                        className="w-5.5 h-5.5 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5 transition-all cursor-pointer active:scale-90"
                        aria-label="Previous Spotlight Slide"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 text-zinc-600" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSliderIndex(prev => (prev + 1) % sliderProducts.length);
                        }}
                        className="w-5.5 h-5.5 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5 transition-all cursor-pointer active:scale-90"
                        aria-label="Next Spotlight Slide"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="h-[1px] bg-black/[0.05] mt-1 mb-4" />
              </div>

              {sliderProduct ? (
                <div 
                  onClick={() => {
                    navigateToProduct(sliderProduct.id);
                    setHoveredMenuId(null);
                  }}
                  className="group/slide relative rounded-2xl overflow-hidden bg-zinc-950 cursor-pointer flex-1 flex flex-col justify-end min-h-[170px] shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                >
                  <div className="absolute inset-0">
                    <img 
                      src={(sliderProduct.images && sliderProduct.images[0]) || "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=400"} 
                      alt={sliderProduct.name}
                      className="w-full h-full object-cover opacity-75 group-hover/slide:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                  </div>
                  
                  <div className="relative p-4 z-10 text-white text-left">
                    <span className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-[8px] font-black tracking-widest text-white px-2 py-0.5 rounded-full uppercase mb-2">
                      Interactive Showcase
                    </span>
                    <h4 className="font-extrabold text-[13px] leading-snug text-white group-hover/slide:text-white/80 transition-colors drop-shadow-sm mb-0.5 line-clamp-1">
                      {sliderProduct.name}
                    </h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[12px] font-black text-white font-mono">
                        {storeSettings?.currencySymbol || '$'}{sliderProduct.price.toLocaleString()}
                      </span>
                      <span className="text-[9px] tracking-widest uppercase font-extrabold text-white/85 group-hover/slide:translate-x-1 transition-transform flex items-center gap-1">
                        View Piece <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border border-dashed border-zinc-200 rounded-2xl p-4">
                  <p className="text-[10px] italic text-zinc-400">Curating styles list...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
