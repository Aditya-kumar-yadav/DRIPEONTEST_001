import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';

interface PhotoGlobeProps {
  products: Product[];
}

export default function PhotoGlobe({ products }: PhotoGlobeProps) {
  const navigate = useNavigate();
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  
  // Fixed parameters that guarantee perfect non-overlapping dense packing
  const radius = 650;
  const TOTAL_ITEMS = 150;
  
  const isDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);
  const startPos = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef<number | null>(null);

  // Responsive scaling - shrinks the entire globe perfectly without breaking the math
  useEffect(() => {
    const updateScale = () => {
      // Scale down the entire globe proportionally based on screen width
      // This makes it smaller and flexible, but keeps all 150 items perfectly spaced!
      const newScale = Math.min(0.65, window.innerWidth / 1400);
      setScale(Math.max(0.25, newScale)); // ensure it doesn't get too microscopic on tiny screens
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Fill array to have exactly TOTAL_ITEMS items
  const displayProducts = useMemo(() => {
    let baseItems = products && products.length > 0 ? products : [];
    
    if (baseItems.length === 0) {
      const placeholder = {
        id: 'placeholder',
        slug: '#',
        name: 'Loading...',
        images: [{ isPrimary: true, imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80' }]
      } as any;
      baseItems = [placeholder];
    }

    let items = [...baseItems];
    while (items.length < TOTAL_ITEMS) {
      items = [...items, ...baseItems];
    }
    return items.sort(() => Math.random() - 0.5).slice(0, TOTAL_ITEMS);
  }, [products]);

  // Pointer event handlers for drag rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    dragDistanceRef.current += Math.abs(deltaX) + Math.abs(deltaY);
    
    setRotation(prev => ({
      x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.15)), // Slower, heavier drag feel
      y: prev.y + deltaX * 0.15
    }));
    
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Auto Rotation Loop
  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      
      if (!isDraggingRef.current) {
        setRotation(prev => ({
          x: prev.x * 0.98, // slowly return X to 0 for a stable equator
          y: prev.y + 4 * delta // Ultra-smooth, slow drift for premium feel (4 deg/sec)
        }));
      }
      autoRotateRef.current = requestAnimationFrame(animate);
    };
    
    autoRotateRef.current = requestAnimationFrame(animate);
    return () => {
      if (autoRotateRef.current) cancelAnimationFrame(autoRotateRef.current);
    };
  }, []);

  const n = displayProducts.length;

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ perspective: '1600px' }}
    >
      <div className="absolute top-4 sm:top-10 left-0 w-full text-center z-20 pointer-events-none">
        <h3 className="text-[#C9A96E] font-medium text-[9px] md:text-[11px] tracking-[0.4em] uppercase mb-2">DRAG TO ROTATE & EXPLORE THE COLLECTION • TAP ANY LOOKBOOK TILE TO EXPAND</h3>
        <p className="text-white/50 text-[10px] md:text-xs tracking-[0.2em] font-sans uppercase">High-Fidelity Details</p>
      </div>

      <div 
        className="relative w-0 h-0 will-change-transform"
        style={{ 
          transformStyle: 'preserve-3d', 
          transform: `scale(${scale}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
        }}
      >
        {displayProducts.map((p, i) => {
          // Fibonacci sphere distribution algorithm provides the perfect dense spherical packing
          const phi = Math.acos(1 - 2 * (i + 0.5) / n);
          const theta = Math.PI * (1 + Math.sqrt(5)) * i;
          
          // Convert to CSS rotation angles
          const lat = phi - Math.PI / 2; // Latitude (-pi/2 to pi/2)
          const lon = theta; // Longitude (0 to 2pi)

          const latDeg = (lat * 180) / Math.PI;
          const lonDeg = (lon * 180) / Math.PI;
          
          const primaryImg = p.images?.find((img) => img.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || '';

          return (
            <div
              key={`${p.id}-${i}`}
              onClick={(e) => {
                if (dragDistanceRef.current > 10) {
                  e.preventDefault();
                  return;
                }
                navigate(`/products/${p.slug}`);
              }}
              className="absolute w-[80px] h-[100px] md:w-[130px] md:h-[160px] -ml-[40px] -mt-[50px] md:-ml-[65px] md:-mt-[80px] bg-black rounded-xl md:rounded-[24px] overflow-hidden cursor-pointer border border-white/5 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 group"
              style={{
                transform: `rotateY(${lonDeg}deg) rotateX(${-latDeg}deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden' // for Safari
              }}
            >
              {primaryImg ? (
                <img 
                  src={primaryImg} 
                  alt={p.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No Image</div>
              )}
              {/* Dark overlay that fades on hover for an interactive feel */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/0 transition-colors duration-300 pointer-events-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
