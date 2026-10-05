import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Lock, MapPin, Phone, Mail, Instagram, ArrowUpRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PolicyTab } from '../types';

export const Footer: React.FC = () => {
  const { 
    setActivePage, 
    setActiveCategory, 
    setActiveGender, 
    setActiveCollection, 
    setIsSizeGuideOpen,
    navigateToPolicy,
    storeSettings
  } = useShop();

  const handleNav = (gender?: 'Men' | 'Women', category?: string, collection?: string) => {
    if (gender) setActiveGender(gender);
    if (category) setActiveCategory(category);
    if (collection) setActiveCollection(collection);
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePolicyClick = (tab: PolicyTab) => {
    navigateToPolicy(tab);
  };

  return (
    <footer className="w-full bg-neutral-950 text-white pt-16 sm:pt-20 pb-12 border-t border-neutral-800">
      <div className="max-w-[1440px] mx-auto w-full">
        {/* Service Guarantees Bar */}
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 pb-14 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-white/70 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-white">Complimentary Delivery</h4>
              <p className="text-xs text-white/50 font-light mt-1">Free express shipping on orders over INR 2,500</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-white/70 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-white">30-Day Returns</h4>
              <p className="text-xs text-white/50 font-light mt-1">Seamless door-to-door reverse pickup</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-white/70 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-white">Certified Materials</h4>
              <p className="text-xs text-white/50 font-light mt-1">100% Biella wool & Grade-A cashmere</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-white/70 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-white">Encrypted Checkout</h4>
              <p className="text-xs text-white/50 font-light mt-1">256-bit TLS bank-grade security</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Directory & Atelier Details */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Monogram, Address & Direct Contacts */}
          <div className="md:col-span-4 pr-0 lg:pr-8 space-y-4">
            <button
              onClick={() => {
                setActivePage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="block text-left hover:opacity-85 transition-opacity"
            >
              <img 
                src={storeSettings?.storeLogoUrl || "https://i.ibb.co/SwmnN7pz/Cornus-Logo.png"} 
                alt={storeSettings?.storeName || 'CORNUS'} 
                className="h-[22px] sm:h-[26px] w-auto object-contain brightness-0 invert"
              />
            </button>
            <p className="text-xs text-white/60 font-light leading-relaxed max-w-sm">
              Contemporary silhouettes, refined architectural lines, and pure unadulterated materiality for modern everyday distinction.
            </p>

            {/* Official Contact Info */}
            <div className="pt-2 space-y-2.5 text-xs text-white/70 font-mono">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-white/50 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {storeSettings?.physicalAddress || 'Tathawade, Pimpri Chinchwad, Pune 411033, Maharashtra, India'}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-white/50 shrink-0" />
                <a href={`tel:${storeSettings?.supportPhone}`} className="hover:text-white transition-colors">
                  {storeSettings?.supportPhone || '+91 9022246164'}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-white/50 shrink-0" />
                <a href={`mailto:${storeSettings?.supportEmail}`} className="hover:text-white transition-colors">
                  {storeSettings?.supportEmail || 'business@cornus.io'}
                </a>
              </div>
            </div>

            <div className="pt-1">
              <a
                href="https://www.cornusfashion.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/40 hover:text-white transition-colors font-mono inline-flex items-center gap-1"
              >
                <span>www.cornusfashion.com</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* SHOP Column */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-5">
              Shop
            </h4>
            <ul className="space-y-3 text-xs text-white/60 font-light">
              <li>
                <button onClick={() => handleNav('Men')} className="hover:text-white transition-colors text-left">
                  Men's Collection
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('Women')} className="hover:text-white transition-colors text-left">
                  Women's Collection
                </button>
              </li>
              <li>
                <button onClick={() => handleNav(undefined, 'All')} className="hover:text-white transition-colors text-left">
                  New Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => handleNav(undefined, undefined, 'Monochrome Collection')} className="hover:text-white transition-colors text-left">
                  Curated Collections
                </button>
              </li>
              <li>
                <button onClick={() => handleNav(undefined, 'Outerwear')} className="hover:text-white transition-colors text-left">
                  Seasonal Archive
                </button>
              </li>
            </ul>
          </div>

          {/* CLIENT CARE / POLICIES Column */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-5">
              Client Care
            </h4>
            <ul className="space-y-3 text-xs text-white/60 font-light">
              <li>
                <button onClick={() => handlePolicyClick('contact')} className="hover:text-white transition-colors text-left">
                  Contact & Concierge
                </button>
              </li>
              <li>
                <button onClick={() => handlePolicyClick('shipping')} className="hover:text-white transition-colors text-left">
                  Shipping & Delivery
                </button>
              </li>
              <li>
                <button onClick={() => handlePolicyClick('returns')} className="hover:text-white transition-colors text-left">
                  30-Day Returns & Refunds
                </button>
              </li>
              <li>
                <button onClick={() => handlePolicyClick('faqs')} className="hover:text-white transition-colors text-left">
                  FAQs
                </button>
              </li>
              <li>
                <button onClick={() => setIsSizeGuideOpen(true)} className="hover:text-white transition-colors text-left">
                  Size & Fit Guide
                </button>
              </li>
            </ul>
          </div>

          {/* ATELIER & LEGAL Column */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-5">
              Legal & Atelier
            </h4>
            <ul className="space-y-3 text-xs text-white/60 font-light">
              <li>
                <button onClick={() => handlePolicyClick('privacy')} className="hover:text-white transition-colors text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => handlePolicyClick('terms')} className="hover:text-white transition-colors text-left">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => handlePolicyClick('sustainability')} className="hover:text-white transition-colors text-left">
                  Sustainability & Sourcing
                </button>
              </li>
              <li>
                <button onClick={() => { setActivePage('story'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors text-left">
                  Our Story & Manifesto
                </button>
              </li>
              <li className="pt-2 border-t border-white/[0.08]">
                <button onClick={() => { setActivePage('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white text-[10px] uppercase tracking-wider text-white/40 font-mono text-left">
                  Atelier Console ↗
                </button>
              </li>
            </ul>
          </div>

          {/* SOCIAL & DIGITAL CHANNELS Column */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80 mb-5">
              Connect
            </h4>
            <ul className="space-y-3 text-xs text-white/60 font-light">
              <li>
                <a
                  href="https://www.instagram.com/cornusfashion/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.cornusfashion.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  cornusfashion.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:business@cornus.io"
                  className="hover:text-white transition-colors"
                >
                  business@cornus.io
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright, Payment Icons & Legal Quick Links */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/45">
        <div>
          © 2026 CORNUS (<a href="https://www.cornusfashion.com/" className="hover:underline">cornusfashion.com</a>). All rights reserved.
        </div>

        {/* Payment Methods Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-1 bg-white/10 rounded-xs text-[10px] tracking-wider text-white/80 font-mono font-semibold">
            VISA
          </span>
          <span className="px-2 py-1 bg-white/10 rounded-xs text-[10px] tracking-wider text-white/80 font-mono font-semibold">
            MASTERCARD
          </span>
          <span className="px-2 py-1 bg-white/10 rounded-xs text-[10px] tracking-wider text-white/80 font-mono font-semibold">
            AMEX
          </span>
          <span className="px-2 py-1 bg-white/10 rounded-xs text-[10px] tracking-wider text-white/80 font-mono font-semibold">
            UPI / GPAY
          </span>
          <span className="px-2 py-1 bg-white/10 rounded-xs text-[10px] tracking-wider text-white/80 font-mono font-semibold">
            APPLE PAY
          </span>
          <span className="px-2 py-1 bg-white/10 rounded-xs text-[10px] tracking-wider text-white/80 font-mono font-semibold">
            COD
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <button onClick={() => handlePolicyClick('privacy')} className="hover:text-white/80 transition-colors">
            Privacy
          </button>
          <span>·</span>
          <button onClick={() => handlePolicyClick('terms')} className="hover:text-white/80 transition-colors">
            Terms
          </button>
          <span>·</span>
          <button onClick={() => handlePolicyClick('shipping')} className="hover:text-white/80 transition-colors">
            Shipping
          </button>
          <span>·</span>
          <button onClick={() => handlePolicyClick('returns')} className="hover:text-white/80 transition-colors">
            Returns
          </button>
        </div>
      </div>
      </div>
    </footer>
  );
};
