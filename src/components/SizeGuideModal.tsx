import React, { useState, useEffect } from 'react';
import { X, Ruler, Check, Info, ArrowRight, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen, products, selectedProductId } = useShop();
  const [unit, setUnit] = useState<'cm' | 'in'>('in');
  const [activeCategory, setActiveCategory] = useState<
    'tops' | 'outerwear' | 'bottoms' | 'dresses' | 'footwear' | 'accessories' | 'kids'
  >('tops');
  const [activeView, setActiveView] = useState<'garment' | 'conversion' | 'howTo'>('garment');

  const currentProduct = products.find((p) => p.id === selectedProductId);

  // Sync category with current product if opened from product page
  useEffect(() => {
    if (currentProduct) {
      const cat = (currentProduct.category || '').toLowerCase();
      const name = (currentProduct.name || '').toLowerCase();
      const gender = (currentProduct.gender || '').toLowerCase();

      if (gender === 'kids' || cat.includes('kid') || name.includes('kid') || name.includes('junior') || name.includes('youth') || name.includes('baby')) {
        setActiveCategory('kids');
      } else if (cat.includes('bottom') || cat.includes('pant') || name.includes('pant') || name.includes('trouser') || name.includes('jean') || name.includes('short')) {
        setActiveCategory('bottoms');
      } else if (cat.includes('outer') || name.includes('coat') || name.includes('jacket') || name.includes('blazer') || name.includes('trench') || name.includes('parka')) {
        setActiveCategory('outerwear');
      } else if (name.includes('dress') || name.includes('gown') || name.includes('skirt') || cat.includes('dress')) {
        setActiveCategory('dresses');
      } else if (name.includes('shoe') || name.includes('boot') || name.includes('loafer') || name.includes('sneaker') || cat.includes('footwear') || cat.includes('shoe')) {
        setActiveCategory('footwear');
      } else if (cat.includes('access') || name.includes('ring') || name.includes('belt') || name.includes('hat') || name.includes('scarf') || name.includes('glove')) {
        setActiveCategory('accessories');
      } else {
        setActiveCategory('tops');
      }
    }
  }, [currentProduct, isSizeGuideOpen]);

  if (!isSizeGuideOpen) return null;

  // Category specific measurements
  const categoryTables = {
    tops: {
      title: 'Tops, Shirts, Polos & Knitwear',
      description: 'Crafted with natural shoulder alignment and comfortable chest drape.',
      in: [
        { size: 'XS', chest: '34 - 36', shoulder: '17.0', sleeve: '32.5', length: '26.5', collar: '14.5' },
        { size: 'S', chest: '36 - 38', shoulder: '17.5', sleeve: '33.5', length: '27.0', collar: '15.0' },
        { size: 'M', chest: '38 - 40', shoulder: '18.0', sleeve: '34.5', length: '27.5', collar: '15.5' },
        { size: 'L', chest: '40 - 43', shoulder: '18.7', sleeve: '35.5', length: '28.5', collar: '16.5' },
        { size: 'XL', chest: '43 - 46', shoulder: '19.5', sleeve: '36.5', length: '29.5', collar: '17.5' },
        { size: 'XXL', chest: '46 - 49', shoulder: '20.2', sleeve: '37.0', length: '30.5', collar: '18.0' }
      ],
      cm: [
        { size: 'XS', chest: '86 - 91', shoulder: '43.2', sleeve: '82.5', length: '67.3', collar: '36.8' },
        { size: 'S', chest: '91 - 97', shoulder: '44.5', sleeve: '85.1', length: '68.6', collar: '38.1' },
        { size: 'M', chest: '97 - 102', shoulder: '45.7', sleeve: '87.6', length: '69.8', collar: '39.4' },
        { size: 'L', chest: '102 - 109', shoulder: '47.5', sleeve: '90.2', length: '72.4', collar: '41.9' },
        { size: 'XL', chest: '109 - 117', shoulder: '49.5', sleeve: '92.7', length: '74.9', collar: '44.5' },
        { size: 'XXL', chest: '117 - 124', shoulder: '51.3', sleeve: '94.0', length: '77.5', collar: '45.7' }
      ],
      headers: ['Size', 'Chest', 'Shoulder', 'Sleeve', 'Length', 'Collar']
    },
    outerwear: {
      title: 'Overcoats, Blazers & Trench Coats',
      description: 'Engineered with tailored shoulder ease to layer comfortably over suiting and knitwear.',
      in: [
        { size: 'XS', chest: '36 - 38', shoulder: '17.5', sleeve: '33.0', length: '38.5', waist: '32 - 34' },
        { size: 'S', chest: '38 - 40', shoulder: '18.0', sleeve: '34.0', length: '39.5', waist: '34 - 36' },
        { size: 'M', chest: '40 - 42', shoulder: '18.5', sleeve: '35.0', length: '40.5', waist: '36 - 38' },
        { size: 'L', chest: '42 - 45', shoulder: '19.2', sleeve: '36.0', length: '41.5', waist: '38 - 41' },
        { size: 'XL', chest: '45 - 48', shoulder: '20.0', sleeve: '37.0', length: '42.5', waist: '41 - 44' },
        { size: 'XXL', chest: '48 - 51', shoulder: '20.8', sleeve: '37.5', length: '43.5', waist: '44 - 47' }
      ],
      cm: [
        { size: 'XS', chest: '91 - 97', shoulder: '44.5', sleeve: '83.8', length: '97.8', waist: '81 - 86' },
        { size: 'S', chest: '97 - 102', shoulder: '45.7', sleeve: '86.4', length: '100.3', waist: '86 - 91' },
        { size: 'M', chest: '102 - 107', shoulder: '47.0', sleeve: '88.9', length: '102.9', waist: '91 - 97' },
        { size: 'L', chest: '107 - 114', shoulder: '48.8', sleeve: '91.4', length: '105.4', waist: '97 - 104' },
        { size: 'XL', chest: '114 - 122', shoulder: '50.8', sleeve: '94.0', length: '108.0', waist: '104 - 112' },
        { size: 'XXL', chest: '122 - 130', shoulder: '52.8', sleeve: '95.3', length: '110.5', waist: '112 - 119' }
      ],
      headers: ['Size', 'Chest', 'Shoulder', 'Sleeve', 'Total Length', 'Waist']
    },
    bottoms: {
      title: 'Trousers, Chinos, Jeans & Shorts',
      description: 'Mid-rise with subtle taper through the leg and customizable finished hem.',
      in: [
        { size: '28 (XS)', waist: '28.0 - 29.5', hip: '35.0 - 36.5', thigh: '21.5', inseam: '32.0', legOpening: '13.5' },
        { size: '30 (S)', waist: '30.0 - 31.5', hip: '37.0 - 38.5', thigh: '22.5', inseam: '32.0', legOpening: '14.0' },
        { size: '32 (M)', waist: '32.0 - 33.5', hip: '39.0 - 40.5', thigh: '23.5', inseam: '32.5', legOpening: '14.5' },
        { size: '34 (L)', waist: '34.0 - 35.5', hip: '41.0 - 42.5', thigh: '24.5', inseam: '33.0', legOpening: '15.0' },
        { size: '36 (XL)', waist: '36.0 - 37.5', hip: '43.0 - 44.5', thigh: '25.5', inseam: '33.5', legOpening: '15.5' },
        { size: '38 (XXL)', waist: '38.0 - 40.0', hip: '45.0 - 47.0', thigh: '26.5', inseam: '34.0', legOpening: '16.0' }
      ],
      cm: [
        { size: '28 (XS)', waist: '71 - 75', hip: '89 - 93', thigh: '54.6', inseam: '81.3', legOpening: '34.3' },
        { size: '30 (S)', waist: '76 - 80', hip: '94 - 98', thigh: '57.2', inseam: '81.3', legOpening: '35.6' },
        { size: '32 (M)', waist: '81 - 85', hip: '99 - 103', thigh: '59.7', inseam: '82.6', legOpening: '36.8' },
        { size: '34 (L)', waist: '86 - 90', hip: '104 - 108', thigh: '62.2', inseam: '83.8', legOpening: '38.1' },
        { size: '36 (XL)', waist: '91 - 95', hip: '109 - 113', thigh: '64.8', inseam: '85.1', legOpening: '39.4' },
        { size: '38 (XXL)', waist: '96 - 102', hip: '114 - 119', thigh: '67.3', inseam: '86.4', legOpening: '40.6' }
      ],
      headers: ['Size', 'Waist', 'Hip', 'Thigh', 'Inseam', 'Leg Opening']
    },
    dresses: {
      title: 'Dresses, Gowns, Silk Slips & Skirts',
      description: 'Precision architectural silhouettes crafted for effortless movement and graceful drape.',
      in: [
        { size: 'XS (US 0-2)', bust: '32 - 34', waist: '24 - 26', hip: '34 - 36', length: '44.0' },
        { size: 'S (US 4-6)', bust: '34 - 36', waist: '26 - 28', hip: '36 - 38', length: '45.0' },
        { size: 'M (US 8-10)', bust: '36 - 38', waist: '28 - 30', hip: '38 - 40', length: '46.0' },
        { size: 'L (US 12-14)', bust: '38 - 41', waist: '30 - 33', hip: '40 - 43', length: '47.0' },
        { size: 'XL (US 16)', bust: '41 - 44', waist: '33 - 36', hip: '43 - 46', length: '48.0' }
      ],
      cm: [
        { size: 'XS (US 0-2)', bust: '81 - 86', waist: '61 - 66', hip: '86 - 91', length: '111.8' },
        { size: 'S (US 4-6)', bust: '86 - 91', waist: '66 - 71', hip: '91 - 97', length: '114.3' },
        { size: 'M (US 8-10)', bust: '91 - 97', waist: '71 - 76', hip: '97 - 102', length: '116.8' },
        { size: 'L (US 12-14)', bust: '97 - 104', waist: '76 - 84', hip: '102 - 109', length: '119.4' },
        { size: 'XL (US 16)', bust: '104 - 112', waist: '84 - 91', hip: '109 - 117', length: '121.9' }
      ],
      headers: ['Size', 'Bust', 'Waist', 'Hip', 'Total Length']
    },
    footwear: {
      title: 'Handcrafted Footwear, Boots & Loafers',
      description: 'Constructed on traditional Italian lasts. Fits true to standard European sizing.',
      in: [
        { size: 'EU 39', usMen: '6.5', usWomen: '8.0', uk: '6.0', footLength: '9.8"' },
        { size: 'EU 40', usMen: '7.5', usWomen: '9.0', uk: '6.5', footLength: '10.1"' },
        { size: 'EU 41', usMen: '8.0', usWomen: '9.5', uk: '7.5', footLength: '10.4"' },
        { size: 'EU 42', usMen: '9.0', usWomen: '10.5', uk: '8.5', footLength: '10.7"' },
        { size: 'EU 43', usMen: '10.0', usWomen: '11.5', uk: '9.5', footLength: '11.0"' },
        { size: 'EU 44', usMen: '11.0', usWomen: '12.5', uk: '10.5', footLength: '11.3"' },
        { size: 'EU 45', usMen: '12.0', usWomen: '13.5', uk: '11.5', footLength: '11.6"' }
      ],
      cm: [
        { size: 'EU 39', usMen: '6.5', usWomen: '8.0', uk: '6.0', footLength: '24.9 cm' },
        { size: 'EU 40', usMen: '7.5', usWomen: '9.0', uk: '6.5', footLength: '25.6 cm' },
        { size: 'EU 41', usMen: '8.0', usWomen: '9.5', uk: '7.5', footLength: '26.4 cm' },
        { size: 'EU 42', usMen: '9.0', usWomen: '10.5', uk: '8.5', footLength: '27.2 cm' },
        { size: 'EU 43', usMen: '10.0', usWomen: '11.5', uk: '9.5', footLength: '28.0 cm' },
        { size: 'EU 44', usMen: '11.0', usWomen: '12.5', uk: '10.5', footLength: '28.7 cm' },
        { size: 'EU 45', usMen: '12.0', usWomen: '13.5', uk: '11.5', footLength: '29.5 cm' }
      ],
      headers: ['EU Size', 'US Men', 'US Women', 'UK Size', 'Foot Length']
    },
    accessories: {
      title: 'Belts, Rings, Jewelry & Headwear',
      description: 'Handmade luxury accessories with precise millimeter tolerances.',
      in: [
        { item: 'Belt S (30-32)', waistMatch: '30" - 32"', totalLength: '38.0"', width: '1.25"' },
        { item: 'Belt M (34-36)', waistMatch: '34" - 36"', totalLength: '42.0"', width: '1.25"' },
        { item: 'Belt L (38-40)', waistMatch: '38" - 40"', totalLength: '46.0"', width: '1.25"' },
        { item: 'Ring US 7 (EU 54)', waistMatch: 'Diameter 0.68"', totalLength: 'Circum. 2.14"', width: '17.3 mm' },
        { item: 'Ring US 9 (EU 59)', waistMatch: 'Diameter 0.75"', totalLength: 'Circum. 2.34"', width: '18.9 mm' },
        { item: 'Hat M/L', waistMatch: 'Head 22.4" - 23.2"', totalLength: 'US 7 1/8 - 7 3/8', width: 'UK 7 - 7 1/4' }
      ],
      cm: [
        { item: 'Belt S (30-32)', waistMatch: '76 - 81 cm', totalLength: '96.5 cm', width: '3.2 cm' },
        { item: 'Belt M (34-36)', waistMatch: '86 - 91 cm', totalLength: '106.7 cm', width: '3.2 cm' },
        { item: 'Belt L (38-40)', waistMatch: '96 - 102 cm', totalLength: '116.8 cm', width: '3.2 cm' },
        { item: 'Ring US 7 (EU 54)', waistMatch: 'Diameter 17.3 mm', totalLength: 'Circum. 54.4 mm', width: 'EU 54' },
        { item: 'Ring US 9 (EU 59)', waistMatch: 'Diameter 18.9 mm', totalLength: 'Circum. 59.5 mm', width: 'EU 59' },
        { item: 'Hat M/L', waistMatch: 'Head 57 - 59 cm', totalLength: 'US 7 1/8 - 7 3/8', width: 'UK 7 - 7 1/4' }
      ],
      headers: ['Item / Spec', 'Primary Dimension', 'Total Span', 'Secondary Spec']
    },
    kids: {
      title: 'Junior, Kids & Youth Garments',
      description: 'Comfort-engineered proportions for growing silhouettes with soft organic seams.',
      in: [
        { age: '2 - 3 Years (98 cm)', height: '36 - 38.5"', chest: '20.5 - 21.5"', waist: '19.5 - 20.5"', hip: '21.0 - 22.0"' },
        { age: '4 - 5 Years (110 cm)', height: '41 - 43.5"', chest: '22.5 - 23.5"', waist: '21.0 - 22.0"', hip: '23.0 - 24.0"' },
        { age: '6 - 7 Years (122 cm)', height: '46 - 48.0"', chest: '24.5 - 25.5"', waist: '22.0 - 23.0"', hip: '25.0 - 26.5"' },
        { age: '8 - 9 Years (134 cm)', height: '50 - 52.5"', chest: '26.5 - 28.0"', waist: '23.5 - 24.5"', hip: '27.5 - 29.0"' },
        { age: '10 - 11 Years (146 cm)', height: '55 - 57.5"', chest: '29.0 - 30.5"', waist: '25.0 - 26.0"', hip: '30.0 - 31.5"' },
        { age: '12 - 14 Years (158 cm)', height: '60 - 62.5"', chest: '31.5 - 33.0"', waist: '26.5 - 28.0"', hip: '33.0 - 34.5"' }
      ],
      cm: [
        { age: '2 - 3 Years (98 cm)', height: '92 - 98 cm', chest: '52 - 55 cm', waist: '50 - 52 cm', hip: '53 - 56 cm' },
        { age: '4 - 5 Years (110 cm)', height: '104 - 110 cm', chest: '57 - 60 cm', waist: '53 - 56 cm', hip: '58 - 61 cm' },
        { age: '6 - 7 Years (122 cm)', height: '116 - 122 cm', chest: '62 - 65 cm', waist: '56 - 58 cm', hip: '64 - 67 cm' },
        { age: '8 - 9 Years (134 cm)', height: '128 - 134 cm', chest: '67 - 71 cm', waist: '60 - 62 cm', hip: '70 - 74 cm' },
        { age: '10 - 11 Years (146 cm)', height: '140 - 146 cm', chest: '74 - 78 cm', waist: '63 - 66 cm', hip: '76 - 80 cm' },
        { age: '12 - 14 Years (158 cm)', height: '152 - 158 cm', chest: '80 - 84 cm', waist: '67 - 71 cm', hip: '84 - 88 cm' }
      ],
      headers: ['Age Group / Size', 'Child Height', 'Chest', 'Waist', 'Hip']
    }
  };

  const activeCategoryData = categoryTables[activeCategory] || categoryTables.tops;
  const currentRows: any[] = activeCategoryData[unit] || (activeCategoryData as any).in;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto glass-modal bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-zinc-950">
                Garment Sizing Matrix
              </h3>
              <p className="text-xs text-zinc-500">
                {currentProduct ? `Specific measurement guide for "${currentProduct.name}"` : 'Master international tailoring specifications'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="w-8 h-8 rounded-full border border-zinc-200 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* View Tabs & Unit Switcher */}
        <div className="px-5 sm:px-6 pt-4 pb-3 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/30">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl">
            <button
              onClick={() => setActiveView('garment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'garment' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Garment Dimensions
            </button>
            <button
              onClick={() => setActiveView('conversion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'conversion' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              International Conversion
            </button>
            <button
              onClick={() => setActiveView('howTo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeView === 'howTo' ? 'bg-white text-zinc-950 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              How to Measure
            </button>
          </div>

          {activeView !== 'howTo' && (
            <div className="flex border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50 p-0.5">
              <button
                onClick={() => setUnit('in')}
                className={`px-3 py-1 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                  unit === 'in' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Inches
              </button>
              <button
                onClick={() => setUnit('cm')}
                className={`px-3 py-1 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer ${
                  unit === 'cm' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Centimeters
              </button>
            </div>
          )}
        </div>

        {/* Category Selector Pills */}
        <div className="px-5 sm:px-6 pt-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none border-b border-zinc-100">
          {[
            { id: 'tops', label: 'Tops & Shirts' },
            { id: 'outerwear', label: 'Jackets & Coats' },
            { id: 'bottoms', label: 'Trousers & Pants' },
            { id: 'dresses', label: 'Dresses & Gowns' },
            { id: 'footwear', label: 'Footwear' },
            { id: 'accessories', label: 'Jewelry & Accessories' },
            { id: 'kids', label: 'Kids & Youth' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {activeView === 'garment' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-serif text-lg font-bold text-zinc-950">{activeCategoryData.title}</h4>
                  <p className="text-xs text-zinc-500">{activeCategoryData.description}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-200 shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] uppercase tracking-wider font-bold text-zinc-600">
                    <tr>
                      {activeCategoryData.headers.map((h: string, idx: number) => (
                        <th key={idx} className="py-2.5 px-3 whitespace-nowrap">
                          {h} {idx > 0 && `(${unit.toUpperCase()})`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {currentRows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-zinc-50/80 transition-colors">
                        {Object.values(row).map((val: any, cIdx: number) => (
                          <td
                            key={cIdx}
                            className={`py-2.5 px-3 whitespace-nowrap ${
                              cIdx === 0 ? 'font-bold font-sans text-zinc-950 bg-zinc-50/40' : 'text-zinc-700 font-mono'
                            }`}
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'conversion' && (
            <div>
              <h4 className="font-serif text-lg font-bold text-zinc-950 mb-1">International Standard Conversions</h4>
              <p className="text-xs text-zinc-500 mb-4">Direct cross-market size equivalence for European luxury apparel.</p>

              <div className="overflow-x-auto rounded-xl border border-zinc-200 shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] uppercase tracking-wider font-bold text-zinc-600">
                    <tr>
                      <th className="py-2.5 px-3">Atelier</th>
                      <th className="py-2.5 px-3">US / CA</th>
                      <th className="py-2.5 px-3">UK / AU</th>
                      <th className="py-2.5 px-3">EU / FR</th>
                      <th className="py-2.5 px-3">IT</th>
                      <th className="py-2.5 px-3">JP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-mono text-xs">
                    <tr className="hover:bg-zinc-50"><td className="py-2.5 px-3 font-bold font-sans text-zinc-950">XS</td><td className="py-2.5 px-3">34 / 0-2</td><td className="py-2.5 px-3">34 / 6</td><td className="py-2.5 px-3">44 / 34</td><td className="py-2.5 px-3">44 / 38</td><td className="py-2.5 px-3">1</td></tr>
                    <tr className="hover:bg-zinc-50"><td className="py-2.5 px-3 font-bold font-sans text-zinc-950">S</td><td className="py-2.5 px-3">36 / 4-6</td><td className="py-2.5 px-3">36 / 8</td><td className="py-2.5 px-3">46 / 36</td><td className="py-2.5 px-3">46 / 40</td><td className="py-2.5 px-3">2</td></tr>
                    <tr className="hover:bg-zinc-50"><td className="py-2.5 px-3 font-bold font-sans text-zinc-950">M</td><td className="py-2.5 px-3">38 / 8-10</td><td className="py-2.5 px-3">38 / 10</td><td className="py-2.5 px-3">48 / 38</td><td className="py-2.5 px-3">48 / 42</td><td className="py-2.5 px-3">3</td></tr>
                    <tr className="hover:bg-zinc-50"><td className="py-2.5 px-3 font-bold font-sans text-zinc-950">L</td><td className="py-2.5 px-3">40 / 12-14</td><td className="py-2.5 px-3">40 / 12</td><td className="py-2.5 px-3">50 / 40</td><td className="py-2.5 px-3">50 / 44</td><td className="py-2.5 px-3">4</td></tr>
                    <tr className="hover:bg-zinc-50"><td className="py-2.5 px-3 font-bold font-sans text-zinc-950">XL</td><td className="py-2.5 px-3">42 / 16</td><td className="py-2.5 px-3">42 / 14</td><td className="py-2.5 px-3">52 / 42</td><td className="py-2.5 px-3">52 / 46</td><td className="py-2.5 px-3">5</td></tr>
                    <tr className="hover:bg-zinc-50"><td className="py-2.5 px-3 font-bold font-sans text-zinc-950">XXL</td><td className="py-2.5 px-3">44 / 18</td><td className="py-2.5 px-3">44 / 16</td><td className="py-2.5 px-3">54 / 44</td><td className="py-2.5 px-3">54 / 48</td><td className="py-2.5 px-3">6</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === 'howTo' && (
            <div className="space-y-4">
              <h4 className="font-serif text-lg font-bold text-zinc-950">Precision Measurement Protocol</h4>
              <p className="text-xs text-zinc-500">For the most accurate silhouette, measure wearing light undergarments using a flexible tape measure.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="font-bold text-zinc-950 block mb-1">1. Chest / Bust</span>
                  <p className="text-zinc-600 leading-relaxed">Wrap the tape horizontally around the fullest part of your chest, keeping it flat under armpits and across shoulder blades.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="font-bold text-zinc-950 block mb-1">2. Natural Waist</span>
                  <p className="text-zinc-600 leading-relaxed">Measure around your natural waistline, situated approximately 1 inch above your navel, keeping the tape comfortably snug.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="font-bold text-zinc-950 block mb-1">3. Hips & Seat</span>
                  <p className="text-zinc-600 leading-relaxed">Stand with heels together and measure around the widest portion of your hips and gluteal curve.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="font-bold text-zinc-950 block mb-1">4. Sleeve Length</span>
                  <p className="text-zinc-600 leading-relaxed">Measure from center back of neck, across the shoulder point, down along the bent elbow to the wrist bone.</p>
                </div>
              </div>
            </div>
          )}

          {/* Fit Concierge Note */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-amber-900 block mb-0.5">Complimentary Exchange Guarantee</strong>
              <p className="text-amber-800/90 text-[11px] leading-relaxed">
                Unsure between two sizes? Order with confidence — all items include free 30-day global size exchanges with pre-paid express return couriers.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end">
          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="px-6 py-2.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-black transition-all shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
