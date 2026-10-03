import React, { useState, useEffect } from 'react';

export default function ZipPreloader() {
  const [unzipping, setUnzipping] = useState(false);
  const [opening, setOpening] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Instantly hide
    sessionStorage.setItem('dripeon_preloaded', 'true');
    setHidden(true);
    return;

    // Sequence timing
    const t1 = setTimeout(() => setUnzipping(true), 10); // Start unzipping down
    const t2 = setTimeout(() => setOpening(true), 100); // Start splitting open
    const t3 = setTimeout(() => {
      setHidden(true);
      sessionStorage.setItem('dripeon_preloaded', 'true');
    }, 300); // Complete unmount

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none flex overflow-hidden">
      {/* Left Fabric Panel */}
      <div 
        className={`relative w-1/2 h-full bg-neutral-950 border-r-[6px] border-dashed border-neutral-700/80 shadow-[10px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] overflow-hidden ${
          opening ? '-translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Full width container forced to align left */}
        <div className="absolute inset-y-0 left-0 w-[100vw] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center">
            <h1 className="text-6xl md:text-[10rem] font-black tracking-widest text-white drop-shadow-2xl">
              DRIP<span className="text-red-600">EON</span>
            </h1>
            <p className="text-neutral-500 tracking-[0.4em] uppercase text-xs md:text-xl font-bold mt-4">
              Urban Innovation Apparel
            </p>
          </div>
        </div>
      </div>

      {/* Right Fabric Panel */}
      <div 
        className={`relative w-1/2 h-full bg-neutral-950 border-l-[6px] border-dashed border-neutral-700/80 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.76,0,0.24,1)] overflow-hidden ${
          opening ? 'translate-x-full' : 'translate-x-0'
        }`}
      >
        {/* Full width container forced to align right edge to right screen edge */}
        <div className="absolute inset-y-0 right-0 w-[100vw] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center">
            <h1 className="text-6xl md:text-[10rem] font-black tracking-widest text-white drop-shadow-2xl">
              DRIP<span className="text-red-600">EON</span>
            </h1>
            <p className="text-neutral-500 tracking-[0.4em] uppercase text-xs md:text-xl font-bold mt-4">
              Urban Innovation Apparel
            </p>
          </div>
        </div>
      </div>

      {/* Zipper Pull Slider */}
      <div 
        className={`absolute left-1/2 -translate-x-1/2 z-10 flex flex-col items-center transition-all duration-300 ease-in ${
          opening ? 'opacity-0 scale-50 translate-y-24' : 'opacity-100'
        }`}
        style={{ top: unzipping ? '100%' : '-5%' }}
      >
        {/* Detailed Premium Metallic Zipper Pull */}
        <svg width="48" height="110" viewBox="0 0 24 60" fill="none" className="drop-shadow-2xl">
          {/* Slider Body */}
          <rect x="3" y="0" width="18" height="26" rx="3" fill="#e4e4e7" stroke="#52525b" strokeWidth="1.5" />
          {/* Slider Ridges */}
          <path d="M3 10 L21 10" stroke="#71717a" strokeWidth="2" />
          <path d="M3 16 L21 16" stroke="#71717a" strokeWidth="2" />
          <path d="M9 0 L9 26" stroke="#a1a1aa" strokeWidth="1" />
          <path d="M15 0 L15 26" stroke="#a1a1aa" strokeWidth="1" />
          
          {/* Pull Connector Loop */}
          <rect x="7" y="22" width="10" height="8" rx="2" fill="#3f3f46" />
          
          {/* Dangling Pull Tab */}
          <path d="M12 26 L20 54 C20 57 16 60 12 60 C8 60 4 57 4 54 L12 26Z" fill="#d4d4d8" stroke="#71717a" strokeWidth="1" />
          <circle cx="12" cy="50" r="3" fill="#52525b" />
        </svg>
      </div>

      {/* Behind the slider gradient light to fake depth */}
      <div className="absolute inset-0 z-[-1] pointer-events-none bg-black" />
    </div>
  );
}
