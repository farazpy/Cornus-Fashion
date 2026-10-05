import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useShop } from '../context/ShopContext';

export const NewArrivals: React.FC = () => {
  const { products, setActivePage, setActiveCategory, setActiveGender, setActiveCollection } = useShop();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const newProducts = products.filter((p) => p.isNew || p.id.endsWith('01') || p.id.endsWith('02') || p.id.endsWith('05') || p.id.endsWith('08') || p.id.endsWith('11') || p.id.endsWith('13'));

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const cardWidth = 320;
      const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleViewAll = () => {
    setActiveCategory('All');
    setActiveGender('All');
    setActiveCollection(null);
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-20 lg:py-28 bg-[#fafaf9] border-y border-black/[0.04] overflow-hidden">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[11px] tracking-[0.25em] uppercase font-semibold text-black/50 block mb-2">
              Fresh Additions
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-black">
              New Arrivals
            </h2>
          </div>

          {/* Carousel Arrows + View All */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-black/15 hover:border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center text-black"
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-black/15 hover:border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center text-black"
              aria-label="Scroll right"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleViewAll}
              className="hidden sm:inline-block ml-4 text-xs font-semibold tracking-[0.16em] uppercase text-black hover:opacity-60 transition-opacity border-b border-black pb-0.5"
            >
              View All
            </button>
          </div>
        </div>

        {/* Horizontal Carousel */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 snap-x snap-mandatory"
        >
          {newProducts.map((product) => (
            <div
              key={product.id}
              className="min-w-[270px] sm:min-w-[300px] md:min-w-[320px] lg:min-w-[340px] snap-start shrink-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center sm:hidden">
          <button
            onClick={handleViewAll}
            className="w-full py-3 border border-black text-xs font-semibold tracking-[0.16em] uppercase hover:bg-black hover:text-white transition-colors"
          >
            View All New Arrivals
          </button>
        </div>
      </div>
    </section>
  );
};
