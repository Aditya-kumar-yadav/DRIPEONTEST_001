import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, Volume2, ArrowRight } from 'lucide-react';
import { useApp } from '../AppContext';

export default function WebGLCarousel({ products }: { products: Product[] }) {
  const navigate = useNavigate();
  const { settings } = useApp();
  const displayProducts = products.slice(0, 10);
  const total = displayProducts.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle Audio Playback (Single Brand Anthem)
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  
  useEffect(() => {
    const defaultTrack = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_a7e289bf00.mp3?filename=lofi-study-112191.mp3';
    const audioUrl = settings?.brandAnthemBase64 || defaultTrack;
    
    let audio: HTMLAudioElement;
    let wasPlaying = false;

    if (audioRef.current && audioRef.current.src !== audioUrl) {
      wasPlaying = !audioRef.current.paused;
      audioRef.current.pause();
    }

    if (!audioRef.current || audioRef.current.src !== audioUrl) {
      audio = new Audio(audioUrl);
      audio.loop = true;
      audio.volume = volume;
      audio.muted = isMuted;
      audioRef.current = audio;
    } else {
      audio = audioRef.current;
    }

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    audio.addEventListener('timeupdate', updateProgress);

    if (wasPlaying && isPlaying) {
      audio.play().catch(e => console.error(e));
    }

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
    };
  }, [settings?.brandAnthemBase64]); // Re-run when the anthem setting changes

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Audio play error", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const volRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setVolume(volRatio);
      audioRef.current.volume = volRatio;
      
      // Unmute if we click to set volume
      if (isMuted && volRatio > 0) {
          audioRef.current.muted = false;
          setIsMuted(false);
      }
    }
  };

  // ... (navigation logic for carousel remains the same)
  const handleNext = () => setActiveIndex((prev) => (prev + 1) % total);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + total) % total);

  if (total === 0) return null;
  const activeProduct = displayProducts[activeIndex];

  // Helper for coverflow styles
  const getCardStyle = (index: number) => {
    const diff = (index - activeIndex + total) % total;
    let offset = diff;
    if (offset > total / 2) offset -= total;

    const isActive = offset === 0;
    const absOffset = Math.abs(offset);
    
    let x = offset * 150;
    let y = Math.pow(absOffset, 1.8) * 18; 
    let scale = 1 - (absOffset * 0.12); 
    let zIndex = 10 - absOffset;
    
    const isVisible = absOffset <= 2;
    let opacity = isVisible ? 1 : 0;
    
    let rotateY = offset * -20; 
    let rotateZ = offset * 10;  
    
    return {
      x, y, scale, zIndex, opacity, rotateY, rotateZ,
      filter: isActive ? 'brightness(1) drop-shadow(0 25px 35px rgba(0,0,0,0.5))' : 'brightness(0.4)',
      isVisible
    };
  };

  return (
    <div className="relative w-full h-[700px] overflow-hidden bg-white select-none flex flex-col items-center justify-center font-sans border-y-4 border-[#e00028]" style={{ perspective: '1200px' }}>
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(224,0,40,0.05)_0%,rgba(255,255,255,1)_70%)] pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center overflow-hidden z-0 opacity-40">
        <span className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-black uppercase text-[12rem] md:text-[20rem] leading-[0.8] text-[#e00028]/10 select-none tracking-tighter -rotate-2">
          PREMIUM
        </span>
        <span className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-black uppercase text-[12rem] md:text-[20rem] leading-[0.8] text-transparent select-none tracking-tighter -rotate-2" style={{ WebkitTextStroke: '3px rgba(224,0,40,0.15)' }}>
          DROPS
        </span>
      </div>

      <div className="absolute top-10 left-0 w-full text-center z-10 pointer-events-none">
        <h2 className="text-gray-900 font-black text-3xl md:text-5xl tracking-[0.2em] uppercase drop-shadow-sm">
          <span className="text-[#e00028]">Premium</span> Drops
        </h2>
        <p className="text-[#e00028]/60 font-bold text-sm md:text-base tracking-[0.4em] uppercase mt-2">Interact to Spin</p>
      </div>

      <div className="relative w-full max-w-5xl h-[450px] flex items-center justify-center mt-[-50px]">
        <AnimatePresence initial={false}>
          {displayProducts.map((p, index) => {
            const style = getCardStyle(index);
            const isActive = index === activeIndex;
            
            if (!style.isVisible) return null;
            
            return (
              <motion.div
                key={p.id}
                className="absolute w-[280px] h-[360px] md:w-[320px] md:h-[420px] rounded-3xl overflow-hidden cursor-pointer shadow-none"
                initial={{ opacity: 0, x: style.x > 0 ? 300 : -300 }}
                animate={{
                  x: style.x, y: style.y, scale: style.scale, zIndex: style.zIndex,
                  opacity: style.opacity, rotateY: style.rotateY, rotateZ: style.rotateZ, filter: style.filter
                }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
                onClick={() => {
                  if (!isActive) {
                    setActiveIndex(index);
                  } else {
                    navigate(`/products/${p.slug}`);
                  }
                }}
                style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}
              >
                <img 
                  src={(p.images[0]?.imageUrl || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80').replace('w_1200', 'w_400')} 
                  alt={p.name}
                  loading={isActive ? "eager" : "lazy"}
                  fetchPriority={isActive ? "high" : "auto"}
                  className="w-full h-full object-cover"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                
                <div className="absolute bottom-6 left-0 w-full text-center px-4 pointer-events-none">
                   <h3 className="text-white font-bold text-xl line-clamp-1">{p.artistName || 'DRIPEON'}</h3>
                   <p className="text-white/70 text-sm mt-1 line-clamp-1">{p.name}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {activeProduct && (
        <div className="absolute bottom-36 z-20">
            <button 
              onClick={() => navigate(`/products/${activeProduct.slug}`)}
              className="flex items-center justify-center gap-2 text-black bg-white hover:bg-[#e00028] hover:text-white px-8 py-2.5 rounded-full text-xs uppercase tracking-widest font-bold transition-all duration-300 shadow-xl backdrop-blur-md"
            >
              <span>View Details - ₹{activeProduct.price.toLocaleString('en-IN')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
        </div>
      )}

      {/* Music Player UI (Single Brand Anthem) */}
      <div className="absolute bottom-8 z-30 w-full max-w-2xl px-4 flex justify-center">
        <div className="bg-[#e00028]/10 backdrop-blur-xl border border-[#e00028]/20 rounded-full p-3 flex items-center gap-4 md:gap-8 shadow-[0_10px_40px_rgba(224,0,40,0.15)] w-full relative">
            
            <div className="absolute inset-0 bg-[#e00028]/5 rounded-full blur-xl pointer-events-none" />

            {/* Play/Pause Control (Removed Skip buttons as requested) */}
            <div className="flex items-center justify-center w-12 text-[#e00028] pl-2 relative z-10">
                <button onClick={togglePlay} className="hover:text-red-700 transition-transform hover:scale-110 active:scale-95 w-10 h-10 flex items-center justify-center bg-white/10 rounded-full">
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                </button>
            </div>

            {/* Currently Playing Info */}
            <div className="flex-1 bg-gray-900 rounded-full py-2 px-3 flex items-center gap-3 md:gap-4 border border-gray-700 relative z-10 shadow-inner">
                {/* Brand Logo Vinyl CD */}
                <div className={`relative w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#111] flex items-center justify-center flex-shrink-0 border-2 border-gray-800 shadow-[0_0_10px_rgba(0,0,0,0.5)] overflow-hidden ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''} transition-all duration-300`}>
                    {/* Vinyl Grooves */}
                    <div className="absolute inset-0 rounded-full border border-gray-700/50 m-1 pointer-events-none" />
                    <div className="absolute inset-0 rounded-full border border-gray-600/30 m-2 pointer-events-none" />
                    
                    <img 
                        src="/custom-logo-1.png"
                        alt="DRIPEON" 
                        className="w-full h-full object-contain filter brightness-0 invert scale-50 opacity-90" 
                    />
                    
                    {/* Center CD Hole */}
                    <div className="absolute w-2.5 h-2.5 bg-gray-900 rounded-full border border-gray-700/80 shadow-inner z-10" />
                </div>
                
                {/* Track Info & Progress */}
                <div className="flex-1 min-w-0 pr-2">
                    <div className="flex justify-start items-baseline mb-1 gap-2">
                        <span className="text-white font-bold text-xs md:text-sm truncate">DRIPEON</span>
                        <span className="text-gray-400 text-[10px] md:text-xs truncate">Official Brand Anthem</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden relative cursor-pointer group" onClick={(e) => {
                       if (audioRef.current) {
                           const rect = e.currentTarget.getBoundingClientRect();
                           const clickRatio = (e.clientX - rect.left) / rect.width;
                           audioRef.current.currentTime = clickRatio * audioRef.current.duration;
                       }
                    }}>
                        <div 
                            className="absolute top-0 left-0 h-full bg-[#e00028] rounded-full transition-all duration-150 ease-linear shadow-[0_0_10px_rgba(224,0,40,0.8)] group-hover:bg-red-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Volume Control */}
            <div className="pr-4 flex items-center gap-2 relative z-10">
                <button onClick={toggleMute} className="text-[#e00028] hover:text-red-700 transition-colors flex items-center justify-center p-2 rounded-full hover:bg-white/10 relative">
                  <Volume2 className="w-5 h-5 md:w-6 md:h-6 transition-opacity" style={{ opacity: isMuted ? 0.4 : 1 }} />
                  {isMuted && <div className="absolute w-[2px] h-6 bg-[#e00028] rotate-45" />}
                </button>
                
                {/* Volume Slider Bar (Expanded hit area for easy clicking) */}
                <div className="hidden sm:flex w-16 h-8 items-center cursor-pointer group" onClick={handleVolumeChange}>
                    <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden relative pointer-events-none">
                        <div 
                            className="absolute top-0 left-0 h-full bg-[#e00028] rounded-full transition-all duration-75 ease-linear shadow-[0_0_5px_rgba(224,0,40,0.5)] group-hover:bg-red-500"
                            style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
}
