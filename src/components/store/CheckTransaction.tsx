'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ClipboardList, CheckCircle, Clock, XCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface TransactionData {
  transactionId: string;
  productName: string;
  variantLabel: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  totalAmount: number;
  uniqueNominal: number;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'success' | 'expired' | 'cancel';
  createdAt: string;
  expiredAt?: string;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Menunggu Pembayaran', bg: 'var(--muted)', icon: Clock },
  paid: { label: 'Sudah Dibayar', bg: 'var(--secondary)', icon: CheckCircle },
  success: { label: 'Berhasil', bg: 'var(--secondary)', icon: CheckCircle },
  expired: { label: 'Kedaluwarsa', bg: 'var(--primary)', icon: AlertTriangle },
  cancel: { label: 'Dibatalkan', bg: 'var(--destructive)', icon: XCircle },
};

export default function CheckTransaction() {
  const { currentView, setView } = useStore();
  const [transactionId, setTransactionId] = useState('');
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!transactionId.trim()) return;
    setIsSearching(true);
    setError('');
    setTransaction(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/transactions/${transactionId.trim()}`);
      if (res.ok) {
        const data = await res.json();
        const txData = data.data || data;
        setTransaction(txData);
      } else {
        setError('Transaksi tidak ditemukan');
      }
    } catch {
      setError('Gagal mencari transaksi');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBack = () => {
    setView('home');
  };

  if (currentView !== 'check-transaction') return null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05, x: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="flex items-center gap-2 mb-6 cartoon-btn px-4 py-2 text-sm"
          style={{
            background: 'var(--card)',
            color: 'var(--foreground)',
            boxShadow: '3px 3px 0px var(--foreground)',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </motion.button>

        {/* Title */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 mb-4 cartoon-card"
            style={{ background: 'var(--primary)' }}
          >
            <ClipboardList className="w-8 h-8" style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <h2 className="text-2xl font-black cartoon-title" style={{ color: 'var(--foreground)' }}>
            Cek Transaksi
          </h2>
          <p className="font-bold text-sm mt-1" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
            Masukkan ID transaksi untuk melihat status
          </p>
        </div>

        {/* Search Input */}
        <div
          className="p-6 mb-6 cartoon-card"
          style={{ background: 'var(--card)' }}
        >
          <div className="flex gap-3">
            <input
              value={transactionId}
              onChange={(e) => { setTransactionId(e.target.value); setError(''); }}
              placeholder="Masukkan ID Transaksi"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 cartoon-input px-4 py-2"
              style={{ color: 'var(--foreground)' }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={isSearching}
              className="cartoon-btn px-6 py-2 flex items-center justify-center"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                boxShadow: '3px 3px 0px var(--foreground)',
              }}
            >
              {isSearching ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 mb-4 flex items-center gap-3 cartoon-card"
              style={{ background: 'var(--destructive)', borderColor: 'var(--foreground)' }}
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary-foreground)' }} />
              <p className="font-bold text-sm" style={{ color: 'var(--primary-foreground)' }}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction Result */}
        <AnimatePresence>
          {transaction && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="p-6 space-y-4 cartoon-card"
              style={{ background: 'var(--card)' }}
            >
              {/* Status Badge */}
              {(() => {
                const config = STATUS_CONFIG[transaction.status] || STATUS_CONFIG.pending;
                const StatusIcon = config.icon;
                const isPaid = transaction.status === 'paid' || transaction.status === 'success';
                const isPending = transaction.status === 'pending';
                return (
                  <div
                    className="p-4 flex items-center gap-3"
                    style={{
                      background: config.bg,
                      border: '3px solid var(--foreground)',
                      borderRadius: '16px',
                    }}
                  >
                    <StatusIcon
                      className="w-6 h-6 flex-shrink-0"
                      style={{
                        color: isPaid ? 'var(--primary-foreground)' : isPending ? 'var(--foreground)' : 'var(--primary-foreground)',
                      }}
                    />
                    <span
                      className="font-black text-lg"
                      style={{
                        color: isPaid ? 'var(--primary-foreground)' : isPending ? 'var(--foreground)' : 'var(--primary-foreground)',
                      }}
                    >
                      {config.label}
                    </span>
                  </div>
                );
              })()}

              {/* Transaction Details */}
              <div className="space-y-3">
                {[
                  { label: 'ID Transaksi', value: transaction.transactionId, mono: true },
                  { label: 'Produk', value: transaction.productName },
                  ...(transaction.variantLabel ? [{ label: 'Varian', value: transaction.variantLabel }] : []),
                  { label: 'Metode Bayar', value: transaction.paymentMethod.toUpperCase() },
                  { label: 'Total', value: `Rp${transaction.totalAmount.toLocaleString('id-ID')}`, highlight: true },
                  {
                    label: 'Tanggal',
                    value: new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center py-2"
                    style={{ borderBottom: '2px solid var(--border)', opacity: 0.8 }}
                  >
                    <span className="font-bold text-sm" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                      {item.label}
                    </span>
                    <span
                      className={`font-bold text-sm ${item.mono ? 'font-mono' : ''}`}
                      style={{ color: item.highlight ? 'var(--primary)' : 'var(--foreground)' }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State after search */}
        {searched && !transaction && !error && !isSearching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="font-bold" style={{ color: 'var(--foreground)', opacity: 0.4 }}>
              Masukkan ID transaksi untuk mulai pencarian
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
