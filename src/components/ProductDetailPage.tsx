import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Maximize2,
  X,
  Star,
  Check,
  Bell,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Share2,
  Ruler,
  Leaf,
  ShoppingBag,
  CreditCard,
  Copy,
  Sliders,
  CheckCheck
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { FashionImage } from './FashionImage';

export const ProductDetailPage: React.FC = () => {
  const {
    products,
    selectedProductId,
    addToCart,
    isInWishlist,
    toggleWishlist,
    setActivePage,
    setActiveCategory,
    setIsSizeGuideOpen,
    setIsCheckoutOpen,
    refreshProducts,
    storeSettings,
    recordRecentlyViewed
  } = useShop();

  const currencySymbol = storeSettings?.currencySymbol || 'INR ';
  const product = products.find((p) => p.id === selectedProductId) || products[0];

  useEffect(() => {
    if (product) {
      recordRecentlyViewed(product);
    }
  }, [product?.id]);

  // Gallery and Selection State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'fit' | 'care' | 'shipping'>('details');
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [showFitAdvisorModal, setShowFitAdvisorModal] = useState(false);

  // Smart Fit Advisor State
  const [userHeight, setUserHeight] = useState(175); // cm
  const [userWeight, setUserWeight] = useState(70); // kg
  const [fitPreference, setFitPreference] = useState<'slim' | 'regular' | 'relaxed'>('regular');
  const [fitRecommendation, setFitRecommendation] = useState<{ size: string; confidence: number; note: string }>({
    size: 'M',
    confidence: 96,
    note: 'Optimal tailored drape based on your height and build.'
  });

  // Out-of-Stock Notification Form State
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySize, setNotifySize] = useState<string>('');
  const [notifyColor, setNotifyColor] = useState<string>('');
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);
  const [notifySuccessMsg, setNotifySuccessMsg] = useState<string | null>(null);
  const [notifyErrorMsg, setNotifyErrorMsg] = useState<string | null>(null);
  const notifySectionRef = useRef<HTMLDivElement>(null);

  // Reviews & Rating System
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [reviewFilterRating, setReviewFilterRating] = useState<number | 'all'>('all');
  const [reviewSortBy, setReviewSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [selectedReviewPhoto, setSelectedReviewPhoto] = useState<string | null>(null);
  const [isWritingReview, setIsWritingReview] = useState(false);

  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewPhoto, setNewReviewPhoto] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [chartUnit, setChartUnit] = useState<'in' | 'cm'>('in');

  // Calculate Smart Fit Recommendation on input change
  useEffect(() => {
    let rec = 'M';
    let conf = 94;
    let note = 'True to size with structured drape.';

    if (userWeight < 58 || userHeight < 165) {
      rec = fitPreference === 'relaxed' ? 'S' : 'XS';
      conf = 95;
      note = 'Tailored fit aligned with slim silhouette proportions.';
    } else if (userWeight <= 72 && userHeight <= 178) {
      rec = fitPreference === 'slim' ? 'S' : fitPreference === 'relaxed' ? 'L' : 'M';
      conf = 97;
      note = 'Perfect shoulder seam alignment and balanced torso drape.';
    } else if (userWeight <= 86 || userHeight <= 186) {
      rec = fitPreference === 'slim' ? 'M' : fitPreference === 'relaxed' ? 'XL' : 'L';
      conf = 96;
      note = 'Comfortable chest clearance with relaxed drape.';
    } else {
      rec = fitPreference === 'slim' ? 'L' : 'XL';
      conf = 95;
      note = 'Generous cut accommodating broader shoulder structure.';
    }

    setFitRecommendation({ size: rec, confidence: conf, note });
  }, [userHeight, userWeight, fitPreference]);

  // Live Sync reviews and reset form state when product changes
  useEffect(() => {
    if (!product) return;
    setActiveImageIndex(0);
    setSelectedColorIndex(0);
    setSelectedSize(product.sizes?.[0] || 'M');
    setNotifySize(product.sizes?.[0] || 'M');
    setNotifyColor(product.colors?.[0]?.name || 'Standard');
    setQuantity(1);
    setNotifySuccessMsg(null);
    setNotifyErrorMsg(null);
    setReviewSubmitted(false);
    setIsWritingReview(false);

    const loadLiveReviews = async () => {
      try {
        const res = await fetch(`/api/products/${product.id}/reviews`);
        const data = await res.json();
        if (data.success && Array.isArray(data.reviews)) {
          setReviewsList(data.reviews);
        }
      } catch (err) {
        console.error('Failed to load live reviews:', err);
      }
    };
    loadLiveReviews();
  }, [product?.id]);

  // Sticky purchase bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 680);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-zinc-50">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Loading Garment Specifications...</p>
      </div>
    );
  }

  const currentColor = product.colors?.[selectedColorIndex] || product.colors?.[0] || { name: 'Default', hex: '#000000', imageIndex: 0 };
  const isPreOrderActive = !!product.isPreOrder;
  const isOutOfStock = !isPreOrderActive && (product.inStock === false || (typeof product.stockCount === 'number' && product.stockCount <= 0));
  const isLowStock = !isPreOrderActive && !isOutOfStock && typeof product.stockCount === 'number' && product.stockCount <= 5;

  const handleColorChange = (index: number) => {
    setSelectedColorIndex(index);
    if (product.colors?.[index] && product.colors[index].imageIndex < product.images.length) {
      setActiveImageIndex(product.colors[index].imageIndex);
    }
    if (product.colors?.[index]) {
      setNotifyColor(product.colors[index].name);
    }
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    setNotifySize(size);
  };

  const handleAddToBag = () => {
    if (isOutOfStock) {
      scrollToNotifyForm();
      return;
    }
    addToCart(product, currentColor, selectedSize, quantity, isPreOrderActive, product.preOrderReleaseDate);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      scrollToNotifyForm();
      return;
    }
    addToCart(product, currentColor, selectedSize, quantity, isPreOrderActive, product.preOrderReleaseDate);
    setActivePage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToNotifyForm = () => {
    if (notifySectionRef.current) {
      notifySectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const input = notifySectionRef.current.querySelector('input[type="email"]') as HTMLInputElement | null;
      if (input) input.focus();
    }
  };

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.includes('@')) {
      setNotifyErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsSubmittingNotify(true);
    setNotifyErrorMsg(null);
    setNotifySuccessMsg(null);

    try {
      const response = await fetch('/api/stock-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          email: notifyEmail.trim(),
          size: notifySize || selectedSize,
          color: notifyColor || currentColor.name
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setNotifySuccessMsg(`You're on the priority list! We'll email ${notifyEmail} the moment ${product.name} (${notifySize || selectedSize}) is back in stock.`);
        setNotifyEmail('');
      } else {
        setNotifyErrorMsg(data.error || 'Unable to register alert. Please try again.');
      }
    } catch {
      setNotifyErrorMsg('Network connection error. Please try again.');
    } finally {
      setIsSubmittingNotify(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewTitle.trim() || !newReviewComment.trim()) {
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: newReviewAuthor.trim(),
          rating: newReviewRating,
          title: newReviewTitle.trim(),
          comment: newReviewComment.trim(),
          user_photo: newReviewPhoto.trim() || undefined
        })
      });
      const data = await res.json();
      if (data.success && data.review) {
        setReviewsList([data.review, ...reviewsList]);
        setReviewSubmitted(true);
        setNewReviewAuthor('');
        setNewReviewTitle('');
        setNewReviewComment('');
        setNewReviewPhoto('');
        setIsWritingReview(false);
        refreshProducts?.();
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2500);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Discover ${product.name} from CORNUS Atelier - Luxury Haute Couture.`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=CornusAtelier,HauteCouture,LuxuryFashion`, '_blank', 'width=600,height=450,noopener,noreferrer');
  };

  const handleSharePinterest = () => {
    const url = encodeURIComponent(window.location.href);
    const media = encodeURIComponent(product.images?.[0] || '');
    const description = encodeURIComponent(`${product.name} - ${product.description || 'Exclusive luxury haute couture piece by CORNUS Atelier.'}`);
    window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${description}`, '_blank', 'width=750,height=600,noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Check out ${product.name} at CORNUS: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  // Curated Complete the Look / Complementary Ensemble Items
  const completeLookList = React.useMemo(() => {
    if (product.completeLookIds && product.completeLookIds.length > 0) {
      const matched = products.filter((p) => product.completeLookIds?.includes(p.id));
      if (matched.length > 0) return matched;
    }
    return products.filter((p) => p.id !== product.id && (p.category === product.category || p.isBestSeller)).slice(0, 2);
  }, [product, products]);

  const [ensembleSizes, setEnsembleSizes] = useState<Record<string, string>>({});
  const completeLookDiscountPct = product.completeLookDiscount && product.completeLookDiscount > 0 ? product.completeLookDiscount : 15;
  const bundleTotalPrice = product.price + completeLookList.reduce((acc, item) => acc + item.price, 0);
  const bundleDiscountPrice = Math.round(bundleTotalPrice * (1 - completeLookDiscountPct / 100));

  const handleAddBundleToCart = () => {
    addToCart(product, currentColor, selectedSize, 1, product.isPreOrder, product.preOrderReleaseDate);
    completeLookList.forEach((item) => {
      const chosenSize = ensembleSizes[item.id] || item.sizes?.[0] || 'M';
      const chosenColor = item.colors?.[0] || { name: 'Standard', hex: '#000000', imageIndex: 0 };
      addToCart(item, chosenColor, chosenSize, 1, item.isPreOrder, item.preOrderReleaseDate);
    });
  };

  // Review Rating Breakdown Calculations
  const effectiveReviews = reviewsList.length > 0 ? reviewsList : (product.reviews || []);
  const totalReviewsCount = effectiveReviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = effectiveReviews.filter((r) => Math.round(r.rating) === stars).length;
    const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0;
    return { stars, count, pct };
  });

  const displayedReviews = effectiveReviews
    .filter((r) => {
      if (reviewFilterRating === 'all') return true;
      return Math.round(r.rating) === reviewFilterRating;
    })
    .sort((a, b) => {
      if (reviewSortBy === 'highest') return b.rating - a.rating;
      if (reviewSortBy === 'lowest') return a.rating - b.rating;
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    });

  // Related products from the same or complementary categories
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen flex flex-col flex-grow bg-[#FAF9F6] text-zinc-900">
      {/* 1. Top Breadcrumb & Quick Back Bar (Clean, transparent, max-w-[1440px]) */}
      <div className="w-full mb-3 sm:mb-4">
        <div className="w-full flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-500 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => setActivePage('home')}
              className="hover:text-zinc-900 transition-colors font-medium"
            >
              Home
            </button>
            <span className="text-zinc-300">/</span>
            <button
              onClick={() => {
                setActiveCategory(product.category);
                setActivePage('shop');
              }}
              className="hover:text-zinc-900 transition-colors capitalize font-medium"
            >
              {product.category}
            </button>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-900 font-semibold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {(() => {
              const isSaved = product ? isInWishlist(product.id) : false;
              return (
                <>
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 hover:border-zinc-400 bg-white text-zinc-700 hover:text-zinc-900 transition-all font-medium text-[11px]"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all font-medium text-[11px] ${
                      isSaved
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'border-zinc-200 hover:border-zinc-400 bg-white text-zinc-700 hover:text-zinc-900'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Wishlist'}</span>
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* 2. Main Product Showcase Hero Section */}
      <div className="w-full pt-1 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Multi-Angle Interactive Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4 lg:gap-6">
            {/* Thumbnail Strip */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[580px] scrollbar-thin scrollbar-thumb-zinc-300 py-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative flex-shrink-0 w-20 h-28 md:w-24 md:h-32 rounded-xl overflow-hidden border-2 transition-all group ${
                    activeImageIndex === idx
                      ? 'border-zinc-900 shadow-md ring-2 ring-zinc-900/10'
                      : 'border-zinc-200/80 hover:border-zinc-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <FashionImage
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    categoryHint={product.category}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-white font-medium">
                    0{idx + 1}
                  </div>
                </button>
              ))}
            </div>

            {/* Main Stage Image Display with Fullscreen Lightbox trigger */}
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-white border border-zinc-200/80 shadow-sm aspect-[3/4] max-h-[640px] group">
              <FashionImage
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                categoryHint={product.category}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Status Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.isBestSeller && (
                  <span className="px-3 py-1 rounded-full bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest shadow-md">
                    Best Seller
                  </span>
                )}
                {product.isNew && (
                  <span className="px-3 py-1 rounded-full bg-amber-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-md">
                    New Arrival
                  </span>
                )}
                {isLowStock && (
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-md animate-pulse">
                    Low Stock: {product.stockCount} left
                  </span>
                )}
                {isOutOfStock && (
                  <span className="px-3 py-1 rounded-full bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest shadow-md">
                    Sold Out
                  </span>
                )}
              </div>

              {/* Gallery Navigation Controls */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-zinc-800 flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                    aria-label="Next image"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Expand to Fullscreen Lightbox Button */}
              <button
                onClick={() => setIsFullscreen(true)}
                className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-zinc-900 text-white flex items-center justify-center backdrop-blur-sm shadow-lg transition-all hover:scale-110"
                title="Expand fullscreen view"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Garment Meta, Specs, Customizers, and Purchase CTAs */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Brand Label & Live Viewer Counter */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
                  CORNUS ATELIER &bull; AUTUMN / WINTER
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>14 shoppers viewing now</span>
                </div>
              </div>

              {/* Garment Title */}
              <h1 className="font-serif text-3xl sm:text-4xl text-zinc-950 font-normal tracking-tight leading-tight mb-3">
                {product.name}
              </h1>

              {/* Star Rating & Reviews Jump Link */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-zinc-900">
                  {(product.rating || 5).toFixed(1)}
                </span>
                <span className="text-zinc-300">&bull;</span>
                <a
                  href="#customer-reviews-section"
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-900 underline underline-offset-4"
                >
                  {totalReviewsCount} Verified Reviews
                </a>
              </div>

              {/* Price Display & Installment Plan */}
              <div className="p-4 rounded-2xl bg-white border border-zinc-200/80 shadow-xs mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-serif font-bold text-zinc-950">
                    {currencySymbol}{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-lg text-zinc-400 line-through font-normal">
                        {currencySymbol}{product.originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-bold">
                        Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    </>
                  )}
                </div>
                
                <div className="mt-2.5 pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-600">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                    <span>or 4 interest-free payments of <strong>{currencySymbol}{Math.round(product.price / 4).toLocaleString('en-IN')}</strong> with</span>
                  </div>
                  <span className="font-bold tracking-tight text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded text-[10px]">
                    UPI / NetBanking
                  </span>
                </div>
              </div>

              {/* Atelier Pre-Order Luxury Announcement Banner */}
              {product.isPreOrder && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-600 text-white shadow-2xs">
                      <Sparkles className="w-3 h-3" />
                      <span>Atelier Pre-Order</span>
                    </span>
                    {product.preOrderReleaseDate && (
                      <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded border border-amber-300">
                        Expected Dispatch: {product.preOrderReleaseDate}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    {product.preOrderMessage || 'Handcrafted to order by master tailors in our European atelier. Secure your allocation before seasonal production closes.'}
                  </p>
                  {product.preOrderLimit && product.preOrderLimit > 0 && (
                    <div className="pt-1 flex items-center justify-between text-[11px] text-amber-800 font-mono">
                      <span>Limited Edition Crafted Allocation</span>
                      <span className="font-bold">Cap: {product.preOrderLimit} Pieces</span>
                    </div>
                  )}
                </div>
              )}

              {/* Color Swatch Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs mb-2.5">
                    <span className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px]">
                      Color: <strong className="text-zinc-950 capitalize">{currentColor.name}</strong>
                    </span>
                    <span className="text-zinc-400">{product.colors.length} Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {product.colors.map((c, i) => (
                      <button
                        key={c.name}
                        onClick={() => handleColorChange(i)}
                        className={`group relative p-1 rounded-full transition-all ${
                          selectedColorIndex === i
                            ? 'ring-2 ring-zinc-900 ring-offset-2 scale-110'
                            : 'hover:ring-1 hover:ring-zinc-400'
                        }`}
                        title={c.name}
                      >
                        <span
                          className="block w-7 h-7 rounded-full border border-black/10 shadow-inner"
                          style={{ backgroundColor: c.hex }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector with Smart Fit Advisor */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs mb-2.5">
                  <span className="font-semibold text-zinc-900 uppercase tracking-wider text-[11px]">
                    Select Size: <strong className="text-zinc-950">{selectedSize}</strong>
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowFitAdvisorModal(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Find My Size</span>
                    </button>
                    <button
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 underline underline-offset-4"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Size Guide</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {(product.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL']).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center transition-all border ${
                        selectedSize === size
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                          : 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200/90'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector & Main Action CTAs */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-zinc-200 rounded-xl bg-white p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={isOutOfStock || quantity <= 1}
                      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 disabled:opacity-30 transition-colors text-zinc-700"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-zinc-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      disabled={isOutOfStock}
                      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 disabled:opacity-30 transition-colors text-zinc-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToBag}
                    disabled={isOutOfStock}
                    className={`flex-1 h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all ${
                      product.isPreOrder
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20 active:scale-[0.99]'
                        : isOutOfStock
                          ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                          : 'bg-zinc-950 hover:bg-black text-white hover:shadow-lg active:scale-[0.99]'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {product.isPreOrder
                      ? `Pre-Order Now • Ships ${product.preOrderReleaseDate || 'Soon'}`
                      : isOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}
                  </button>
                </div>

                {!isOutOfStock && (
                  <button
                    onClick={handleBuyNow}
                    className={`w-full h-11 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-xs active:scale-[0.99] flex items-center justify-center gap-2 ${
                      product.isPreOrder
                        ? 'bg-zinc-900 hover:bg-black text-white'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {product.isPreOrder ? 'Reserve Allocation & Express Checkout' : 'Buy Now • 1-Click Express Checkout'}
                  </button>
                )}
              </div>

              {/* Luxury Guarantee Badges Grid */}
              <div className="grid grid-cols-2 gap-2.5 p-4 rounded-2xl bg-white border border-zinc-200/80 mb-6">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0 text-zinc-800">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-[11px] font-bold text-zinc-900">Complimentary Express</h2>
                    <p className="text-[10px] text-zinc-500">2-4 business days tracked</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0 text-zinc-800">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-[11px] font-bold text-zinc-900">30-Day Free Returns</h2>
                    <p className="text-[10px] text-zinc-500">Pre-printed return label included</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0 text-zinc-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-[11px] font-bold text-zinc-900">Certified Authentic</h2>
                    <p className="text-[10px] text-zinc-500">Includes digital certificate</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0 text-zinc-800">
                    <Leaf className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h2 className="text-[11px] font-bold text-zinc-900">Carbon Neutral</h2>
                    <p className="text-[10px] text-zinc-500">100% plastic-free packaging</p>
                  </div>
                </div>
              </div>

              {/* Stock Back-in-Stock Notification Section (for Out of Stock items) */}
              {isOutOfStock && (
                <div
                  ref={notifySectionRef}
                  className="p-5 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-md mb-6"
                >
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Bell className="w-4 h-4" />
                    Get Notified When Restocked
                  </div>
                  <p className="text-xs text-zinc-300 mb-4">
                    Be first in line when our atelier completes the next limited production run for size {selectedSize}.
                  </p>

                  {notifySuccessMsg ? (
                    <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                      <span>{notifySuccessMsg}</span>
                    </div>
                  ) : (
                    <form onSubmit={handleNotifySubmit} className="space-y-3">
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={notifyEmail}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          placeholder="Enter your VIP email address..."
                          required
                          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingNotify}
                          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                        >
                          {isSubmittingNotify ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                          Notify Me
                        </button>
                      </div>
                      {notifyErrorMsg && (
                        <p className="text-[11px] text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {notifyErrorMsg}
                        </p>
                      )}
                    </form>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>

        {/* 3. Comprehensive Interactive Specifications Tabs */}
        <div className="mt-14 pt-10 border-t border-zinc-200">
          <div className="flex border-b border-zinc-200 overflow-x-auto scrollbar-none gap-2 sm:gap-6">
            {[
              { id: 'details', label: 'Overview & Design Notes' },
              { id: 'materials', label: 'Material & Eco Index' },
              { id: 'fit', label: 'Fit & Model Metrics' },
              { id: 'care', label: 'Garment Care & Longevity' },
              { id: 'shipping', label: 'Global Delivery & Returns' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 px-2 text-xs sm:text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-zinc-900 text-zinc-950'
                    : 'border-transparent text-zinc-400 hover:text-zinc-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === 'details' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-zinc-700 text-sm leading-relaxed">
                <div>
                  <h3 className="font-serif text-xl text-zinc-900 mb-3">Atelier Editorial Synopsis</h3>
                  <p className="mb-4">
                    {product.description ||
                      'Expertly tailored with uncompromising attention to architectural proportions and pure luxury hand-feel. Crafted for discerning collectors who demand longevity, poise, and tactile distinction.'}
                  </p>
                  <p>
                    Every seam is reinforced with double-needle construction, ensuring structural integrity through seasons of regular wear. Finished with custom bespoke hardware and invisible hand-stitched hems.
                  </p>

                  {/* Social Sharing Component beneath Product Description */}
                  <div className="mt-6 pt-5 border-t border-zinc-200/90">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-zinc-200">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-800 flex-shrink-0">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-950 uppercase tracking-wider">Share This Creation</h4>
                          <p className="text-[11px] text-zinc-500">Inspire your network & amplify atelier reach</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Twitter / X */}
                        <button
                          type="button"
                          onClick={handleShareTwitter}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-zinc-950 bg-zinc-50 hover:bg-zinc-950 text-zinc-700 hover:text-white transition-all text-xs font-semibold group cursor-pointer shadow-xs"
                          title="Share on Twitter / X"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                          <span>Tweet</span>
                        </button>

                        {/* Pinterest */}
                        <button
                          type="button"
                          onClick={handleSharePinterest}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-rose-600 bg-zinc-50 hover:bg-rose-600 text-zinc-700 hover:text-white transition-all text-xs font-semibold group cursor-pointer shadow-xs"
                          title="Pin on Pinterest"
                        >
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.194-.334 1.361-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.546.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                          </svg>
                          <span>Pin</span>
                        </button>

                        {/* Copy Link */}
                        <button
                          type="button"
                          onClick={handleCopyShareLink}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold cursor-pointer shadow-xs ${
                            copiedShareLink
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'border-zinc-200 hover:border-zinc-950 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                          }`}
                          title="Copy direct product link"
                        >
                          {copiedShareLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedShareLink ? 'Copied!' : 'Copy Link'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Garment Attributes</h4>
                  <div className="flex justify-between py-2 border-b border-zinc-100 text-xs">
                    <span className="text-zinc-500">Collection</span>
                    <span className="font-semibold text-zinc-900">Autumn / Winter Atelier</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-100 text-xs">
                    <span className="text-zinc-500">Silhouette</span>
                    <span className="font-semibold text-zinc-900">Contemporary Structural Cut</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-100 text-xs">
                    <span className="text-zinc-500">Hardware</span>
                    <span className="font-semibold text-zinc-900">Custom Brushed Palladium</span>
                  </div>
                  <div className="flex justify-between py-2 text-xs">
                    <span className="text-zinc-500">Origin</span>
                    <span className="font-semibold text-zinc-900">Handmade in Florence, Italy</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white border border-zinc-200/80">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg text-zinc-950 mb-2">Sustainable Composition</h3>
                  <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
                    100% organically harvested raw natural fibers with zero synthetic chemical treatments.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Primary Material</span>
                      <span className="font-bold text-zinc-900">85% Organic Cotton</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Blend</span>
                      <span className="font-bold text-zinc-900">15% Mulberry Silk</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-zinc-200/80">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg text-zinc-950 mb-2">Tactile Hand-Feel</h3>
                  <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
                    Brushed finish providing cloud-soft skin contact with breathable thermoregulating weave.
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Fabric Weight</span>
                      <span className="font-bold text-zinc-900">380 GSM Heavyweight</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Breathability</span>
                      <span className="font-bold text-zinc-900">High Airflow Weave</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-zinc-200/80">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg text-zinc-950 mb-2">Eco Certifications</h3>
                  <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
                    Certified OEKO-TEX® Standard 100 and Global Organic Textile Standard (GOTS).
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Eco Score</span>
                      <span className="font-bold text-emerald-600">98 / 100 (A+)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Dye Process</span>
                      <span className="font-bold text-zinc-900">Non-Toxic Botanical</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'fit' && (() => {
              const cat = (product.category || '').toLowerCase();
              const name = (product.name || '').toLowerCase();
              const gender = (product.gender || '').toLowerCase();

              let chartInfo = {
                title: 'Tops & Knitwear Tailoring Specs',
                headers: ['Size', `Chest (${chartUnit.toUpperCase()})`, `Shoulder (${chartUnit.toUpperCase()})`, `Sleeve (${chartUnit.toUpperCase()})`, `Length (${chartUnit.toUpperCase()})`],
                rows: chartUnit === 'in' ? [
                  ['XS', '34 - 36"', '17.0"', '32.5"', '26.5"'],
                  ['S', '36 - 38"', '17.5"', '33.5"', '27.0"'],
                  ['M', '38 - 40"', '18.0"', '34.5"', '27.5"'],
                  ['L', '40 - 43"', '18.7"', '35.5"', '28.5"'],
                  ['XL', '43 - 46"', '19.5"', '36.5"', '29.5"'],
                  ['XXL', '46 - 49"', '20.2"', '37.0"', '30.5"']
                ] : [
                  ['XS', '86 - 91 cm', '43.2 cm', '82.5 cm', '67.3 cm'],
                  ['S', '91 - 97 cm', '44.5 cm', '85.1 cm', '68.6 cm'],
                  ['M', '97 - 102 cm', '45.7 cm', '87.6 cm', '69.8 cm'],
                  ['L', '102 - 109 cm', '47.5 cm', '90.2 cm', '72.4 cm'],
                  ['XL', '109 - 117 cm', '49.5 cm', '92.7 cm', '74.9 cm'],
                  ['XXL', '117 - 124 cm', '51.3 cm', '94.0 cm', '77.5 cm']
                ]
              };

              if (gender === 'kids' || cat.includes('kid') || name.includes('kid') || name.includes('junior') || name.includes('youth') || name.includes('baby')) {
                chartInfo = {
                  title: 'Junior & Youth Proportions',
                  headers: ['Age / Size', `Height (${chartUnit.toUpperCase()})`, `Chest (${chartUnit.toUpperCase()})`, `Waist (${chartUnit.toUpperCase()})`, `Hip (${chartUnit.toUpperCase()})`],
                  rows: chartUnit === 'in' ? [
                    ['2-3 Y', '36 - 38.5"', '20.5 - 21.5"', '19.5 - 20.5"', '21.0 - 22.0"'],
                    ['4-5 Y', '41 - 43.5"', '22.5 - 23.5"', '21.0 - 22.0"', '23.0 - 24.0"'],
                    ['6-7 Y', '46 - 48.0"', '24.5 - 25.5"', '22.0 - 23.0"', '25.0 - 26.5"'],
                    ['8-9 Y', '50 - 52.5"', '26.5 - 28.0"', '23.5 - 24.5"', '27.5 - 29.0"'],
                    ['10-11 Y', '55 - 57.5"', '29.0 - 30.5"', '25.0 - 26.0"', '30.0 - 31.5"'],
                    ['12-14 Y', '60 - 62.5"', '31.5 - 33.0"', '26.5 - 28.0"', '33.0 - 34.5"']
                  ] : [
                    ['2-3 Y', '92 - 98 cm', '52 - 55 cm', '50 - 52 cm', '53 - 56 cm'],
                    ['4-5 Y', '104 - 110 cm', '57 - 60 cm', '53 - 56 cm', '58 - 61 cm'],
                    ['6-7 Y', '116 - 122 cm', '62 - 65 cm', '56 - 58 cm', '64 - 67 cm'],
                    ['8-9 Y', '128 - 134 cm', '67 - 71 cm', '60 - 62 cm', '70 - 74 cm'],
                    ['10-11 Y', '140 - 146 cm', '74 - 78 cm', '63 - 66 cm', '76 - 80 cm'],
                    ['12-14 Y', '152 - 158 cm', '80 - 84 cm', '67 - 71 cm', '84 - 88 cm']
                  ]
                };
              } else if (cat.includes('bottom') || cat.includes('pant') || name.includes('pant') || name.includes('trouser') || name.includes('jean') || name.includes('short')) {
                chartInfo = {
                  title: 'Trouser & Bottoms Tailoring Chart',
                  headers: ['Size', `Waist (${chartUnit.toUpperCase()})`, `Hip (${chartUnit.toUpperCase()})`, `Thigh (${chartUnit.toUpperCase()})`, `Inseam (${chartUnit.toUpperCase()})`],
                  rows: chartUnit === 'in' ? [
                    ['28 (XS)', '28.0 - 29.5"', '35.0 - 36.5"', '21.5"', '32.0"'],
                    ['30 (S)', '30.0 - 31.5"', '37.0 - 38.5"', '22.5"', '32.0"'],
                    ['32 (M)', '32.0 - 33.5"', '39.0 - 40.5"', '23.5"', '32.5"'],
                    ['34 (L)', '34.0 - 35.5"', '41.0 - 42.5"', '24.5"', '33.0"'],
                    ['36 (XL)', '36.0 - 37.5"', '43.0 - 44.5"', '25.5"', '33.5"'],
                    ['38 (XXL)', '38.0 - 40.0"', '45.0 - 47.0"', '26.5"', '34.0"']
                  ] : [
                    ['28 (XS)', '71 - 75 cm', '89 - 93 cm', '54.6 cm', '81.3 cm'],
                    ['30 (S)', '76 - 80 cm', '94 - 98 cm', '57.2 cm', '81.3 cm'],
                    ['32 (M)', '81 - 85 cm', '99 - 103 cm', '59.7 cm', '82.6 cm'],
                    ['34 (L)', '86 - 90 cm', '104 - 108 cm', '62.2 cm', '83.8 cm'],
                    ['36 (XL)', '91 - 95 cm', '109 - 113 cm', '64.8 cm', '85.1 cm'],
                    ['38 (XXL)', '96 - 102 cm', '114 - 119 cm', '67.3 cm', '86.4 cm']
                  ]
                };
              } else if (cat.includes('outer') || name.includes('coat') || name.includes('jacket') || name.includes('blazer') || name.includes('trench') || name.includes('parka')) {
                chartInfo = {
                  title: 'Outerwear & Coat Cut Specifications',
                  headers: ['Size', `Chest (${chartUnit.toUpperCase()})`, `Shoulder (${chartUnit.toUpperCase()})`, `Sleeve (${chartUnit.toUpperCase()})`, `Length (${chartUnit.toUpperCase()})`],
                  rows: chartUnit === 'in' ? [
                    ['XS', '36 - 38"', '17.5"', '33.0"', '38.5"'],
                    ['S', '38 - 40"', '18.0"', '34.0"', '39.5"'],
                    ['M', '40 - 42"', '18.5"', '35.0"', '40.5"'],
                    ['L', '42 - 45"', '19.2"', '36.0"', '41.5"'],
                    ['XL', '45 - 48"', '20.0"', '37.0"', '42.5"'],
                    ['XXL', '48 - 51"', '20.8"', '37.5"', '43.5"']
                  ] : [
                    ['XS', '91 - 97 cm', '44.5 cm', '83.8 cm', '97.8 cm'],
                    ['S', '97 - 102 cm', '45.7 cm', '86.4 cm', '100.3 cm'],
                    ['M', '102 - 107 cm', '47.0 cm', '88.9 cm', '102.9 cm'],
                    ['L', '107 - 114 cm', '48.8 cm', '91.4 cm', '105.4 cm'],
                    ['XL', '114 - 122 cm', '50.8 cm', '94.0 cm', '108.0 cm'],
                    ['XXL', '122 - 130 cm', '52.8 cm', '95.3 cm', '110.5 cm']
                  ]
                };
              } else if (name.includes('dress') || name.includes('gown') || name.includes('skirt') || cat.includes('dress')) {
                chartInfo = {
                  title: 'Couture Dress & Silhouette Matrix',
                  headers: ['Size', `Bust (${chartUnit.toUpperCase()})`, `Waist (${chartUnit.toUpperCase()})`, `Hip (${chartUnit.toUpperCase()})`, `Length (${chartUnit.toUpperCase()})`],
                  rows: chartUnit === 'in' ? [
                    ['XS (0-2)', '32 - 34"', '24 - 26"', '34 - 36"', '44.0"'],
                    ['S (4-6)', '34 - 36"', '26 - 28"', '36 - 38"', '45.0"'],
                    ['M (8-10)', '36 - 38"', '28 - 30"', '38 - 40"', '46.0"'],
                    ['L (12-14)', '38 - 41"', '30 - 33"', '40 - 43"', '47.0"'],
                    ['XL (16)', '41 - 44"', '33 - 36"', '43 - 46"', '48.0"']
                  ] : [
                    ['XS (0-2)', '81 - 86 cm', '61 - 66 cm', '86 - 91 cm', '111.8 cm'],
                    ['S (4-6)', '86 - 91 cm', '66 - 71 cm', '91 - 97 cm', '114.3 cm'],
                    ['M (8-10)', '91 - 97 cm', '71 - 76 cm', '97 - 102 cm', '116.8 cm'],
                    ['L (12-14)', '97 - 104 cm', '76 - 84 cm', '102 - 109 cm', '119.4 cm'],
                    ['XL (16)', '104 - 112 cm', '84 - 91 cm', '109 - 117 cm', '121.9 cm']
                  ]
                };
              } else if (name.includes('shoe') || name.includes('boot') || name.includes('loafer') || name.includes('sneaker') || cat.includes('footwear') || cat.includes('shoe')) {
                chartInfo = {
                  title: 'Italian Last Footwear Sizing',
                  headers: ['EU Size', 'US Men', 'US Women', 'UK', `Foot Length (${chartUnit.toUpperCase()})`],
                  rows: chartUnit === 'in' ? [
                    ['EU 39', '6.5', '8.0', '6.0', '9.8"'],
                    ['EU 40', '7.5', '9.0', '6.5', '10.1"'],
                    ['EU 41', '8.0', '9.5', '7.5', '10.4"'],
                    ['EU 42', '9.0', '10.5', '8.5', '10.7"'],
                    ['EU 43', '10.0', '11.5', '9.5', '11.0"'],
                    ['EU 44', '11.0', '12.5', '10.5', '11.3"'],
                    ['EU 45', '12.0', '13.5', '11.5', '11.6"']
                  ] : [
                    ['EU 39', '6.5', '8.0', '6.0', '24.9 cm'],
                    ['EU 40', '7.5', '9.0', '6.5', '25.6 cm'],
                    ['EU 41', '8.0', '9.5', '7.5', '26.4 cm'],
                    ['EU 42', '9.0', '10.5', '8.5', '27.2 cm'],
                    ['EU 43', '10.0', '11.5', '9.5', '28.0 cm'],
                    ['EU 44', '11.0', '12.5', '10.5', '28.7 cm'],
                    ['EU 45', '12.0', '13.5', '11.5', '29.5 cm']
                  ]
                };
              } else if (cat.includes('access') || name.includes('ring') || name.includes('belt') || name.includes('hat')) {
                chartInfo = {
                  title: 'Accessories & Jewelry Matrix',
                  headers: ['Item / Size', 'Primary Dimension', 'Total Span', 'Secondary Fit'],
                  rows: chartUnit === 'in' ? [
                    ['Belt S (30-32)', 'Waist 30" - 32"', 'Length 38.0"', 'Width 1.25"'],
                    ['Belt M (34-36)', 'Waist 34" - 36"', 'Length 42.0"', 'Width 1.25"'],
                    ['Belt L (38-40)', 'Waist 38" - 40"', 'Length 46.0"', 'Width 1.25"'],
                    ['Ring US 7', 'Dia. 0.68"', 'Circum. 2.14"', 'EU 54'],
                    ['Ring US 9', 'Dia. 0.75"', 'Circum. 2.34"', 'EU 59'],
                    ['Hat M/L', 'Head 22.4" - 23.2"', 'US 7 1/8 - 7 3/8', 'UK 7 - 7 1/4']
                  ] : [
                    ['Belt S (30-32)', 'Waist 76 - 81 cm', 'Length 96.5 cm', 'Width 3.2 cm'],
                    ['Belt M (34-36)', 'Waist 86 - 91 cm', 'Length 106.7 cm', 'Width 3.2 cm'],
                    ['Belt L (38-40)', 'Waist 96 - 102 cm', 'Length 116.8 cm', 'Width 3.2 cm'],
                    ['Ring US 7', 'Dia. 17.3 mm', 'Circum. 54.4 mm', 'EU 54'],
                    ['Ring US 9', 'Dia. 18.9 mm', 'Circum. 59.5 mm', 'EU 59'],
                    ['Hat M/L', 'Head 57 - 59 cm', 'US 7 1/8 - 7 3/8', 'UK 7 - 7 1/4']
                  ]
                };
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-lg text-zinc-950">Model Specifications & Fit Advice</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        True to Size
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-700 space-y-2">
                      <p><strong>Model Profile:</strong> 5'11" (180 cm), 145 lbs (66 kg)</p>
                      <p><strong>Wearing:</strong> Size Small (S) for refined architectural drape</p>
                      <p><strong>Tailor's Recommendation:</strong> Order your true size for clean tailored lines, or size up 1 size for relaxed, effortless layering.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setShowFitAdvisorModal(true)}
                        className="py-2.5 px-3 rounded-xl border border-zinc-900 bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Fit Advisor</span>
                      </button>
                      <button
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="py-2.5 px-3 rounded-xl border border-zinc-300 bg-white text-zinc-900 font-bold text-xs uppercase tracking-wider hover:bg-zinc-50 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <Ruler className="w-3.5 h-3.5" />
                        <span>Full Size Guide</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-serif text-lg text-zinc-950">{chartInfo.title}</h3>
                        <p className="text-[11px] text-zinc-500">Specific measurements for {product.name}</p>
                      </div>
                      <div className="flex border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50 p-0.5">
                        <button
                          type="button"
                          onClick={() => setChartUnit('in')}
                          className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded transition-all cursor-pointer ${
                            chartUnit === 'in' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
                          }`}
                        >
                          IN
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartUnit('cm')}
                          className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded transition-all cursor-pointer ${
                            chartUnit === 'cm' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900'
                          }`}
                        >
                          CM
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-zinc-100">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-zinc-50/80 border-b border-zinc-200 text-[11px] text-zinc-500 uppercase font-bold">
                          <tr>
                            {chartInfo.headers.map((h, i) => (
                              <th key={i} className="py-2 px-2.5 whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 text-zinc-800">
                          {chartInfo.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-zinc-50/50">
                              {row.map((val, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`py-2 px-2.5 whitespace-nowrap ${
                                    cIdx === 0 ? 'font-bold text-zinc-950 bg-zinc-50/30' : 'font-mono text-zinc-700'
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
                </div>
              );
            })()}

            {activeTab === 'care' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 text-center">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 mx-auto flex items-center justify-center font-bold text-xs text-zinc-800 mb-2">
                    30°
                  </div>
                  <h4 className="font-bold text-xs text-zinc-900 mb-1">Cold Hand Wash</h4>
                  <p className="text-[11px] text-zinc-500">Max 30°C / 85°F with delicate eco detergent.</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 text-center">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 mx-auto flex items-center justify-center font-bold text-xs text-zinc-800 mb-2">
                    X
                  </div>
                  <h4 className="font-bold text-xs text-zinc-900 mb-1">Do Not Tumble Dry</h4>
                  <p className="text-[11px] text-zinc-500">Reshape whilst damp and lay flat to dry in shade.</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 text-center">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 mx-auto flex items-center justify-center font-bold text-xs text-zinc-800 mb-2">
                    LOW
                  </div>
                  <h4 className="font-bold text-xs text-zinc-900 mb-1">Low Heat Iron</h4>
                  <p className="text-[11px] text-zinc-500">Iron inside-out using protective cloth or steam.</p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 text-center">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 mx-auto flex items-center justify-center font-bold text-xs text-zinc-800 mb-2">
                    (P)
                  </div>
                  <h4 className="font-bold text-xs text-zinc-900 mb-1">Dry Clean Safe</h4>
                  <p className="text-[11px] text-zinc-500">Professional eco dry clean perchloroethylene-free.</p>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-zinc-700">
                <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 space-y-3">
                  <h3 className="font-serif text-lg text-zinc-950 font-normal">Express Shipping Options</h3>
                  <div className="flex justify-between py-2 border-b border-zinc-100">
                    <div>
                      <p className="font-bold text-zinc-900">Standard Insured Courier</p>
                      <p className="text-zinc-500 text-[11px]">3-5 Business Days</p>
                    </div>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-zinc-100">
                    <div>
                      <p className="font-bold text-zinc-900">Next-Day Priority Air</p>
                      <p className="text-zinc-500 text-[11px]">Orders placed before 2 PM</p>
                    </div>
                    <span className="font-bold text-zinc-900">{currencySymbol}350</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <div>
                      <p className="font-bold text-zinc-900">Express White-Glove</p>
                      <p className="text-zinc-500 text-[11px]">Delivered in hand-crafted packaging</p>
                    </div>
                    <span className="font-bold text-zinc-900">{currencySymbol}750</span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-zinc-200/80 space-y-3">
                  <h3 className="font-serif text-lg text-zinc-950 font-normal">Hassle-Free Returns & Exchanges</h3>
                  <p className="text-zinc-600 leading-relaxed">
                    We offer complimentary 30-day global returns on all unworn items in original packaging with tags intact.
                  </p>
                  <p className="text-zinc-600 leading-relaxed">
                    Simply use the prepaid return label included in your box or generate an instant QR code return slip via your account dashboard.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Complete The Look / Bundled Outfit Builder */}
        {completeLookList.length > 0 && (
          <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-700">
                  CURATED BY ATELIER STYLISTS
                </span>
                <h2 className="font-serif text-2xl text-zinc-950">Complete The Look Bundle</h2>
                {product.completeLookNote && (
                  <p className="text-xs text-zinc-500 italic mt-1 font-serif">"{product.completeLookNote}"</p>
                )}
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 self-start sm:self-auto">
                {completeLookDiscountPct}% Bundle Savings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 flex flex-wrap sm:flex-nowrap items-center gap-3">
                {/* Main Item */}
                <div className="flex-1 min-w-[120px] p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-white">
                    <FashionImage
                      src={product.images[0]}
                      alt={product.name}
                      categoryHint={product.category}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-bold text-zinc-900 truncate">{product.name}</p>
                  <p className="text-xs text-zinc-500 font-serif">{currencySymbol}{product.price.toLocaleString('en-IN')}</p>
                </div>

                <div className="text-zinc-400 font-bold text-lg px-1">+</div>

                {/* Bundle Item 1 */}
                <div className="flex-1 min-w-[120px] p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                  <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-white">
                    <FashionImage
                      src={completeLookList[0].images[0]}
                      alt={completeLookList[0].name}
                      categoryHint={completeLookList[0].category}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-bold text-zinc-900 truncate">{completeLookList[0].name}</p>
                  <p className="text-xs text-zinc-500 font-serif">{currencySymbol}{completeLookList[0].price.toLocaleString('en-IN')}</p>
                </div>

                {completeLookList[1] && (
                  <>
                    <div className="text-zinc-400 font-bold text-lg px-1">+</div>
                    <div className="flex-1 min-w-[120px] p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                      <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-white">
                        <FashionImage
                          src={completeLookList[1].images[0]}
                          alt={completeLookList[1].name}
                          categoryHint={completeLookList[1].category}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs font-bold text-zinc-900 truncate">{completeLookList[1].name}</p>
                      <p className="text-xs text-zinc-500 font-serif">{currencySymbol}{completeLookList[1].price.toLocaleString('en-IN')}</p>
                    </div>
                  </>
                )}
              </div>

              {/* Bundle Pricing and Purchase CTA */}
              <div className="md:col-span-4 p-5 rounded-2xl bg-zinc-950 text-white flex flex-col justify-between h-full">
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-1">Total Bundle Value</p>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-serif font-bold text-white">{currencySymbol}{bundleDiscountPrice.toLocaleString('en-IN')}</span>
                    <span className="text-sm text-zinc-500 line-through">{currencySymbol}{bundleTotalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-medium mb-4">
                    Instant {currencySymbol}{(bundleTotalPrice - bundleDiscountPrice).toLocaleString('en-IN')} bundle discount applied at checkout.
                  </p>
                </div>
                <button
                  onClick={handleAddBundleToCart}
                  className="w-full py-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add Complete Outfit to Bag
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. Customer Reviews & Ratings Section */}
        <div id="customer-reviews-section" className="mt-16 pt-12 border-t border-zinc-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                VERIFIED COMMUNITY FEEDBACK
              </span>
              <h2 className="font-serif text-3xl text-zinc-950">Customer Reviews & Ratings</h2>
            </div>

            <button
              onClick={() => setIsWritingReview(!isWritingReview)}
              className="px-6 py-2.5 rounded-full bg-zinc-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition-all self-start md:self-auto shadow-sm"
            >
              {isWritingReview ? 'Close Review Form' : 'Write a Review'}
            </button>
          </div>

          {/* Review Submission Form Drawer */}
          {isWritingReview && (
            <div className="mb-12 p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200/90 shadow-lg">
              <h3 className="font-serif text-xl text-zinc-950 mb-2">Share Your Atelier Experience</h3>
              <p className="text-xs text-zinc-500 mb-6">
                Your review helps discerning shoppers evaluate fit, drape, and material quality.
              </p>

              {reviewSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Thank you! Your review has been published.</p>
                    <p className="text-[11px] text-emerald-700">It is now visible in the verified customer feedback feed.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                        Your Name / Alias *
                      </label>
                      <input
                        type="text"
                        value={newReviewAuthor}
                        onChange={(e) => setNewReviewAuthor(e.target.value)}
                        placeholder="e.g. Sophia R., New York"
                        required
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                        Overall Rating *
                      </label>
                      <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReviewRating(star)}
                            className="p-1 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= newReviewRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-zinc-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-zinc-700 ml-2">{newReviewRating} / 5 Stars</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Review Headline *
                    </label>
                    <input
                      type="text"
                      value={newReviewTitle}
                      onChange={(e) => setNewReviewTitle(e.target.value)}
                      placeholder="e.g. Impeccable drape and luxurious hand-feel"
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Detailed Review *
                    </label>
                    <textarea
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      placeholder="Describe the fabric weight, fit, stitching, styling versatility..."
                      rows={4}
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Customer Photo Attachment URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={newReviewPhoto}
                      onChange={(e) => setNewReviewPhoto(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsWritingReview(false)}
                      className="px-5 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-6 py-2.5 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                    >
                      {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Publish Review
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Rating Breakdown & Filter Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
            {/* Left: Overall Rating Card */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-center items-center text-center">
              <span className="font-serif text-5xl text-zinc-950 font-bold mb-2">
                {(product.rating || 5).toFixed(1)}
              </span>
              <div className="flex items-center gap-1 text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-zinc-200'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-zinc-500 font-medium">Based on {totalReviewsCount} customer ratings</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-2">97% would recommend this garment</p>
            </div>

            {/* Middle: Rating Distribution Bars */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-center gap-2">
              {ratingDistribution.map(({ stars, count, pct }) => (
                <button
                  key={stars}
                  onClick={() => setReviewFilterRating(reviewFilterRating === stars ? 'all' : stars)}
                  className={`flex items-center gap-3 text-xs group w-full text-left py-0.5 px-1 rounded-lg transition-colors ${
                    reviewFilterRating === stars ? 'bg-zinc-100 font-bold' : 'hover:bg-zinc-50'
                  }`}
                >
                  <span className="w-12 text-zinc-600 font-medium">{stars} Star</span>
                  <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-zinc-400 text-[11px]">{count}</span>
                </button>
              ))}
            </div>

            {/* Right: Star Filter Pills & Sorter */}
            <div className="lg:col-span-3 p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                  Filter by Stars
                </span>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(['all', 5, 4, 3, 2, 1] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setReviewFilterRating(r)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        reviewFilterRating === r
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      {r === 'all' ? 'All' : `${r} ★`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Sort Reviews
                </span>
                <select
                  value={reviewSortBy}
                  onChange={(e) => setReviewSortBy(e.target.value as any)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-zinc-800 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Individual Reviews Cards List */}
          <div className="space-y-4">
            {displayedReviews.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center text-zinc-500 text-xs">
                No reviews found matching the selected star filter.
              </div>
            ) : (
              displayedReviews.map((rev, idx) => (
                <div
                  key={rev.id || idx}
                  className="p-6 rounded-2xl bg-white border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center font-serif">
                        {rev.author ? rev.author.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-zinc-900">{rev.author}</span>
                          <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                            <CheckCheck className="w-3 h-3 text-emerald-600" />
                            Verified Buyer
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400">{rev.date || 'Recent Purchase'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(rev.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h4 className="font-bold text-sm text-zinc-950 mb-1.5">{rev.title}</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed mb-3">{rev.comment}</p>

                  {rev.user_photo && (
                    <button
                      onClick={() => setSelectedReviewPhoto(rev.user_photo)}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-200 hover:ring-2 hover:ring-zinc-900 transition-all group"
                    >
                      <img
                        src={rev.user_photo}
                        alt="Customer wearing garment"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 6. "You May Also Like" Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-zinc-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                  COMPLEMENTARY CURATION
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-zinc-950">You May Also Admire</h2>
              </div>
              <button
                onClick={() => {
                  setActiveCategory(product.category);
                  setActivePage('shop');
                }}
                className="text-xs font-bold text-zinc-900 hover:text-amber-700 transition-colors uppercase tracking-wider flex items-center gap-1"
              >
                <span>View Full Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 7. Sticky Bottom Purchase Bar (Appears on scroll) */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 shadow-2xl transition-all duration-300 transform translate-y-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200">
                <FashionImage
                  src={product.images[0]}
                  alt={product.name}
                  categoryHint={product.category}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-zinc-900 truncate">{product.name}</h3>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <span className="font-serif font-bold text-zinc-950">{currencySymbol}{product.price.toLocaleString('en-IN')}</span>
                  <span>&bull;</span>
                  <span>Size: {selectedSize}</span>
                  <span>&bull;</span>
                  <span className="capitalize">{currentColor.name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleAddToBag}
                disabled={isOutOfStock}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md ${
                  isOutOfStock
                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    : 'bg-zinc-950 hover:bg-black text-white'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
              </button>
              {!isOutOfStock && (
                <button
                  onClick={handleBuyNow}
                  className="hidden sm:flex px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-xs"
                >
                  Buy Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. Fullscreen Image Lightbox Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center">
            <FashionImage
              src={product.images[activeImageIndex] || product.images[0]}
              alt={product.name}
              categoryHint={product.category}
              className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>

          <div className="mt-4 flex items-center gap-2">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeImageIndex === idx ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 9. Interactive Smart Fit Advisor Modal */}
      {showFitAdvisorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>Smart Fit & Drape Advisor</span>
              </div>
              <button
                onClick={() => setShowFitAdvisorModal(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 mb-6">
              Our AI tailoring algorithm analyzes biometric dimensions to recommend your ideal fit for <strong>{product.name}</strong>.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Height</span>
                  <span className="text-zinc-900 font-bold">{userHeight} cm ({Math.floor(userHeight / 30.48)}'{Math.round((userHeight % 30.48) / 2.54)}")</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="205"
                  value={userHeight}
                  onChange={(e) => setUserHeight(Number(e.target.value))}
                  className="w-full accent-zinc-900"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Weight</span>
                  <span className="text-zinc-900 font-bold">{userWeight} kg ({Math.round(userWeight * 2.20462)} lbs)</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="120"
                  value={userWeight}
                  onChange={(e) => setUserWeight(Number(e.target.value))}
                  className="w-full accent-zinc-900"
                />
              </div>

              <div>
                <span className="block text-xs font-semibold mb-2">Preferred Silhouette Drape</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['slim', 'regular', 'relaxed'] as const).map((fit) => (
                    <button
                      key={fit}
                      onClick={() => setFitPreference(fit)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                        fitPreference === fit
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendation Result Card */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 mb-6 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-800 block mb-1">
                Recommended Size
              </span>
              <span className="font-serif text-3xl font-bold text-zinc-950 block mb-1">
                Size {fitRecommendation.size}
              </span>
              <p className="text-[11px] text-zinc-600 mb-2">{fitRecommendation.note}</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {fitRecommendation.confidence}% Fit Confidence Score
              </span>
            </div>

            <button
              onClick={() => {
                setSelectedSize(fitRecommendation.size);
                setShowFitAdvisorModal(false);
              }}
              className="w-full py-3 rounded-xl bg-zinc-950 hover:bg-black text-white font-bold text-xs uppercase tracking-widest transition-all"
            >
              Apply Recommended Size ({fitRecommendation.size})
            </button>
          </div>
        </div>
      )}

      {/* 10. Social Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-zinc-200 text-center">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg text-zinc-900">Share This Piece</h3>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-zinc-500 mb-4">
              Share <strong>{product.name}</strong> with friends or across your personal moodboard.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <button
                type="button"
                onClick={handleShareTwitter}
                className="p-2.5 rounded-xl border border-zinc-200 hover:border-zinc-950 bg-zinc-50 hover:bg-zinc-950 text-zinc-700 hover:text-white transition-all text-xs font-semibold flex flex-col items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X / Twitter</span>
              </button>

              <button
                type="button"
                onClick={handleSharePinterest}
                className="p-2.5 rounded-xl border border-zinc-200 hover:border-rose-600 bg-zinc-50 hover:bg-rose-600 text-zinc-700 hover:text-white transition-all text-xs font-semibold flex flex-col items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.194-.334 1.361-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.546.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
                <span>Pinterest</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="p-2.5 rounded-xl border border-zinc-200 hover:border-emerald-600 bg-zinc-50 hover:bg-emerald-600 text-zinc-700 hover:text-white transition-all text-xs font-semibold flex flex-col items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>WhatsApp</span>
              </button>
            </div>

            <button
              onClick={handleCopyShareLink}
              className={`w-full py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 mb-3 transition-colors cursor-pointer ${
                copiedShareLink
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-zinc-200 hover:border-zinc-950 bg-zinc-50 hover:bg-zinc-100 text-zinc-900'
              }`}
            >
              {copiedShareLink ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copiedShareLink ? 'Link Copied to Clipboard!' : 'Copy Direct Link'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 11. Customer Review Photo Modal Lightbox */}
      {selectedReviewPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-black rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedReviewPhoto(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={selectedReviewPhoto}
              alt="Customer product review attachment"
              className="w-full h-auto max-h-[75vh] object-contain"
            />
          </div>
        </div>
      )}
    </main>
  );
};
