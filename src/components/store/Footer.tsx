'use client';

import { motion } from 'framer-motion';
import { Heart, Instagram, MessageCircle, Music2, Facebook } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Footer() {
  const { siteName, siteSlogan, setView } = useStore();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: MessageCircle, label: 'WhatsApp', href: '#' },
    { icon: Instagram, label: 'Instagram', href: '#' },
    { icon: Music2, label: 'TikTok', href: '#' },
    { icon: Facebook, label: 'Facebook', href: '#' },
  ];

  const navLinks = [
    { label: 'Cek Transaksi', onClick: () => setView('check-transaction') },
    { label: 'Cara Pembelian', onClick: () => {} },
    { label: 'Persyaratan', onClick: () => {} },
    { label: 'Sosmed', onClick: () => {} },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className="mt-auto w-full"
      style={{
        background: 'var(--foreground)',
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        borderTop: '3px solid var(--border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Slogan */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 flex items-center justify-center rounded-lg"
                style={{
                  background: 'var(--primary)',
                  border: '2px solid var(--background)',
                }}
              >
                <span style={{ color: 'var(--primary-foreground)' }} className="font-black text-sm">C</span>
              </div>
              <span className="font-black text-lg" style={{ color: 'var(--background)' }}>
                {siteName.split(' ').map((word, i) => (
                  <span key={i}>
                    {i > 0 && ' '}
                    <span style={i === 1 ? { color: 'var(--primary)' } : undefined}>{word}</span>
                  </span>
                ))}
              </span>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--background)', opacity: 0.6 }}>
              {siteSlogan}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {navLinks.map((link) => (
              <motion.button
                key={link.label}
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={link.onClick}
                className="text-sm font-bold transition-colors"
                style={{ color: 'var(--background)', opacity: 0.7 }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.opacity = '1';
                  (e.target as HTMLElement).style.color = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.opacity = '0.7';
                  (e.target as HTMLElement).style.color = 'var(--background)';
                }}
              >
                {link.label}
              </motion.button>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
                style={{
                  background: 'var(--background)',
                  opacity: 0.15,
                  border: '2px solid var(--background)',
                  borderRadius: '12px',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--primary)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
                  (e.currentTarget as HTMLElement).style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--background)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--background)';
                  (e.currentTarget as HTMLElement).style.opacity = '0.15';
                }}
                aria-label={link.label}
              >
                <link.icon className="w-4 h-4" style={{ color: 'var(--background)' }} />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div
          className="my-4 h-px"
          style={{ background: 'var(--background)', opacity: 0.1 }}
        />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-sm font-bold" style={{ color: 'var(--background)', opacity: 0.4 }}>
          <span>&copy; {currentYear} {siteName}</span>
          <span style={{ color: 'var(--primary)' }}>&bull;</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3" style={{ color: 'var(--primary)', fill: 'var(--primary)' }} />
          </span>
        </div>
      </div>
    </motion.footer>
  );
}
