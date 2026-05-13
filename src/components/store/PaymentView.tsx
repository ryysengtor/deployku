'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  QrCode,
  AlertTriangle,
  Download,
  ExternalLink,
  RefreshCw,
  Home,
  Loader2,
  Package,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

// Confetti particle component
function ConfettiParticle({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      initial={{ y: -20, x, opacity: 1, rotate: 0 }}
      animate={{ y: '100vh', opacity: 0, rotate: 720 }}
      transition={{ duration: 2.5 + Math.random(), delay, ease: 'easeIn' }}
      className="fixed top-0 w-3 h-3 rounded-sm z-50 pointer-events-none"
      style={{ background: color }}
    />
  );
}

function ConfettiEffect() {
  const colors = ['var(--primary)', 'var(--secondary)', 'var(--accent)', 'var(--ring)', 'var(--destructive)'];
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.5,
    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400) - 200,
    color: colors[i % colors.length],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((p) => (
        <ConfettiParticle key={p.id} delay={p.delay} x={p.x} color={p.color} />
      ))}
    </div>
  );
}

// Pulsing status check indicator
function StatusCheckIndicator() {
  return (
    <motion.div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
      style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Loader2 className="w-3 h-3 animate-spin" />
      <span>Memeriksa status...</span>
    </motion.div>
  );
}

