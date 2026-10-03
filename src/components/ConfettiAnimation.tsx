import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfettiPiece {
  id: string;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  shape: 'circle' | 'square' | 'sparkle';
  targetX: number;
  targetY: number;
  duration: number;
  delay: number;
}

const SHIMMERING_COLORS = [
  '#C9A96E', // DRIPEON Store Signature Gold
  '#DFBA7D', // Premium Brass
  '#09a363', // Emerald Green
  '#10b981', // Vivid Mint Green
  '#ffffff', // Pristine White
  '#1e3d2f', // Forest Green Accent
];

export default function ConfettiAnimation() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const handleTrigger = () => {
      const newPieces: ConfettiPiece[] = [];
      const pieceCount = 75; // Generous premium burst

      for (let i = 0; i < pieceCount; i++) {
        // Spawn particles in a nice fan-like burst from the bottom third or center
        const startX = window.innerWidth / 2 + (Math.random() * 120 - 60);
        const startY = window.innerHeight * 0.45 + (Math.random() * 60 - 30);

        // Project them outward and let them drift down
        const angle = Math.random() * Math.PI * 2;
        const distance = 150 + Math.random() * 350;
        const targetX = startX + Math.cos(angle) * distance;
        // Gravity pulls them down, so targeted Y is weighted downwards
        const targetY = startY + Math.sin(angle) * distance + (250 + Math.random() * 200);

        newPieces.push({
          id: `confetti-${Date.now()}-${i}-${Math.random()}`,
          x: startX,
          y: startY,
          color: SHIMMERING_COLORS[Math.floor(Math.random() * SHIMMERING_COLORS.length)],
          size: 4 + Math.random() * 10,
          rotation: Math.random() * 360,
          shape: ['circle', 'square', 'sparkle'][Math.floor(Math.random() * 3)] as any,
          targetX,
          targetY,
          duration: 1.8 + Math.random() * 1.5,
          delay: Math.random() * 0.15,
        });
      }

      setPieces((prev) => [...prev, ...newPieces]);

      // Automatically prune after longest animation duration
      setTimeout(() => {
        setPieces((prev) => prev.filter((piece) => !newPieces.includes(piece)));
      }, 4000);
    };

    window.addEventListener('coupon-applied-confetti', handleTrigger);
    return () => {
      window.removeEventListener('coupon-applied-confetti', handleTrigger);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden">
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.div
            key={p.id}
            initial={{
              x: p.x,
              y: p.y,
              scale: 0,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              x: [p.x, (p.x + p.targetX) / 2, p.targetX],
              y: [p.y, (p.y + p.targetY) * 0.4, p.targetY],
              scale: [0, 1.3, 0.8, 0],
              rotate: p.rotation + 720,
              opacity: [1, 1, 0.8, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.1, 0.8, 0.25, 1], // Incredibly fluid aesthetic spring curve
            }}
            className="absolute"
            style={{
              width: p.size,
              height: p.size,
            }}
          >
            {p.shape === 'circle' && (
              <div
                className="w-full h-full rounded-full shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: p.color, color: p.color }}
              />
            )}
            {p.shape === 'square' && (
              <div
                className="w-full h-full rotate-45 shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: p.color, color: p.color }}
              />
            )}
            {p.shape === 'sparkle' && (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ color: p.color }}
                className="w-full h-full drop-shadow-[0_0_4px_currentColor]"
              >
                <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
              </svg>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
