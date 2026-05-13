'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RainDrop {
  id: number;
  x: number;
  delay: number;
  duration: number;
  height: number;
  opacity: number;
}

export default function RainEffect() {
  const [drops, setDrops] = useState<RainDrop[]>(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 0.5 + Math.random() * 0.5,
      height: 15 + Math.random() * 25,
      opacity: 0.2 + Math.random() * 0.5,
    }))
  );
  const [lightning, setLightning] = useState(false);

  useEffect(() => {
    // Random lightning
    const lightningTimer = setInterval(() => {
      if (Math.random() > 0.7) {
        setLightning(true);
        setTimeout(() => setLightning(false), 150);
        setTimeout(() => {
          if (Math.random() > 0.5) {
            setLightning(true);
            setTimeout(() => setLightning(false), 100);
          }
        }, 300);
      }
    }, 4000);

    return () => clearInterval(lightningTimer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[#2D3436]/30" />

      {/* Rain drops */}
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          initial={{ y: -drop.height, opacity: 0 }}
          animate={{
            y: ['0vh', '110vh'],
            opacity: [0, drop.opacity, drop.opacity, 0],
          }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute w-[2px] bg-gradient-to-b from-transparent via-blue-300 to-transparent rounded-full"
          style={{
            left: `${drop.x}%`,
            height: `${drop.height}px`,
            transform: 'rotate(15deg)',
          }}
        />
      ))}

      {/* Lightning flash */}
      <AnimatePresence>
        {lightning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0, 0.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white"
          />
        )}
      </AnimatePresence>

      {/* Puddle reflections at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-400/10 to-transparent" />
    </div>
  );
}
