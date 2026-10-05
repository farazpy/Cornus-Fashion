import React from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { FashionImage } from './FashionImage';

export const StoryPage: React.FC = () => {
  const { setActivePage, setActiveCollection } = useShop();

  return (
    <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen flex flex-col flex-grow">
      <button
        onClick={() => setActivePage('home')}
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-black/60 hover:text-black mb-3 sm:mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Homepage</span>
      </button>

      {/* Hero Header */}
      <div className="max-w-3xl mb-8 sm:mb-10">
        <span className="text-[11px] tracking-[0.3em] uppercase font-semibold text-black/50 block mb-3">
          The CORNUS Manifesto
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-black leading-[1.05] mb-6">
          Architectural forms. Pure natural drape. Silhouettes built to outlive trends.
        </h1>
        <p className="text-base sm:text-lg text-black/70 font-light leading-relaxed">
          CORNUS was created as an antidote to fast-churning apparel. We believe clothing should function as personal architecture: deliberate, durable, and understated.
        </p>
      </div>

      {/* Large Full-width Visual */}
      <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-xs border border-black/5 mb-20 shadow-xl">
        <FashionImage
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2200&q=85"
          alt="CORNUS Creative Studio"
          className="w-full h-full object-cover"
          aspectRatio="aspect-auto"
        />
      </div>

      {/* Three Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-20 border-b border-black/10">
        <div>
          <span className="font-mono text-xs text-black/40 font-semibold mb-2 block">01 / MATERIAL ORIGIN</span>
          <h3 className="font-serif text-2xl font-normal text-black mb-3">Direct Fiber Sourcing</h3>
          <p className="text-xs sm:text-sm text-black/70 font-light leading-relaxed">
            We bypass middlemen to partner directly with generational heritage mills: virgin wool from Piedmont Italy, Grade-A combed cashmere from the Mongolian steppe, and selvedge denim from Okayama vintage shuttle looms.
          </p>
        </div>

        <div>
          <span className="font-mono text-xs text-black/40 font-semibold mb-2 block">02 / STRUCTURE</span>
          <h3 className="font-serif text-2xl font-normal text-black mb-3">Sculptural Restraint</h3>
          <p className="text-xs sm:text-sm text-black/70 font-light leading-relaxed">
            Every seam is calculated to honor how fabric hangs in motion. We remove unnecessary hardware, loud branding, and ornamental excess to let proportion and weight speak with confidence.
          </p>
        </div>

        <div>
          <span className="font-mono text-xs text-black/40 font-semibold mb-2 block">03 / CONSCIOUSNESS</span>
          <h3 className="font-serif text-2xl font-normal text-black mb-3">Enduring Longevity</h3>
          <p className="text-xs sm:text-sm text-black/70 font-light leading-relaxed">
            Our garments are crafted to be repaired, not replaced. With reinforced twin-needle stitching and natural horn closures, each piece is engineered for a decade of daily wear.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-black mb-4">
          Experience the Autumn/Winter Collection
        </h2>
        <p className="text-sm text-black/60 font-light max-w-md mx-auto mb-8">
          Explore the latest study in heavyweight tailoring and tactile knits.
        </p>
        <button
          onClick={() => {
            setActiveCollection('Essential Collection');
            setActivePage('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="group inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white text-xs uppercase tracking-widest font-semibold hover:bg-black/85 transition-colors"
        >
          <span>Explore The Catalog</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </main>
  );
};
