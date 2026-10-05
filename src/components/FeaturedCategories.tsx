import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play, Sparkles, Smile, Shirt, Gift, Star, Layers, Compass } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface FallbackCategory {
  id: string;
  name: string;
  tagline: string;
  bgColor: string;
  textColor: string;
  accentBg: string;
  icon: React.FC<{ className?: string }>;
  image: string;
}

const DEFAULT_CATEGORIES: FallbackCategory[] = [
  {
    id: 'cat-women',
    name: 'Women',
    tagline: 'Lovely Silhouette & Playful Dresses',
    bgColor: 'bg-[#fecdd3]',
    textColor: 'text-[#881337]',
    accentBg: 'bg-[#f43f5e]',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'cat-men',
    name: 'Men',
    tagline: 'Dapper Suits & Tailored Essentials',
    bgColor: 'bg-[#e0f2fe]',
    textColor: 'text-[#0c4a6e]',
    accentBg: 'bg-[#0284c7]',
    icon: Shirt,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'cat-kids',
    name: 'Kids',
    tagline: 'Comfy Wardrobe & Durable Playwear',
    bgColor: 'bg-[#bbf7d0]',
    textColor: 'text-[#065f46]',
    accentBg: 'bg-[#10b981]',
    icon: Smile,
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'cat-outerwear',
    name: 'Outerwear',
    tagline: 'Structured Silhouette & Heavy Wool Coats',
    bgColor: 'bg-[#fef08a]',
    textColor: 'text-[#713f12]',
    accentBg: 'bg-[#eab308]',
    icon: Layers,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'cat-tops',
    name: 'Tops',
    tagline: 'Precision Knitwear & Organic Cotton Tees',
    bgColor: 'bg-[#e9d5ff]',
    textColor: 'text-[#581c87]',
    accentBg: 'bg-[#a855f7]',
    icon: Compass,
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    tagline: 'Charming Leather Goods & Fine Accessories',
    bgColor: 'bg-[#fed7aa]',
    textColor: 'text-[#7c2d12]',
    accentBg: 'bg-[#f97316]',
    icon: Gift,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80'
  }
];

export const FeaturedCategories: React.FC = () => {
  const { categories: dbCategories, setActivePage, setActiveCategory, setActiveGender, setActiveCollection } = useShop();

  // Combine live database categories with standard visual styles and sanitized taglines
  const displayCategories = React.useMemo(() => {
    if (dbCategories && dbCategories.length > 0) {
      return dbCategories.map((cat, idx) => {
        const catName = cat.name || cat.title || cat.category || 'Collection';
        const fallback = DEFAULT_CATEGORIES.find(
          d => d.name.toLowerCase() === catName.toLowerCase()
        ) || DEFAULT_CATEGORIES[idx % DEFAULT_CATEGORIES.length];

        const rawTagline = cat.subtitle || cat.tagline;
        const isValidTagline = rawTagline && rawTagline.trim().length > 3 && rawTagline.trim().toUpperCase() !== 'XYZ';
        const tagline = isValidTagline ? rawTagline : fallback.tagline;

        return {
          id: cat.id || `db-cat-${idx}`,
          name: catName,
          tagline: tagline,
          bgColor: fallback.bgColor,
          textColor: fallback.textColor,
          accentBg: fallback.accentBg,
          icon: fallback.icon,
          image: cat.image && cat.image.trim().length > 5 ? cat.image : fallback.image
        };
      });
    }
    return DEFAULT_CATEGORIES;
  }, [dbCategories]);

  const handleCategorySelect = (categoryName: string) => {
    setActiveCollection(null);
    const cleanName = categoryName.trim();

    if (cleanName === 'Women') {
      setActiveGender('Women');
      setActiveCategory('All');
    } else if (cleanName === 'Men') {
      setActiveGender('Men');
      setActiveCategory('All');
    } else if (cleanName === 'Kids') {
      setActiveGender('Kids');
      setActiveCategory('All');
    } else {
      setActiveGender('All');
      setActiveCategory(cleanName);
    }
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isPaused || displayCategories.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayCategories.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, displayCategories.length]);

  return (
    <section className="py-16 sm:py-20 lg:py-24 w-full px-4 sm:px-6 md:px-8 lg:px-10 overflow-hidden bg-[#fffdf9]">
      
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 sm:mb-12 gap-6 text-left">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-500 bg-rose-50 border border-neutral-900/15 px-3 py-1 rounded-full shadow-xs mb-3">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Curated Categories</span>
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-neutral-900">
            Shop By Category
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-10">
          <p className="text-sm sm:text-base text-neutral-700 max-w-md font-medium leading-relaxed">
            Discover tailored silhouettes, structured outerwear, and modern essential garments crafted with unadulterated materiality.
          </p>

          {/* Slider Controllers */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-11 h-11 border border-neutral-900/15 bg-white hover:bg-neutral-50 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-xs active:translate-y-0.5"
              title={isPaused ? 'Resume auto cycle' : 'Pause auto cycle'}
            >
              {isPaused ? <Play className="w-4 h-4 ml-0.5 text-neutral-900 stroke-[2.5]" /> : <Pause className="w-4 h-4 text-neutral-900 stroke-[2.5]" />}
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + displayCategories.length) % displayCategories.length)}
              className="w-11 h-11 border border-neutral-900/15 bg-white hover:bg-neutral-50 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-xs active:translate-y-0.5"
              aria-label="Previous Category"
            >
              <ChevronLeft className="w-5 h-5 text-neutral-900 stroke-[2.5]" />
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % displayCategories.length)}
              className="w-11 h-11 border border-neutral-900/15 bg-white hover:bg-neutral-50 rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-xs active:translate-y-0.5"
              aria-label="Next Category"
            >
              <ChevronRight className="w-5 h-5 text-neutral-900 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div 
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 transform-gpu"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {displayCategories.map((item, idx) => {
          const IconComponent = item.icon;
          const isSelected = currentIndex === idx;

          return (
            <div
              key={item.id}
              onClick={() => handleCategorySelect(item.name || 'All')}
              className={`group relative flex flex-col justify-between aspect-square w-full cursor-pointer hover:scale-[1.02] transition-all duration-500 rounded-2xl border border-black/10 shadow-md overflow-hidden ${
                isSelected ? 'ring-2 ring-black ring-offset-2' : ''
              }`}
            >
              {/* High-definition Category Image */}
              <div className="absolute inset-0 bg-neutral-900 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out brightness-[0.95]"
                  loading="lazy"
                />
                {/* Gradient Overlays for perfect legibility and contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 transition-opacity duration-300" />
              </div>

              {/* Top Row: Icon badge & Arrow button */}
              <div className="relative z-10 p-5 flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-900 shadow-md">
                  <IconComponent className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/90 text-neutral-900 flex items-center justify-center transition-all duration-300 group-hover:bg-white group-hover:rotate-45 group-hover:scale-110 shadow-md">
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              {/* Bottom Content: Name & Tagline */}
              <div className="relative z-10 p-6 pt-12 text-white">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] block mb-1.5 text-white/75">
                  Atelier Division
                </span>
                <h3 className="font-serif text-3xl font-bold tracking-tight mb-2 text-white drop-shadow-sm">
                  {item.name}
                </h3>
                <p className="text-xs font-medium leading-relaxed max-w-[260px] text-white/90 drop-shadow-xs">
                  {item.tagline}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
