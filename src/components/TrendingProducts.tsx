import { ProductCard } from './ProductCard';
import { useShop } from '../context/ShopContext';

export const TrendingProducts: React.FC = () => {
  const { products, storeSettings, setActivePage, setActiveCategory, setActiveGender, setActiveCollection } = useShop();

  const menCategory = storeSettings.homeMenCategory || '';
  const womenCategory = storeSettings.homeWomenCategory || '';
  const kidsCategory = storeSettings.homeKidsCategory || '';

  // Filter products for each section based on customizable settings (exactly 20 items max)
  const menCollection = products.filter((p) => {
    if (menCategory && menCategory !== 'All' && menCategory !== 'Default (Gender Men)') {
      return p.category === menCategory;
    }
    return p.gender === 'Men';
  }).slice(0, 20);

  const womenCollection = products.filter((p) => {
    if (womenCategory && womenCategory !== 'All' && womenCategory !== 'Default (Gender Women)') {
      return p.category === womenCategory;
    }
    return p.gender === 'Women';
  }).slice(0, 20);

  const kidsCollection = products.filter((p) => {
    if (kidsCategory && kidsCategory !== 'All' && kidsCategory !== 'Default (Gender Kids)') {
      return p.category === kidsCategory;
    }
    return p.gender === 'Kids';
  }).slice(0, 20);

  const handleViewCategory = (gender: 'Men' | 'Women' | 'Kids') => {
    setActiveCollection(null);
    if (gender === 'Men') {
      if (menCategory && menCategory !== 'All' && menCategory !== 'Default (Gender Men)') {
        setActiveCategory(menCategory);
        setActiveGender('All');
      } else {
        setActiveGender('Men');
        setActiveCategory('All');
      }
    } else if (gender === 'Women') {
      if (womenCategory && womenCategory !== 'All' && womenCategory !== 'Default (Gender Women)') {
        setActiveCategory(womenCategory);
        setActiveGender('All');
      } else {
        setActiveGender('Women');
        setActiveCategory('All');
      }
    } else if (gender === 'Kids') {
      if (kidsCategory && kidsCategory !== 'All' && kidsCategory !== 'Default (Gender Kids)') {
        setActiveCategory(kidsCategory);
        setActiveGender('All');
      } else {
        setActiveGender('Kids');
        setActiveCategory('All');
      }
    }
    setActivePage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const menTitle = menCategory && menCategory !== 'All' && menCategory !== 'Default (Gender Men)' ? `${menCategory} Collection` : "Men Collection";
  const womenTitle = womenCategory && womenCategory !== 'All' && womenCategory !== 'Default (Gender Women)' ? `${womenCategory} Fashion` : "Woman Fashion";
  const kidsTitle = kidsCategory && kidsCategory !== 'All' && kidsCategory !== 'Default (Gender Kids)' ? `${kidsCategory} Collection` : "Kids Collection";

  return (
    <div className="bg-white">
      {/* 1. MEN DIVISION */}
      <section className="py-16 sm:py-20 lg:py-24 w-full px-4 sm:px-6 md:px-8 lg:px-10 border-b border-black/[0.04]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-black/40 block mb-2">
              Atelier Curated
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-black uppercase">
              {menTitle} ({menCollection.length} Items)
            </h2>
          </div>

          <button
            onClick={() => handleViewCategory('Men')}
            className="text-xs font-semibold tracking-[0.16em] uppercase text-black hover:opacity-60 transition-opacity border-b border-black pb-0.5 self-start sm:self-auto"
          >
            Explore {menTitle}
          </button>
        </div>

        {/* 5-Column Grid Desktop, 2-Column Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12 animate-fadeIn">
          {menCollection.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 2. WOMAN DIVISION */}
      <section className="py-16 sm:py-20 lg:py-24 w-full px-4 sm:px-6 md:px-8 lg:px-10 border-b border-black/[0.04]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-black/40 block mb-2">
              Sculptural Forms
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-black uppercase">
              {womenTitle} ({womenCollection.length} Items)
            </h2>
          </div>

          <button
            onClick={() => handleViewCategory('Women')}
            className="text-xs font-semibold tracking-[0.16em] uppercase text-black hover:opacity-60 transition-opacity border-b border-black pb-0.5 self-start sm:self-auto"
          >
            Explore {womenTitle}
          </button>
        </div>

        {/* 5-Column Grid Desktop, 2-Column Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12 animate-fadeIn">
          {womenCollection.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 3. KIDS DIVISION */}
      <section className="py-16 sm:py-20 lg:py-24 w-full px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-black/40 block mb-2">
              Miniature Luxury
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-black uppercase">
              {kidsTitle} ({kidsCollection.length} Items)
            </h2>
          </div>

          <button
            onClick={() => handleViewCategory('Kids')}
            className="text-xs font-semibold tracking-[0.16em] uppercase text-black hover:opacity-60 transition-opacity border-b border-black pb-0.5 self-start sm:self-auto"
          >
            Explore {kidsTitle}
          </button>
        </div>

        {/* 5-Column Grid Desktop, 2-Column Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-12 animate-fadeIn">
          {kidsCollection.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};
