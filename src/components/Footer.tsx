import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Instagram, 
  Youtube, 
  Facebook, 
  ArrowUpRight, 
  ArrowRight,
  Crown,
  Award,
  Lock,
  HeartHandshake,
  Globe
} from 'lucide-react';
import { useApp } from '../AppContext';

export default function Footer(): React.JSX.Element {
  const { addToast, categories } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }
    addToast('Thank you for subscribing to DRIPEON Newsletter!', 'success');
    setEmail('');
  };

  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname.startsWith('/admin')) {
    return <></>;
  }

  return (
    <footer className="w-full relative overflow-hidden font-sans bg-[#e00028] border-t border-red-700 text-white">
      
      {/* 1. BRAND TRUST BADGES RIBBON ROW (Black for high contrast) */}
      <div className="bg-[#111111] py-4 select-none overflow-hidden relative w-full text-white">
        <div className="flex w-max-content whitespace-nowrap">
          <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap cursor-pointer">
            {/* Loop Segment A */}
            <div className="flex items-center gap-16 shrink-0 pr-16">
              {[1, 2].map((loopIdx) => (
                <React.Fragment key={`loop-${loopIdx}`}>
                  <div className="flex items-center gap-3 px-2">
                    <Crown className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
                    <span className="font-sans text-[11px] sm:text-xs tracking-[0.2em] font-bold uppercase">
                      DESIGNED IN NYC
                    </span>
                  </div>
                  <span className="text-white/40 text-xs">✦</span>

                  <div className="flex items-center gap-3 px-2">
                    <Award className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="font-sans text-[11px] sm:text-xs tracking-[0.2em] font-bold uppercase">
                      ASSURED QUALITY
                    </span>
                  </div>
                  <span className="text-white/40 text-xs">✦</span>

                  <div className="flex items-center gap-3 px-2">
                    <Lock className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="font-sans text-[11px] sm:text-xs tracking-[0.2em] font-bold uppercase">
                      SECURE PAYMENTS
                    </span>
                  </div>
                  <span className="text-white/40 text-xs">✦</span>

                  <div className="flex items-center gap-3 px-2">
                    <HeartHandshake className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="font-sans text-[11px] sm:text-xs tracking-[0.2em] font-bold uppercase">
                      EMPOWERING CREATIVES
                    </span>
                  </div>
                  <span className="text-white/40 text-xs">✦</span>
                </React.Fragment>
              ))}
            </div>
            {/* Loop Segment B */}
            <div className="flex items-center gap-16 shrink-0 pr-16">
              {[1, 2].map((loopIdx) => (
                <React.Fragment key={`loop2-${loopIdx}`}>
                  <div className="flex items-center gap-3 px-2">
                    <Crown className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
                    <span className="font-sans text-[11px] sm:text-xs tracking-[0.2em] font-bold uppercase">
                      DESIGNED IN NYC
                    </span>
                  </div>
                  <span className="text-white/40 text-xs">✦</span>

                  <div className="flex items-center gap-3 px-2">
                    <Award className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="font-sans text-[11px] sm:text-xs tracking-[0.2em] font-bold uppercase">
                      ASSURED QUALITY
                    </span>
                  </div>
                  <span className="text-white/40 text-xs">✦</span>

                  <div className="flex items-center gap-3 px-2">
                    <Lock className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="font-sans text-[11px] sm:text-xs tracking-[0.2em] font-bold uppercase">
                      SECURE PAYMENTS
                    </span>
                  </div>
                  <span className="text-white/40 text-xs">✦</span>

                  <div className="flex items-center gap-3 px-2">
                    <HeartHandshake className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="font-sans text-[11px] sm:text-xs tracking-[0.2em] font-bold uppercase">
                      EMPOWERING CREATIVES
                    </span>
                  </div>
                  <span className="text-white/40 text-xs">✦</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT PANEL */}
      <div className="max-w-7xl mx-auto px-6 py-20 pb-8">
        
        {/* Main Grid Layout - Extended to 12 cols for more options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20 text-left">
          
          {/* Column 1: Logo & Description */}
          <div className="lg:col-span-3 flex flex-col items-start pr-4">
            <div className="flex items-center gap-3 cursor-pointer mb-6 group" onClick={() => navigate('/')}>
              <img 
                src="/custom-logo-1.png" 
                alt="Logo" 
                className="w-10 h-10 object-contain filter brightness-0 invert drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-5deg]"
              />
              <h3 className="font-sans text-2xl tracking-[0.1em] text-white uppercase font-black leading-none mt-1">
                DRIPEON
              </h3>
            </div>
            <p className="text-white text-[13px] leading-relaxed max-w-sm font-medium">
              The most powerful streetwear collection & design system for the modern internet era.
            </p>
          </div>

          {/* Column 2: Categories */}
          <div className="lg:col-span-2">
            <h4 className="font-sans text-[13px] text-white font-bold mb-6 tracking-wide">
              Categories
            </h4>
            <ul className="space-y-4 text-[13px] font-medium text-white">
              <li>
                <Link to="/clothing" className="hover:text-white transition-colors">
                  Clothing
                </Link>
              </li>
              <li>
                <Link to="/footwear" className="hover:text-white transition-colors">
                  Footwear
                </Link>
              </li>
              <li>
                <Link to="/caps" className="hover:text-white transition-colors">
                  Caps
                </Link>
              </li>
              <li>
                <Link to="/ear-piercing" className="hover:text-white transition-colors">
                  Ear Piercing
                </Link>
              </li>
              <li>
                <Link to="/ornaments" className="hover:text-white transition-colors">
                  Ornaments
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Support & Legal */}
          <div className="lg:col-span-2">
            <h4 className="font-sans text-[13px] text-white font-bold mb-6 tracking-wide">
              Support
            </h4>
            <ul className="space-y-4 text-[13px] font-medium text-white mb-8">
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link to="/return-policy" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Size Guide</Link></li>
              <li><Link to="/account" className="hover:text-white transition-colors">Track Order</Link></li>
            </ul>

            <h4 className="font-sans text-[13px] text-white font-bold mb-6 tracking-wide">
              Legal
            </h4>
            <ul className="space-y-4 text-[13px] font-medium text-white">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Column 4: Company & Socials */}
          <div className="lg:col-span-2">
            <h4 className="font-sans text-[13px] text-white font-bold mb-6 tracking-wide">
              Company
            </h4>
            <ul className="space-y-4 text-[13px] font-medium text-white mb-8">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li>
                <Link to="/contact" className="group flex items-center hover:text-white transition-colors">
                  Affiliates
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-60 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>

            <h4 className="font-sans text-[13px] text-white font-bold mb-6 tracking-wide">
              Socials
            </h4>
            <ul className="space-y-4 text-[13px] font-medium text-white">
              <li>
                <a href="https://instagram.com/dripeon" target="_blank" rel="noopener noreferrer" className="group flex items-center hover:text-white transition-colors">
                  Instagram
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="https://youtube.com/@dripeon" target="_blank" rel="noopener noreferrer" className="group flex items-center hover:text-white transition-colors">
                  YouTube
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Newsletter */}
          <div className="lg:col-span-3">
            <h4 className="font-sans text-[13px] text-white font-bold mb-4 tracking-wide">
              Newsletter
            </h4>
            <p className="text-white text-[13px] leading-relaxed mb-6 font-medium">
              Receive product updates news, exclusive discounts and early access.
            </p>
            <form onSubmit={handleSubscribe} className="w-full">
              <div className="relative w-full flex items-center bg-white rounded-full border border-transparent p-1.5 focus-within:ring-2 focus-within:ring-black transition-all duration-300 shadow-xl">
                <span className="pl-4 text-gray-400 text-sm font-medium">@</span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email..." 
                  className="w-full bg-transparent px-3 py-2 text-[13px] text-gray-900 focus:outline-none placeholder-gray-400 font-medium"
                />
                <button 
                  type="submit"
                  className="w-10 h-10 shrink-0 bg-[#111111] hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-colors duration-300 cursor-pointer shadow-md"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Copyright Row */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-red-700/50">
          <div className="text-red-200 text-[11px] font-medium mb-4 md:mb-0 flex flex-col md:flex-row items-center gap-1.5 flex-wrap justify-center text-center">
            <span>© Copyright 2024 - 2026 DRIPEON Streetwear Pvt Ltd.</span>
            <span className="hidden md:inline mx-1">·</span>
            <span>All rights reserved.</span>
            <span className="hidden md:inline mx-1">·</span>
            <span>Company Reg No. 109947. GSTIN 27AAKCM0202D1Z2.</span>
            <span className="hidden md:inline mx-1">·</span>
            <span>MADE BY <a href="https://aurora-portfolio-e9k7.vercel.app/" target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-red-200 transition-colors underline decoration-red-500/50 underline-offset-2">AURORA</a></span>
          </div>

          <div className="flex items-center gap-6 text-white">
            <span className="text-[11px] font-medium hidden sm:inline-block">Built in DRIPEON</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors"><Globe className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
