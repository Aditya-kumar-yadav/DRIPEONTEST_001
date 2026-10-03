import React from 'react';
import { motion } from 'framer-motion';
import { Globe, ScanBarcode, Crown, Star, ArrowRight } from 'lucide-react';

export default function ClothingHero() {
  return (
    <section className="relative h-screen w-full bg-white overflow-hidden select-none flex flex-col pt-20">

      {/* Background Typography Layers (Behind) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 mt-[-5vh]">
        <h1 className="text-[9.5vw] md:text-[9vw] font-black tracking-tighter text-[#D90416] leading-[0.8] whitespace-nowrap opacity-20">
          SOCIAL INTROVERT
        </h1>
        <h1 className="text-[9.5vw] md:text-[9vw] font-black tracking-tighter text-transparent leading-[0.8] whitespace-nowrap opacity-0 -mt-4" style={{ WebkitTextStroke: '4px #D90416' }}>
          SOCIAL INTROVERT
        </h1>
        <h1 className="text-[9.5vw] md:text-[9vw] font-black tracking-tighter text-[#D90416] leading-[0.8] whitespace-nowrap opacity-20 -mt-4">
          SOCIAL INTROVERT
        </h1>
      </div>

      {/* Floating Graphic Badges (Behind & Around Model) */}

      {/* Top Left: Globe */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="absolute top-[20%] left-[5%] md:left-[10%] z-20 flex items-center gap-3 bg-white/80 backdrop-blur-sm border-2 border-black px-4 py-2 rounded-full shadow-[4px_4px_0px_rgba(0,0,0,1)]"
      >
        <Globe className="w-5 h-5 text-black" />
        <span className="font-bold text-black text-[10px] tracking-widest uppercase">STAY IN YOUR LANE.</span>
      </motion.div>

      {/* Top Right: Barcode */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="absolute top-[15%] right-[5%] md:right-[10%] z-20 flex flex-col items-end gap-1 bg-white/80 backdrop-blur-sm border-2 border-black p-3 rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,1)]"
      >
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-[#D90416]" />
          <span className="font-bold text-black text-[10px] tracking-widest uppercase">LOWKEY MODE</span>
        </div>
        <ScanBarcode className="w-16 h-8 text-black opacity-80" />
      </motion.div>

      {/* Mid Left: Rating Block */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute top-[45%] left-[3%] md:left-[8%] z-20 hidden sm:flex flex-col gap-1 bg-white/90 border border-gray-200 p-3 rounded-md shadow-xl"
      >
        <div className="flex text-[#D90416]">
          {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
        </div>
        <span className="font-black text-black text-[9px] tracking-widest uppercase mt-1">SOCIAL INTROVERT</span>
      </motion.div>

      {/* Mid Right: Personality Text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="absolute top-[50%] right-[3%] md:right-[8%] z-20 hidden sm:flex flex-col items-center justify-center w-24 h-24 bg-[#D90416] text-white rounded-full shadow-2xl rotate-12"
      >
        <span className="font-black text-[10px] tracking-widest uppercase">100%</span>
        <span className="font-bold text-[8px] tracking-widest uppercase mt-0.5">PERSONALITY</span>
      </motion.div>

      {/* Bottom Left: Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute bottom-[20%] left-[5%] md:left-[15%] z-20 flex flex-col gap-2 bg-white/90 border-2 border-black p-3 rounded-md w-40 shadow-[4px_4px_0px_rgba(217,4,22,1)]"
      >
        <div className="flex justify-between items-center w-full">
          <span className="font-bold text-black text-[9px] tracking-widest uppercase">MENTAL SPACE</span>
          <span className="font-bold text-[#D90416] text-[9px]">100%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-[#D90416] w-full"></div>
        </div>
      </motion.div>

      {/* Bottom Right: Stamp */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="absolute bottom-[15%] right-[5%] md:right-[15%] z-20 border-[3px] border-black text-black font-black uppercase text-[10px] tracking-[0.2em] p-2 rotate-[-5deg] backdrop-blur-sm bg-white/50"
      >
        OVERTHINKER<br />IN PROGRESS
      </motion.div>


      {/* Central Model Image */}
      <div className="relative z-10 h-[85vh] flex items-center justify-center mt-[2vh] pointer-events-none">
        <img
          src="/images/clothing-story-man.png"
          alt="Drip Lab Model"
          className="h-full object-contain drop-shadow-[0_20px_40px_rgba(217,4,22,0.3)] scale-[1.15]"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Background Typography Layers (In Front for 3D Effect) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 mt-[-5vh]">
        <h1 className="text-[9.5vw] md:text-[9vw] font-black tracking-tighter text-transparent leading-[0.8] whitespace-nowrap opacity-0">
          SOCIAL INTROVERT
        </h1>
        <h1 className="text-[9.5vw] md:text-[9vw] font-black tracking-tighter text-[#D90416] leading-[0.8] whitespace-nowrap opacity-100 -mt-4">
          SOCIAL INTROVERT
        </h1>
        <h1 className="text-[9.5vw] md:text-[9vw] font-black tracking-tighter text-transparent leading-[0.8] whitespace-nowrap opacity-0 -mt-4">
          SOCIAL INTROVERT
        </h1>
      </div>

      {/* Bottom CTA Block */}
      <div className="absolute bottom-[8%] w-full flex flex-col items-center justify-center z-30 pointer-events-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-[#D90416] font-black text-xl md:text-3xl tracking-[0.3em] uppercase mb-4 drop-shadow-md bg-white/80 px-4 py-1 rounded"
        >
          COMFORTZONE
        </motion.h2>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          onClick={() => document.getElementById('clothing-products')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-[#D90416] text-white px-8 py-4 rounded font-black tracking-[0.2em] text-xs hover:bg-black transition-colors shadow-xl flex items-center gap-2 cursor-pointer uppercase"
        >
          SHOP NOW <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>

    </section>
  );
}
