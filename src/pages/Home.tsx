import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import {
  ArrowRight,
  Sparkles,
  Award,
  Compass,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { SafeImage } from '../components/SafeImage';
import Shuffle from '../components/Shuffle';
import { Product, ProductVariant, ProductImage } from '../types';
import { ParticleCard, GlobalSpotlight } from '../components/MagicBentoCard';

import TiltedCard from '../components/TiltedCard';
import PhotoGlobe from '../components/PhotoGlobe';
import ShinyText from '../components/ShinyText';
import LookbookSection from '../components/LookbookSection';
import { gsap } from 'gsap';
import RunwayLookbook from '../components/RunwayLookbook';
import WebGLCarousel from '../components/WebGLCarousel';
import SpecularButton from '../components/SpecularButton';

// Ultra-fast localized Wishlist Button to prevent full-page re-renders
const HomeWishlistButton = ({ productId }: { productId: string }) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useApp();
  const isGlobalWishlisted = wishlist.some((w: any) => w.productId === productId);
  const [localWishlisted, setLocalWishlisted] = useState<boolean | null>(null);

  const isWishlisted = localWishlisted !== null ? localWishlisted : isGlobalWishlisted;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // INSTANT LOCAL UI UPDATE (0ms delay)
    setLocalWishlisted(!isWishlisted);

    if (isWishlisted) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="absolute top-3 right-3 w-8 h-8 bg-white/80 hover:bg-red-600 text-gray-900 hover:text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-md border border-gray-200/50 backdrop-blur-sm transform hover:scale-110 active:scale-90 z-20 cursor-pointer"
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart 
        className={`w-3.5 h-3.5 transition-none ${
          isWishlisted ? 'fill-red-500 text-red-500 scale-115' : 'text-gray-900'
        }`} 
      />
    </button>
  );
};

