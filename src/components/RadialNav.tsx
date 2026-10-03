import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Shirt, Footprints, Crown, Truck, Watch, PhoneCall, Menu, X, Gem, Ear } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/', icon: <Home className="w-5 h-5" /> },
  { label: 'Clothing', href: '/clothing', icon: <Shirt className="w-5 h-5" /> },
  { label: 'Footwear', href: '/footwear', icon: <Footprints className="w-5 h-5" /> },
  { label: 'Caps', href: '/caps', icon: <Crown className="w-5 h-5" /> },
  { label: 'Ornaments', href: '/ornaments', icon: <Watch className="w-5 h-5" /> },
  { label: 'Ear Piercing', href: '/ear-piercing', icon: <Ear className="w-5 h-5" /> },
  { label: 'Contact', href: '/contact', icon: <PhoneCall className="w-5 h-5" /> },
];

export default function RadialNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Radius for the items
  const radius = 200;

  return (
    <div className="relative z-[100] flex flex-col items-center justify-center" ref={menuRef}>

      {/* Semicircle / Radial Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.1 } }}
            className="absolute left-6 top-6 w-0 h-0 z-0"
          >
            {/* Premium Aesthetic Glowing Arc Track */}
            <motion.div
              className="absolute top-0 left-0 z-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <svg width={radius + 80} height={radius + 80} className="overflow-visible">
                <defs>
                  <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(0, 0, 0, 0.08)" />
                    <stop offset="100%" stopColor="rgba(0, 0, 0, 0.02)" />
                  </linearGradient>
                  <filter id="arcGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="12" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <motion.circle
                  cx="0" cy="0" r={radius}
                  fill="none"
                  stroke="url(#arcGrad)"
                  strokeWidth="64"
                  strokeLinecap="round"
                  filter="url(#arcGlow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 0.25, opacity: 1 }}
                  exit={{ pathLength: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 100, damping: 25 }}
                />
              </svg>
            </motion.div>

            {navItems.map((item, index) => {
              // Since it's on the left side of the navbar, we'll spread it from right to down
              // Angle from 0 to 90 degrees (0 to PI/2).
              // Actually, spreading from -10 deg to 100 deg looks better, but let's stick to 0 to 90.
              const angle = (index * (Math.PI / 2 / (navItems.length - 1)));
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;

              const isActive = location.pathname === item.href ||
                (item.href !== '/' && location.pathname.startsWith(item.href));

              return (
                <motion.div
                  key={item.href}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                  animate={{ x, y, scale: 1, opacity: 1 }}
                  exit={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 22,
                    delay: index * 0.05
                  }}
                  className="absolute left-0 top-0 -ml-6 -mt-6 group"
                >
                  <Link
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.12)] border transition-transform hover:scale-110 relative z-10 ${isActive
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-900 border-gray-200/80 hover:border-gray-300 hover:text-red-600 hover:shadow-[0_8px_25px_rgba(0,0,0,0.18)]'
                      }`}
                  >
                    {item.icon}
                  </Link>

                  {/* Sliding Right Tooltip */}
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300 ease-out z-0 flex items-center">
                    <span className="bg-gray-900 text-white shadow-lg text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md whitespace-nowrap ml-2">
                      {item.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger Button */}
      <div className="flex flex-col items-center justify-center relative group mt-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.12)] border transition-all duration-300 z-10 ${isOpen ? 'bg-black text-white border-black' : 'bg-white text-gray-900 border-gray-200/80 group-hover:bg-black group-hover:text-white group-hover:border-black group-hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]'
            }`}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className={`absolute -bottom-4 text-[9px] font-bold uppercase tracking-widest transition-colors ${isOpen ? 'text-black opacity-0' : 'text-white group-hover:text-black'}`}>
          Menu
        </span>
      </div>

    </div>
  );
}
