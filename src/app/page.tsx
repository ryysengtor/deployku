'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import LoadingScreen from '@/components/store/LoadingScreen';
import LandingPage from '@/components/store/LandingPage';

// Dynamic imports to reduce initial compilation memory
const Header = dynamic(() => import('@/components/store/Header'));
const HeroBanner = dynamic(() => import('@/components/store/HeroBanner'));
const FlashSaleBar = dynamic(() => import('@/components/store/FlashSaleBar'));
const CategoryBar = dynamic(() => import('@/components/store/CategoryBar'));
const ProductGrid = dynamic(() => import('@/components/store/ProductGrid'));
const ProductDetail = dynamic(() => import('@/components/store/ProductDetail'));
const CheckoutForm = dynamic(() => import('@/components/store/CheckoutForm'));
const PaymentView = dynamic(() => import('@/components/store/PaymentView'));
const CheckTransaction = dynamic(() => import('@/components/store/CheckTransaction'));
const Footer = dynamic(() => import('@/components/store/Footer'));
const NatureEffects = dynamic(() => import('@/components/store/NatureEffects'));

/* Map theme slug → CSS class on <html> */
const THEME_CLASS_MAP: Record<string, string> = {
  'craig-of-the-creek': '',
  'adventure-cartoon': 'theme-adventure',
  'forest-cartoon': 'theme-forest',
  'night-adventure': 'theme-night',
  'cartoon-network': 'theme-cartoon-network',
};

/* Map theme slug → animated background class */
const THEME_BG_CLASS_MAP: Record<string, string> = {
  'craig-of-the-creek': 'bg-craig-of-the-creek',
  'adventure-cartoon': 'bg-adventure-cartoon',
  'forest-cartoon': 'bg-forest-cartoon',
  'night-adventure': 'bg-night-adventure',
  'cartoon-network': 'bg-cartoon-network',
};

/* Map theme slug → blob colors */
const THEME_BLOB_COLORS: Record<string, [string, string, string]> = {
  'craig-of-the-creek': ['#6BCB77', '#FF8C42', '#4FC0D0'],
  'cartoon-network': ['#FF5722', '#FFC107', '#00BCD4'],
  'adventure-cartoon': ['#FF6F00', '#26A69A', '#FFB74D'],
  'forest-cartoon': ['#43A047', '#8BC34A', '#81C784'],
  'night-adventure': ['#533483', '#E94560', '#4FC0D0'],
};

export default function Home() {
  const { currentView, currentTheme, isLoading, setLoading, hasVisitedLanding, setTheme, setSiteName, setSiteSlogan, setView, _hasHydrated, setHasHydrated } = useStore();
  const [initialLoad, setInitialLoad] = useState(true);

  // Safety fallback: if hydration doesn't complete in 3 seconds, force it
  useEffect(() => {
    if (_hasHydrated) return;
    const timer = setTimeout(() => {
      setHasHydrated(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [_hasHydrated, setHasHydrated]);

  // Load active theme + site settings from API on startup
  useEffect(() => {
    if (!_hasHydrated) return;

    const loadInitialData = async () => {
      try {
        const themeRes = await fetch('/api/themes');
        const themeData = await themeRes.json();
        if (themeData.success && themeData.data?.activeTheme?.slug) {
          setTheme(themeData.data.activeTheme.slug as any);
        }

        const settingsRes = await fetch('/api/settings');
        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.data) {
          const s = settingsData.data;
          if (s.site_name) setSiteName(s.site_name);
          if (s.site_slogan) setSiteSlogan(s.site_slogan);
        }
      } catch {
        // Silent fail - use defaults/persisted values
      }
    };
    loadInitialData();
  }, [_hasHydrated, setTheme, setSiteName, setSiteSlogan]);

  // Handle initial loading
  useEffect(() => {
    if (!_hasHydrated) return;

    const timer = setTimeout(() => {
      setInitialLoad(false);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [_hasHydrated, setLoading]);

  // If persisted currentView is 'admin', reset to 'home' since
  // admin is on a separate /admin route now.
  // Use a separate flag to avoid redirect loops
  const hasFixedViewRef = useRef(false);
  useEffect(() => {
    if (!_hasHydrated || hasFixedViewRef.current) return;
    hasFixedViewRef.current = true;

    if (currentView === 'admin') {
      setView('home');
    }
  }, [_hasHydrated, currentView, setView]);

  // Apply theme class to <html>
  useEffect(() => {
    if (!_hasHydrated) return;

    const root = document.documentElement;
    root.classList.remove(
      'dark',
      'theme-adventure',
      'theme-forest',
      'theme-night',
      'theme-cartoon-network',
    );

    const cls = THEME_CLASS_MAP[currentTheme];
    if (cls) {
      root.classList.add(cls);
    }

    if (currentTheme === 'night-adventure') {
      root.classList.add('dark');
    }
  }, [currentTheme, _hasHydrated]);

  const bgClass = THEME_BG_CLASS_MAP[currentTheme] || 'bg-craig-of-the-creek';
  const blobColors = THEME_BLOB_COLORS[currentTheme] || ['#6BCB77', '#FF8C42', '#4FC0D0'];

  if (initialLoad || !_hasHydrated) {
    return <LoadingScreen />;
  }

  if (currentView === 'landing' && !hasVisitedLanding) {
    return <LandingPage />;
  }

  // Don't render admin view on home page - it's at /admin route
  if (currentView === 'admin') {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden">
      <div className={`theme-animated-bg ${bgClass}`}>
        <div className="theme-blob" style={{ background: blobColors[0] }} />
        <div className="theme-blob" style={{ background: blobColors[1] }} />
        <div className="theme-blob" style={{ background: blobColors[2] }} />
      </div>

      <NatureEffects />
      <Header />

      <main className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <HeroBanner />
              <FlashSaleBar />
              <CategoryBar />
              <ProductGrid />
            </motion.div>
          )}

          {currentView === 'product' && (
            <motion.div key="product" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
              <ProductDetail />
            </motion.div>
          )}

          {currentView === 'checkout' && (
            <motion.div key="checkout" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
              <CheckoutForm />
            </motion.div>
          )}

          {currentView === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
              <PaymentView />
            </motion.div>
          )}

          {currentView === 'check-transaction' && (
            <motion.div key="check-transaction" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <CheckTransaction />
            </motion.div>
          )}

          {currentView === 'transaction' && (
            <motion.div key="transaction" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <PaymentView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