export default function Home() {
  const { settings, addToCart, addToast, categories: appCategories, globalProducts, wishlist, addToWishlist, removeFromWishlist } = useApp();
  const navigate = useNavigate();
  const statsGridRef = useRef<HTMLDivElement>(null);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHoveringHero, setIsHoveringHero] = useState(false);

  // Dynamically separate clothing vs footwear using the real category types from the database
  // This handles admin-added products with custom category names correctly
  const footwearCategoryNames = appCategories.filter(c => c.type === 'FOOTWEAR').map(c => c.name);
  const clothingProducts = allProducts.filter(p =>
    footwearCategoryNames.length > 0
      ? !footwearCategoryNames.includes(p.category)
      : !['SNEAKER', 'BOOT', 'LOAFER'].includes(p.category)
  );
  const footwearProducts = allProducts.filter(p =>
    footwearCategoryNames.length > 0
      ? footwearCategoryNames.includes(p.category)
      : ['SNEAKER', 'BOOT', 'LOAFER'].includes(p.category)
  );



  useEffect(() => {
    let isMounted = true;
    setMounted(true);

    if (globalProducts && globalProducts.length > 0) {
      setAllProducts(globalProducts);
      const shacket = globalProducts.find((p: Product) => p.category === 'SHACKET' || p.slug.includes('shacket')) || globalProducts[0];
      setFeaturedProduct(prev => {
        if (prev && prev.id === shacket.id) return prev;
        return shacket;
      });
      if (shacket && shacket.variants && shacket.variants.length > 0) {
        setSelectedVariant(prev => {
          if (prev && shacket.variants.find((v:any) => v.id === prev.id)) return prev;
          return shacket.variants[0];
        });
      }
    }

    return () => {
      isMounted = false;
    };
  }, [globalProducts]);



  useEffect(() => {
    if (mounted && heroContainerRef.current) {
      const ctx = gsap.context(() => {
        // Minimal state-set to avoid snap glitches
        gsap.set('.gsap-hero-fade', { opacity: 0, y: 20 });
        gsap.set('.gsap-hero-card', { opacity: 0, y: 30 });
        gsap.set('.gsap-hero-model', { opacity: 0 });

        // Staggered layout entry using Power4.out for ultimate premium look
        gsap.to('.gsap-hero-fade', {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.08,
          ease: 'power4.out',
          clearProps: 'all'
        });

        // Slow soft transition for the background model aspect
        gsap.to('.gsap-hero-model', {
          opacity: 0.75,
          duration: 1.8,
          ease: 'power3.out',
          clearProps: 'opacity'
        });

        // Right hand TiltedCard bracket sweep
        gsap.to('.gsap-hero-card', {
          opacity: 1,
          y: 0,
          duration: 1.4,
          delay: 0.3,
          ease: 'power4.out',
          clearProps: 'all'
        });
      }, heroContainerRef);

      return () => ctx.revert();
    }
  }, [mounted]);

  const handleAddToBag = async (product: Product | null, variant: ProductVariant | null, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!variant) {
      addToast("Please select a size before proceeding.", "error");
      return;
    }
    await addToCart(variant.id, 1);
  };

  return (
    <div className="flex-grow pb-16 font-sans bg-white text-gray-900">

      {/* 1. RED & WHITE AESTHETIC HERO (Poster-inspired with Radial Hover) */}
      <section
        ref={heroContainerRef}
        className="relative h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] flex flex-col items-center justify-center overflow-hidden bg-[#e00028] select-none w-full"
        onMouseMove={(e) => {
          const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - left) / width) * 100;
          const y = ((e.clientY - top) / height) * 100;
          setMousePos({ x, y });
        }}
        onMouseEnter={() => setIsHoveringHero(true)}
        onMouseLeave={() => setIsHoveringHero(false)}
      >
        {/* Concentric Background Circles (Poster aesthetic) */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
          <div className="absolute w-[40vw] h-[40vw] rounded-full border border-white/20" />
          <div className="absolute w-[70vw] h-[70vw] rounded-full border border-white/10" />
          <div className="absolute w-[100vw] h-[100vw] rounded-full border border-white/5" />
        </div>

        {/* Scattered Typography (Y2K / Streetwear Vibe) */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          {/* Top Center Title */}
          <div className="absolute top-36 md:top-32 w-full text-center z-30">
            <style>
              {`
                @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Rubik+Dirt&display=swap');
                .dripeon-grunge {
                  font-family: 'Rubik Dirt', 'Permanent Marker', cursive;
                  letter-spacing: 0.05em;
                }
              `}
            </style>
            <h1 className="dripeon-grunge text-white text-6xl md:text-8xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transform -rotate-2 leading-none">
              DRIPEON
            </h1>
            <h2 className="text-white/90 font-black text-lg md:text-2xl uppercase tracking-[0.4em] mt-2 drop-shadow-lg font-sans">
              Streetwear Collection
            </h2>
          </div>

          {/* Abstract Floating Texts */}
          <span className="absolute top-1/4 left-4 sm:left-12 text-white/20 text-5xl sm:text-8xl md:text-[7rem] font-black italic -rotate-[12deg] select-none blur-[1px]">
            STREETWEAR
          </span>
          <span
            className="absolute bottom-1/4 right-4 sm:right-16 text-transparent text-6xl sm:text-8xl md:text-[8rem] font-black rotate-[10deg] select-none"
            style={{ WebkitTextStroke: '2px rgba(255,255,255,0.4)' }}
          >
            INTERNET
          </span>
          <span className="absolute top-[45%] left-8 md:left-24 text-white font-black text-6xl md:text-[6rem] leading-[0.9] uppercase select-none z-30 drop-shadow-xl">
            DRIP START <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '2px white' }}>HERE</span>
          </span>
          <span className="absolute top-1/3 right-10 sm:right-24 text-white/50 text-2xl md:text-4xl font-light uppercase tracking-[0.5em] select-none rotate-90 origin-right">
            Premium Quality
          </span>
        </div>

        {/* Floating Abstract Shapes Removed */}



        {/* X-Ray Reveal Layer (Inverted White Background & Black Text) */}
        <div
          className="absolute inset-0 z-30 pointer-events-none overflow-hidden bg-white/95"
          style={{
            clipPath: isHoveringHero
              ? `circle(120px at ${mousePos.x}% ${mousePos.y}%)`
              : `circle(0px at ${mousePos.x}% ${mousePos.y}%)`,
            transition: isHoveringHero ? 'clip-path 0s' : 'clip-path 0.3s ease-out',
          }}
        >
          {/* Inverted Typography */}
          <div className="absolute top-36 md:top-32 w-full text-center z-30">
            <h1 className="dripeon-grunge text-gray-900 text-6xl md:text-8xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] transform -rotate-2 leading-none">
              {settings.heroTitle || 'DRIPEON'}
            </h1>
            <h2 className="text-gray-900/90 font-black text-lg md:text-2xl uppercase tracking-[0.4em] mt-2 drop-shadow-sm font-sans">
              {settings.heroSub || 'Streetwear Collection'}
            </h2>
          </div>

          <span className="absolute top-1/4 left-4 sm:left-12 text-gray-900/10 text-5xl sm:text-8xl md:text-[7rem] font-black italic -rotate-[12deg] select-none blur-[1px]">
            STREETWEAR
          </span>
          <span
            className="absolute bottom-1/4 right-4 sm:right-16 text-transparent text-6xl sm:text-8xl md:text-[8rem] font-black rotate-[10deg] select-none"
            style={{ WebkitTextStroke: '2px rgba(0,0,0,0.15)' }}
          >
            INTERNET
          </span>
          <span className="absolute top-[45%] left-8 md:left-24 text-gray-900 font-black text-6xl md:text-[6rem] leading-[0.9] uppercase select-none z-30 drop-shadow-sm">
            DRIP START <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '2px #111827' }}>HERE</span>
          </span>
          <span className="absolute top-1/3 right-10 sm:right-24 text-gray-900/30 text-2xl md:text-4xl font-light uppercase tracking-[0.5em] select-none rotate-90 origin-right">
            Premium Quality
          </span>


        </div>

        {/* Bottom Mascot Lineup (Stickers) */}
        <div className="absolute bottom-0 left-0 w-full flex justify-center items-end -space-x-4 sm:space-x-0 sm:gap-2 md:gap-4 lg:gap-8 pointer-events-none z-40 h-[30vh] sm:h-[30vh] md:h-[40vh] overflow-visible px-2 sm:px-4">
          <img
            src="/images/deadpool.png"
            alt="Deadpool"
            className="h-[30vh] sm:h-[30vh] md:h-[40vh] w-auto max-w-[20%] sm:max-w-[11%] md:max-w-[12%] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-110 hover:-translate-y-6 pointer-events-auto cursor-pointer"
            style={{ transform: isHoveringHero ? 'scale(1.05) translate(8px, 0)' : 'scale(1)' }}
          />
          <img
            src="/images/tanjiro.png"
            alt="Tanjiro"
            className="h-[30vh] sm:h-[30vh] md:h-[40vh] w-auto max-w-[20%] sm:max-w-[11%] md:max-w-[12%] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-110 hover:-translate-y-6 pointer-events-auto cursor-pointer"
            style={{ transform: isHoveringHero ? 'scale(1.03) translate(5px, -2px)' : 'scale(1)' }}
          />
          <img
            src="/images/bugs.png"
            alt="Bugs Bunny"
            className="h-[30vh] sm:h-[30vh] md:h-[40vh] w-auto max-w-[20%] sm:max-w-[11%] md:max-w-[12%] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-110 hover:-translate-y-6 pointer-events-auto cursor-pointer"
            style={{ transform: isHoveringHero ? 'scale(1.02) translate(3px, -4px)' : 'scale(1)' }}
          />
          <img
            src="/images/luffy.png"
            alt="Luffy"
            className="h-[30vh] sm:h-[30vh] md:h-[40vh] w-auto max-w-[20%] sm:max-w-[11%] md:max-w-[12%] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-110 hover:-translate-y-6 pointer-events-auto cursor-pointer"
            style={{ transform: isHoveringHero ? 'scale(1.04) translate(1px, -3px)' : 'scale(1)' }}
          />
          <img
            src="/images/goku.png"
            alt="Goku"
            className="h-[30vh] sm:h-[30vh] md:h-[40vh] w-auto max-w-[20%] sm:max-w-[11%] md:max-w-[12%] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-110 hover:-translate-y-6 pointer-events-auto cursor-pointer"
            style={{ transform: isHoveringHero ? 'scale(1.03) translate(-3px, -4px)' : 'scale(1)' }}
          />
          <img
            src="/images/spiderman.png"
            alt="Spiderman"
            className="h-[30vh] sm:h-[30vh] md:h-[40vh] w-auto max-w-[20%] sm:max-w-[11%] md:max-w-[12%] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-110 hover:-translate-y-6 pointer-events-auto cursor-pointer"
            style={{ transform: isHoveringHero ? 'scale(1.02) translate(-5px, -2px)' : 'scale(1)' }}
          />
          <img
            src="/images/zenitsu.png"
            alt="Zenitsu"
            className="h-[30vh] sm:h-[30vh] md:h-[40vh] w-auto max-w-[20%] sm:max-w-[11%] md:max-w-[12%] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-110 hover:-translate-y-6 pointer-events-auto cursor-pointer"
            style={{ transform: isHoveringHero ? 'scale(1.05) translate(-8px, 0)' : 'scale(1)' }}
          />
          <img
            src="/images/sukuna.png"
            alt="Sukuna"
            className="h-[30vh] sm:h-[30vh] md:h-[40vh] w-auto max-w-[20%] sm:max-w-[11%] md:max-w-[12%] object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-110 hover:-translate-y-6 pointer-events-auto cursor-pointer"
            style={{ transform: isHoveringHero ? 'scale(1.04) translate(-10px, -2px)' : 'scale(1)' }}
          />
        </div>

      </section>

      {/* 3. CUSTOM ADMIN PROMO BANNER OR DEFAULT RETRO PAPER COUPON CARD */}
      <section className="py-12 bg-transparent flex justify-center items-center">
        <TiltedCard
          captionText={settings?.promoImageBase64 ? (settings?.promoImageCaption || "EXCLUSIVE PROMO") : "GRAB ₹300 COUPON"}
          containerWidth="100%"
          className="w-full cursor-grab active:cursor-grabbing"
          scaleOnHover={1.01}
          rotateAmplitude={4}
          showTooltip={true}
        >
          {settings?.promoImageBase64 ? (
            <div className="w-full h-[350px] md:h-[500px] relative overflow-hidden shadow-xl flex justify-center items-center group">
              <img src={settings.promoImageBase64 || "https://images.unsplash.com/photo-1550246140-5119ae4790b8?auto=format&fit=crop&w=1500&q=80"} alt="Promotional Offer" className="w-full h-full object-cover border-y border-[#1c1c1c]/10 group-hover:scale-105 transition-transform duration-700 ease-out" />
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto relative overflow-hidden bg-[#e60012] text-white p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 border border-white/20 anti-gravity-card">

              {/* Perforated semi-circle cuts (left and right) */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-gray-200/50 z-10 hidden sm:block"></div>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-gray-200/50 z-10 hidden sm:block"></div>

              {/* Perforated lines inside */}
              <div className="absolute left-[20%] top-0 bottom-0 w-[1px] border-l-2 border-dashed border-white/30 hidden md:block"></div>

              {/* Coupon discount text */}
              <div className="text-center md:text-left z-10 md:pl-8">
                <span className="text-[10px] font-medium tracking-[0.25em] font-extrabold text-white/60 uppercase block mb-1">WELCOME INITIATIVE</span>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black tracking-tighter uppercase leading-none">
                  FLAT ₹300 OFF
                </div>
                <span className="text-[11px] font-medium tracking-widest uppercase font-bold text-[#443825] block mt-1">
                  On Your 1st Purchase! / Special Launch Offer
                </span>
              </div>

              {/* Coupon CTA Code */}
              <div className="flex flex-col items-center md:items-end z-10 md:pr-4 space-y-2.5">
                <span className="text-[9px] font-medium tracking-[0.2em] uppercase font-bold text-[#443825]">USE DISCOUNT CODE AT CHECKOUT:</span>
                <div className="bg-white text-red-600 px-6 py-2.5 font-medium text-sm sm:text-base font-extrabold tracking-[0.16em] border border-red-200 rounded-full">
                  FIRST300
                </div>
                <span className="text-[9px] text-[#423927] font-medium tracking-widest uppercase">
                  VALID FOR NEXT 48 HOURS ONLY
                </span>
              </div>
            </div>
          )}
        </TiltedCard>
      </section>

      {/* 3.1 3D CURVED CAROUSEL (LATEST DROPS) */}
      <section className="w-full bg-white">
        <WebGLCarousel products={allProducts} />
      </section>

      {/* 4. AMAZING PRODUCT CATALOG (Heart icon above clothes like Amazon/Flipkart - Screenshot 4) */}
      <section id="new-arrivals-section" className="py-20 px-4 sm:px-6 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">

          {/* Section Header elements */}
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 pb-6 border-b border-gray-200">
            <div className="space-y-1">
              <span className="text-xs font-bold text-red-600 tracking-[0.3em] uppercase block">SHOP THE HOTTEST ARRIVALS</span>
              <h2 className="font-sans text-3xl sm:text-5xl tracking-widest uppercase font-extrabold select-none">
                <ShinyText text="NEW ARRIVALS" speed={3} color="#111111" shineColor="#e00028" spread={100} />
              </h2>
            </div>
            <button
              onClick={() => navigate('/clothing')}
              className="text-xs font-bold tracking-[0.16em] text-red-600 hover:text-white uppercase flex items-center gap-2 mt-4 md:mt-0 transition-colors cursor-pointer py-2 px-4 border border-red-600/30 hover:border-red-600 hover:bg-red-600 rounded-full anti-gravity-card"
            >
              BROWSE WHOLE LOOKBOOK <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-8">
            {clothingProducts.slice(0, 4).map((p) => {
              const primaryImg = (p.images?.find((img: ProductImage) => img.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || "").replace("w_1200", "w_400");
              const secondaryImg = (p.images?.find((img: ProductImage) => !img.isPrimary && img.imageUrl)?.imageUrl || primaryImg || "").replace("w_1200", "w_400");

              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/products/${p.slug}`)}
                  className="group relative flex flex-col justify-between bg-white border border-gray-100 hover:border-red-500 rounded-2xl overflow-hidden p-3 anti-gravity-card"
                  data-cursor="view"
                >
                  <div className="h-56 sm:h-80 w-full overflow-hidden relative bg-white rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                    <span className="absolute top-3 left-3 bg-white/80 px-2 py-0.5 text-[8px] font-medium tracking-widest text-red-600 rounded z-20 border border-red-600/25 uppercase">
                      {p.category.replace('_', ' ')}
                    </span>

                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 text-[9px] font-medium tracking-widest text-gray-900 rounded-md z-20 flex items-center gap-1 shadow-md border border-gray-200/60">
                      <span className="text-[#C9A96E] text-[10px]">★</span>
                      <span>{p.averageRating != null ? p.averageRating.toFixed(1) : '5.0'} ({p.reviewCount || 0})</span>
                    </div>

                    <HomeWishlistButton productId={p.id} />

                    <SafeImage
                      src={primaryImg}
                      alt={p.name}
                      className="w-full h-full object-cover transition-all duration-750 group-hover:scale-[1.04]"
                      containerClassName="absolute inset-0 z-0"
                    />

                    {secondaryImg && secondaryImg !== primaryImg && (
                      <SafeImage
                        src={secondaryImg}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-[1.04]"
                        containerClassName="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-all duration-750"
                      />
                    )}

                    <div className="absolute inset-x-0 bottom-0 py-3 bg-white/90 backdrop-blur-md border-t border-gray-200/60 translate-y-full group-hover:translate-y-0 duration-300 z-20 px-3 rounded-b-xl sm:rounded-b-2xl">
                      <p className="text-[9px] font-medium tracking-wider text-red-600 text-center mb-1.5 uppercase">QUICK SEIZE SIZE</p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {p.variants?.filter((v: ProductVariant) => v.stockQuantity > 0).slice(0, 4).map((v: ProductVariant) => (
                          <button
                            key={v.id}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addToCart(v.id, 1);
                              addToast(`Item added to bag.`, 'success');
                            }}
                            className="h-7 min-w-7 px-1.5 flex items-center justify-center whitespace-nowrap border border-gray-200/60 text-[10px] text-gray-900 bg-white hover:border-red-600 hover:text-red-600 hover:bg-red-600/10 transition-colors uppercase font-medium rounded-sm cursor-pointer"
                          >
                            {v.size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex-grow space-y-1 mt-2 mb-4 px-2">
                    <div className="flex justify-between items-baseline gap-2">
                      <h3 className="font-sans text-sm tracking-wide text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1 uppercase">
                        {p.name}
                      </h3>
                    </div>
                    <p className="text-[10px] font-sans text-gray-500 uppercase tracking-wider">
                      {p.upperMaterial || p.fabric} • {p.soleType ? p.soleType + ' Sole' : (p.fit || 'Tailored') + ' Shape'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 px-2 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-red-600">
                        ₹{p.price.toLocaleString('en-IN')}
                      </span>
                      {p.comparePrice > p.price && (
                        <span className="text-[10px] line-through font-medium text-gray-500">
                          ₹{p.comparePrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const variant = p.variants?.find((v: ProductVariant) => v.stockQuantity > 0) || p.variants?.[0];
                        if (variant) {
                          addToCart(variant.id, 1);
                          addToast(`Item added to bag.`, 'success');
                        } else {
                          addToast('Currently out of stock.', 'error');
                        }
                      }}
                      className="w-full h-8 sm:h-9 bg-gray-50 hover:bg-red-600 text-gray-900 hover:text-white font-sans uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-[0.2em] font-bold flex items-center justify-center gap-1 sm:gap-1.5 rounded cursor-pointer anti-gravity-card"
                    >
                      <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> ADD TO CART
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center w-full">
            <button
              onClick={() => navigate('/clothing')}
              className="px-8 py-3 bg-white border border-gray-200 text-gray-900 hover:border-red-600 hover:text-white hover:bg-red-600 transition-colors uppercase font-bold tracking-[0.2em] text-[10px] sm:text-xs rounded-full cursor-pointer anti-gravity-card"
            >
              SHOW MORE CLOTHING
            </button>
          </div>

        </div>
      </section>

      {/* CAPS CATEGORY ENTRY */}
      <section className="py-16 px-4 sm:px-6 bg-[#f5f5f5] border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row group cursor-pointer" onClick={() => navigate('/caps')}>
            <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden bg-gray-900">
              <img
                src="/caps-category.jpg"
                alt="Caps Category"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center items-start bg-white">
              <span className="text-xs font-bold text-[#D90416] tracking-[0.3em] uppercase mb-2">NEW DROP</span>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter mb-4">CAPS</h2>
              <p className="text-gray-500 font-medium max-w-md mb-8">Built different. Worn by you. Premium structured caps designed for the streets.</p>
              <button className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#D90416] group-hover:text-red-700 transition-colors uppercase">
                EXPLORE CAPS <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ORNAMENTS CATEGORY ENTRY */}
      <section className="py-16 px-4 sm:px-6 bg-[#f5f5f5] border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row-reverse group cursor-pointer" onClick={() => navigate('/ornaments')}>
            <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden bg-gray-900">
              <img
                src="/ornaments-category.jpg"
                alt="Ornaments Category"
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center items-start bg-white">
              <span className="text-xs font-bold text-[#D90416] tracking-[0.3em] uppercase mb-2">ELEVATE YOUR AURA</span>
              <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter mb-4">ORNAMENTS</h2>
              <p className="text-gray-500 font-medium max-w-md mb-8">Premium rings, chains, and jewelry pieces designed to complement your individual edge.</p>
              <button className="flex items-center gap-2 text-sm font-bold tracking-widest text-[#D90416] group-hover:text-red-700 transition-colors uppercase">
                EXPLORE ORNAMENTS <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* EAR PIERCING SESSION ENTRY */}
      <section className="bg-[#050505] py-24 px-6 border-t border-gray-900 overflow-hidden relative cursor-pointer group" onClick={() => navigate('/ear-piercing')}>
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1500&q=80"
            alt="Piercing Service"
            className="w-full h-full object-cover opacity-40 grayscale group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-xl">
            <span className="text-xs font-bold text-red-600 tracking-[0.3em] uppercase mb-4 block">PROFESSIONAL SERVICE</span>
            <h2 className="font-sans text-5xl sm:text-7xl font-black text-white tracking-tighter mb-6 uppercase">
              Pierced.<br />Personal.<br /><span className="text-red-600">Powerful.</span>
            </h2>
            <p className="text-gray-400 font-light text-sm tracking-widest uppercase mb-8 leading-relaxed">
              Experience our premium in-store ear piercing sessions. Crafted for your identity. Walk-ins not guaranteed.
            </p>
            <button className="bg-red-600 text-white font-bold uppercase tracking-[0.15em] py-4 px-8 hover:bg-red-700 transition-colors text-[10px] flex items-center gap-3">
              BOOK A SESSION <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Everyday Essentials SECTION (Editorial posturing story) */}
      <section className="bg-white border-t border-gray-200 py-28 px-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-red-600/5 blur-3xl rounded-full select-none pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <span className="font-sans italic text-red-600 text-2xl tracking-wide select-none">
            Everyday Essentials
          </span>
          <h2 className="font-sans text-3xl sm:text-5xl text-gray-900 tracking-widest uppercase">
            Draping structured confidence.
          </h2>
          <div className="w-16 h-[1px] bg-red-600/60 mx-auto my-3" />
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-sans max-w-[700px] mx-auto uppercase tracking-[0.16em]">
            DRIPEON was initiated from a collective urge to restructure menswear fittings in Worldwide. Infusing premium silk-heavy crepe with contemporary Japanese geometries and structured military waistbands, we craft articles that represent casual luxury and elegant presence. Every garment is designed, tailored, and packed in New York.
          </p>
        </div>
      </section>

      {/* 6. COUTURE BRAND STATS & DETAILS */}
      <section className="bg-white py-24 px-6 border-t border-gray-100 select-none overflow-hidden bento-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-red-600 tracking-[0.3em] uppercase">THE DESIGN STANDARD</span>
            <h2 className="font-sans text-2xl sm:text-4xl text-gray-900 tracking-widest uppercase mt-2">WHY CHOOSE THE WEFT</h2>
            <div className="w-12 h-[1px] bg-red-600/40 mx-auto mt-4" />
          </div>

          <GlobalSpotlight gridRef={statsGridRef} />

          <div ref={statsGridRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <ParticleCard
              className="p-8 border border-red-100 rounded-2xl bg-white space-y-4 anti-gravity-card"
              enableTilt={true}
              enableMagnetism={false}
              clickEffect={true}
            >
              <Sparkles className="w-7 h-7 text-red-600" />
              <h3 className="font-sans text-lg text-gray-900 tracking-wider uppercase font-semibold">Premium Quality</h3>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider leading-relaxed">
                Heavyweight double-weave silk crepe fabric selected from world-class spinners. Resists creasing while generating excellent drapes.
              </p>
            </ParticleCard>

            <ParticleCard
              className="p-8 border border-red-100 rounded-2xl bg-white space-y-4 anti-gravity-card"
              enableTilt={true}
              enableMagnetism={false}
              clickEffect={true}
            >
              <Compass className="w-7 h-7 text-red-600" />
              <h3 className="font-sans text-lg text-gray-900 tracking-wider uppercase font-semibold">Modern & Minimal</h3>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider leading-relaxed">
                Discarding excessive patterns, we optimize for clean lines, hidden tabs, custom side buckles, and subtle closures.
              </p>
            </ParticleCard>

            <ParticleCard
              className="p-8 border border-red-100 rounded-2xl bg-white space-y-4 anti-gravity-card"
              enableTilt={true}
              enableMagnetism={false}
              clickEffect={true}
            >
              <Award className="w-7 h-7 text-red-600" />
              <h3 className="font-sans text-lg text-gray-900 tracking-wider uppercase font-semibold">Made In Dhanbad, Jharkhand</h3>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider leading-relaxed">
                Designed, stitched, and finished by master tailors in premium studios inside Dhanbad. Preserving authentic Indian heritage craftsmanship.
              </p>
            </ParticleCard>

            <ParticleCard
              className="p-8 border border-red-100 rounded-2xl bg-white space-y-4 anti-gravity-card"
              enableTilt={true}
              enableMagnetism={false}
              clickEffect={true}
            >
              <Heart className="w-7 h-7 text-red-600" />
              <h3 className="font-sans text-lg text-gray-900 tracking-wider uppercase font-semibold">Postured Shape</h3>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider leading-relaxed">
                Crafted to stand out in Dhanbad, Ranchi, or Mumbai. Bridging Indian structure with contemporary global design.
              </p>
            </ParticleCard>
          </div>
        </div>
      </section>

    </div>
  );
}
