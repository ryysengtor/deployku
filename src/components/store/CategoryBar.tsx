'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
}

export default function CategoryBar() {
  const { currentView, selectedCategory, setSelectedCategory } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories((data.data || data).filter((c: Category) => c.isActive));
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryClick = (slug: string) => {
    setSelectedCategory(selectedCategory === slug ? 'all' : slug);
  };

  if (currentView !== 'home') return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-6">
      <div
        className="overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-3 min-w-max">
          {/* "All" Category */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory('all')}
            className="flex items-center gap-2 px-4 py-2.5 font-bold text-sm whitespace-nowrap transition-all cartoon-badge"
            style={{
              fontSize: '0.875rem',
              padding: '10px 16px',
              background: selectedCategory === 'all' ? 'var(--primary)' : 'var(--card)',
              color: selectedCategory === 'all' ? 'var(--primary-foreground)' : 'var(--foreground)',
              boxShadow: selectedCategory === 'all'
                ? '4px 4px 0px var(--foreground)'
                : '3px 3px 0px var(--foreground)',
            }}
          >
            <span className="text-lg">🏪</span>
            Semua
          </motion.button>

          {/* Category Pills */}
          <AnimatePresence>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-11 w-28 shimmer"
                    style={{
                      border: '3px solid var(--border)',
                      borderRadius: '10px',
                      opacity: 0.3,
                    }}
                  />
                ))
              : categories.map((cat, idx) => {
                  const isActive = selectedCategory === cat.slug;
                  return (
                    <motion.button
                      key={cat._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className="flex items-center gap-2 px-4 py-2.5 font-bold text-sm whitespace-nowrap transition-all cartoon-badge"
                      style={{
                        fontSize: '0.875rem',
                        padding: '10px 16px',
                        background: isActive ? (cat.color || 'var(--primary)') : 'var(--card)',
                        color: isActive ? 'var(--primary-foreground)' : 'var(--foreground)',
                        boxShadow: isActive
                          ? '4px 4px 0px var(--foreground)'
                          : '3px 3px 0px var(--foreground)',
                      }}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      {cat.name}
                    </motion.button>
                  );
                })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
