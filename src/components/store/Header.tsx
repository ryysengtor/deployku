'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ClipboardList, Users, MessageCircle, Menu, X,
  Instagram, Send, Music, Youtube,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Header() {
  const { setView, searchQuery, setSearchQuery, setSelectedCategory, siteName } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGoHome = () => {
    setView('home');
    setSelectedCategory('all');
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setView('home');
  };

  const handleCekTransaksi = () => {
    setView('check-transaction');
    setMobileMenuOpen(false);
  };

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Send, href: '#', label: 'Telegram' },
    { icon: Music, href: '#', label: 'TikTok' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="sticky top-0 z-50 w-full"
      style={{ background: 'var(--background)', borderBottom: '3px solid var(--foreground)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <motion.button
            onClick={handleGoHome}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <div
              className="w-10 h-10 flex items-center justify-center rounded-xl"
              style={{
                background: 'var(--primary)',
                border: '3px solid var(--foreground)',
                boxShadow: '3px 3px 0px var(--foreground)',
              }}
            >
              <span style={{ color: 'var(--primary-foreground)' }} className="font-black text-lg">C</span>
            </div>
            <h1
              className="text-xl md:text-2xl font-black tracking-tight cartoon-title"
              style={{ color: 'var(--foreground)' }}
            >
              {siteName.split(' ').map((word, i) => (
                <span key={i}>
                  {i > 0 && ' '}
                  <span style={i === 1 ? { color: 'var(--primary)' } : undefined}>{word}</span>
                </span>
              ))}
            </h1>
          </motion.button>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--foreground)' }} />
              <input
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Cari produk..."
                className="cartoon-input w-full pl-10 pr-4 py-2"
                style={{ color: 'var(--foreground)' }}
              />
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCekTransaksi}
              className="cartoon-btn flex items-center gap-2 px-4 py-2 text-sm"
              style={{
                background: 'var(--secondary)',
                color: 'var(--foreground)',
                boxShadow: '3px 3px 0px var(--foreground)',
              }}
            >
              <ClipboardList className="w-4 h-4" />
              Cek Transaksi
            </motion.button>

            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cartoon-btn flex items-center gap-2 px-4 py-2 text-sm cursor-pointer"
              style={{
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                boxShadow: '3px 3px 0px var(--foreground)',
              }}
            >
              <Users className="w-4 h-4" />
              Join Saluran
            </motion.a>

            <motion.a
              href="https://wa.me/6283856801224"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="cartoon-btn flex items-center gap-2 px-4 py-2 text-sm cursor-pointer"
              style={{
                background: '#25D366',
                color: 'white',
                boxShadow: '3px 3px 0px var(--foreground)',
              }}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </motion.a>

            {/* Social Icons Row */}
            <div className="flex items-center gap-1 ml-1">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: 'var(--foreground)' }}
                  title={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl"
            style={{
              background: 'var(--primary)',
              border: '3px solid var(--foreground)',
              boxShadow: '3px 3px 0px var(--foreground)',
            }}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" style={{ color: 'var(--primary-foreground)' }} />
            ) : (
              <Menu className="w-5 h-5" style={{ color: 'var(--primary-foreground)' }} />
            )}
          </motion.button>
        </div>

        {/* Mobile Search - always visible */}
        <div className="md:hidden mt-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--foreground)' }} />
            <input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Cari produk..."
              className="cartoon-input w-full pl-10 pr-4 py-2"
              style={{ color: 'var(--foreground)' }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: '3px solid var(--foreground)', background: 'var(--background)' }}
          >
            <div className="px-4 py-3 flex flex-col gap-2">
              {/* Cek Transaksi */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCekTransaksi}
                className="cartoon-btn w-full flex items-center gap-3 px-4 py-3 text-sm justify-start"
                style={{
                  background: 'var(--secondary)',
                  color: 'var(--foreground)',
                  boxShadow: '4px 4px 0px var(--foreground)',
                }}
              >
                <ClipboardList className="w-5 h-5" />
                Cek Transaksi
              </motion.button>

              {/* Join Saluran */}
              <motion.a
                href="#"
                whileTap={{ scale: 0.95 }}
                className="cartoon-btn w-full flex items-center gap-3 px-4 py-3 text-sm justify-start"
                style={{
                  background: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                  boxShadow: '4px 4px 0px var(--foreground)',
                }}
              >
                <Users className="w-5 h-5" />
                Join Saluran
              </motion.a>

              {/* WhatsApp Admin */}
              <motion.a
                href="https://wa.me/6283856801224"
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.95 }}
                className="cartoon-btn w-full flex items-center gap-3 px-4 py-3 text-sm justify-start"
                style={{
                  background: '#25D366',
                  color: 'white',
                  boxShadow: '4px 4px 0px var(--foreground)',
                }}
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Admin
              </motion.a>

              {/* Social Links */}
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{
                  background: 'var(--card)',
                  border: '2px solid var(--muted)',
                }}
              >
                <span className="text-xs font-bold mr-1" style={{ color: 'var(--muted-foreground)' }}>Sosmed:</span>
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:scale-110"
                    style={{ color: 'var(--foreground)' }}
                    title={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
