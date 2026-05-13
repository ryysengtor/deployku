'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface FlashSaleProduct {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  variants: { name: string; options: { label: string; price: number; stock: number }[] }[];
  isFlashSale: boolean;
  flashSalePrice?: number;
  flashSaleEndTime?: string;
  countdown?: {
    total: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  };
}

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  });

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1">
      <Clock className="w-3 h-3" style={{ color: 'var(--foreground)' }} />
      <span className="font-black text-xs" style={{ color: 'var(--foreground)' }}>
        {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
      </span>
    </div>
  );
}

export default function FlashSaleBar() {
  const { currentView, setSelectedProduct, setView } = useStore();
  const [products, setProducts] = useState<FlashSaleProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const isPausedRef = useRef(false);
  const scrollPosRef = useRef(0);

  const fetchFlashSale = useCallback(async () => {
    try {
      const res = await fetch('/api/flashsale');
      const data = await res.json();
      setProducts((data.data || []).filter((p: FlashSaleProduct) => p.isFlashSale && !p.countdown?.isExpired));
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlashSale();
  }, [fetchFlashSale]);

  // Smooth infinite scroll animation using requestAnimationFrame
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || products.length === 0) return;

    const scrollWidth = container.scrollWidth / 2; // Half because content is duplicated
    const speed = 0.5; // pixels per frame (~30px/sec at 60fps)

    const animate = () => {
      if (!isPausedRef.current) {
        scrollPosRef.current += speed;
        if (scrollPosRef.current >= scrollWidth) {
          scrollPosRef.current -= scrollWidth;
        }
        container.style.transform = `translateX(-${scrollPosRef.current}px)`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [products.length]);

  const handleProductClick = (productId: string) => {
    setSelectedProduct(productId);
    setView('product');
  };

  const handleMouseEnter = () => {
    isPausedRef.current = true;
  };

  const handleMouseLeave = () => {
    isPausedRef.current = false;
  };

  const handleTouchStart = () => {
    isPausedRef.current = true;
  };

  const handleTouchEnd = () => {
    // Resume after a short delay so user can see the product
    setTimeout(() => {
      isPausedRef.current = false;
    }, 2000);
  };

  if (currentView !== 'home') return null;
  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 mt-6">
        <div
          className="h-24 shimmer"
          style={{
            border: '3px solid var(--foreground)',
            borderRadius: '20px',
            boxShadow: '4px 4px 0px var(--foreground)',
          }}
        />
      </div>
    );
  }

  if (products.length === 0) return null;

  // Duplicate products for seamless infinite scrolling
  const displayProducts = [...products, ...products];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-6">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 mb-3"
      >
        <div
          className="flex items-center gap-2 px-4 py-2 animate-pulse-glow"
          style={{
            background: 'var(--primary)',
            border: '3px solid var(--foreground)',
            borderRadius: '16px',
            boxShadow: '3px 3px 0px var(--foreground)',
          }}
        >
          <Zap className="w-5 h-5 fill-current" style={{ color: 'var(--primary-foreground)' }} />
          <span
            className="font-black text-lg tracking-wide cartoon-title"
            style={{ color: 'var(--primary-foreground)' }}
          >
            FLASH SALE
          </span>
        </div>
        <div
          className="h-1 flex-1 rounded-full"
          style={{ background: 'var(--primary)', border: '2px solid var(--foreground)' }}
        />
      </motion.div>

      {/* Scrolling Container - requestAnimationFrame based for smooth infinite scroll */}
      <div
        className="overflow-hidden"
        style={{
          border: '3px solid var(--foreground)',
          borderRadius: '20px',
          boxShadow: '4px 4px 0px var(--foreground)',
          background: 'var(--card)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={scrollRef}
          className="flex gap-4 p-4"
          style={{ width: 'max-content', willChange: 'transform' }}
        >
          {displayProducts.map((product, idx) => {
            const minPrice = product.variants?.[0]?.options?.[0]?.price || product.price;
            return (
              <motion.div
                key={`fs-${product._id}-${idx}`}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleProductClick(product._id)}
                className="flex-shrink-0 w-44 md:w-52 cursor-pointer cartoon-card overflow-hidden"
              >
                {/* Product Image */}
                <div
                  className="w-full h-28 md:h-32 relative overflow-hidden"
                  style={{ background: 'var(--muted)' }}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const next = (e.target as HTMLImageElement).nextElementSibling;
                        if (next) next.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex items-center justify-center ${product.image ? 'hidden' : ''}`}
                    style={{ background: 'var(--muted)' }}
                  >
                    <Zap className="w-8 h-8" style={{ color: 'var(--primary)', opacity: 0.5 }} />
                  </div>
                  {/* Flash Sale Badge */}
                  <div
                    className="absolute top-1 left-1 px-2 py-0.5 cartoon-badge"
                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  >
                    <span className="font-black text-[10px]">SALE!</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-2.5">
                  <p className="font-bold text-xs truncate" style={{ color: 'var(--foreground)' }}>
                    {product.name}
                  </p>
                  <div className="mt-1">
                    <span
                      className="text-[10px] line-through font-bold"
                      style={{ color: 'var(--foreground)', opacity: 0.5 }}
                    >
                      Rp{minPrice.toLocaleString('id-ID')}
                    </span>
                    <p className="font-black text-sm" style={{ color: 'var(--primary)' }}>
                      Rp{(product.flashSalePrice || minPrice).toLocaleString('id-ID')}
                    </p>
                  </div>
                  {product.flashSaleEndTime && (
                    <div className="mt-1">
                      <CountdownTimer endTime={product.flashSaleEndTime} />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
