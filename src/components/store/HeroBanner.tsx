'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface Banner {
  _id: string;
  title: string;
  image: string;
  link: string;
  isActive: boolean;
  sortOrder: number;
}

// Unique gradient presets per banner (cycling through them)
const BANNER_GRADIENTS = [
  { angle: 135, colors: ['var(--secondary)', 'var(--primary)', 'var(--accent)'] },
  { angle: 200, colors: ['var(--accent)', 'var(--secondary)', 'var(--primary)'] },
  { angle: 45, colors: ['var(--primary)', 'var(--accent)', 'var(--secondary)'] },
  { angle: 315, colors: ['var(--secondary)', 'var(--accent)', 'var(--primary)'] },
  { angle: 90, colors: ['var(--accent)', 'var(--primary)', 'var(--secondary)'] },
  { angle: 270, colors: ['var(--primary)', 'var(--secondary)', 'var(--accent)'] },
];

function getBannerGradient(index: number) {
  const preset = BANNER_GRADIENTS[index % BANNER_GRADIENTS.length];
  return `linear-gradient(${preset.angle}deg, ${preset.colors.join(', ')})`;
}

export default function HeroBanner() {
  const { currentView } = useStore();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(1);
  const [slideDelay, setSlideDelay] = useState(4000);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const fetchBanners = useCallback(async () => {
    try {
      const res = await fetch('/api/banners');
      const data = await res.json();
      setBanners((data.data || []).filter((b: Banner) => b.isActive));
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch settings for banner_slide_delay
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      const settings = data.data || {};
      if (settings.banner_slide_delay) {
        const parsed = parseInt(settings.banner_slide_delay, 10);
        if (!isNaN(parsed) && parsed >= 1000) {
          setSlideDelay(parsed);
        }
      }
    } catch {
      // use default 4000ms
    }
  }, []);

  useEffect(() => {
    fetchBanners();
    fetchSettings();
  }, [fetchBanners, fetchSettings]);

  // Auto-slide with configurable delay
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, slideDelay);
    return () => clearInterval(timer);
  }, [banners.length, slideDelay]);

  const goTo = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  // Touch / swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  if (currentView !== 'home') return null;

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 mt-4">
        <div
          className="w-full h-48 md:h-64 shimmer"
          style={{ border: '3px solid var(--foreground)', borderRadius: '20px', boxShadow: '4px 4px 0px var(--foreground)' }}
        />
      </div>
    );
  }

  // Default gradient placeholder when no banners available
  if (banners.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 mt-4">
        <div
          className="relative w-full overflow-hidden"
          style={{
            border: '3px solid var(--foreground)',
            borderRadius: '20px',
            boxShadow: '4px 4px 0px var(--foreground)',
          }}
        >
          <div
            className="w-full h-48 md:h-64 lg:h-80 relative"
            style={{
              background: 'linear-gradient(135deg, var(--secondary), var(--primary), var(--accent))',
            }}
          >
            {/* Animated decorative elements - no text, just visual */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-10 -left-10 w-40 h-40 rounded-full opacity-20"
                style={{ background: 'var(--card)' }}
              />
              <motion.div
                animate={{ x: [0, -20, 0], y: [0, 15, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-15"
                style={{ background: 'var(--card)' }}
              />
              <motion.div
                animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full opacity-10"
                style={{ background: 'var(--card)' }}
              />
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full opacity-5"
                style={{ background: 'conic-gradient(from 0deg, var(--card), transparent, var(--card))' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Slide animation variants - scale + fade for dynamic feel
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '80%' : '-80%',
      opacity: 0,
      scale: 0.92,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-80%' : '80%',
      opacity: 0,
      scale: 1.08,
    }),
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-4">
      <div
        className="relative w-full overflow-hidden"
        style={{
          border: '3px solid var(--foreground)',
          borderRadius: '20px',
          boxShadow: '4px 4px 0px var(--foreground)',
          background: 'var(--foreground)',
        }}
      >
        {/* Banner Display - responsive aspect ratio, clean photo only */}
        <div
          className="relative w-full h-48 md:h-64 lg:h-80"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
              className="absolute inset-0"
            >
              {/* Banner Image or Unique Animated Gradient */}
              {banners[currentIndex]?.image ? (
                <img
                  src={banners[currentIndex].image}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                <div
                  className="w-full h-full relative overflow-hidden"
                  style={{ background: getBannerGradient(currentIndex) }}
                >
                  {/* Animated floating shapes for visual interest */}
                  <motion.div
                    animate={{
                      x: [0, 25, 0],
                      y: [0, -15, 0],
                      scale: [1, 1.15, 1],
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-8 -left-8 w-36 h-36 rounded-full opacity-20"
                    style={{ background: 'var(--card)' }}
                  />
                  <motion.div
                    animate={{
                      x: [0, -18, 0],
                      y: [0, 12, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full opacity-15"
                    style={{ background: 'var(--card)' }}
                  />
                  <motion.div
                    animate={{
                      x: [0, 12, 0],
                      y: [0, -8, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full opacity-8"
                    style={{ background: 'conic-gradient(from 0deg, var(--card), transparent, var(--card))' }}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Subtle gradient overlay at bottom for visual depth */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
            style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.15))' }}
          />
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center z-10"
              style={{
                background: 'var(--card)',
                color: 'var(--foreground)',
                padding: 0,
                borderRadius: '12px',
                border: '2px solid var(--foreground)',
                boxShadow: '2px 2px 0px var(--foreground)',
              }}
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center z-10"
              style={{
                background: 'var(--card)',
                color: 'var(--foreground)',
                padding: 0,
                borderRadius: '12px',
                border: '2px solid var(--foreground)',
                boxShadow: '2px 2px 0px var(--foreground)',
              }}
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </>
        )}

        {/* Dots Indicator - animated pills */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {banners.map((_, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => goTo(idx)}
                className="h-3 rounded-full transition-all duration-300"
                style={{
                  width: idx === currentIndex ? '32px' : '12px',
                  background: idx === currentIndex ? 'var(--primary)' : 'var(--card)',
                  border: '2px solid var(--foreground)',
                  opacity: idx === currentIndex ? 1 : 0.7,
                }}
                aria-label={`Go to banner ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
