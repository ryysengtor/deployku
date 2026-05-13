'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Zap, Package } from 'lucide-react';
import { useStore } from '@/store/useStore';

export interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: string;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  flashSaleEndTime?: string;
  variants?: { name: string; options: { label: string; price: number; stock: number }[] }[];
}

export default function ProductCard({
  id,
  name,
  image,
  price,
  originalPrice,
  category,
  isFlashSale,
  flashSalePrice,
  variants,
}: ProductCardProps) {
  const { setSelectedProduct, setView } = useStore();
  const [imgError, setImgError] = useState(false);

  // Calculate price range from variants
  const getPriceRange = () => {
    if (variants && variants.length > 0 && variants[0].options.length > 0) {
      const prices = variants.flatMap((v) => v.options.map((o) => o.price));
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min === max) return `Rp${min.toLocaleString('id-ID')}`;
      return `Rp${min.toLocaleString('id-ID')} - Rp${max.toLocaleString('id-ID')}`;
    }
    return `Rp${price.toLocaleString('id-ID')}`;
  };

  const handleClick = () => {
    setSelectedProduct(id);
    setView('product');
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="cursor-pointer cartoon-card overflow-hidden group"
    >
      {/* Image Container - 1:1 Ratio */}
      <div
        className="relative w-full aspect-square overflow-hidden"
        style={{ background: 'var(--muted)' }}
      >
        {image && !imgError ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12" style={{ color: 'var(--foreground)', opacity: 0.3 }} />
          </div>
        )}

        {/* Flash Sale Badge */}
        {isFlashSale && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute top-2 right-2 px-2 py-1 flex items-center gap-1 cartoon-badge"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
            }}
          >
            <Zap className="w-3 h-3 fill-current" />
            <span className="text-[10px]">FLASH</span>
          </motion.div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3
          className="font-bold text-sm leading-tight line-clamp-2 min-h-[2.5rem]"
          style={{ color: 'var(--foreground)' }}
        >
          {name}
        </h3>

        {/* Category Badge */}
        {category && (
          <div className="mt-1">
            <span
              className="cartoon-badge text-[9px]"
              style={{
                background: 'var(--muted)',
                color: 'var(--foreground)',
                opacity: 0.7,
              }}
            >
              {category}
            </span>
          </div>
        )}

        {/* Price Display */}
        <div className="mt-2">
          {isFlashSale && flashSalePrice ? (
            <div>
              <span
                className="text-xs line-through font-bold"
                style={{ color: 'var(--foreground)', opacity: 0.5 }}
              >
                Rp{price.toLocaleString('id-ID')}
              </span>
              <p className="font-black text-base" style={{ color: 'var(--primary)' }}>
                Rp{flashSalePrice.toLocaleString('id-ID')}
              </p>
            </div>
          ) : (
            <p className="font-black text-sm" style={{ color: 'var(--secondary)' }}>
              {getPriceRange()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