export default function PaymentView() {
  const {
    currentView,
    setView,
    paymentInfo,
    setPaymentInfo,
    setCartItem,
    setSelectedProduct,
    cartItem,
  } = useStore();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [copied, setCopied] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAutoChecking, setIsAutoChecking] = useState(false);
  const [hasAutoExpired, setHasAutoExpired] = useState(false);
  const [productDeliveryInfo, setProductDeliveryInfo] = useState<{
    downloadLink?: string;
    googleDriveLink?: string;
    accessInstructions?: string;
    deliveryType?: string;
  } | null>(null);
  const autoCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAutoExpiredRef = useRef(false);
  const hasInitialCheckedRef = useRef(false);

  // Determine statuses based ONLY on paymentInfo.status (not timer)
  const isPaid = paymentInfo?.status === 'paid' || paymentInfo?.status === 'success';
  const isExpired =
    paymentInfo?.status === 'expired' || paymentInfo?.status === 'cancel';
  const isPending = !isPaid && !isExpired;

  // Auto-expire handler: call status API then set local status to expired
  // Defined BEFORE the useEffect that uses it
  const handleAutoExpire = useCallback(async () => {
    if (hasAutoExpiredRef.current) return;
    hasAutoExpiredRef.current = true;
    setHasAutoExpired(true);

    // Call the status API one more time (backend will update DB and send Telegram notifications)
    if (paymentInfo?.transactionId) {
      try {
        const res = await fetch('/api/payment/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: paymentInfo.transactionId }),
        });
        const data = await res.json();
        if (data?.success && data.data?.status) {
          // Use the actual status from the server
          setPaymentInfo((prev) => {
            if (!prev) return prev;
            return { ...prev, status: data.data.status };
          });
          return;
        }
      } catch {
        // silent fail - fall through to local expiry
      }
    }

    // Fallback: set local status to expired
    setPaymentInfo((prev) => {
      if (!prev) return prev;
      return { ...prev, status: 'expired' };
    });
  }, [paymentInfo?.transactionId, setPaymentInfo]);

  // Helper: process a status check response
  const processStatusResponse = useCallback((data: any) => {
    if (!data?.success) return;

    const newStatus = data.data?.status;
    if (!newStatus) return;

    // Use functional update to avoid stale closure over paymentInfo
    setPaymentInfo((prev) => {
      if (!prev) return prev;
      return { ...prev, status: newStatus };
    });

    // If status is paid, also set delivery info from the response
    if (newStatus === 'paid' || newStatus === 'success') {
      if (data.data?.deliveryInfo) {
        setProductDeliveryInfo(data.data.deliveryInfo);
      }
    }
  }, [setPaymentInfo]);

  // Countdown timer + auto-expire detection
  useEffect(() => {
    if (!paymentInfo?.expiredAt) return;
    if (isPaid || isExpired) return;

    const calculate = () => {
      const diff = new Date(paymentInfo.expiredAt!).getTime() - Date.now();
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      };
    };

    const result = calculate();
    setTimeLeft({ hours: result.hours, minutes: result.minutes, seconds: result.seconds });

    // If already expired on first calculation, trigger auto-expire
    if (result.expired && !hasAutoExpiredRef.current) {
      handleAutoExpire();
      return;
    }

    const timer = setInterval(() => {
      const res = calculate();
      setTimeLeft({ hours: res.hours, minutes: res.minutes, seconds: res.seconds });
      if (res.expired && !hasAutoExpiredRef.current) {
        clearInterval(timer);
        handleAutoExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentInfo?.expiredAt, isPaid, isExpired, handleAutoExpire]);

  // Auto-check status every 5 seconds if pending
  useEffect(() => {
    if (currentView !== 'payment') return;
    if (!paymentInfo?.transactionId) return;
    if (isPaid || isExpired) return;

    const transactionId = paymentInfo.transactionId;

    autoCheckRef.current = setInterval(async () => {
      setIsAutoChecking(true);
      try {
        const res = await fetch('/api/payment/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId }),
        });
        const data = await res.json();
        processStatusResponse(data);
      } catch {
        // silent fail
      } finally {
        setIsAutoChecking(false);
      }
    }, 5000);

    return () => {
      if (autoCheckRef.current) clearInterval(autoCheckRef.current);
    };
  }, [currentView, paymentInfo?.transactionId, isPaid, isExpired, processStatusResponse]);

  // Fetch product delivery info when paid
  useEffect(() => {
    if (!paymentInfo || !isPaid) return;
    if (!cartItem?.productId) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${cartItem.productId}`);
        const data = await res.json();
        const product = data.data || data;
        if (product.downloadLink || product.googleDriveLink || product.accessInstructions) {
          setProductDeliveryInfo({
            downloadLink: product.downloadLink,
            googleDriveLink: product.googleDriveLink,
            accessInstructions: product.accessInstructions,
            deliveryType: product.deliveryType,
          });
        }
      } catch {
        // silent
      }
    };
    fetchProduct();
  }, [isPaid, cartItem?.productId, paymentInfo]);

  // On mount (especially after refresh), re-check payment status from server
  // to ensure the persisted state is still accurate
  useEffect(() => {
    if (!paymentInfo?.transactionId) return;
    if (currentView !== 'payment' && currentView !== 'transaction') return;
    if (hasInitialCheckedRef.current) return;
    hasInitialCheckedRef.current = true;

    // Only re-check if status is pending (not yet paid/expired in local state)
    if (isPaid || isExpired) return;

    const checkOnMount = async () => {
      try {
        const res = await fetch('/api/payment/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: paymentInfo.transactionId }),
        });
        const data = await res.json();
        processStatusResponse(data);
      } catch {
        // silent fail - use persisted state
      }
    };
    checkOnMount();
  }, [paymentInfo?.transactionId, currentView, isPaid, isExpired, processStatusResponse]);

  // Show confetti when paid
  useEffect(() => {
    if (isPaid) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isPaid]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  const copyTransactionId = () => {
    if (!paymentInfo?.transactionId) return;
    navigator.clipboard.writeText(paymentInfo.transactionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckStatus = async () => {
    if (!paymentInfo?.transactionId) return;
    setIsChecking(true);
    try {
      const res = await fetch('/api/payment/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: paymentInfo.transactionId }),
      });
      const data = await res.json();
      processStatusResponse(data);
    } catch {
      // silent fail
    } finally {
      setIsChecking(false);
    }
  };

  const qrCodeUrl = paymentInfo?.qrString
    ? `https://larabert-qrgen.hf.space/v1/create-qr-code?data=${encodeURIComponent(paymentInfo.qrString)}&size=300`
    : '';

  const handleDownloadQR = async () => {
    if (!qrCodeUrl || !paymentInfo?.transactionId) return;
    setIsDownloadingQR(true);
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QRIS-${paymentInfo.transactionId.substring(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      // Fallback: open in new tab
      window.open(qrCodeUrl, '_blank');
    } finally {
      setIsDownloadingQR(false);
    }
  };

  const handleCancel = async () => {
    if (!paymentInfo?.transactionId) return;
    setIsCancelling(true);
    try {
      await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: paymentInfo.transactionId }),
      });
      setPaymentInfo(null);
      setCartItem(null);
      setSelectedProduct(null);
      setView('home');
    } catch {
      // silent fail
    } finally {
      setIsCancelling(false);
    }
  };

  const handleBackToHome = () => {
    setPaymentInfo(null);
    setCartItem(null);
    setSelectedProduct(null);
    setView('home');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (currentView !== 'payment' && currentView !== 'transaction') return null;

  return (
    <>
      {showConfetti && <ConfettiEffect />}

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-2xl mx-auto px-4 py-6"
        >
          {/* Back Button - no-print */}
          <motion.div whileHover={{ x: -4 }} whileTap={{ scale: 0.95 }} className="no-print">
            <button
              onClick={handleBackToHome}
              className="cartoon-btn mb-6 px-5 py-2.5 flex items-center gap-2 text-sm"
              style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
          </motion.div>

          {/* PRINT AREA */}
          <div className="print-area space-y-4">
            {/* Status Banner */}
            {isPaid ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="cartoon-card p-5 flex items-center gap-3"
                style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)', borderColor: 'var(--foreground)' }}
              >
                <CheckCircle className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="cartoon-title text-lg">Pembayaran Berhasil!</h3>
                  <p className="text-sm font-bold opacity-80">Terima kasih atas pembayaran Anda</p>
                </div>
              </motion.div>
            ) : isExpired ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="cartoon-card p-5 flex items-center gap-3"
                style={{ background: 'var(--destructive)', color: 'var(--primary-foreground)', borderColor: 'var(--foreground)' }}
              >
                <AlertTriangle className="w-8 h-8 flex-shrink-0" />
                <div>
                  <h3 className="cartoon-title text-lg">Waktu Habis!</h3>
                  <p className="text-sm font-bold opacity-80">Pembayaran telah kedaluwarsa</p>
                </div>
              </motion.div>
            ) : (
              /* Countdown Timer + Auto-check indicator */
              <div className="space-y-2">
                <div
                  className="p-4 rounded-[20px] flex items-center justify-center gap-3"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--accent-foreground)',
                    border: '3px solid var(--foreground)',
                    boxShadow: '4px 4px 0px var(--foreground)',
                  }}
                >
                  <Clock className="w-5 h-5" />
                  <span className="font-bold">Sisa waktu:</span>
                  <div className="flex items-center gap-1">
                    {[pad(timeLeft.hours), pad(timeLeft.minutes), pad(timeLeft.seconds)].map((val, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span
                          className="font-black text-lg px-2.5 py-1 rounded-xl"
                          style={{ background: 'var(--foreground)', color: 'var(--background)' }}
                        >
                          {val}
                        </span>
                        {i < 2 && <span className="font-black">:</span>}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Auto-check indicator */}
                <div className="flex justify-center">
                  {isAutoChecking ? (
                    <StatusCheckIndicator />
                  ) : (
                    <p className="text-xs font-bold" style={{ color: 'var(--muted-foreground)' }}>
                      Status dicek otomatis setiap 5 detik
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Transaction ID */}
            <div className="cartoon-card p-5">
              <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--foreground)' }}>
                ID Transaksi
              </h3>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 p-3 rounded-xl font-mono font-bold text-sm"
                  style={{ background: 'var(--muted)', border: '3px solid var(--foreground)', color: 'var(--foreground)' }}
                >
                  {paymentInfo?.transactionId || '-'}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={copyTransactionId}
                  className="cartoon-btn px-3 py-2.5 no-print"
                  style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </motion.button>
              </div>
            </div>

            {/* QRIS QR Code - ALWAYS visible when status is pending (not paid, not expired) */}
            {qrCodeUrl && isPending && (
              <div className="cartoon-card p-6 text-center">
                <h3
                  className="cartoon-title text-sm mb-4 flex items-center justify-center gap-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  <QrCode className="w-5 h-5" style={{ color: 'var(--primary)' }} />
                  Scan QR Code
                </h3>
                <div
                  className="inline-block p-4 rounded-2xl"
                  style={{ background: 'var(--card)', border: '3px solid var(--foreground)' }}
                >
                  <img
                    src={qrCodeUrl}
                    alt="QRIS QR Code"
                    className="w-56 h-56 mx-auto"
                  />
                </div>
                <p className="text-xs font-bold mt-3" style={{ color: 'var(--muted-foreground)' }}>
                  Scan dengan aplikasi e-wallet atau mobile banking
                </p>
                {/* Total amount display */}
                <div
                  className="mt-4 p-3 rounded-xl inline-block"
                  style={{ background: 'var(--muted)', border: '3px solid var(--foreground)' }}
                >
                  <p className="font-bold text-xs" style={{ color: 'var(--muted-foreground)' }}>Total Bayar</p>
                  <p className="font-black text-2xl" style={{ color: 'var(--primary)' }}>
                    Rp{(paymentInfo?.totalAmount ?? 0).toLocaleString('id-ID')}
                  </p>
                  {paymentInfo?.uniqueNominal ? (
                    <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      Termasuk kode unik Rp{paymentInfo.uniqueNominal.toLocaleString('id-ID')}
                    </p>
                  ) : null}
                </div>
                {/* Download QR button inside QR section */}
                <div className="mt-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadQR}
                    disabled={isDownloadingQR}
                    className="cartoon-btn px-4 py-2 text-xs inline-flex items-center gap-2 no-print"
                    style={{ background: 'var(--card)', color: 'var(--foreground)' }}
                  >
                    {isDownloadingQR ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    {isDownloadingQR ? 'Mengunduh...' : 'Download QR'}
                  </motion.button>
                </div>
              </div>
            )}

            {/* Transaction Details */}
            <div className="cartoon-card p-5 space-y-2">
              <h3 className="cartoon-title text-sm mb-3" style={{ color: 'var(--foreground)' }}>
                Detail Transaksi
              </h3>
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm" style={{ color: 'var(--muted-foreground)' }}>Jumlah</span>
                <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                  Rp{(paymentInfo?.amount ?? 0).toLocaleString('id-ID')}
                </span>
              </div>
              {paymentInfo?.uniqueNominal ? (
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm" style={{ color: 'var(--muted-foreground)' }}>Kode Unik</span>
                  <span className="font-bold" style={{ color: 'var(--secondary)' }}>
                    Rp{paymentInfo.uniqueNominal.toLocaleString('id-ID')}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm" style={{ color: 'var(--muted-foreground)' }}>Metode</span>
                <span className="font-bold flex items-center gap-1.5" style={{ color: 'var(--foreground)' }}>
                  <QrCode className="w-4 h-4" />
                  QRIS
                </span>
              </div>
              {paymentInfo?.expiredAt && (
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm" style={{ color: 'var(--muted-foreground)' }}>Berlaku hingga</span>
                  <span className="font-bold" style={{ color: 'var(--foreground)' }}>
                    {new Date(paymentInfo.expiredAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              )}
              <div
                className="pt-2 mt-2"
                style={{ borderTop: '3px solid var(--foreground)' }}
              >
                <div className="flex justify-between items-center">
                  <span className="cartoon-title text-lg" style={{ color: 'var(--foreground)' }}>Total</span>
                  <span className="font-black text-2xl" style={{ color: 'var(--primary)' }}>
                    Rp{(paymentInfo?.totalAmount ?? 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Info (after payment success) - Prominent display */}
            {isPaid && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="cartoon-card p-6 space-y-4"
                style={{
                  background: 'var(--secondary)',
                  color: 'var(--secondary-foreground)',
                  borderColor: 'var(--foreground)',
                  boxShadow: '6px 6px 0px var(--foreground)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                  >
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="cartoon-title text-lg">Produk Digital</h3>
                    <p className="text-sm font-bold opacity-80">Akses produk Anda sekarang</p>
                  </div>
                </div>

                {productDeliveryInfo ? (
                  <div className="space-y-3">
                    {productDeliveryInfo.downloadLink && (
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={productDeliveryInfo.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cartoon-btn w-full py-3.5 text-sm flex items-center justify-center gap-2"
                        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', boxShadow: '3px 3px 0px var(--foreground)' }}
                      >
                        <Download className="w-5 h-5" />
                        Download Produk
                      </motion.a>
                    )}
                    {productDeliveryInfo.googleDriveLink && (
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={productDeliveryInfo.googleDriveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cartoon-btn w-full py-3.5 text-sm flex items-center justify-center gap-2"
                        style={{ background: 'var(--accent)', color: 'var(--accent-foreground)', boxShadow: '3px 3px 0px var(--foreground)' }}
                      >
                        <ExternalLink className="w-5 h-5" />
                        Buka Google Drive
                      </motion.a>
                    )}
                    {productDeliveryInfo.accessInstructions && (
                      <div
                        className="p-4 rounded-xl text-sm"
                        style={{ background: 'rgba(0,0,0,0.15)', border: '2px solid rgba(0,0,0,0.1)' }}
                      >
                        <p className="font-bold mb-1">Petunjuk Akses:</p>
                        <p className="opacity-90 leading-relaxed">{productDeliveryInfo.accessInstructions}</p>
                      </div>
                    )}
                    {!productDeliveryInfo.downloadLink && !productDeliveryInfo.googleDriveLink && !productDeliveryInfo.accessInstructions && (
                      <div
                        className="p-4 rounded-xl text-sm"
                        style={{ background: 'rgba(0,0,0,0.15)' }}
                      >
                        <p className="font-bold">Produk sedang diproses</p>
                        <p className="opacity-80">Admin akan mengirimkan detail produk melalui WhatsApp.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="p-4 rounded-xl text-sm"
                    style={{ background: 'rgba(0,0,0,0.15)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="font-bold">Memuat info produk...</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
          {/* END PRINT AREA */}

          {/* Action Buttons - no-print */}
          <div className="space-y-3 mt-4 no-print">
            {/* Pending action buttons: Cek Status | Download QR | Batalkan Transaksi */}
            {isPending && (
              <>
                {/* Cek Status */}
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <button
                    onClick={handleCheckStatus}
                    disabled={isChecking}
                    className="cartoon-btn w-full py-3.5 text-base flex items-center justify-center gap-2"
                    style={{
                      background: 'var(--secondary)',
                      color: 'var(--secondary-foreground)',
                      boxShadow: '4px 4px 0px var(--foreground)',
                      opacity: isChecking ? 0.7 : 1,
                    }}
                  >
                    {isChecking ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-5 h-5" />
                    )}
                    {isChecking ? 'Mengecek...' : 'Cek Status Pembayaran'}
                  </button>
                </motion.div>

                {/* Download QR */}
                {qrCodeUrl && (
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    <button
                      onClick={handleDownloadQR}
                      disabled={isDownloadingQR}
                      className="cartoon-btn w-full py-3.5 text-base flex items-center justify-center gap-2"
                      style={{
                        background: 'var(--card)',
                        color: 'var(--foreground)',
                        boxShadow: '4px 4px 0px var(--foreground)',
                        opacity: isDownloadingQR ? 0.7 : 1,
                      }}
                    >
                      {isDownloadingQR ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                      {isDownloadingQR ? 'Mengunduh QR...' : 'Download QR'}
                    </button>
                  </motion.div>
                )}

                {/* Batalkan Transaksi */}
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="cartoon-btn w-full py-3.5 text-base flex items-center justify-center gap-2"
                    style={{
                      background: 'var(--destructive)',
                      color: 'var(--primary-foreground)',
                      boxShadow: '4px 4px 0px var(--foreground)',
                      opacity: isCancelling ? 0.7 : 1,
                    }}
                  >
                    {isCancelling ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    {isCancelling ? 'Membatalkan...' : 'Batalkan Transaksi'}
                  </button>
                </motion.div>
              </>
            )}

            {/* Cetak Invoice - always available */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={handlePrintInvoice}
                className="cartoon-btn w-full py-3.5 text-base flex items-center justify-center gap-2"
                style={{
                  background: 'var(--card)',
                  color: 'var(--foreground)',
                  boxShadow: '4px 4px 0px var(--foreground)',
                }}
              >
                <Printer className="w-5 h-5" />
                Cetak Invoice
              </button>
            </motion.div>

            {/* Kembali ke Beranda - always available */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={handleBackToHome}
                className="cartoon-btn w-full py-3.5 text-base flex items-center justify-center gap-2"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  boxShadow: '4px 4px 0px var(--foreground)',
                }}
              >
                <Home className="w-5 h-5" />
                Kembali ke Beranda
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
