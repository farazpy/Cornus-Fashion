import React from 'react';
import { ArrowUpRight, Sparkles, Heart, Award } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const BrandStory: React.FC = () => {
  const { setActivePage, setActiveCollection } = useShop();

  const handleLearnMore = () => {
    setActiveCollection('Essential Collection');
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 lg:py-28 bg-[#e9d5ff]/30 border-y border-dashed border-neutral-900/20">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Playful Illustrated Image Board */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-neutral-900/15 shadow-sm bg-white">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85"
                alt="CORNUS Atelier Craftsman"
                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all duration-300"
              />
            </div>

            {/* Playful Float Badge */}
            <div className="absolute -bottom-6 -right-2 sm:-bottom-8 sm:-right-4 bg-[#fef08a] border border-neutral-900/15 p-5 max-w-[260px] shadow-xs rounded-xl hidden sm:block text-left">
              <span className="font-serif text-3xl font-black text-neutral-900 block mb-1">
                100%
              </span>
              <span className="text-xs uppercase tracking-wider text-neutral-700 font-extrabold leading-tight block">
                Traceable organic yarns & playful carbon-neutral sewing!
              </span>
            </div>
          </div>

          {/* Right Column: Colorful Text & Pillars */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left space-y-6">
            <div className="inline-flex items-center gap-1.5 self-start text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-100 border border-neutral-900/15 px-3 py-1 rounded-full shadow-xs">
              <Award className="w-3.5 h-3.5 fill-current" />
              <span>THE CRAFTSMANSHIP MANIFESTO</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-neutral-900 leading-[1.1] text-balance uppercase">
              BUILT FOR COZY DAYS. LOVED FOREVER.
            </h2>

            <div className="space-y-4 text-neutral-800 text-sm sm:text-base font-medium leading-relaxed">
              <p>
                CORNUS was born from a love for colorful, joyful, and happy garments! We reject sterile minimalism in favor of delightful hand-drawn shapes, playful vector lines, and cheerful pastel tones.
              </p>
              <p>
                Every knit is crafted with care using 100% premium Grade-A cotton, buttery-soft Biella wool, and cozy Okayama yarns. We make clothes that feel like a warm hug, tailored to bring smiles to everyday routines.
              </p>
            </div>

            {/* Illustrated Craft Pillars */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-neutral-900/10">
              <div className="p-4 bg-[#e0f2fe] border border-neutral-900/12 rounded-xl shadow-xs">
                <h4 className="font-serif text-lg font-black text-neutral-900 mb-1">Cheerful Drapes</h4>
                <p className="text-xs text-neutral-700 leading-relaxed font-semibold">
                  Charming cuts engineered to bring absolute comfort and ease to your movements.
                </p>
              </div>
              <div className="p-4 bg-[#bbf7d0] border border-neutral-900/12 rounded-xl shadow-xs">
                <h4 className="font-serif text-lg font-black text-neutral-900 mb-1">Happy Yarns</h4>
                <p className="text-xs text-neutral-700 leading-relaxed font-semibold">
                  Responsibly harvested soft fibers designed to last through happy adventures.
                </p>
              </div>
            </div>

            <button
              onClick={handleLearnMore}
              className="illus-btn px-6 py-3 bg-amber-300 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider self-start cursor-pointer"
            >
              <span>Explore Happy Fits</span>
              <ArrowUpRight className="w-4 h-4 ml-1 stroke-[2]" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
