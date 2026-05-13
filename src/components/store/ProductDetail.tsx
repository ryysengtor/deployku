'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ShoppingCart,
  Zap,
  Download,
  ExternalLink,
  Package,
  Loader2,
} from 'lucide-react';
import { useStore, CartItem } from '@/store/useStore';

interface VariantOption {
  label: string;
  price: number;
  stock: number;
  downloadLink?: string;
  googleDriveLink?: string;
  accessInstructions?: string;
}

interface Variant {
  name: string;
  options: VariantOption[];
}

interface Product {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  category: string;
  variants: Variant[];
  stock: number;
  isActive: boolean;
  isFlashSale: boolean;
  flashSalePrice?: number;
  flashSaleEndTime?: string;
  deliveryType: 'auto' | 'manual' | 'link' | 'file';
  downloadLink?: string;
  googleDriveLink?: string;
  accessInstructions?: string;
}

export default function ProductDetail() {
  const { currentView, selectedProductId, setSelectedProduct, setView, setCartItem } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [currentPrice, setCurrentPrice] = useState(0);

  const fetchProduct = useCallback(async () => {
    if (!selectedProductId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/products/${selectedProductId}`);
      const data = await res.json();
      const productData = data.data || data;
      setProduct(productData);

      const initialVariants: Record<string, string> = {};
      productData.variants?.forEach((v: Variant) => {
        if (v.options.length > 0) {
          initialVariants[v.name] = v.options[0].label;
        }
      });
      setSelectedVariants(initialVariants);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, [selectedProductId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    if (!product) return;
    let price = product.price;

    product.variants?.forEach((v) => {
      const selectedLabel = selectedVariants[v.name];
      if (selectedLabel) {
        const option = v.options.find((o) => o.label === selectedLabel);
        if (option) {
          price = option.price;
        }
      }
    });

    if (product.isFlashSale && product.flashSalePrice) {
      price = product.flashSalePrice;
    }

    setCurrentPrice(price);
  }, [product, selectedVariants]);

  const handleVariantChange = (variantName: string, optionLabel: string) => {
    setSelectedVariants((prev) => ({ ...prev, [variantName]: optionLabel }));
  };

  const handleBuyNow = () => {
    if (!product) return;

    const variantLabel = Object.entries(selectedVariants)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const cartItem: CartItem = {
      productId: product._id,
      productName: product.name,
      productImage: product.image,
      variantLabel,
      price: currentPrice,
      quantity: 1,
    };

    setCartItem(cartItem);
    setView('checkout');
  };

  const handleBack = () => {
    setSelectedProduct(null);
    setView('home');
  };

  // Get delivery info for selected variant or product
  const getDeliveryInfo = () => {
    if (!product) return null;
    let downloadLink = product.downloadLink;
    let googleDriveLink = product.googleDriveLink;
    let accessInstructions = product.accessInstructions;

    // Check if selected variant has its own delivery info
    product.variants?.forEach((v) => {
      const selectedLabel = selectedVariants[v.name];
      if (selectedLabel) {
        const option = v.options.find((o) => o.label === selectedLabel);
        if (option) {
          if (option.downloadLink) downloadLink = option.downloadLink;
          if (option.googleDriveLink) googleDriveLink = option.googleDriveLink;
          if (option.accessInstructions) accessInstructions = option.accessInstructions;
        }
      }
    });

    if (!downloadLink && !googleDriveLink) return null;
    return { downloadLink, googleDriveLink, accessInstructions };
  };

  if (currentView !== 'product') return null;

  const deliveryInfo = product ? getDeliveryInfo() : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -80 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-4xl mx-auto px-4 py-6"
      >
        {/* Back Button */}
        <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }}>
          <button
            onClick={handleBack}
            className="cartoon-btn mb-6 px-5 py-2.5 flex items-center gap-2 text-sm"
            style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </motion.div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="w-full aspect-square shimmer cartoon-card rounded-[20px]" />
            <div className="h-10 shimmer cartoon-card w-3/5" />
            <div className="h-8 shimmer cartoon-card w-2/5" />
            <div className="h-24 shimmer cartoon-card" />
          </div>
        ) : product ? (
          <div className="flex flex-col gap-6">
            {/* Large Product Image - Square 1:1 */}
            <div className="cartoon-card overflow-hidden">
              <div className="relative w-full aspect-square" style={{ background: 'var(--muted)' }}>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-20 h-20" style={{ color: 'var(--foreground)', opacity: 0.2 }} />
                  </div>
                )}
                {/* Flash Sale Badge */}
                {product.isFlashSale && (
                  <div
                    className="absolute top-4 right-4 cartoon-badge flex items-center gap-1.5 animate-pulse"
                    style={{ background: 'var(--destructive)', color: 'var(--primary-foreground)' }}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    FLASH SALE
                  </div>
                )}
                {/* Delivery Type Badge */}
                {deliveryInfo && (
                  <div
                    className="absolute top-4 left-4 cartoon-badge flex items-center gap-1.5"
                    style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}
                  >
                    <Download className="w-3.5 h-3.5" />
                    PRODUK DIGITAL
                  </div>
                )}
              </div>
            </div>

            {/* Product Info Card */}
            <div className="cartoon-card p-6 space-y-5">
              {/* Product Name */}
              <h1 className="cartoon-title text-2xl md:text-3xl" style={{ color: 'var(--foreground)' }}>
                {product.name}
              </h1>

              {/* Price Display */}
              <div
                className="p-4 rounded-2xl"
                style={{ background: 'var(--muted)', border: '3px solid var(--foreground)' }}
              >
                {product.isFlashSale && product.flashSalePrice && product.originalPrice ? (
                  <div>
                    <span
                      className="text-sm line-through font-bold"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      Rp{(product.originalPrice || product.price).toLocaleString('id-ID')}
                    </span>
                    <p className="font-black text-2xl md:text-3xl" style={{ color: 'var(--destructive)' }}>
                      Rp{currentPrice.toLocaleString('id-ID')}
                    </p>
                  </div>
                ) : (
                  <p className="font-black text-2xl md:text-3xl" style={{ color: 'var(--primary)' }}>
                    Rp{currentPrice.toLocaleString('id-ID')}
                  </p>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="cartoon-title text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                    Deskripsi
                  </h3>
                  <p
                    className="text-sm leading-relaxed whitespace-pre-line"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {product.description}
                  </p>
                </div>
              )}
            </div>

            {/* Delivery Info Card */}
            {deliveryInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="cartoon-card p-6 space-y-3"
              >
                <h3 className="cartoon-title text-sm" style={{ color: 'var(--foreground)' }}>
                  Informasi Pengiriman
                </h3>
                <div
                  className="p-3 rounded-xl text-sm space-y-2"
                  style={{ background: 'var(--muted)' }}
                >
                  {deliveryInfo.downloadLink && (
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                      <span style={{ color: 'var(--foreground)' }}>
                        Link download akan tersedia setelah pembayaran
                      </span>
                    </div>
                  )}
                  {deliveryInfo.googleDriveLink && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                      <span style={{ color: 'var(--foreground)' }}>
                        Akses via Google Drive setelah pembayaran
                      </span>
                    </div>
                  )}
                  {deliveryInfo.accessInstructions && (
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                      {deliveryInfo.accessInstructions}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Variant Selectors - Redesigned as card grid */}
            {product.variants?.length > 0 && (
              <div className="cartoon-card p-6 space-y-5">
                <h3 className="cartoon-title text-sm" style={{ color: 'var(--foreground)' }}>
                  Pilih Varian
                </h3>
                {product.variants.map((variant) => (
                  <div key={variant.name} className="space-y-3">
                    <label
                      className="font-bold text-sm block"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {variant.name}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {variant.options.map((option) => {
                        const isSelected = selectedVariants[variant.name] === option.label;
                        return (
                          <motion.button
                            key={option.label}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleVariantChange(variant.name, option.label)}
                            className="cartoon-card relative flex flex-col items-center justify-center gap-1 p-4 cursor-pointer text-center"
                            animate={{
                              scale: isSelected ? 1.04 : 1,
                            }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            style={{
                              background: isSelected ? 'var(--primary)' : 'var(--card)',
                              color: isSelected ? 'var(--primary-foreground)' : 'var(--foreground)',
                              borderWidth: isSelected ? '4px' : '3px',
                              borderColor: isSelected ? 'var(--primary)' : 'var(--foreground)',
                              borderRadius: '20px',
                              boxShadow: isSelected
                                ? '6px 6px 0px var(--foreground)'
                                : '3px 3px 0px var(--foreground)',
                              backdropFilter: 'blur(12px)',
                            }}
                          >
                            {/* Selection indicator dot */}
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{
                                  background: 'var(--accent)',
                                  border: '2px solid var(--foreground)',
                                }}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-foreground)' }}>
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </motion.div>
                            )}
                            {/* Label - bold */}
                            <span className="font-extrabold text-sm leading-tight" style={{ textTransform: 'uppercase' }}>
                              {option.label}
                            </span>
                            {/* Price - prominent */}
                            <span
                              className="font-black text-base md:text-lg leading-tight"
                              style={{ opacity: isSelected ? 1 : 0.85 }}
                            >
                              Rp{option.price.toLocaleString('id-ID')}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Buy Now Button */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={handleBuyNow}
                className="cartoon-btn w-full py-4 text-lg flex items-center justify-center gap-3"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  boxShadow: '4px 4px 0px var(--foreground)',
                }}
              >
                <ShoppingCart className="w-5 h-5" />
                Beli Sekarang
              </button>
            </motion.div>
          </div>
        ) : (
          <div className="cartoon-card p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
            <p className="cartoon-title text-lg" style={{ color: 'var(--muted-foreground)' }}>
              Produk tidak ditemukan
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
