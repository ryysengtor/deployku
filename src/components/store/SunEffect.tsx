'use client';

import { motion } from 'framer-motion';

interface CloudProps {
  x: number;
  y: number;
  scale: number;
  duration: number;
  delay: number;
}

function Cloud({ x, y, scale, duration, delay }: CloudProps) {
  return (
    <motion.div
      initial={{ x: '-200px', opacity: 0 }}
      animate={{ x: 'calc(100vw + 200px)', opacity: 1 }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      className="absolute"
      style={{ top: `${y}%`, transform: `scale(${scale})` }}
    >
      <div className="relative">
        {/* Cloud shape using CSS */}
        <div className="w-32 h-10 bg-white/80 rounded-full border-[3px] border-[#2D3436]/10 relative">
          <div className="absolute -top-4 left-4 w-16 h-12 bg-white/80 rounded-full border-[3px] border-[#2D3436]/10" />
          <div className="absolute -top-6 left-12 w-20 h-14 bg-white/80 rounded-full border-[3px] border-[#2D3436]/10" />
          <div className="absolute -top-3 right-4 w-12 h-10 bg-white/80 rounded-full border-[3px] border-[#2D3436]/10" />
        </div>
      </div>
    </motion.div>
  );
}

export default function SunEffect() {
  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Warm overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFD166]/10 via-transparent to-[#FF6B35]/5" />

      {/* Sun */}
      <div className="absolute -top-10 -right-10 md:top-4 md:right-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="relative"
        >
          {/* Sun rays */}
          <div className="absolute inset-0 w-32 h-32 md:w-48 md:h-48">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute left-1/2 top-1/2 w-2 md:w-3 bg-[#FFD166] rounded-full"
                style={{
                  height: `${30 + (i % 2) * 15}px`,
                  transformOrigin: 'center bottom',
                  transform: `translate(-50%, -100%) rotate(${i * 30}deg) translateY(-50px)`,
                }}
              />
            ))}
          </div>

          {/* Sun body */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-[#FFD166] to-[#FF6B35] rounded-full border-[4px] border-[#2D3436]/20 shadow-[0_0_60px_rgba(255,209,102,0.4)]"
          >
            {/* Sun face */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex gap-2 mt-2">
                <div className="w-2 h-2 bg-[#2D3436]/60 rounded-full" />
                <div className="w-2 h-2 bg-[#2D3436]/60 rounded-full" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Clouds */}
      <Cloud x={5} y={8} scale={0.7} duration={35} delay={0} />
      <Cloud x={15} y={15} scale={1} duration={45} delay={10} />
      <Cloud x={60} y={5} scale={0.5} duration={30} delay={5} />
      <Cloud x={80} y={20} scale={0.8} duration={40} delay={15} />

      {/* Sparkle particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-2 h-2 bg-[#FFD166] rounded-full"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 60}%`,
          }}
        />
      ))}
    </div>
  );
}
