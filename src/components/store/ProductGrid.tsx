'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageSearch } from 'lucide-react';
import { useStore } from '@/store/useStore';
import ProductCard from './ProductCard';

interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: string;
  variants: { name: string; options: { label: string; price: number; stock: number }[] }[];
  stock: number;
  isActive: boolean;
  isFlashSale: boolean;
  flashSalePrice?: number;
  flashSaleEndTime?: string;
  sortOrder: number;
}

function ProductSkeleton() {
  return (
    <div
      className="overflow-hidden shimmer"
      style={{
        border: '3px solid var(--border)',
        borderRadius: '20px',
        opacity: 0.4,
      }}
    >
      <div className="w-full aspect-square" style={{ background: 'var(--muted)' }} />
      <div className="p-3 space-y-2">
        <div className="h-4 rounded w-3/4" style={{ background: 'var(--muted)' }} />
        <div className="h-5 rounded w-1/2" style={{ background: 'var(--muted)' }} />
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const { currentView, selectedCategory, searchQuery } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.set('category', selectedCategory);
      }
      if (searchQuery) {
        params.set('search', searchQuery);
      }
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.data || []);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (currentView !== 'home') return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-6 pb-6">
      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 mb-4"
      >
        <h2
          className="text-xl md:text-2xl font-black cartoon-title"
          style={{ color: 'var(--foreground)' }}
        >
          {searchQuery
            ? `Hasil pencarian "${searchQuery}"`
            : selectedCategory !== 'all'
            ? 'Kategori'
            : 'Semua Produk'}
        </h2>
        <div
          className="h-1 flex-1 rounded-full"
          style={{ background: 'var(--secondary)', border: '2px solid var(--foreground)' }}
        />
      </motion.div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty State - cartoon styled */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <div
            className="w-20 h-20 flex items-center justify-center mb-4 cartoon-card"
            style={{ background: 'var(--muted)' }}
          >
            <PackageSearch className="w-10 h-10" style={{ color: 'var(--foreground)', opacity: 0.4 }} />
          </div>
          <p className="font-bold text-lg" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
            Tidak ada produk
          </p>
          <p className="font-medium text-sm mt-1" style={{ color: 'var(--foreground)', opacity: 0.4 }}>
            Coba kata kunci lain
          </p>
        </motion.div>
      ) : (
        /* Product Grid with AnimatePresence for filter transitions */
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedCategory}-${searchQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {products.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
              >
                <ProductCard
                  id={product._id}
                  name={product.name}
                  image={product.image}
                  price={product.price}
                  originalPrice={product.originalPrice}
                  category={product.category}
                  isFlashSale={product.isFlashSale}
                  flashSalePrice={product.flashSalePrice}
                  flashSaleEndTime={product.flashSaleEndTime}
                  variants={product.variants}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
