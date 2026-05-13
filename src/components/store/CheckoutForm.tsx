'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CreditCard,
  Tag,
  ShoppingBag,
  QrCode,
  Loader2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function CheckoutForm() {
  const {
    currentView,
    setView,
    cartItem,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    voucherCode,
    setVoucherCode,
    voucherDiscount,
    setVoucherDiscount,
    setPaymentInfo,
  } = useStore();

  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payError, setPayError] = useState('');

  const subtotal = cartItem?.price ?? 0;
  const discountAmount = Math.round(subtotal * (voucherDiscount / 100));
  const totalAmount = subtotal - discountAmount;

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    setIsApplyingVoucher(true);
    setVoucherError('');
    setVoucherSuccess(false);
    try {
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode, amount: subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        const voucherData = data.data;
        setVoucherDiscount(voucherData.discount || 0);
        setVoucherSuccess(true);
      } else {
        setVoucherError(data.error || 'Voucher tidak valid');
        setVoucherDiscount(0);
      }
    } catch {
      setVoucherError('Gagal menerapkan voucher');
      setVoucherDiscount(0);
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handlePayNow = async () => {
    if (!cartItem) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      setPayError('Mohon lengkapi data pelanggan');
      return;
    }

    setIsProcessing(true);
    setPayError('');
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: cartItem.productId,
          variantLabel: cartItem.variantLabel,
          amount: totalAmount,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          paymentMethod: 'qris',
        }),
      });
      const data = await res.json();
      if (data.success) {
        const paymentData = data.data;
        setPaymentInfo({
          transactionId: paymentData.transactionId,
          cashifyTransactionId: paymentData.cashifyTransactionId,
          amount: paymentData.amount,
          totalAmount: paymentData.totalAmount,
          uniqueNominal: paymentData.uniqueNominal,
          paymentMethod: 'qris',
          qrString: paymentData.qrString,
          status: paymentData.status,
          expiredAt: paymentData.expiredAt,
        });
        setView('payment');
      } else {
        setPayError(data.error || 'Gagal membuat transaksi');
      }
    } catch {
      setPayError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    setView('product');
  };

  if (currentView !== 'checkout') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -80 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-2xl mx-auto px-4 py-6"
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

        {/* Title */}
        <h2
          className="cartoon-title text-2xl mb-6 flex items-center gap-2"
          style={{ color: 'var(--foreground)' }}
        >
          <ShoppingBag className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          Checkout
        </h2>

        {/* Order Summary */}
        {cartItem && (
          <div className="cartoon-card p-5 mb-4">
            <div className="flex gap-4">
              <div
                className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
                style={{ background: 'var(--muted)', border: '3px solid var(--foreground)' }}
              >
                {cartItem.productImage ? (
                  <img src={cartItem.productImage} alt={cartItem.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8" style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate" style={{ color: 'var(--foreground)' }}>
                  {cartItem.productName}
                </h3>
                {cartItem.variantLabel && (
                  <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    {cartItem.variantLabel}
                  </p>
                )}
                <p className="font-black text-lg mt-1" style={{ color: 'var(--primary)' }}>
                  Rp{cartItem.price.toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Customer Info */}
        <div className="cartoon-card p-5 mb-4 space-y-4">
          <h3 className="cartoon-title text-sm" style={{ color: 'var(--foreground)' }}>
            Data Pelanggan
          </h3>

          <div>
            <label className="font-bold text-sm mb-1.5 block" style={{ color: 'var(--foreground)' }}>
              Nama Lengkap
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Masukkan nama lengkap"
              className="cartoon-input w-full px-4 py-3 text-sm"
              style={{ color: 'var(--foreground)' }}
            />
          </div>

          <div>
            <label className="font-bold text-sm mb-1.5 block" style={{ color: 'var(--foreground)' }}>
              Nomor WhatsApp
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="cartoon-input w-full px-4 py-3 text-sm"
              style={{ color: 'var(--foreground)' }}
            />
          </div>
        </div>

        {/* Payment Method - QRIS Only */}
        <div className="cartoon-card p-5 mb-4">
          <h3
            className="cartoon-title text-sm flex items-center gap-2 mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            <CreditCard className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            Metode Pembayaran
          </h3>
          <div
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{
              border: '3px solid var(--primary)',
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              boxShadow: '4px 4px 0px var(--foreground)',
            }}
          >
            <QrCode className="w-6 h-6 flex-shrink-0" />
            <div>
              <span className="font-bold">QRIS</span>
              <span className="text-xs opacity-80 ml-2">Scan QR Code untuk bayar</span>
            </div>
          </div>
        </div>

        {/* Voucher */}
        <div className="cartoon-card p-5 mb-4 space-y-3">
          <h3
            className="cartoon-title text-sm flex items-center gap-2"
            style={{ color: 'var(--foreground)' }}
          >
            <Tag className="w-4 h-4" style={{ color: 'var(--secondary)' }} />
            Voucher
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => {
                setVoucherCode(e.target.value);
                setVoucherError('');
                setVoucherSuccess(false);
              }}
              placeholder="Masukkan kode voucher"
              className="cartoon-input flex-1 px-4 py-2.5 text-sm"
              style={{ color: 'var(--foreground)' }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleApplyVoucher}
              disabled={isApplyingVoucher}
              className="cartoon-btn px-4 py-2.5 text-sm"
              style={{
                background: 'var(--secondary)',
                color: 'var(--secondary-foreground)',
                opacity: isApplyingVoucher ? 0.7 : 1,
              }}
            >
              {isApplyingVoucher ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Gunakan'
              )}
            </motion.button>
          </div>
          {voucherError && (
            <p className="text-xs font-bold" style={{ color: 'var(--destructive)' }}>
              {voucherError}
            </p>
          )}
          {voucherSuccess && voucherDiscount > 0 && (
            <p className="text-xs font-bold" style={{ color: 'var(--secondary)' }}>
              Voucher aktif! Diskon {voucherDiscount}%
            </p>
          )}
        </div>

        {/* Price Summary */}
        <div
          className="p-5 rounded-[20px] mb-6 space-y-2"
          style={{ background: 'var(--muted)', border: '3px solid var(--foreground)', boxShadow: '4px 4px 0px var(--foreground)' }}
        >
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Subtotal
            </span>
            <span className="font-bold" style={{ color: 'var(--foreground)' }}>
              Rp{subtotal.toLocaleString('id-ID')}
            </span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm" style={{ color: 'var(--secondary)' }}>
                Diskon ({voucherDiscount}%)
              </span>
              <span className="font-bold" style={{ color: 'var(--secondary)' }}>
                -Rp{discountAmount.toLocaleString('id-ID')}
              </span>
            </div>
          )}
          <div
            className="pt-2 mt-2"
            style={{ borderTop: '3px solid var(--foreground)' }}
          >
            <div className="flex justify-between items-center">
              <span className="cartoon-title text-lg" style={{ color: 'var(--foreground)' }}>
                Total
              </span>
              <span className="font-black text-2xl" style={{ color: 'var(--primary)' }}>
                Rp{totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {payError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="cartoon-card p-4 mb-4 text-center"
            style={{ background: 'var(--destructive)', color: 'var(--primary-foreground)', borderColor: 'var(--foreground)' }}
          >
            <p className="font-bold text-sm">{payError}</p>
          </motion.div>
        )}

        {/* Pay Button */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <button
            onClick={handlePayNow}
            disabled={isProcessing || !customerName.trim() || !customerPhone.trim() || !cartItem}
            className="cartoon-btn w-full py-4 text-lg flex items-center justify-center gap-3"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              boxShadow: '4px 4px 0px var(--foreground)',
              opacity: isProcessing || !customerName.trim() || !customerPhone.trim() || !cartItem ? 0.6 : 1,
              cursor: isProcessing || !customerName.trim() || !customerPhone.trim() || !cartItem ? 'not-allowed' : 'pointer',
            }}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <QrCode className="w-5 h-5" />
                Bayar dengan QRIS
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
