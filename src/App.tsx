/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FeaturedCategories } from './components/FeaturedCategories';
import { NewArrivals } from './components/NewArrivals';
import { TrendingProducts } from './components/TrendingProducts';
import { BrandStory } from './components/BrandStory';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchOverlay } from './components/SearchOverlay';
import { CheckoutModal } from './components/CheckoutModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { AuthModal } from './components/AuthModal';
import { QuickViewModal } from './components/QuickViewModal';
import { ToastContainer } from './components/ToastContainer';
import { MobileBottomBar } from './components/MobileBottomBar';
import { RecentlyViewedTray } from './components/RecentlyViewedTray';

// Code-splitting premium sub-pages for instantaneous core bundle size optimization
const ProductListingPage = lazy(() =>
  import('./components/ProductListingPage').then((m) => ({ default: m.ProductListingPage }))
);
const ProductDetailPage = lazy(() =>
  import('./components/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage }))
);
const WishlistPage = lazy(() =>
  import('./components/WishlistPage').then((m) => ({ default: m.WishlistPage }))
);
const AccountDashboard = lazy(() =>
  import('./components/AccountDashboard').then((m) => ({ default: m.AccountDashboard }))
);
const StoryPage = lazy(() =>
  import('./components/StoryPage').then((m) => ({ default: m.StoryPage }))
);
const PolicyPages = lazy(() =>
  import('./components/PolicyPages').then((m) => ({ default: m.PolicyPages }))
);
const AdminPanel = lazy(() =>
  import('./components/AdminPanel').then((m) => ({ default: m.AdminPanel }))
);
const CheckoutPage = lazy(() =>
  import('./components/CheckoutPage').then((m) => ({ default: m.CheckoutPage }))
);
const ContactPage = lazy(() =>
  import('./components/ContactPage').then((m) => ({ default: m.ContactPage }))
);

// High-end minimalist shimmer/loader component conforming to luxury aesthetic
const RouteSuspenseFallback: React.FC = () => (
  <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-24 bg-[#fafaf9] animate-fadeIn">
    <div className="relative w-12 h-12 mb-5">
      <div className="absolute inset-0 rounded-full border-t border-r border-black animate-spin" style={{ animationDuration: '0.6s' }} />
      <div className="absolute inset-0 rounded-full border border-zinc-100" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[8px] font-bold tracking-widest text-black/60">C</span>
      </div>
    </div>
    <span className="text-[9px] tracking-[0.25em] uppercase text-zinc-400 font-bold animate-pulse">
      Loading Atelier
    </span>
  </div>
);

const MainContent: React.FC = () => {
  const { activePage } = useShop();

  return (
    <div className="min-h-screen flex flex-col pb-16 lg:pb-0">
      <div key={activePage} className="page-transition flex flex-col flex-grow">
        {activePage === 'home' && (
          <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen flex flex-col flex-grow">
            <Hero />
            <div className="w-full flex flex-col">
              <FeaturedCategories />
              <TrendingProducts />
              <BrandStory />
              <NewArrivals />
              <Newsletter />
            </div>
          </main>
        )}

        {/* Wrapping each code-split subpage inside React Suspense with minimalist premium loading screens */}
        {activePage !== 'home' && (
          <div className="w-full flex flex-col flex-grow">
            <Suspense fallback={<RouteSuspenseFallback />}>
              {activePage === 'shop' && <ProductListingPage />}
              {activePage === 'product' && <ProductDetailPage />}
              {activePage === 'wishlist' && <WishlistPage />}
              {activePage === 'account' && <AccountDashboard />}
              {activePage === 'story' && <StoryPage />}
              {activePage === 'contact' && <ContactPage />}
              {activePage === 'policy' && <PolicyPages />}
              {activePage === 'checkout' && <CheckoutPage />}
              {activePage === 'admin' && <AdminPanel />}
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  const { activePage } = useShop();
  const isAdminPage = activePage === 'admin';

  return (
    <div className="min-h-screen bg-[#fffdf9] text-[#121212] flex flex-col font-sans selection:bg-black selection:text-white w-full relative">
      {!isAdminPage && <Header />}
      <MainContent />
      {!isAdminPage && <Footer />}

      {/* Global Overlays & Modals */}
      <CartDrawer />
      <SearchOverlay />
      <CheckoutModal />
      <SizeGuideModal />
      <AuthModal />
      <QuickViewModal />
      <ToastContainer />
      {!isAdminPage && <RecentlyViewedTray />}
      {!isAdminPage && <MobileBottomBar />}
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <AppLayout />
    </ShopProvider>
  );
}

