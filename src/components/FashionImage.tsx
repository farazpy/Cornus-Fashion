import React, { useState, useEffect, useRef } from 'react';

interface FashionImageProps {
  src: string;
  alt: string;
  className?: string;
  categoryHint?: string;
  aspectRatio?: string;
}

export const FashionImage: React.FC<FashionImageProps> = ({
  src,
  alt,
  className = '',
  categoryHint = 'CORNUS COLLECTION',
  aspectRatio = 'aspect-[3/4]'
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Custom IntersectionObserver lazy loader to guarantee buttery-smooth scroll performance for 60+ items
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect(); // Disconnect once triggered to free browser thread resources
          }
        });
      },
      {
        rootMargin: '300px 0px', // Preload the image 300px before entering screen for lag-free scrolling
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src]); // Re-observe if the source changes dynamically (e.g. swatch hover)

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#f4f4f2] ${aspectRatio} ${className}`}
    >
      {/* Background elegant loading pulse shimmer */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#f0f0ee] via-[#f7f7f5] to-[#f0f0ee] animate-pulse" />
      )}

      {!hasError ? (
        isInView ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            className={`w-full h-full object-cover object-center transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'
            } ${className}`}
          />
        ) : (
          /* Plain high-performance skeleton placeholder */
          <div className="absolute inset-0 bg-[#f4f4f2]" />
        )
      ) : (
        /* Refined minimalist luxury fallback container satisfying the Zero-Broken-Image Policy */
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#f5f5f3] to-[#eae8e3] text-center select-none">
          <div className="w-12 h-12 rounded-full border border-black/15 flex items-center justify-center mb-3 text-black/60 font-serif text-lg tracking-widest animate-pulse">
            C
          </div>
          <span className="font-serif text-xs uppercase tracking-[0.25em] text-black/50 mb-1">
            CORNUS
          </span>
          <span className="text-[11px] uppercase tracking-wider text-black/40 font-medium">
            {categoryHint}
          </span>
        </div>
      )}
    </div>
  );
};
