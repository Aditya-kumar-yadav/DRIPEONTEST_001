import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Diamond, ShieldCheck, Clock, Layers } from 'lucide-react';

export default function CapsHero() {
  const containerRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const navigate = useNavigate();

  return (
    <section
      ref={containerRef}
      className="relative h-screen w-full bg-[#fdfdfd] overflow-hidden select-none flex flex-col pt-20"
      onMouseMove={(e) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePos({ x, y });
      }}
    >
      {/* Static Image Layer (Replacing 3D Elements) */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-end overflow-hidden px-4">
        {/* Glow effect behind the product image */}
        <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/15 rounded-full blur-[100px]"></div>

        <div className="relative w-full h-full max-w-7xl mx-auto flex items-center justify-end">
          <div className="w-full md:w-[65%] h-[80%] relative translate-y-10 md:translate-x-10 flex items-center justify-center">
            {/* You can replace this src with your exported cap pedestal image from the mockup */}
            <img
              src="/images/caps-hero-sticker.png"
              alt="Dripeon Caps"
              className="w-full h-full object-contain drop-shadow-2xl z-10 cursor-pointer hover:scale-105 transition-transform duration-300 pointer-events-auto"
              onError={(e) => {
                // Displaying a helpful message instead of the white cap fallback
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector('.fallback-msg')) {
                  const msg = document.createElement('div');
                  msg.className = 'fallback-msg bg-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-gray-500 max-w-sm pointer-events-auto';
                  msg.innerHTML = '<span class="text-xl font-bold mb-2">Image Missing</span><p class="text-sm">Please save your sticker image as <b>caps-hero-sticker.png</b> in the <b>public/images</b> folder.</p>';
                  parent.appendChild(msg);
                }
              }}
            />
            {/* 
              Strategic Red Block to cover the baked-in chat icon from the source image.
              It is positioned at the bottom right where the icon appears.
            */}
            <div className="absolute bottom-[5%] right-[5%] z-20 pointer-events-auto shadow-2xl transition-transform hover:scale-105">
              <div className="bg-[#c10015] text-white px-8 py-4 font-black italic text-2xl -skew-x-12 flex flex-col items-center justify-center shadow-lg border border-red-500" style={{ fontFamily: 'Impact, sans-serif' }}>
                <span>BUILT</span>
                <span>DIFFERENT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center max-w-7xl mx-auto px-6 lg:px-12 w-full">
        <div className="w-full md:w-[55%] flex flex-col items-start text-left space-y-6 -mt-20 ml-8 md:ml-12 lg:ml-16">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-3 text-[#D90416] text-xs font-bold uppercase tracking-widest"
          >
            <span>New Drop</span>
            <div className="w-10 h-[1px] bg-[#D90416]"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-2"
          >
            <h1 className="text-7xl md:text-[9rem] font-black italic text-[#c10015] leading-[0.8] tracking-tighter -skew-x-12 pr-4 drop-shadow-lg" style={{ fontFamily: 'Impact, sans-serif', WebkitTextStroke: '1px #a00010' }}>
              DRIPEON
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col text-2xl md:text-3xl font-bold uppercase tracking-[0.3em] leading-relaxed mt-4"
          >
            <span className="text-gray-800">BUILT DIFFERENT.</span>
            <span className="text-[#D90416]">WORN BY YOU.</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-gray-500 text-base md:text-lg max-w-sm mt-4 font-medium leading-relaxed"
          >
            Premium caps for those who set trends, not follow them.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 mt-8 pointer-events-auto"
          >
            <button
              onClick={() => {
                document.getElementById('cap-collections')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#c10015] text-white px-8 py-3.5 rounded-md font-bold tracking-widest text-xs hover:bg-red-800 transition-colors shadow-lg shadow-red-600/30 cursor-pointer flex items-center gap-2"
            >
              SHOP NOW ↗
            </button>
            <button
              onClick={() => {
                document.getElementById('cap-products')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-transparent text-[#c10015] border-[1.5px] border-[#c10015] rounded-md px-8 py-3.5 font-bold tracking-widest text-xs hover:bg-red-50 transition-colors cursor-pointer"
            >
              EXPLORE COLLECTIONS
            </button>
          </motion.div>

          {/* Slider Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex items-center gap-3 pt-12 text-xs font-bold text-gray-400"
          >
            <span className="text-[#c10015]">01</span>
            <div className="flex gap-1">
              <div className="w-6 h-[2px] bg-[#c10015]"></div>
              <div className="w-6 h-[2px] bg-gray-300"></div>
              <div className="w-6 h-[2px] bg-gray-300"></div>
            </div>
            <span>03</span>
          </motion.div>
        </div>
      </div>

      {/* Bottom Feature Bar */}
      <div className="absolute bottom-0 left-0 w-full px-4 md:px-8 pb-6 pointer-events-auto z-20">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="max-w-7xl mx-auto bg-white/60 border border-white/40 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-4 px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6"
        >
          {/* Feature 1 */}
          <div className="flex items-center gap-4 w-full md:w-1/4">
            <div className="w-12 h-12 rounded-full bg-[#c10015] flex items-center justify-center shrink-0">
              <Diamond className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-gray-900 font-bold text-xs uppercase tracking-wide">Premium Quality</h4>
              <p className="text-gray-500 text-[11px] leading-tight mt-0.5">Top tier fabrics & finishes</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-10 bg-black/10"></div>

          {/* Feature 2 */}
          <div className="flex items-center gap-4 w-full md:w-1/4">
            <div className="w-12 h-12 rounded-full bg-[#c10015] flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-gray-900 font-bold text-xs uppercase tracking-wide">Perfect Fit</h4>
              <p className="text-gray-500 text-[11px] leading-tight mt-0.5">Designed for comfort, made to last</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-10 bg-black/10"></div>

          {/* Feature 3 */}
          <div className="flex items-center gap-4 w-full md:w-1/4">
            <div className="w-12 h-12 rounded-full bg-[#c10015] flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-gray-900 font-bold text-xs uppercase tracking-wide">Limited Drops</h4>
              <p className="text-gray-500 text-[11px] leading-tight mt-0.5">Exclusive styles. Limited stock.</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-10 bg-black/10"></div>

          {/* Feature 4 */}
          <div className="flex items-center gap-4 w-full md:w-1/4">
            <div className="w-12 h-12 rounded-full bg-[#c10015] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-gray-900 font-bold text-xs uppercase tracking-wide">Secure Payment</h4>
              <p className="text-gray-500 text-[11px] leading-tight mt-0.5">100% secure checkout experience</p>
            </div>
          </div>
        </motion.div>
      </div>

    </section>
  );
}

