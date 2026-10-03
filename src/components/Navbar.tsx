import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { ShoppingBag, User, Menu, X, Search, Heart, Package, MapPin, LogOut } from 'lucide-react';
import { CentaurArcherLogo } from './ChatWidget';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import RadialNav from './RadialNav';
import { ProductTrie } from '../utils/TrieSearch';

// 🏹 PREMIUM ARCHERY FLANKING ARROWS (MATCHING BRAND VECTOR ART ASSET VERBATIM)
const DEFAULT_LINKS = [
  { label: 'Clothing', href: '/clothing' },
  { label: 'Footwear', href: '/footwear' },
  { label: 'Caps', href: '/caps' },
  { label: 'About', href: '/about' }
];

const ArcheryArrowLeft: React.FC<{ className?: string; color?: string }> = ({
  className = "w-5 h-3",
  color = "white"
}) => (
  <svg className={className} viewBox="0 0 32 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dual chevron fletching tail lines */}
    <path d="M 2,1.5 L 6,5 L 2,8.5" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 5,1.5 L 9,5 L 5,8.5" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    {/* Sharp structural shaft line */}
    <path d="M 7,5 L 26,5" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
    {/* Clean geometric arrowhead pointing towards brand text */}
    <path d="M 25,2 L 29,5 L 25,8 Z" fill={color} />
  </svg>
);

const ArcheryArrowRight: React.FC<{ className?: string; color?: string }> = ({
  className = "w-5 h-3",
  color = "white"
}) => (
  <svg className={className} viewBox="0 0 32 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dual chevron fletching tail lines */}
    <path d="M 2,1.5 L 6,5 L 2,8.5" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 5,1.5 L 9,5 L 5,8.5" stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    {/* Sharp structural shaft line */}
    <path d="M 7,5 L 26,5" stroke={color} strokeWidth="1.25" strokeLinecap="round" />
    {/* Clean geometric arrowhead pointing outward/forward */}
    <path d="M 25,2 L 29,5 L 25,8 Z" fill={color} />
  </svg>
);

const dropdownContainerVariants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.95,
    transition: {
      duration: 0.18,
      ease: "easeOut" as const
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      duration: 0.45,
      bounce: 0.15,
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const dropdownItemVariants = {
  hidden: { opacity: 0, x: -8, y: -4 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 140,
      damping: 15
    }
  }
};

