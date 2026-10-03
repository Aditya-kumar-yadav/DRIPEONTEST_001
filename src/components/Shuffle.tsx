import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'motion/react';

interface ShuffleProps {
  text: string;
  shuffleDirection?: 'right' | 'left' | 'both';
  duration?: number;
  animationMode?: 'evenodd' | 'random' | 'linear';
  shuffleTimes?: number;
  ease?: string;
  stagger?: number;
  threshold?: number;
  triggerOnce?: boolean;
  triggerOnHover?: boolean;
  respectReducedMotion?: boolean;
  loop?: boolean;
  loopDelay?: number;
  className?: string;
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_+#@&%*!$?-=/\\';

export default function Shuffle({
  text,
  shuffleDirection = 'right',
  duration = 0.35,
  animationMode = 'evenodd',
  shuffleTimes = 3,
  ease = 'power3.out',
  stagger = 0.03,
  threshold = 0.1,
  triggerOnce = true,
  triggerOnHover = true,
  respectReducedMotion = true,
  loop = false,
  loopDelay = 0,
  className = '',
}: ShuffleProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isShuffling, setIsShuffling] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(containerRef, { amount: threshold, once: triggerOnce });
  const hasTriggeredOnView = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all running timers
  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
  }, []);

  const runShuffle = useCallback(() => {
    if (isShuffling) return;
    setIsShuffling(true);

    const length = text.length;
    let frames = 0;
    const maxFrames = Math.max(10, Math.floor((duration * 1000) / 30));
    
    // Indices order based on direction and mode
    const indices = Array.from({ length }, (_, i) => i);
    
    // Shuffle the resolution order of indices
    if (animationMode === 'random') {
      indices.sort(() => Math.random() - 0.5);
    } else if (animationMode === 'evenodd') {
      const evens = indices.filter(i => i % 2 === 0);
      const odds = indices.filter(i => i % 2 !== 0);
      indices.splice(0, indices.length, ...evens, ...odds);
    }
    
    if (shuffleDirection === 'left') {
      indices.reverse();
    }

    clearTimers();

    timerRef.current = setInterval(() => {
      frames++;
      
      const nextText = text.split('').map((char, index) => {
        if (char === ' ') return ' ';
        
        // Calculate progress for this character
        const charOrder = indices.indexOf(index);
        const relativeProgress = frames / maxFrames;
        const cutoff = relativeProgress * length;
        
        // If solved
        if (charOrder < cutoff) {
          return char;
        }
        
        // Otherwise present random symbol
        const randomIndex = Math.floor(Math.random() * GLYPHS.length);
        return GLYPHS[randomIndex];
      }).join('');

      setDisplayText(nextText);

      if (frames >= maxFrames) {
        setDisplayText(text);
        setIsShuffling(false);
        if (timerRef.current) clearInterval(timerRef.current);

        // Schedule loop if requested
        if (loop) {
          loopTimerRef.current = setTimeout(() => {
            runShuffle();
          }, loopDelay * 1000);
        }
      }
    }, 30);
  }, [text, shuffleDirection, duration, animationMode, loop, loopDelay, isShuffling, clearTimers]);

  useEffect(() => {
    if (inView && !hasTriggeredOnView.current) {
      hasTriggeredOnView.current = true;
      runShuffle();
    }
  }, [inView, runShuffle]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Hover handler
  const handleMouseEnter = () => {
    if (triggerOnHover && !isShuffling) {
      runShuffle();
    }
  };

  return (
    <motion.span
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      className={`inline-block font-medium cursor-default select-none ${className}`}
      style={{ whiteSpace: 'pre' }}
    >
      {displayText}
    </motion.span>
  );
}
