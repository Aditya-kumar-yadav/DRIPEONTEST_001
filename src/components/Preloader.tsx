import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function Preloader() {
  const [percent, setPercent] = useState(0);
  const [complete, setComplete] = useState(false);
  const [mounted, setMounted] = useState(true);
  const [stage, setStage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Disable preloader instantly
    sessionStorage.setItem('DRIPEON_first_visit', 'true');
    setMounted(false);
    return;

    const runSequence = async () => {
      // Stage 0: Black Void (0 -> 600ms)
      await new Promise(r => setTimeout(r, 600));
      
      // Stage 1: Appear near center (DRIP   EON)
      setStage(1);
      await new Promise(r => setTimeout(r, 800));
      
      // Stage 2: Separate horizontally (DRIP <-  -> EON)
      setStage(2);
      await new Promise(r => setTimeout(r, 1400));
      
      // Stage 3: Move together (DRIP ->  <- EON)
      setStage(3);
      await new Promise(r => setTimeout(r, 1000));
      
      // Stage 4: Connect & Light sweep
      setStage(4);
      await new Promise(r => setTimeout(r, 1500));
      
      // Stage 5: Existing Loading Sequence starts
      setStage(5);
    };

    runSequence();
  }, []);

  useEffect(() => {
    if (stage === 5) {
      // Fill progress from 0% to 100% over 1.5 seconds
      const interval = setInterval(() => {
        setPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            triggerSplit();
            return 100;
          }
          return prev + 2;
        });
      }, 25);
      return () => clearInterval(interval);
    }
  }, [stage]);

  const triggerSplit = () => {
    setComplete(true);
    sessionStorage.setItem('DRIPEON_first_visit', 'true');
    // Safely unmount after curtain animation ends (700ms)
    setTimeout(() => {
      setMounted(false);
    }, 800);
  };

  if (!mounted) return null;

  // Animation values for DRIP and EON based on stage and mobile
  const sepDist = isMobile ? 50 : 140; // safe separation distance

  const dripVariants: any = {
    initial: { opacity: 0, x: -10, rotateY: shouldReduceMotion ? 0 : 15, scale: 0.95 },
    stage1: { opacity: 1, x: -20, rotateY: shouldReduceMotion ? 0 : 5, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
    stage2: { x: -sepDist, rotateY: shouldReduceMotion ? 0 : 25, scale: 1.05, transition: { duration: 1.2, ease: [0.25, 1, 0.3, 1] } },
    stage3: { x: 0, rotateY: 0, scale: 1, transition: { duration: 1, ease: [0.25, 1, 0.3, 1] } },
    stage4: { opacity: 0, scale: 1.5, transition: { duration: 0.6, ease: "easeInOut" } }
  };

  const eonVariants: any = {
    initial: { opacity: 0, x: 10, rotateY: shouldReduceMotion ? 0 : -15, scale: 0.95 },
    stage1: { opacity: 1, x: 20, rotateY: shouldReduceMotion ? 0 : -5, scale: 1, transition: { duration: 0.8, ease: "easeOut" } },
    stage2: { x: sepDist, rotateY: shouldReduceMotion ? 0 : -25, scale: 1.05, transition: { duration: 1.2, ease: [0.25, 1, 0.3, 1] } },
    stage3: { x: 0, rotateY: 0, scale: 1, transition: { duration: 1, ease: [0.25, 1, 0.3, 1] } },
    stage4: { x: 0, rotateY: 0, scale: 1 }
  };

  const currentVariant = 
    stage === 1 ? 'stage1' : 
    stage === 2 ? 'stage2' : 
    stage === 3 ? 'stage3' : 
    stage >= 4 ? 'stage4' : 'initial';

  return (
    <div 
      className={`fixed inset-0 z-[99999] overflow-hidden ${complete ? 'pointer-events-none' : 'pointer-events-auto'}`}
    >
      <style>{`
        @keyframes text-sweep {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-text-sweep {
          background-image: linear-gradient(110deg, transparent 0%, transparent 40%, rgba(255, 255, 255, 0.9) 50%, transparent 60%, transparent 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: text-sweep 1.2s ease-in-out forwards;
        }
        .wordmark-font {
          font-family: 'Oswald', sans-serif;
        }
      `}</style>
      
      {/* Intro Typography Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[999] pointer-events-none bg-transparent">
        
        {/* DRIPEON Wordmark Split Container */}
        <motion.div 
          className="relative flex justify-center items-center"
          style={{ perspective: 1200 }}
          initial={{ opacity: 1 }}
          animate={{ opacity: stage >= 5 ? 0 : 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" as const }}
        >
          <motion.div
            variants={dripVariants}
            initial="initial"
            animate={currentVariant}
            className="wordmark-font text-5xl md:text-7xl font-bold tracking-[0.1em] text-red-600"
          >
            DRIP
          </motion.div>
          <motion.div
            variants={eonVariants}
            initial="initial"
            animate={currentVariant}
            className="wordmark-font text-5xl md:text-7xl font-bold tracking-[0.1em] text-red-600"
          >
            EON
          </motion.div>

          {/* Light Sweep Layer - perfectly overlays the connected text in Stage 4 */}
          {stage === 4 && (
            <div className="absolute inset-0 flex justify-center items-center z-10">
              <div className="wordmark-font text-5xl md:text-7xl font-bold tracking-[0.1em] animate-text-sweep">
                DRIPEON
              </div>
            </div>
          )}
        </motion.div>

        {/* Small subtitle that fades in when connected */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: stage >= 4 && stage < 5 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
          className="absolute mt-28 text-[10px] font-medium text-gray-500 tracking-[0.5em] uppercase"
        >
          DRIPEON
        </motion.p>
      </div>

      {/* Top half sliding panel */}
      <div 
        className={`fixed top-0 left-0 w-full h-1/2 bg-[#050505] duration-750 ease-in-out transition-transform flex flex-col justify-end items-center pb-8 border-b border-gray-200/15 ${
          complete ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* We crossfade this exactly as the intro overlay fades out */}
        <div className="text-center transition-opacity duration-1000" style={{ opacity: stage >= 5 ? 1 : 0 }}>
          {stage >= 5 && (
            <h1 className="wordmark-font text-5xl md:text-7xl font-bold tracking-[0.1em] text-red-600 flex justify-center">
              DRIPEON
            </h1>
          )}
          {stage >= 5 && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-[10px] font-medium text-gray-500 tracking-[0.5em] uppercase mt-4"
            >
              DRIPEON
            </motion.p>
          )}
        </div>
      </div>

      {/* Bottom half sliding panel */}
      <div 
        className={`fixed bottom-0 left-0 w-full h-1/2 bg-[#050505] duration-750 ease-in-out transition-transform flex flex-col justify-start items-center pt-8 border-t border-gray-200/15 ${
          complete ? 'translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="w-full max-w-xs px-6 pt-4 text-center transition-opacity duration-700" style={{ opacity: stage >= 5 ? 1 : 0 }}>
          {stage >= 5 && (
            <>
              <div className="flex justify-between items-baseline text-[9px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
                <span>Loading</span>
                <span>{percent}%</span>
              </div>
              
              <div className="w-full bg-gray-100 h-[1px] relative overflow-hidden">
                <div 
                  className="bg-red-600 h-full absolute left-0 top-0 transition-all duration-100"
                  style={{ width: `${percent}%` }}
                />
              </div>
              
              <p className="text-[8px] font-medium text-gray-500/40 tracking-wider uppercase mt-4">
                Curating luxury draping silhouettes
              </p>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
