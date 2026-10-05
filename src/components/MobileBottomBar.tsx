import React from 'react';
import { Home, Compass, Search, Heart, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const MobileBottomBar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    setIsSearchOpen,
    setIsCartOpen,
    cartCount,
    wishlistCount,
    setActiveCategory,
    setActiveGender,
    setActiveCollection
  } = useShop();

  const handleOpenShop = () => {
    setActiveCategory('All');
    setActiveGender('All');
    setActiveCollection(null);
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenHome = () => {
    setActivePage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav bg-white/90 backdrop-blur-xl border-t border-black/10 px-4 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <button
        onClick={handleOpenHome}
        className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
          activePage === 'home' ? 'text-black' : 'text-black/50 hover:text-black'
        }`}
        aria-label="Home"
      >
        <Home className="w-4 h-4 stroke-[1.8]" />
        <span className="text-[10px] uppercase tracking-wider font-medium">Home</span>
      </button>

      <button
        onClick={handleOpenShop}
        className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
          activePage === 'shop' ? 'text-black' : 'text-black/50 hover:text-black'
        }`}
        aria-label="Explore Shop"
      >
        <Compass className="w-4 h-4 stroke-[1.8]" />
        <span className="text-[10px] uppercase tracking-wider font-medium">Shop</span>
      </button>

      <button
        onClick={() => setIsSearchOpen(true)}
        className="flex flex-col items-center gap-1 p-1.5 text-black/50 hover:text-black transition-colors"
        aria-label="Search"
      >
        <Search className="w-4 h-4 stroke-[1.8]" />
        <span className="text-[10px] uppercase tracking-wider font-medium">Search</span>
      </button>

      <button
        onClick={() => {
          setActivePage('wishlist');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`relative flex flex-col items-center gap-1 p-1.5 transition-colors ${
          activePage === 'wishlist' ? 'text-black' : 'text-black/50 hover:text-black'
        }`}
        aria-label="Wishlist"
      >
        <Heart className="w-4 h-4 stroke-[1.8]" />
        {wishlistCount > 0 && (
          <span className="absolute top-0.5 right-1 w-3.5 h-3.5 bg-black text-white text-[8px] font-bold rounded-full flex items-center justify-center">
            {wishlistCount}
          </span>
        )}
        <span className="text-[10px] uppercase tracking-wider font-medium">Saved</span>
      </button>

      <button
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center gap-1 p-1.5 text-black"
        aria-label="Bag"
      >
        <ShoppingBag className="w-4 h-4 stroke-[1.8]" />
        {cartCount > 0 && (
          <span className="absolute top-0.5 right-1 w-3.5 h-3.5 bg-black text-white text-[8px] font-bold rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        )}
        <span className="text-[10px] uppercase tracking-wider font-medium">Bag</span>
      </button>
    </div>
  );
};
