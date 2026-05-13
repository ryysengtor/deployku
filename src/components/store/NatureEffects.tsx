'use client';

import { useStore, ThemeSlug } from '@/store/useStore';

/* ──────────────────────────────────────────
   Small pure-CSS effect pieces – each uses
   the animation classes from globals.css
   ────────────────────────────────────────── */

function Leaf({ index }: { index: number }) {
  const left = 3 + (index * 7.3) % 93;
  const size = 14 + (index * 2.5) % 12;
  const dur = 9 + (index * 1.1) % 7;
  const delay = (index * 0.8) % 6;
  const hue = [
    'var(--secondary)', 'var(--primary)', 'var(--accent)', 'var(--ring)', 'var(--secondary)',
    'var(--primary)', 'var(--accent)', 'var(--secondary)', 'var(--ring)', 'var(--secondary)',
  ];

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
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ fill: hue[index % hue.length] }}>
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 8.5-3 10-7s1-8 1-8-1.5.5-2 1z" />
      </svg>
    </div>
  );
}

function Cloud({ index }: { index: number }) {
  const top = 3 + (index * 10) % 20;
  const left = 5 + (index * 17) % 75;
  const scale = 0.4 + (index * 0.12) % 0.6;
  const dur = 6 + (index * 1.4) % 5;
  const delay = (index * 1.1) % 4;

  return (
    <div
      className="cloud-float absolute pointer-events-none opacity-20"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        animationDuration: `${dur}s`,
        animationDelay: `${delay}s`,
        transform: `scale(${scale})`,
      }}
    >
      <svg viewBox="0 0 120 50" width="90" height="38" fill="white">
        <ellipse cx="60" cy="35" rx="55" ry="15" />
        <ellipse cx="40" cy="25" rx="25" ry="20" />
        <ellipse cx="70" cy="20" rx="30" ry="22" />
        <ellipse cx="95" cy="30" rx="18" ry="12" />
      </svg>
    </div>
  );
}

function SunRay({ index }: { index: number }) {
  const rot = index * 30;

  return (
    <div
      className="sun-rays absolute pointer-events-none opacity-15"
      style={{
        top: '-30px',
        right: '-30px',
        width: '200px',
        height: '200px',
        transformOrigin: 'center center',
        animationDuration: '20s',
      }}
    >
      <svg viewBox="0 0 200 200" width="200" height="200">
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="100"
            y1="10"
            x2="100"
            y2="0"
            stroke="var(--ring)"
            strokeWidth="4"
            strokeLinecap="round"
            transform={`rotate(${rot + i * 30} 100 100)`}
          />
        ))}
        <circle cx="100" cy="100" r="35" style={{ fill: 'var(--ring)' }} opacity="0.6" />
      </svg>
    </div>
  );
}

function Firefly({ index }: { index: number }) {
  const left = 5 + (index * 7.8) % 88;
  const top = 10 + (index * 8.3) % 75;
  const size = 4 + (index * 0.7) % 4;
  const dur = 3 + (index * 0.6) % 3;
  const delay = (index * 0.5) % 4;
  const colors = ['var(--ring)', 'var(--accent)', 'var(--primary)', 'var(--secondary)', 'var(--primary)'];

  return (
    <div
      className="firefly absolute pointer-events-none opacity-30"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
        background: colors[index % colors.length],
        borderRadius: '50%',
        boxShadow: `0 0 ${size * 2}px ${colors[index % colors.length]}`,
        animationDuration: `${dur}s`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function TwinklingStar({ index }: { index: number }) {
  const left = 4 + (index * 7.1) % 90;
  const top = 3 + (index * 9.2) % 80;
  const size = 6 + (index * 1.3) % 8;
  const dur = 1.2 + (index * 0.25) % 1.5;
  const delay = (index * 0.35) % 3;

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
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ fill: 'var(--ring)' }}>
        <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
      </svg>
    </div>
  );
}

function BouncingStar({ index }: { index: number }) {
  const left = 5 + (index * 7.5) % 85;
  const top = 8 + (index * 9) % 65;
  const size = 10 + (index * 1.5) % 10;
  const dur = 1.3 + (index * 0.2) % 0.8;
  const delay = (index * 0.3) % 2;
  const colors = ['var(--primary)', 'var(--ring)', 'var(--accent)', 'var(--secondary)', 'var(--primary)'];

  return (
    <div
      className="animate-bounce-fun absolute pointer-events-none opacity-25"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
        animationDuration: `${dur}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <svg viewBox="0 0 24 24" width={size} height={size} style={{ fill: colors[index % colors.length] }}>
        <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
      </svg>
    </div>
  );
}

/* ──────────────────────────────────────────
   Theme → effects mapping
   ────────────────────────────────────────── */

const EFFECTS_MAP: Record<ThemeSlug, { leaves?: number; clouds?: number; sunRays?: number; fireflies?: number; stars?: number; bouncingStars?: number }> = {
  'craig-of-the-creek': { leaves: 12, clouds: 8 },
  'adventure-cartoon': { sunRays: 1, clouds: 10 },
  'forest-cartoon': { leaves: 15, fireflies: 12 },
  'night-adventure': { fireflies: 15, stars: 14 },
  'cartoon-network': { bouncingStars: 12, clouds: 8 },
};

/* ──────────────────────────────────────────
   Main component
   ────────────────────────────────────────── */

export default function NatureEffects() {
  const { currentTheme } = useStore();
  const config = EFFECTS_MAP[currentTheme];

  // Nothing to render for unknown themes
  if (!config) return null;

  const hasAnyEffect = Object.values(config).some((v) => v && v > 0);
  if (!hasAnyEffect) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Leaves */}
      {config.leaves
        ? Array.from({ length: config.leaves }).map((_, i) => <Leaf key={`leaf-${i}`} index={i} />)
        : null}

      {/* Clouds */}
      {config.clouds
        ? Array.from({ length: config.clouds }).map((_, i) => <Cloud key={`cloud-${i}`} index={i} />)
        : null}

      {/* Sun Rays */}
      {config.sunRays
        ? Array.from({ length: config.sunRays }).map((_, i) => <SunRay key={`sun-${i}`} index={i} />)
        : null}

      {/* Fireflies */}
      {config.fireflies
        ? Array.from({ length: config.fireflies }).map((_, i) => <Firefly key={`fly-${i}`} index={i} />)
        : null}

      {/* Twinkling Stars */}
      {config.stars
        ? Array.from({ length: config.stars }).map((_, i) => <TwinklingStar key={`tstar-${i}`} index={i} />)
        : null}

      {/* Bouncing Stars */}
      {config.bouncingStars
        ? Array.from({ length: config.bouncingStars }).map((_, i) => <BouncingStar key={`bstar-${i}`} index={i} />)
        : null}
    </div>
  );
}
