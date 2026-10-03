import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  imageUrl?: string;
}

export default function FlyToCartAnimation() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const handleAdd = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number; imageUrl?: string }>;
      const { x, y, imageUrl } = customEvent.detail || {};

      // Calculate source coordinates, fallback to mouse click or center
      const startX = typeof x === 'number' ? x : window.innerWidth / 2;
      const startY = typeof y === 'number' ? y : window.innerHeight / 2;

      // Find current position of the cart element relative to the viewport
      const cartIconEl = document.querySelector('[class*="ShoppingBag"], [class*="Cart"]');
      const cartRect = cartIconEl?.getBoundingClientRect();
      const targetX = cartRect ? cartRect.left + cartRect.width / 2 : window.innerWidth - 80;
      const targetY = cartRect ? cartRect.top + cartRect.height / 2 : 40;

      const newParticle: Particle = {
        id: `particle-${Date.now()}-${Math.random()}`,
        startX,
        startY,
        targetX,
        targetY,
        imageUrl,
      };

      setParticles((prev) => [...prev, newParticle]);
    };

    window.addEventListener('item-added-to-cart', handleAdd);
    return () => {
      window.removeEventListener('item-added-to-cart', handleAdd);
    };
  }, []);

  const removeParticle = (id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

   return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <React.Fragment key={p.id}>
            {/* The main flying container - Smaller, snappier, highly professional */}
            <motion.div
              initial={{
                x: p.startX - 16, // Center alignment (width = 32)
                y: p.startY - 16, // Height = 32
                scale: 0.6,
                opacity: 0,
              }}
              animate={{
                x: p.targetX - 12, // Align to center of cart icon
                y: p.targetY - 12,
                scale: [0.6, 1.0, 0.25], // Elegant snap and shrink
                opacity: [0, 1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.55,
                ease: [0.25, 1, 0.5, 1], // snappier curve
              }}
              onAnimationComplete={() => removeParticle(p.id)}
              className="absolute w-8 h-8 flex items-center justify-center rounded-full border border-red-600/60 bg-white shadow-[0_4px_12px_rgba(201,169,110,0.3)] overflow-hidden"
            >
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt="Sartorial Allocation Thumbnail"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white">
                  <span className="text-[9px] font-sans text-red-600 font-black uppercase leading-none select-none">
                    RT
                  </span>
                </div>
              )}
            </motion.div>
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
}