export default function Navbar() {
  const {
    user,
    isAdmin,
    cartCount,
    settings,
    setIsCartOpen,
    logout,
    apiFetch,
    categories,
    globalProducts,
    isProductsLoaded
  } = useApp();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [animateCart, setAnimateCart] = useState(false);
  const prevCartCountRef = useRef(cartCount);

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Global Search Center State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  const trieSearchEngine = React.useMemo(() => {
    const trie = new ProductTrie();
    allProducts.forEach(p => trie.insert(p));
    return trie;
  }, [allProducts]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dynamic products suggestion fetching
  const loadSearchProducts = async () => {
    if (allProducts.length > 0) return;
    setIsLoadingProducts(true);
    try {
      if (globalProducts && globalProducts.length > 0) {
        setAllProducts(globalProducts.filter((p: Product) => p.isActive));
      } else {
        // Wait for globalProducts if not loaded
        if (isProductsLoaded) {
          setAllProducts(globalProducts.filter((p: Product) => p.isActive));
        }
      }
    } catch (err) {
      console.warn("[System Warning] Dynamic suggestions fetch omitted. Loading client-safe luxury portfolio fallbacks.");
      // Fallback elegant catalog list to stay offline-first resilient
      const fallbackProducts: Product[] = [
        {
          id: "fallback-jap-pant",
          name: "Tailored Japanese Origami Pant",
          slug: "black-tailored-japanese-pant",
          description: "Premium cotton avant-garde draping with traditional origami layout.",
          category: "JAPANESE_PANT",
          price: 1299,
          comparePrice: 2149,
          isActive: true,
          fabric: "Premium Cotton",
          fit: "Tailored",
          closure: "Internal Tab",
          waistStyle: "Mid Rise",
          styleType: "Avant-garde Minimal",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          images: [{ id: "fb-1", productId: "fallback-jap-pant", imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80", isPrimary: true, sortOrder: 1 }],
          variants: []
        },
        {
          id: "fallback-gurkha-pant",
          name: "Sovereign Olive Gurkha Trouser",
          slug: "sovereign-olive-gurkha-trouser",
          description: "High-waist classic gurkha utility belts, crafted with raw canvas.",
          category: "GURKHA_PANT",
          price: 1899,
          comparePrice: 2899,
          isActive: true,
          fabric: "Raw Canvas",
          fit: "Relaxed",
          closure: "Gurkha Side Buckle",
          waistStyle: "High Rise",
          styleType: "Cavalry Vintage",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          images: [{ id: "fb-2", productId: "fallback-gurkha-pant", imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80", isPrimary: true, sortOrder: 1 }],
          variants: []
        }
      ];
      setAllProducts(fallbackProducts);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
      loadSearchProducts();
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
      setSearchQuery('');
      setSuggestions([]);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isSearchOpen]);

  // Automatically close search overlay when navigating to a new page
  useEffect(() => {
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Debounce search query for smooth typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Live query filtering (Highly Accurate Scoring System)
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const query = debouncedSearchQuery.toLowerCase().trim();

    // 1. Instantaneous O(1) Prefix Tree lookup for matching candidates
    const rawMatches = trieSearchEngine.search(query);

    // 2. Score ONLY the highly targeted subset of products
    const scoredProducts = rawMatches.map((p: Product) => {
      let score = 0;
      const name = p.name?.toLowerCase() || '';
      const category = p.category?.toLowerCase() || '';
      const desc = p.description?.toLowerCase() || '';
      const fabric = p.fabric?.toLowerCase() || '';
      const fit = p.fit?.toLowerCase() || '';

      // High precision name matching
      if (name === query) score += 100;
      else if (name.startsWith(query)) score += 50;
      else if (name.includes(query)) score += 20;

      // Category matching
      if (category === query || category.replace('_', ' ') === query) score += 40;
      else if (category.includes(query)) score += 15;

      // Attributes matching
      if (fabric.includes(query)) score += 10;
      if (fit.includes(query)) score += 10;
      if (desc.includes(query)) score += 5;

      return { product: p, score };
    });

    // Sort by highest score first
    scoredProducts.sort((a, b) => b.score - a.score);

    // Return top 8 results for the drawer
    setSuggestions(scoredProducts.map(item => item.product).slice(0, 8));
  }, [debouncedSearchQuery, trieSearchEngine]);

  // Escape key close listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close handlers on route transition
  useEffect(() => {
    setIsSearchOpen(false);
    setMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is active to prevent scroll issues and shifting
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 900);
      return () => clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dynamicCategoryLinks = categories.map(cat => ({
    label: cat.name.replace(/_/g, ' '),
    path: `/${cat.type.toLowerCase()}?category=${cat.name}`
  }));

  const mobileLinks = [
    { label: 'Clothing', path: '/clothing' },
    { label: 'Footwear', path: '/footwear' },
    { label: 'Caps', path: '/caps' },
    { label: 'Ornaments', path: '/ornaments' },
    { label: 'Piercing', path: '/ear-piercing' },
    { label: 'Account', path: '/account' }
  ];

  const handleProfileClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (user) {
      setIsProfileDropdownOpen(prev => !prev);
    } else {
      navigate('/login'); // Redirect to login page instead of relying on popup
    }
  };

  if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname.startsWith('/admin')) {
    return null;
  }

  const isDarkHero = location.pathname === '/' || location.pathname === '/ear-piercing' || location.pathname === '/ornaments';
  const isTransparent = !scrolled;
  const useDarkElements = isTransparent ? !isDarkHero : true;
  const textColorClass = useDarkElements ? 'text-gray-900' : 'text-white';

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 w-full z-[60] transition-all duration-300 font-sans text-white"
      onMouseLeave={() => {
        if (!searchQuery.trim()) setIsSearchOpen(false);
      }}
    >
      {/* Announcement Bar */}
      {settings.showAnnouncement && settings.announcementText && (
        <div className="bg-red-600 text-white py-2.5 overflow-hidden border-b border-white/10 select-none relative z-50">
          <div className="flex w-max whitespace-nowrap">
            <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap font-medium text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase cursor-pointer">
              {/* Loop Segment A */}
              <div className="flex items-center gap-12 shrink-0 pr-12">
                <span>{settings.announcementText}</span>
                <span className="text-white/40 text-xs">✦</span>
                <span>{settings.announcementText}</span>
                <span className="text-white/40 text-xs">✦</span>
                <span>{settings.announcementText}</span>
                <span className="text-white/40 text-xs">✦</span>
                <span>{settings.announcementText}</span>
                <span className="text-white/40 text-xs">✦</span>
              </div>
              {/* Loop Segment B (Identical for seamless looping translation) */}
              <div className="flex items-center gap-12 shrink-0 pr-12">
                <span>{settings.announcementText}</span>
                <span className="text-white/40 text-xs">✦</span>
                <span>{settings.announcementText}</span>
                <span className="text-white/40 text-xs">✦</span>
                <span>{settings.announcementText}</span>
                <span className="text-white/40 text-xs">✦</span>
                <span>{settings.announcementText}</span>
                <span className="text-white/40 text-xs">✦</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <nav
        className={`w-full h-20 transition-all duration-300 flex items-center ${scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'
          : 'bg-transparent border-b border-transparent'
          }`}
      >
        <div className="w-full px-4 sm:px-6 md:px-12 flex items-center justify-between relative">

          {/* Left Link cluster (Desktop) */}
          {/* Left Link cluster (Desktop) */}
          <div
            className="hidden lg:flex items-center gap-6"

          >
            <RadialNav />

            {/* Clean E-commerce DRIPEON Logo */}
            <Link
              to="/"
              onClick={(e) => {
                e.preventDefault();
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/');
                  window.scrollTo({ top: 0, behavior: 'instant' as any });
                }
              }}
              className="flex items-center justify-center cursor-pointer text-center select-none group ml-2"
            >
              <motion.img
                src="/custom-logo-1.png"
                alt="DRIPEON"
                className={`w-auto object-contain transition-all duration-300 ease-out h-20 brightness-0 ${useDarkElements ? '' : 'invert group-hover:invert-0'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            </Link>
          </div>

          {/* Hamburger toggle on Mobile */}
          <div className="lg:hidden z-10 flex items-center h-14">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`h-full px-2 flex items-center justify-center transition-colors cursor-pointer ${textColorClass} hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}
            >
              <Menu className="w-8 h-8" strokeWidth={1.5} />
            </button>
          </div>

          {/* Mobile Center Logo */}
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'instant' as any });
              }
            }}
            className="lg:hidden absolute left-1/2 -translate-x-1/2 flex items-center justify-center cursor-pointer text-center select-none group z-10"
          >
            <motion.img
              src="/custom-logo-1.png"
              alt="DRIPEON"
              className="w-auto object-contain transition-transform duration-300 ease-out h-14"
              style={{ filter: useDarkElements ? 'brightness(0)' : 'brightness(0) invert(1)' }}
              whileTap={{ scale: 0.95 }}
            />
          </Link>

          {/* Right Controls cluster */}
          <div className={`flex items-center gap-1.5 sm:gap-4 md:gap-6 text-[11px] uppercase tracking-[0.2em] font-medium ${textColorClass} z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]`}>

            {/* Admin Badging */}
            {user && isAdmin && (
              <Link
                to="/admin/dashboard"

                className="hidden sm:inline-flex items-center gap-1 bg-white text-[10px] font-bold tracking-widest text-red-600 px-3 py-1.5 hover:bg-gray-100 transition-all rounded-md cursor-pointer shadow-sm"
              >
                ADMIN PANEL
              </Link>
            )}

            {/* Desktop Search Bar (Google Style Pill) */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hidden md:flex items-center gap-2 bg-white border border-white rounded-full px-3 py-1.5 w-28 lg:w-32 transition-all duration-300 cursor-pointer text-red-600 hover:bg-gray-50 shadow-sm group"
              title="Search Collections (Esc)"
            >
              <Search className="w-3 h-3 text-red-600 opacity-80 group-hover:opacity-100 transition-opacity" />
              <span className="text-[9px] tracking-widest uppercase font-bold opacity-70 group-hover:opacity-100 transition-opacity">Search...</span>
            </button>

            {/* Mobile Small Search Icon */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`md:hidden p-1.5 rounded-full transition-all duration-300 cursor-pointer flex items-center ${textColorClass} hover-underline`}
              title="Search Collections"
            >
              <Search className={`w-4 h-4 ${textColorClass}`} />
            </button>

            {user ? (
              <div className="relative py-2" ref={profileDropdownRef} >
                <button
                  onClick={handleProfileClick}
                  className="hidden md:flex items-center gap-1.5 transition-colors cursor-pointer uppercase text-[10px] tracking-[0.2em] font-bold text-red-600 bg-white px-3 py-1.5 rounded-full hover:bg-gray-50 shadow-sm"
                >
                  <User className="w-3 h-3 text-red-600" />
                  <span>{user.name.split(' ')[0]}</span>
                  <span className={`text-[8px] transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180 text-red-600' : 'text-red-600/80'}`}>▼</span>
                </button>

                <button
                  onClick={handleProfileClick}
                  className={`md:hidden p-1 px-1.5 ${textColorClass} hover:text-white transition-all cursor-pointer animate-none`}
                >
                  <User className="w-4 h-4" />
                </button>

                {/* Staggered double-curtain background reveal */}
                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      variants={dropdownContainerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="absolute right-0 top-full mt-1.5 w-76 bg-white border border-red-600/25 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 text-left overflow-hidden"
                    >
                      {/* Interactive Backdrop curtain reveal */}
                      <motion.div
                        initial={{ scaleY: 1 }}
                        animate={{ scaleY: 0 }}
                        exit={{ scaleY: 1 }}
                        transition={{ duration: 0.45, ease: "circOut" as const }}
                        className="absolute inset-0 bg-red-600/30 z-20 origin-top pointer-events-none"
                      />
                      <motion.div
                        initial={{ scaleY: 1 }}
                        animate={{ scaleY: 0 }}
                        exit={{ scaleY: 1 }}
                        transition={{ delay: 0.08, duration: 0.45, ease: "circOut" as const }}
                        className="absolute inset-0 bg-gray-50 z-10 origin-top pointer-events-none"
                      />

                      {/* Dropdown Header - just User Name on top */}
                      <motion.div
                        variants={dropdownItemVariants}
                        className="px-5 py-4 border-b border-red-600/15 bg-gray-50 select-none relative z-0"
                      >
                        <p className="text-xs font-sans text-red-600 tracking-[0.15em] uppercase font-bold truncate">
                          {user.name}
                        </p>
                        <p className="text-[9px] text-gray-500 truncate uppercase font-bold mt-0.5">
                          {user.email}
                        </p>
                      </motion.div>

                      {/* Options */}
                      <div className="p-2 space-y-1 bg-white relative z-0">
                        {/* 1. My Profile */}
                        <motion.div variants={dropdownItemVariants}>
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              navigate('/account?tab=profile');
                            }}
                            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg hover:bg-red-600/10 text-gray-900 hover:text-red-600 transition-all text-[11px] font-medium uppercase tracking-wider cursor-pointer font-bold text-left"
                          >
                            <User className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <span>My Profile</span>
                          </button>
                        </motion.div>

                        {/* 2. My Orders */}
                        <motion.div variants={dropdownItemVariants}>
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              navigate('/account?tab=orders');
                            }}
                            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg hover:bg-red-600/10 text-gray-900 hover:text-red-600 transition-all text-[11px] font-medium uppercase tracking-wider cursor-pointer font-bold text-left"
                          >
                            <Package className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <span>My Orders</span>
                          </button>
                        </motion.div>

                        {/* 3. My Wishlist */}
                        <motion.div variants={dropdownItemVariants}>
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              navigate('/account?tab=wishlist');
                            }}
                            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg hover:bg-red-600/10 text-gray-900 hover:text-red-600 transition-all text-[11px] font-medium uppercase tracking-wider cursor-pointer font-bold text-left"
                          >
                            <Heart className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <span>My Wishlist</span>
                          </button>
                        </motion.div>

                        {/* 4. Address Settings */}
                        <motion.div variants={dropdownItemVariants}>
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              navigate('/account?tab=addresses');
                            }}
                            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg hover:bg-red-600/10 text-gray-900 hover:text-red-600 transition-all text-[11px] font-medium uppercase tracking-wider cursor-pointer font-bold text-left"
                          >
                            <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <span>Address Settings</span>
                          </button>
                        </motion.div>

                        {/* Admin Panel Link in Dropdown */}
                        {isAdmin && (
                          <motion.div variants={dropdownItemVariants}>
                            <button
                              onClick={() => {
                                setIsProfileDropdownOpen(false);
                                navigate('/admin/dashboard');
                              }}
                              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg hover:bg-red-600/10 text-red-600 hover:text-white transition-all text-[11px] font-medium uppercase tracking-wider cursor-pointer font-black text-left border-t border-[#0f3024]/40 pt-3 mt-1.5"
                            >
                              <svg className="w-4 h-4 text-red-600 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span>Admin Control Panel</span>
                            </button>
                          </motion.div>
                        )}

                        {/* 5. Sign Out */}
                        <motion.div variants={dropdownItemVariants}>
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              logout();
                              navigate('/');
                            }}
                            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all text-[11px] font-medium uppercase tracking-wider cursor-pointer font-bold text-left border-t border-[#0f3024]/20 pt-2.5 mt-1"
                          >
                            <LogOut className="w-4 h-4 flex-shrink-0 text-red-400" />
                            <span>Sign Out</span>
                          </button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4" >
                <button
                  onClick={handleProfileClick}
                  className="hidden md:flex items-center gap-1.5 transition-colors cursor-pointer uppercase text-[10px] tracking-[0.2em] font-bold text-red-600 bg-white px-3 py-1.5 rounded-full hover:bg-gray-50 shadow-sm"
                >
                  <User className="w-3 h-3 text-red-600" />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={handleProfileClick}
                  className="md:hidden p-1 px-1.5 transition-colors cursor-pointer text-gray-900 hover:text-red-600"
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Cart with count */}
            <button
              onClick={() => setIsCartOpen(true)}

              className={`relative flex items-center gap-1.5 cursor-pointer transition-all duration-300 font-bold bg-white px-3 py-1.5 rounded-full hover:bg-gray-50 shadow-sm ${animateCart ? 'scale-110 text-red-600 font-black' : 'text-red-600'}`}
            >
              <ShoppingBag className={`w-3.5 h-3.5 sm:w-3 sm:h-3 transition-transform duration-300 text-red-600 ${animateCart ? 'rotate-12 scale-110' : ''}`} />
              <span className="hidden sm:inline uppercase text-[10px] tracking-[0.2em] font-medium">Cart ({cartCount})</span>
              {cartCount > 0 && (
                <span className="sm:hidden absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-white font-medium text-[9px] font-bold flex items-center justify-center rounded-full shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </nav>

      {/* Sleek Slide-Down Search Drawer Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-white/60 backdrop-blur-3xl border-b border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden font-sans text-left relative z-30"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12">

              {/* Left search bar / typing center */}
              <div className="md:col-span-6 space-y-5">
                <div>
                  <h3 className="text-base sm:text-lg font-sans font-black text-gray-900 uppercase tracking-wider">
                    Search for product
                  </h3>
                </div>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600/70 select-none pointer-events-none">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for product"
                    className="w-full bg-white/40 backdrop-blur-md border border-white/60 text-gray-900 font-sans text-sm sm:text-base tracking-wide placeholder-gray-500 rounded-xl pl-11 pr-10 py-3.5 focus:bg-white/80 focus:border-red-600/60 focus:outline-none focus:ring-2 focus:ring-red-600/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] hover:bg-white/50 transition-all duration-300"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-900 hover:text-gray-900 transition-all cursor-pointer"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>

                {/* Suggested curated search queries */}
                <div className="space-y-2 pt-1 border-t border-red-600/10">
                  <span className="text-[10px] uppercase font-medium tracking-widest text-gray-900 font-bold block">
                    Collections
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { display: 'Utility', value: 'utility' },
                      { display: 'Tailored', value: 'tailored' },
                      { display: 'Oversized', value: 'oversized' },
                      { display: 'Stealth', value: 'stealth' },
                      { display: 'Bespoke', value: 'bespoke' }
                    ].map((tag) => (
                      <button
                        key={tag.value}
                        type="button"
                        onClick={() => {
                          setSearchQuery(tag.value.replace('_', ' '));
                          searchInputRef.current?.focus();
                        }}
                        className="bg-white/40 backdrop-blur-sm border border-white/60 hover:bg-white/80 hover:border-red-600/40 hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(230,0,18,0.1)] active:scale-95 text-gray-900 hover:text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-medium tracking-wider transition-all duration-300 cursor-pointer font-bold"
                      >
                        #{tag.display}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Right: Live suggestions grid */}
              <div className="md:col-span-6 border-t md:border-t-0 md:border-l border-red-600/15 pt-6 md:pt-0 md:pl-10 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-red-600/15 pb-2.5 mb-3">
                    <span className="text-[10px] tracking-widest font-medium text-gray-900 uppercase font-bold">
                      Matching Pieces
                    </span>
                    {isLoadingProducts && (
                      <span className="text-[9px] font-medium text-red-600 animate-pulse">
                        searching catalog...
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                    {searchQuery.trim() === '' ? (
                      <div className="py-6 text-left">
                        <p className="text-xs text-gray-500/70 font-sans italic leading-relaxed">
                          Enter product titles, silhouettes, fabric properties, or custom categories above to display corresponds instantly.
                        </p>
                      </div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((p) => {
                        const primaryImage = p.images?.find(i => i.isPrimary) || p.images?.[0];
                        const imageUrl = primaryImage ? primaryImage.imageUrl : 'https://placehold.co/100x120';

                        return (
                          <div
                            key={p.id}
                            className="flex items-center justify-between gap-4 p-2 rounded-xl border border-white/50 bg-white/30 backdrop-blur-md hover:bg-white/70 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)] hover:border-red-600/30 transition-all duration-300 group cursor-pointer"
                          >
                            <Link
                              to={`/product/${p.slug}`}
                              state={{ openLightbox: true }}
                              className="flex items-center gap-3.5 flex-1 select-none text-left"
                            >
                              <motion.img
                                layoutId={`product-image-${p.id}`}
                                src={imageUrl}
                                alt={p.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-12 object-cover rounded-md border border-gray-200/25 bg-white"
                              />
                              <div className="space-y-0.5">
                                <h5 className="font-sans text-xs font-bold text-gray-900 uppercase leading-tight tracking-wider line-clamp-1 hover:text-red-600 transition-colors">
                                  {p.name}
                                </h5>
                                <p className="text-[9px] font-medium tracking-widest text-red-600 uppercase">
                                  {p.category.replace('_', ' ')}
                                </p>
                                <p className="text-[10px] font-medium text-gray-900">
                                  ₹{p.price.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </Link>

                            <Link
                              to={`/product/${p.slug}`}
                              state={{ openLightbox: true }}
                              className="px-3 py-1.5 bg-white/60 backdrop-blur-sm select-none hover:bg-red-600 border border-white/60 group-hover:border-red-600/30 text-gray-900 hover:text-white rounded-lg text-[9px] uppercase tracking-widest font-medium font-black transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                              EXPLORE
                            </Link>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-4 text-left space-y-2">
                        <p className="text-xs text-red-600 font-bold uppercase tracking-wider">
                          Aura Unmatched
                        </p>
                        <p className="text-[11px] text-gray-900 font-sans">
                          No items matched "{searchQuery}" inside current inventory. Try alternative spelling or explore collections.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {suggestions.length > 0 && (
                  <Link
                    to="/clothing"
                    className="block text-center w-full bg-gray-50 border border-red-600/20 text-red-600 text-[10px] tracking-widest uppercase py-2.5 rounded-lg font-medium hover:bg-red-600 hover:text-white transition-all duration-300 font-black mt-2 select-none"
                  >
                    VIEW ALL MATCHING PRODUCTS ({allProducts.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase())).length})
                  </Link>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Full-Screen Drawer / Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70] bg-white flex flex-col p-6 animate-slide-in">
          <div className="flex items-center justify-between border-b border-gray-200 pb-6">
            <Link
              to="/"
              onClick={(e) => {
                e.preventDefault();
                setMobileMenuOpen(false);
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/');
                  window.scrollTo({ top: 0, behavior: 'instant' as any });
                }
              }}
              className="flex flex-col items-center justify-center gap-1.5 select-none w-full text-center"
            >
              <img
                src="/custom-logo-1.png"
                alt="DRIPEON"
                className="w-auto object-contain h-10 mb-2"
                style={{ filter: 'brightness(0)' }}
              />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-900 hover:text-gray-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6 text-center text-lg uppercase font-sans tracking-[0.2em] my-12">
            {/* Mobile Search Input Trigger */}
            <div className="px-4 max-w-sm mx-auto w-full -mt-6 mb-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="w-full bg-white/95 border border-red-600/25 text-gray-900 hover:text-red-600 text-[10px] font-medium tracking-widest uppercase rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer select-none"
              >
                <span className="flex items-center gap-2 font-bold">
                  <Search className="w-3.5 h-3.5 text-red-600" />
                  <span>Search Collections...</span>
                </span>
                <span className="text-[10px] text-red-600">✦</span>
              </button>
            </div>

            {mobileLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-red-600 font-bold hover:text-red-800 transition-colors cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-6 flex flex-col gap-4 text-center">
            {user ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-900 uppercase tracking-wider">Logged in as {user.name}</p>
                <Link
                  to={isAdmin ? "/admin/dashboard" : "/account"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block bg-red-600 text-gray-900 text-gray-900 font-sans py-3 text-xs font-semibold uppercase tracking-widest rounded-sm cursor-pointer"
                >
                  My Dashboard
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block border border-red-600 text-red-600 font-sans py-3 text-xs uppercase tracking-[0.15em] rounded-sm cursor-pointer"
              >
                Sign In / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

