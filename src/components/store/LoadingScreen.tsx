'use client';

import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: 'var(--background)' }}
    >
      {/* ── spinning compass ── */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        className="mb-8"
      >
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center"
          style={{
            background: 'var(--primary)',
            border: '4px solid var(--foreground)',
            borderRadius: '18px',
            boxShadow: '5px 5px 0px var(--foreground)',
          }}
        >
          <Compass className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: 'var(--primary-foreground)' }} />
        </div>
      </motion.div>

      {/* ── three bouncing dots ── */}
      <div className="flex items-center gap-3 mb-6">
        {[
          { bg: 'var(--primary)', shadow: 'var(--primary)' },
          { bg: 'var(--secondary)', shadow: 'var(--secondary)' },
          { bg: 'var(--accent)', shadow: 'var(--accent)' },
        ].map((dot, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -18, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
            className="w-5 h-5 rounded-full"
            style={{
              background: dot.bg,
              border: '3px solid var(--foreground)',
              boxShadow: `3px 3px 0px var(--foreground)`,
            }}
          />
        ))}
      </div>

      {/* ── "Memuat..." text with pulse ── */}
      <motion.p
        animate={{ opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        className="text-lg sm:text-xl font-black tracking-wide"
        style={{ color: 'var(--foreground)' }}
      >
        Memuat...
      </motion.p>

      {/* ── cartoon progress bar ── */}
      <div
        className="mt-5 w-44 sm:w-56 h-3 rounded-full overflow-hidden"
        style={{
          background: 'var(--muted)',
          border: '3px solid var(--foreground)',
          boxShadow: '3px 3px 0px var(--foreground)',
        }}
      >
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          className="h-full w-1/2 rounded-full"
          style={{ background: 'var(--primary)' }}
        />
      </div>
    </div>
  );
}
