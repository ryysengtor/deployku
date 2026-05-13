'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { TreePine, Compass, Star, ArrowRight } from 'lucide-react';

/* ── staggered entrance helpers ── */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 14 } },
};

/* ── decorative sub-components ── */

function FloatingLeaf({ index }: { index: number }) {
  const left = 5 + (index * 7.5) % 90;
  const size = 16 + (index * 3) % 14;
  const dur = 8 + (index * 1.7) % 6;
  const delay = (index * 0.9) % 5;
  const colors = ['#6BCB77', '#43A047', '#8BC34A', '#FFD93D', '#FF8C42'];
  const color = colors[index % colors.length];

  return (
    <div
      className="leaf-fall absolute pointer-events-none opacity-30"
      style={{
        left: `${left}%`,
        width: size,
        height: size,
        animationDuration: `${dur}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <svg viewBox="0 0 24 24" fill={color} width={size} height={size}>
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 8.5-3 10-7s1-8 1-8-1.5.5-2 1z" />
      </svg>
    </div>
  );
}

function FloatingCloud({ index }: { index: number }) {
  const top = 4 + (index * 12) % 22;
  const scale = 0.5 + (index * 0.15) % 0.6;
  const dur = 6 + (index * 1.3) % 4;
  const delay = (index * 1.2) % 4;

  return (
    <div
      className="cloud-float absolute pointer-events-none opacity-20"
      style={{
        top: `${top}%`,
        left: `${10 + (index * 18) % 70}%`,
        animationDuration: `${dur}s`,
        animationDelay: `${delay}s`,
        transform: `scale(${scale})`,
      }}
    >
      <svg viewBox="0 0 120 50" width="100" height="42" fill="white">
        <ellipse cx="60" cy="35" rx="55" ry="15" />
        <ellipse cx="40" cy="25" rx="25" ry="20" />
        <ellipse cx="70" cy="20" rx="30" ry="22" />
        <ellipse cx="95" cy="30" rx="18" ry="12" />
      </svg>
    </div>
  );
}

function SparkleStar({ index }: { index: number }) {
  const left = 8 + (index * 7.2) % 84;
  const top = 6 + (index * 9.5) % 70;
  const size = 10 + (index * 2) % 10;
  const dur = 1.2 + (index * 0.3) % 1.3;
  const delay = (index * 0.4) % 3;

  return (
    <div
      className="animate-sparkle absolute pointer-events-none"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
        animationDuration: `${dur}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <Star size={size} className="text-[#FFD93D]" fill="#FFD93D" strokeWidth={0} />
    </div>
  );
}

/* ── SVG forest scene at the bottom ── */
function ForestScene() {
  return (
    <svg
      className="absolute bottom-0 left-0 w-full pointer-events-none"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      style={{ height: '30vh' }}
    >
      {/* Ground / creek */}
      <path d="M0,260 C200,240 400,280 600,250 C800,220 1000,270 1200,240 C1300,230 1400,250 1440,245 L1440,320 L0,320Z" fill="#6BCB77" opacity="0.4" />
      <path d="M0,280 C300,270 500,290 720,275 C940,260 1100,285 1440,270 L1440,320 L0,320Z" fill="#43A047" opacity="0.5" />

      {/* Creek water */}
      <path d="M400,290 C500,285 550,295 650,288 C750,281 800,293 900,287 L900,320 L400,320Z" fill="#4FC0D0" opacity="0.5" />
      <path d="M420,295 C520,290 560,298 660,292 C760,286 790,296 880,290 L880,310 L420,310Z" fill="#4FC0D0" opacity="0.3" />

      {/* Trees */}
      {/* Tree 1 - big left */}
      <rect x="80" y="200" width="18" height="70" fill="#5D4037" rx="4" />
      <ellipse cx="89" cy="170" rx="50" ry="60" fill="#2E7D32" opacity="0.85" />
      <ellipse cx="89" cy="155" rx="38" ry="40" fill="#43A047" opacity="0.8" />

      {/* Tree 2 */}
      <rect x="250" y="210" width="14" height="60" fill="#5D4037" rx="3" />
      <ellipse cx="257" cy="185" rx="40" ry="50" fill="#1B5E20" opacity="0.8" />
      <ellipse cx="257" cy="172" rx="30" ry="35" fill="#388E3C" opacity="0.75" />

      {/* Tree 3 - tall center */}
      <rect x="620" y="160" width="22" height="110" fill="#4E342E" rx="5" />
      <ellipse cx="631" cy="120" rx="60" ry="70" fill="#2E7D32" opacity="0.9" />
      <ellipse cx="631" cy="100" rx="45" ry="50" fill="#43A047" opacity="0.85" />
      <ellipse cx="631" cy="85" rx="30" ry="32" fill="#66BB6A" opacity="0.7" />

      {/* Tree 4 */}
      <rect x="1050" y="195" width="16" height="75" fill="#5D4037" rx="4" />
      <ellipse cx="1058" cy="165" rx="48" ry="55" fill="#1B5E20" opacity="0.85" />
      <ellipse cx="1058" cy="150" rx="35" ry="38" fill="#388E3C" opacity="0.8" />

      {/* Tree 5 - right */}
      <rect x="1280" y="205" width="18" height="65" fill="#4E342E" rx="4" />
      <ellipse cx="1289" cy="175" rx="52" ry="58" fill="#2E7D32" opacity="0.85" />
      <ellipse cx="1289" cy="160" rx="38" ry="42" fill="#4CAF50" opacity="0.75" />

      {/* Small bushes */}
      <ellipse cx="450" cy="268" rx="30" ry="18" fill="#388E3C" opacity="0.6" />
      <ellipse cx="850" cy="262" rx="25" ry="16" fill="#2E7D32" opacity="0.5" />
      <ellipse cx="1150" cy="270" rx="28" ry="17" fill="#388E3C" opacity="0.55" />
    </svg>
  );
}

/* ── main component ── */
export default function LandingPage() {
  const { setHasVisitedLanding, setView } = useStore();

  const handleEnter = () => {
    setHasVisitedLanding(true);
    setView('home');
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden">
      {/* ── gradient background ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(175deg, #1B5E20 0%, #2E7D32 18%, #43A047 32%, #6BCB77 48%, #FFD93D 65%, #FF8C42 82%, #FF6B35 100%)',
        }}
      />

      {/* ── decorative elements ── */}
      {Array.from({ length: 12 }).map((_, i) => (
        <FloatingLeaf key={`leaf-${i}`} index={i} />
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <SparkleStar key={`star-${i}`} index={i} />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <FloatingCloud key={`cloud-${i}`} index={i} />
      ))}

      {/* ── forest scene ── */}
      <ForestScene />

      {/* ── sun ── */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-12 pointer-events-none">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.06, 1] }}
          transition={{ rotate: { duration: 40, repeat: Infinity, ease: 'linear' }, scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
          className="relative"
        >
          <svg width="80" height="80" viewBox="0 0 80 80" className="sm:w-[110px] sm:h-[110px]">
            {Array.from({ length: 10 }).map((_, i) => (
              <line
                key={i}
                x1="40"
                y1="6"
                x2="40"
                y2="0"
                stroke="#FFD93D"
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${i * 36} 40 40)`}
                opacity="0.7"
              />
            ))}
            <circle cx="40" cy="40" r="22" fill="#FFD93D" stroke="#FF8C42" strokeWidth="3" />
            <circle cx="34" cy="37" r="2.5" fill="#FF8C42" />
            <circle cx="46" cy="37" r="2.5" fill="#FF8C42" />
            <path d="M34 46 Q40 52 46 46" fill="none" stroke="#FF8C42" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </motion.div>
      </div>

      {/* ── content ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg"
      >
        {/* Logo "C" circle */}
        <motion.div variants={item} className="mb-4">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              border: '4px solid var(--foreground)',
              boxShadow: '5px 5px 0px var(--foreground)',
            }}
          >
            <span className="text-white font-black text-4xl sm:text-5xl select-none" style={{ textShadow: '2px 2px 0px var(--foreground)' }}>
              C
            </span>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={item}
          className="text-4xl sm:text-5xl md:text-6xl text-white leading-tight"
          style={{ textShadow: '3px 3px 0px var(--foreground), 6px 6px 0px rgba(0,0,0,0.15)', fontWeight: 900, letterSpacing: '-0.02em' }}
        >
          Craig Of
          <br />
          The Creek
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={item}
          className="mt-2 text-xl sm:text-2xl font-extrabold tracking-wide"
          style={{ color: 'var(--ring)', textShadow: '2px 2px 0px var(--foreground)' }}
        >
          Digital Store
        </motion.p>

        {/* Tagline */}
        <motion.p
          variants={item}
          className="mt-3 text-sm sm:text-base font-semibold text-white/80 max-w-xs"
          style={{ textShadow: '1px 1px 0px var(--foreground)' }}
        >
          Petualangan Digital Dimulai di Sini!
        </motion.p>

        {/* Decorative icons row */}
        <motion.div variants={item} className="flex items-center gap-4 mt-5 opacity-70">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <TreePine className="w-5 h-5" style={{ color: 'var(--secondary)' }} />
          </motion.div>
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Compass className="w-5 h-5" style={{ color: 'var(--ring)' }} />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Star className="w-5 h-5" style={{ color: 'var(--primary)' }} fill="currentColor" />
          </motion.div>
        </motion.div>

        {/* Enter button with bounce animation */}
        <motion.div variants={item} className="mt-8">
          <motion.button
            onClick={handleEnter}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-8 py-4 text-lg sm:text-xl font-extrabold cursor-pointer"
            style={{
              background: 'var(--primary)',
              color: 'var(--primary-foreground)',
              border: '4px solid var(--foreground)',
              borderRadius: '20px',
              boxShadow: '5px 5px 0px var(--foreground)',
              textShadow: '1px 1px 0px rgba(0,0,0,0.3)',
              letterSpacing: '0.02em',
            }}
          >
            Masuk Website
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight className="w-6 h-6" />
            </motion.div>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
