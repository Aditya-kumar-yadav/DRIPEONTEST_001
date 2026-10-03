import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../AppContext';
import { Product, ProductVariant, ColorType, SizeType, ProductImage } from '../types';
import { Shield, Sparkles, Check, ChevronDown, RefreshCw, Scissors, Heart, Share2, Shirt, Info, Ruler, X, Star, ChevronLeft, ChevronRight, Link as LinkIcon, MessageCircle, Facebook, Mail, MessageSquare, Linkedin, MoreHorizontal } from 'lucide-react';
import { ProductReviews } from '../components/ProductReviews';
import { RelatedProducts } from '../components/RelatedProducts';
import { SafeImage } from '../components/SafeImage';
import { ParticleCard, GlobalSpotlight } from '../components/MagicBentoCard';
import CountUp from '../components/CountUp';
import Lens from '../components/Lens';
import PincodeChecker from '../components/PincodeChecker';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart, addToast, wishlist, addToWishlist, removeFromWishlist } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const specsGridRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [activeColor, setActiveColor] = useState<ColorType>('Black');
  const [activeSize, setActiveSize] = useState<SizeType>('M');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Filter product images based on active color selection for professional presentation
  const filteredImages = React.useMemo(() => {
    if (!product || !product.images) return [];

    // Check if there are any images specifically tag-annotated for the selected activeColor
    const colorSpecific = product.images.filter(img => img.color === activeColor);
    if (colorSpecific.length > 0) {
      return colorSpecific;
    }

    // Fallback: If no image is specifically tagged for this color, show all/general images
    return product.images;
  }, [product, activeColor]);

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product || !filteredImages || filteredImages.length <= 1) return;
    const currentIndex = filteredImages.findIndex(img => img.imageUrl === activeImage);
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setActiveImage(filteredImages[nextIndex].imageUrl);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product || !filteredImages || filteredImages.length <= 1) return;
    const currentIndex = filteredImages.findIndex(img => img.imageUrl === activeImage);
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setActiveImage(filteredImages[prevIndex].imageUrl);
  };

  // Luxury Live Interactions & Stream States


  // Interaction states
  const [addingState, setAddingState] = useState<'idle' | 'collapsing' | 'success'>('idle');
  const [bounceSize, setBounceSize] = useState<SizeType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const isWishlisted = product ? wishlist.some((w: any) => w.productId === product.id) : false;
  const [showCareDocs, setShowCareDocs] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [imageFit, setImageFit] = useState<'contain' | 'cover'>('contain');

  // Coupon discount states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  // Reset coupon and discount when a new product is loaded
  useEffect(() => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponError('');
  }, [slug]);

  // Lightbox modal variables for Flipkart/Amazon full-bleed view style
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(false);

  // Lock body/html scroll when lightbox is active
  useEffect(() => {
    if (isLightboxOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isLightboxOpen]);

  // Handle keyboard navigation for the Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        if (!product || !filteredImages || filteredImages.length <= 1) return;
        const currentIndex = filteredImages.findIndex(img => img.imageUrl === activeImage);
        const nextIndex = (currentIndex + 1) % filteredImages.length;
        setActiveImage(filteredImages[nextIndex].imageUrl);
      } else if (e.key === 'ArrowLeft') {
        if (!product || !filteredImages || filteredImages.length <= 1) return;
        const currentIndex = filteredImages.findIndex(img => img.imageUrl === activeImage);
        const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
        setActiveImage(filteredImages[prevIndex].imageUrl);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, activeImage, product, filteredImages]);

  // Load product detail
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setActiveImage(data.images?.find((im: ProductImage) => im.isPrimary)?.imageUrl || data.images?.[0]?.imageUrl || '');

          if (data.variants && data.variants.length > 0) {
            setActiveColor(data.variants[0].color);
            setActiveSize(data.variants[0].size);
          }

          if ((location.state as any)?.openLightbox) {
            setIsLightboxOpen(true);
            window.history.replaceState({}, '');
          }
        } else {
          addToast("Silhouette lookbook item not found.", "error");
          navigate('/clothing');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchDetail();
  }, [slug]);

  // Track variant match on color + size shift
  useEffect(() => {
    if (!product) return;
    const match = product.variants.find(v => v.color === activeColor && v.size === activeSize);
    setSelectedVariant(match || null);
    setQuantity(1); // Reset qty on variant selection
  }, [activeColor, activeSize, product]);

  // Handle color click
  const handleColorClick = (color: ColorType) => {
    setActiveColor(color);
    if (product) {
      // Find images tagged with this color
      const colorSpecific = product.images.filter(img => img.color === color);
      if (colorSpecific.length > 0) {
        setActiveImage(colorSpecific[0].imageUrl);
      } else {
        // Fallback to historic presets or default
        if (product.category === 'SHACKET') {
          const targetImg = color === 'Brown' ? product.images[0] : product.images[1];
          if (targetImg) setActiveImage(targetImg.imageUrl);
        } else if (product.category === 'GURKHA_PANT') {
          const targetImg = color === 'Navy Blue' ? product.images[0] : product.images[1];
          if (targetImg) setActiveImage(targetImg.imageUrl);
        } else if (product.category === 'JAPANESE_PANT') {
          const targetImg = color === 'Beige' ? product.images[0] : product.images[1];
          if (targetImg) setActiveImage(targetImg.imageUrl);
        } else if (product.images[0]) {
          setActiveImage(product.images[0].imageUrl);
        }
      }
    }
  };

  const handleSizeClick = (size: SizeType) => {
    setActiveSize(size);
    setBounceSize(size);
    setTimeout(() => setBounceSize(null), 250);
  };

  const handleDecreaseQty = () => setQuantity(q => q > 1 ? q - 1 : 1);
  const handleIncreaseQty = () => {
    if (selectedVariant && quantity < selectedVariant.stockQuantity) {
      setQuantity(q => q + 1);
    } else {
      addToast("Maximum quantity limit reached for this item.", "info");
    }
  };

  const handleAddToBag = async () => {
    if (!selectedVariant) {
      addToast("This fit variation is out of stock", "error");
      return;
    }

    if (selectedVariant.stockQuantity <= 0) {
      addToast("Style currently fully allocated / fully booked", "error");
      return;
    }

    setAddingState('success');
    addToCart(selectedVariant.id, quantity);
    setTimeout(() => setAddingState('idle'), 1500);
  };

  const handleBuyNow = async () => {
    if (!selectedVariant || selectedVariant.stockQuantity <= 0) {
      addToast("This configuration is unavailable.", "error");
      return;
    }
    // Add to cart with buy-now flag so only this item becomes selected
    await addToCart(selectedVariant.id, quantity, true);
    addToast("Directing to secure checkout...", "info");
    navigate('/checkout');
  };

  const toggleWishlist = async () => {
    if (!product) return;
    if (isWishlisted) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Product URL copied to clipboard.", "success");
    setShowShareModal(false);
  };

  if (loading) {
    return (
      <div className="flex-grow font-sans flex items-center justify-center min-h-screen bg-white">
        <div className="text-center flex flex-col items-center gap-6">
          {/* Animated logo mark */}
          <div className="relative flex items-center justify-center w-16 h-16">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-gray-100 animate-spin" style={{ animationDuration: '3s' }} />
            {/* Inner pulse ring */}
            <div className="absolute inset-2 rounded-full border border-red-600/30 animate-ping" style={{ animationDuration: '1.5s' }} />
            {/* Core dot */}
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
            {/* Orbit dot */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '1.2s' }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-1.5 h-1.5 bg-red-600 rounded-full" />
            </div>
          </div>

          {/* Brand wordmark */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-0.5">
              <span className="text-[22px] font-black uppercase tracking-[0.25em] text-black">DRIP</span>
              <span className="text-[22px] font-black uppercase tracking-[0.25em] text-red-600">EON</span>
            </div>
            {/* Animated loading bar */}
            <div className="w-24 h-[2px] bg-gray-100 rounded-full overflow-hidden mt-1">
              <div className="h-full bg-red-600 rounded-full animate-[loadbar_1.4s_ease-in-out_infinite]" style={{ width: '60%', animation: 'loadbar 1.4s ease-in-out infinite' }} />
            </div>
          </div>
        </div>

        <style>{`
          @keyframes loadbar {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(60%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    );
  }

  if (!product) return null;

  const colorSwatches = Array.from(new Set(product.variants.map(v => v.color))) as ColorType[];
  const sizeSwatches = ['S', 'M', 'L', 'XL'] as SizeType[];

  // Dynamic custom or fallback HIGHLIGHTS
  const defaultHighlights: Record<string, string[]> = {
    'SHACKET': [
      'Lightweight breathable fabric for summer comfort',
      'Relaxed fit with soft structure',
      'Sand beige tone for clean, minimal styling',
      'Dual utility pockets for functional design',
      'Easy front closure for everyday wear',
      'Perfect for layering without overheating',
      'Designed for warm weather versatility',
      'Ideal for casual and smart summer looks'
    ],
    'GURKHA_PANT': [
      'Double-buckle adjuster beltless waist structure',
      'Hand-finished double forward waist pleats',
      'Exceptional high-rise tailoring profile',
      'Comfortable relaxed thigh draping down to hem lines',
      'Traditional Gurkha military legacy detailing',
      'Premium crease-resistant draping fabric',
      'Elegant blind hem styling for bespoke fitting',
      'Tailored and hand-assembled in direct-to-design workshop'
    ],
    'JAPANESE_PANT': [
      'Premium cotton with traditional origami draping layouts',
      'Tailored architectural design with sheer elegance',
      'Avant-garde asymmetrical fluid wrap silhouette',
      'Lightweight structure with high breathability',
      'Distinctive internal tab waistband closure',
      'Deep structural welt side pockets',
      'Perfect casual or smart-casual pairing option',
      'Exquisite garment dyeing for bespoke coloring depth'
    ],
    'ORNAMENT': [
      'Precision crafted with high-grade materials',
      'Hand-finished polishing for maximum brilliance',
      'Hypoallergenic and skin-safe composition',
      'Designed for timeless elegance and daily wear',
      'Durable structural integrity to withstand active lifestyles',
      'Premium clasp/setting ensuring secure placement',
      'Versatile aesthetic suitable for stacking or standalone',
      'Sustainably sourced and ethically manufactured'
    ]
  };

  const productHighlights = (product.highlights && product.highlights.length > 0)
    ? product.highlights
    : (defaultHighlights[product.category] || defaultHighlights['SHACKET']);

  // Dynamic custom or fallback SPECIFICATIONS
  const getDefaultSpecs = (category: string) => {
    const isFootwearCategory = ['FOOTWEAR', 'DERBY', 'OXFORD', 'BOOT', 'LOAFER', 'SNEAKER'].includes(category);
    if (isFootwearCategory) {
      return {
        'UPPER MATERIAL': product.upperMaterial || 'Premium Full-Grain Leather',
        'SOLE TYPE': product.soleType || 'Durable Goodyear Welted Rubber',
        'TOE STYLE': product.toeStyle || 'Classic Cap Toe',
        'CONSTRUCTION': 'Hand-stitched Artisanal Assembly',
        'LINING': 'Breathable Calfskin Leather',
        'FIT TYPE': 'Standard Classic Fit',
        'GARMENT BRAND': 'DRIPEON Atelier'
      };
    }
    if (category === 'ORNAMENT') {
      return {
        'MATERIAL': product.fabric || 'Premium 925 Sterling Silver / Enamel',
        'METAL PURITY': 'High-Grade Hallmarked',
        'FINISH TYPE': 'High Polish / Matte Contrasts',
        'DIMENSIONS': product.fit || 'Standard / Adjustable',
        'CLASP / SETTING': product.closure || 'Secure Lobster Clasp / Bezel Setting',
        'WEIGHT PROFILE': 'Substantial & Balanced Weight',
        'STONE DETAIL': 'Lab-Grown High Clarity Crystals (if applicable)',
        'CURATED COLOR': activeColor.toUpperCase(),
        'HYPOALLERGENIC': 'Yes (Skin-Safe)',
        'STYLE OCCASION': product.styleType || 'Avant-Garde Jewelry / Street Luxe',
        'DESIGN SEASON': 'All Seasons Archive',
        'ORIGIN COUNTRY': 'Worldwide',
        'BRAND': 'DRIPEON FINE JEWELRY'
      };
    } else if (category === 'GURKHA_PANT') {
      return {
        'FABRIC': product.fabric || 'Premium Cotton Blend',
        'FABRIC WEIGHT': 'Medium Weight',
        'FIT TYPE': product.fit || 'Tailored Fit',
        'SYSTEM ADJUSTER': 'Double Slide Buckle Adjusters',
        'CLOSURE STYLE': product.closure || 'Side Buckles & Double Pleated',
        'WAISTLINE RISE': product.waistStyle || 'High Waist Rise',
        'BREATHABILITY': 'High Airflow',
        'STRETCH RATING': 'Slight Stretch comfort',
        'CURATED COLOR': activeColor.toUpperCase(),
        'PATTERN SPEC': 'Solid / Tailored Pleated',
        'SARTORIAL POCKETS': '2 Side Slash, 2 Back Jet pockets',
        'HEM PROFILE': 'Classic Blind Sewn Hem',
        'STYLE OCCASION': product.styleType || 'Stealth Wealth Traditional',
        'DESIGN SEASON': 'All Seasons Archive',
        'ORIGIN COUNTRY': 'Worldwide',
        'GARMENT BRAND': 'DRIPEON'
      };
    } else if (category === 'JAPANESE_PANT') {
      return {
        'FABRIC': product.fabric || 'Premium Cotton',
        'FABRIC WEIGHT': 'Medium-Light Weight (Drape-friendly)',
        'FIT TYPE': product.fit || 'Tailored / Loose Drape',
        'WAIST STYLE': product.waistStyle || 'Mid Rise Relaxed',
        'CLOSURE STYLE': product.closure || 'Internal Tab & Origami Pleated',
        'BREATHABILITY': 'High Interloop',
        'STRETCH RATING': 'No Stretch (Structural)',
        'CURATED COLOR': activeColor.toUpperCase(),
        'PATTERN SPEC': 'Avant-garde Minimal Pleated',
        'SARTORIAL POCKETS': 'Deep Side Utility Pockets',
        'HEM PROFILE': 'Raw Avant-garde Fluid Hem',
        'STYLE OCCASION': product.styleType || 'Avant-garde / Street Sartorial',
        'DESIGN SEASON': 'All Seasons Archive',
        'ORIGIN COUNTRY': 'Worldwide',
        'GARMENT BRAND': 'DRIPEON'
      };
    } else {
      return {
        'FABRIC': product.fabric || 'Lightweight Cotton-Linen Blend',
        'FABRIC WEIGHT': 'Light-weight (Summer Friendly)',
        'FIT TYPE': product.fit || 'Relaxed Fit',
        'COLLAR STYLE': 'Classic Spread Collar design',
        'CLOSURE STYLE': product.closure || 'Front Button Shell Alignment',
        'SLEEVES CUTE': 'Full Sleeves (Roll-up Friendly)',
        'BREATHABILITY': 'High Porosity Air',
        'STRETCH RATING': 'No Stretch Structure',
        'CURATED COLOR': activeColor.toUpperCase(),
        'PATTERN SPEC': 'Solid Clean Weave',
        'SARTORIAL POCKETS': '2 Front Utility Chest Pockets',
        'HEM PROFILE': 'Elegant Straight Tail Hem',
        'STYLE OCCASION': product.styleType || 'Casual / Sartorial Smart',
        'DESIGN SEASON': 'All Seasons Archive',
        'ORIGIN COUNTRY': 'Worldwide',
        'GARMENT BRAND': 'DRIPEON'
      };
    }
  };

  const productSpecifications = (product.specifications && Object.keys(product.specifications).length > 0)
    ? product.specifications
    : getDefaultSpecs(product.category);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex-grow pt-32 pb-24 font-sans px-6 max-w-7xl mx-auto min-h-screen"
    >

      {/* Route Navigation Breadcrumb */}
      <div className="relative z-30 text-[10px] font-bold uppercase tracking-widest text-gray-800 mb-8 py-2 border-b border-gray-300 select-none">
        <span className="hover:text-gray-900 cursor-pointer transition-colors" onClick={() => navigate('/')}>Home</span>
        <span className="mx-2 text-brand-grey/50">/</span>
        <span className="hover:text-gray-900 cursor-pointer transition-colors" onClick={() => navigate('/clothing')}>Catalog</span>
        <span className="mx-2 text-brand-grey/50">/</span>
        <span className="hover:text-gray-900 cursor-pointer transition-colors animate-pulse" onClick={() => navigate('/clothing')}>{product.category.replace('_', ' ')}S</span>
        <span className="mx-2 text-brand-grey/50">/</span>
        <span className="text-red-600">{product.name}</span>
      </div>

      {/* Main visual column splitter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

        {/* Dynamic Image Gallery (7 Columns) with Magnifying Lens */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="aspect-[4/5] sm:aspect-[3/4] md:aspect-[3/4] lg:h-[680px] max-h-[75vh] w-full bg-[#0a080c] overflow-hidden relative border border-gray-400 rounded-2xl cursor-zoom-in group shadow-2xl flex items-center justify-center p-2"
          >
            {/* Ambient Blurred Backdrop to resolve any aspect-ratio borders gracefully */}
            <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden opacity-30 transform scale-110">
              <img
                src={activeImage}
                alt=""
                className="w-full h-full object-cover blur-3xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <motion.div layoutId={`product-image-${product.id}`} className="w-full h-full z-10">
              <Lens zoomFactor={2.2} lensSize={280} lensColor="#000000" className="w-full h-full flex items-center justify-center">
                <SafeImage
                  src={activeImage}
                  alt={product.name}
                  className={`w-full h-full object-${imageFit} rounded-2xl`}
                />
              </Lens>
            </motion.div>

            {/* Aspect/Fit Toggle Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setImageFit(prev => prev === 'cover' ? 'contain' : 'cover');
              }}
              className="absolute bottom-4 right-4 z-30 px-2.5 py-1 text-[8px] font-medium tracking-widest text-gray-900 bg-white/70 border border-gray-400 hover:border-red-600 hover:text-red-600 rounded-md backdrop-blur-md uppercase cursor-pointer transition-all active:scale-95 shadow-md flex items-center gap-1"
              title="Toggle image fit (Cover or Contain)"
            >
              Fit: <span className="text-red-600 font-bold">{imageFit}</span>
            </button>

            {product.comparePrice > product.price && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-white text-[9px] font-medium tracking-widest px-2.5 py-1 rounded-md border border-gray-900/10 uppercase font-semibold z-30">
                Allocation Launch Save
              </span>
            )}

            {/* Left and Right navigation arrows if multiple images exist */}
            {filteredImages && filteredImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 group-hover:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/80 border border-gray-400 hover:border-red-600 hover:text-red-600 text-gray-900 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer transition-all duration-300 active:scale-95 group/arrow shadow-md opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 group-hover/arrow:-translate-x-0.5 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 group-hover:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/80 border border-gray-400 hover:border-red-600 hover:text-red-600 text-gray-900 rounded-full flex items-center justify-center backdrop-blur-md cursor-pointer transition-all duration-300 active:scale-95 group/arrow shadow-md opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 group-hover/arrow:translate-x-0.5 transition-transform" />
                </button>
              </>
            )}
          </div>

          {/* Horizontal Swiper Index Strip */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-brand-grey">
            {filteredImages.map((img) => {
              const matches = activeImage === img.imageUrl;
              return (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(img.imageUrl)}
                  className={`w-20 h-24 bg-white flex-shrink-0 border overflow-hidden relative cursor-pointer rounded-xl transition-all duration-300 ${matches
                      ? 'border-red-600 scale-[1.03] shadow-[0_0_12px_rgba(201,169,110,0.25)]'
                      : 'border-gray-400 opacity-60 hover:opacity-100 hover:border-gray-900'
                    }`}
                >
                  <SafeImage src={img.imageUrl} alt="Lookbook thumb" className="w-full h-full object-cover" />
                  {matches && (
                    <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 text-white animate-slide-in" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Information Dashboard (5 Columns) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Main heading element */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-medium tracking-[0.2em] text-red-600 uppercase">
              <span>{product.fabric} premium series</span>
              <span className="bg-red-600/10 border border-red-600/20 px-3 py-1 rounded-full lowercase font-sans text-[10px] whitespace-nowrap flex items-center justify-center">limited edition</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <h1 className="font-sans text-3xl md:text-4xl font-black text-gray-900 tracking-wide uppercase leading-tight">
                {product.name}
              </h1>

              {/* Heart and Share Action Cluster */}
              <div className="flex items-center gap-1.5 pt-1.5">
                <button
                  onClick={toggleWishlist}
                  title="Bookmark Lookbook item"
                  className={`p-2.5 border rounded-full transition-all cursor-pointer ${isWishlisted
                      ? 'bg-red-500/10 border-red-500/50 text-red-400'
                      : 'border-gray-400 hover:border-red-600 text-gray-800 hover:text-gray-900 bg-white/20'
                    }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-400' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  title="Copy Product URL link"
                  className="p-2.5 border border-gray-400 rounded-full hover:border-red-600 text-gray-800 hover:text-gray-900 transition-all bg-white/20 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Price section with Launch discount percentages */}
            <div className="flex flex-wrap items-baseline gap-3.5 pt-2 border-b border-gray-200/20 pb-4">
              <span className="text-2xl font-medium text-red-600 font-medium inline-flex items-center">
                ₹
                <CountUp
                  key={product.id}
                  to={Math.max(product.comparePrice || 0, Math.round((product.price - couponDiscount) * 1.25))}
                  from={product.price - couponDiscount}
                  direction="down"
                  duration={1.5}
                  separator=","
                />
              </span>
              {appliedCoupon && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 border border-green-500/40 rounded font-bold uppercase tracking-wider font-medium animate-fade-in flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                  ${couponDiscount} Coupon Saved! ({appliedCoupon})
                </span>
              )}
              {product.comparePrice > product.price && (
                <>
                  <span className="text-sm line-through font-medium text-gray-800">
                    ₹{(product.comparePrice).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-medium bg-yellow-400/90 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% off
                  </span>
                </>
              )}
              <span className="text-[10px] font-medium text-gray-800 uppercase tracking-wider block w-full pt-1">
                Inclusive of all custom direct taxes & free New York studio tailoring
              </span>
            </div>
          </div>

          {/* Narrative text segment */}
          <p className="text-xs text-gray-800 border-l-2 border-red-600 pl-4 py-1 leading-relaxed uppercase tracking-widest leading-relaxed">
            {product.description}
          </p>

          {/* COLOR SWATCH LIST */}
          <div className="space-y-3.5 pt-2">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-gray-800 uppercase">Selected Swatch Tone</span>
              <span className="text-gray-900 font-bold uppercase tracking-wider">{activeColor}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {colorSwatches.map((col) => {
                const isActive = col === activeColor;
                return (
                  <button
                    key={col}
                    onClick={() => handleColorClick(col)}
                    className={`px-4 py-2.5 text-xs uppercase tracking-widest rounded-lg transition-all border cursor-pointer flex items-center gap-2 ${isActive
                        ? 'border-red-600 text-red-600 bg-red-600/10 font-bold scale-[1.03] shadow-[0_4px_12px_rgba(201,169,110,0.15)]'
                        : 'border-gray-400 bg-white text-gray-800 hover:text-gray-900 hover:border-red-600'
                      }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block border border-gray-900/10"
                      style={{
                        backgroundColor: col === 'Brown' ? '#6E473B' :
                          col === 'Navy Blue' ? '#1E2A38' :
                            col === 'Beige' ? '#D9C5B2' : '#0a0a0a'
                      }}
                    />
                    {col}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SIZE SELECTION & MEASUREMENT MODAL TRIGGER */}
          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-gray-800 uppercase">Size Proportion</span>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="text-red-600 hover:text-gray-900 font-semibold flex items-center gap-1 cursor-pointer transition-colors uppercase tracking-wider"
              >
                <Ruler className="w-3.5 h-3.5" /> Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5 sm:gap-3.5">
              {sizeSwatches.map((sz) => {
                const isSelected = sz === activeSize;
                const matchesStock = product.variants.find(v => v.color === activeColor && v.size === sz);
                const hasStock = matchesStock && matchesStock.stockQuantity > 0;
                const isBouncing = bounceSize === sz;

                return (
                  <button
                    key={sz}
                    disabled={!hasStock}
                    onClick={() => handleSizeClick(sz)}
                    className={`w-12 h-12 flex items-center justify-center text-xs uppercase rounded-lg border cursor-pointer transition-all ${isSelected
                        ? 'bg-red-600 text-white border-red-600 font-bold shadow-[0_4px_12px_rgba(201,169,110,0.3)]'
                        : hasStock
                          ? 'border-gray-400 hover:border-red-600 text-gray-900 hover:bg-red-600/5'
                          : 'border-gray-300 text-gray-800/30 line-through opacity-30 pointer-events-none'
                      } ${isBouncing ? 'scale-115' : ''}`}
                    title={hasStock ? `Choose size ${sz}` : "Size fully reserved"}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AVAILABILITY & DELIVERY PREVIEW SETTER */}
          <div className="bg-white/40 border border-gray-200/40 rounded-xl overflow-hidden shadow-sm">
            {/* STOCK STATUS ADVISOR */}
            <div className="p-4 border-b border-gray-200/30 flex items-center gap-3">
              <Info className="w-5 h-5 text-gray-800 shrink-0" />
              <div className="text-[11px] font-medium tracking-widest uppercase">
                {selectedVariant ? (
                  selectedVariant.stockQuantity > 0 ? (
                    <p className="text-green-500 font-bold">✓ In Stock & Ready to Ship ({selectedVariant.stockQuantity} items left)</p>
                  ) : (
                    <p className="text-red-500 font-bold">✗ Out of Stock</p>
                  )
                ) : (
                  <p className="text-orange-500 font-bold">Please select size & color</p>
                )}
              </div>
            </div>
            {/* PINCODE INTEGRATED */}
            <div className="p-4 bg-gray-50/50">
              <PincodeChecker integrated={true} />
            </div>
          </div>


          {/* LUXURY PROMO COUPON WIDGET */}
          <div className="bg-white/40 border border-gray-200/20 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-red-600 uppercase tracking-wider">
              <Scissors className="w-3.5 h-3.5 text-red-600" />
              <span>Discount Coupons</span>
            </div>

            {!appliedCoupon ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="ENTER COUPON CODE (e.g. FIRST300)"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError('');
                      }}
                      className="w-full bg-white border border-gray-400 rounded-lg px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none focus:border-red-600 placeholder:text-gray-800/40 uppercase"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const trimmed = couponCode.trim().toUpperCase();
                      if (!trimmed) {
                        setCouponError('Please enter a coupon code.');
                        return;
                      }
                      if (trimmed === 'FIRST300') {
                        setAppliedCoupon('FIRST300');
                        setCouponDiscount(300);
                        setCouponError('');
                        addToast('Coupon applied! Saved ₹300.', 'success');
                      } else {
                        setCouponError('Invalid coupon code. Use FIRST300');
                      }
                    }}
                    className="bg-red-600 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-xs font-medium font-bold uppercase transition-colors cursor-pointer"
                  >
                    APPLY
                  </button>
                </div>
                {couponError && (
                  <p className="text-[10px] text-red-400 font-medium tracking-wide">{couponError}</p>
                )}
                <p className="text-[9px] text-red-600/60 font-medium tracking-widest uppercase">
                  Tip: Use <span className="font-bold text-red-600 underline cursor-pointer hover:text-gray-900 transition-colors" onClick={() => setCouponCode('FIRST300')}>FIRST300</span> to save ₹300 instantly!
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 p-2.5 rounded-lg text-xs font-medium text-green-400">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span>COUPON Applied: <strong className="text-gray-900">{appliedCoupon}</strong> (-${couponDiscount})</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponDiscount(0);
                    setCouponCode('');
                    addToast('Coupon removed.', 'info');
                  }}
                  className="text-[10px] text-gray-800 hover:text-gray-900 underline uppercase cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* QUANTITY PICKER PILL */}
          {selectedVariant && selectedVariant.stockQuantity > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-medium text-gray-800 uppercase tracking-widest block">Quantity</span>
              <div className="flex items-center gap-3 bg-white/40 border border-gray-400 w-fit rounded-full px-1 py-1">
                <button
                  type="button"
                  onClick={handleDecreaseQty}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-full border border-gray-300 hover:border-red-600 flex items-center justify-center text-gray-900 hover:text-red-600 font-medium text-lg transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-medium font-bold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={handleIncreaseQty}
                  className="w-8 h-8 rounded-full border border-gray-300 hover:border-red-600 flex items-center justify-center text-gray-900 hover:text-red-600 font-medium text-lg transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* CTA GRID BUTTONS */}
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3 sm:gap-4 pt-2">
            {addingState === 'idle' ? (
              <button
                disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
                onClick={handleAddToBag}
                className="bg-red-600 hover:bg-gray-900 text-white py-4 px-6 text-xs font-medium font-bold tracking-[0.2em] uppercase transition-all duration-300 disabled:bg-gray-100 disabled:pointer-events-none disabled:text-gray-800/50 rounded-xl cursor-pointer hover:shadow-[0_4px_16px_rgba(201,169,110,0.25)] flex items-center justify-center"
              >
                ADD TO CART
              </button>
            ) : addingState === 'collapsing' ? (
              <div className="flex justify-center items-center py-2 bg-white/30 border border-red-600/20 rounded-xl">
                <span className="w-6 h-6 rounded-full border-2 border-red-600 border-t-white animate-spin inline-block" />
              </div>
            ) : (
              <button
                disabled
                className="bg-green-500 text-gray-900 py-4 px-6 text-xs font-medium font-bold tracking-[0.2em] uppercase rounded-xl flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 shrink-0 animate-bounce" /> ALLOCATED!
              </button>
            )}

            <button
              disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
              onClick={handleBuyNow}
              className="bg-transparent hover:bg-red-600/10 text-red-600 border-2 border-red-600 py-4 px-6 text-xs font-medium font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-xl cursor-pointer disabled:border-gray-200 disabled:pointer-events-none disabled:text-gray-800/30 flex items-center justify-center"
            >
              BUY
            </button>
          </div>
          
          {/* COLLAPSIBLE DRY CLEAN DIRECTIVES */}
          <div className="pt-2">
            <button
              onClick={() => setShowCareDocs(!showCareDocs)}
              className="w-full flex items-center justify-between text-[11px] font-medium tracking-widest text-red-600 hover:text-gray-900 transition-colors bg-white/30 border border-gray-300 py-3 px-4 rounded-xl cursor-pointer"
            >
              <span className="flex items-center gap-2 font-medium">
                <Shirt className="w-4 h-4 text-red-600 shrink-0" /> VIEW CARE INSTRUCTIONS
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-800 transition-transform duration-300 ${showCareDocs ? 'rotate-180' : ''}`} />
            </button>

            {showCareDocs && (
              <div className="bg-white/40 p-4 border-x border-b border-gray-300 rounded-b-xl text-[11px] text-gray-800 leading-relaxed space-y-2 uppercase font-medium mt-[-3px] text-left">
                <p>• COLD HAND WASH ONLY WITH pH-NEUTRAL SILHOUETTE FLUID WASHES.</p>
                <p>• LAY FLAT TO AIR-DRY UNDER HIGH ARCHIVE SHADOW. STREAM RECOMMENDED.</p>
                <p>• DO NOT MACHINE TUMBLE DRY OR INFLICT RAW FLAT IRON HEAVY SURFACE STATIC.</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* DRIPEON BRAND SELECTION: HIGHLIGHTS SECTION */}
      <div className="bg-white border border-gray-300 rounded-3xl p-6 md:p-8 text-left mt-16 max-w-7xl mx-auto shadow-xl">
        <h3 className="font-sans text-xl text-gray-900 uppercase tracking-wider mb-6 pb-2.5 border-b border-gray-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-red-600 animate-pulse" /> Structural Elegance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
          {productHighlights.map((hl, i) => (
            <div key={i} className="flex items-start gap-4">
              <span className="text-red-600 mt-0.5 text-base font-semibold">★</span>
              <p className="text-xs text-gray-800 leading-relaxed uppercase tracking-wider font-medium">{hl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DRIPEON BRAND SELECTION: DETAILED SPECIFICATIONS SECTION */}
      <div className="mt-16 text-left max-w-7xl mx-auto bento-section">
        <h3 className="font-sans text-xl text-gray-900 uppercase tracking-wider mb-6 pb-2.5 border-b border-gray-300 flex items-center gap-2">
          <Scissors className="w-4 h-4 text-red-600" /> Product Details
        </h3>

        <GlobalSpotlight gridRef={specsGridRef} />

        <div ref={specsGridRef} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(productSpecifications).map(([key, value]) => (
            <ParticleCard
              key={key}
              className="bg-white border border-gray-300 hover:border-red-600/40 transition-all p-4 rounded-xl flex flex-col justify-between uppercase font-medium text-left shadow-md hover:shadow-xl"
              enableTilt={true}
              enableMagnetism={false}
              clickEffect={true}
            >
              <span className="text-[9px] text-red-600 tracking-widest block font-bold mb-1.5">{key}</span>
              <span className="text-[11px] text-gray-900 font-medium tracking-wide block leading-snug">{value}</span>
            </ParticleCard>
          ))}
        </div>
      </div>

      {/* PRODUCT INLINE FAQ SECTION */}
      <div className="mt-16 bg-white border border-gray-300 rounded-3xl p-6 md:p-8 text-left max-w-7xl mx-auto shadow-xl">
        <h3 className="font-sans text-xl text-gray-900 uppercase tracking-wider mb-6 pb-2.5 border-b border-gray-300 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-red-600 animate-pulse" /> {product.category === 'ORNAMENT' ? 'Jewelry Care & Fit FAQ' : 'Sizing & Material Care FAQ'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-600">How do I find my size?</h4>
            <p className="text-[11px] text-gray-800 uppercase tracking-wide leading-relaxed font-medium">
              {product.category === 'ORNAMENT' ? 'Please refer to the dimensions specified above. Chains specify length (e.g. 18", 20") while rings use standard US sizing. For bracelets, measure your wrist circumfrence.' : 'Use our size chart above. Our styles run true to size with a relaxed fit. If between sizes, size up for a boxier fit or down for a tailored look. The model wears size M and is 5\'10" tall.'}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-600">What {product.category === 'ORNAMENT' ? 'metal/material' : 'fabric/material'} is this made of?</h4>
            <p className="text-[11px] text-gray-800 uppercase tracking-wide leading-relaxed font-medium">
              {product.category === 'ORNAMENT' ? 'Our jewelry is crafted from high-grade metals (925 Sterling Silver, Platinum Plated, or 18k Gold Vermeil). We ensure all pieces are hypoallergenic.' : 'We prioritize breathable, sustainable, pre-shrunk fabrics across our collections. Exact composition is listed in the Product Details above.'}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-600">How do I wash and care for this item?</h4>
            <p className="text-[11px] text-gray-800 uppercase tracking-wide leading-relaxed font-medium">
              {product.category === 'ORNAMENT' ? 'Avoid direct contact with harsh chemicals, perfumes, and prolonged exposure to water. Store in a dry pouch. Gently polish with a microfiber cloth to maintain its shine.' : 'Cold hand wash only with pH-neutral fluid washes. Lay flat to air-dry. Do not machine tumble dry or inflict raw flat iron heavy surface static.'}
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-600">Will the {product.category === 'ORNAMENT' ? 'metal tarnish or color fade' : 'colors fade or fabric shrink'}?</h4>
            <p className="text-[11px] text-gray-800 uppercase tracking-wide leading-relaxed font-medium">
              {product.category === 'ORNAMENT' ? 'While our protective rhodium/gold plating prevents rapid oxidation, all metals may naturally tarnish over years. Follow the care instructions to preserve the brilliant finish.' : 'Our fabrics are pre-shrunk and colorfast-tested, but cold hand wash and low heat are strongly recommended to preserve color and fit long-term.'}
            </p>
          </div>
        </div>
      </div>

      {/* Persistent Customer Review & Rating Segment */}
      <ProductReviews productId={product.id} productName={product.name} />

      {/* Recommended matching silhouettes */}
      <RelatedProducts currentProductId={product.id} currentCategory={product.category} />

      {/* SARTORIAL SIZE GUIDE POPUP MODAL */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0c0c0c] border border-red-600/30 rounded-3xl p-6 max-w-lg w-full text-left space-y-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] animate-scale-up">
            <div className="flex justify-between items-center border-b border-gray-300 pb-3">
              <h3 className="font-sans text-lg text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Ruler className="w-4 h-4 text-red-600" /> SARTORIAL MEASUREMENTS CHART
              </h3>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="text-gray-800 hover:text-gray-900 text-lg p-1.5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-medium text-[11px]">
              <p className="text-gray-800 uppercase leading-relaxed">
                All measurements are in inches. Crafted to fit high-drape garments perfectly. If unsure of sizing proportion, size up for boxy silhouettes or contact New York headquarter studio.
              </p>

              <div className="overflow-x-auto border border-gray-300 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-300 uppercase text-red-600">
                      <th className="p-3">SIZE</th>
                      <th className="p-3">CHEST</th>
                      <th className="p-3">SHOULDER</th>
                      <th className="p-3">WAISTBAND</th>
                      <th className="p-3">LENGTH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-grey/25 text-gray-900">
                    <tr>
                      <td className="p-3 font-bold text-red-600">S</td>
                      <td className="p-3">38" - 40"</td>
                      <td className="p-3">17.5"</td>
                      <td className="p-3">28" - 30"</td>
                      <td className="p-3">27.0"</td>
                    </tr>
                    <tr className="bg-white/20">
                      <td className="p-3 font-bold text-red-600">M</td>
                      <td className="p-3">40" - 42"</td>
                      <td className="p-3">18.0"</td>
                      <td className="p-3">30" - 32"</td>
                      <td className="p-3">28.0"</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-red-600">L</td>
                      <td className="p-3">42" - 44"</td>
                      <td className="p-3">19.0"</td>
                      <td className="p-3">32" - 34"</td>
                      <td className="p-3">29.0"</td>
                    </tr>
                    <tr className="bg-white/20">
                      <td className="p-3 font-bold text-red-600">XL</td>
                      <td className="p-3">44" - 46"</td>
                      <td className="p-3">20.0"</td>
                      <td className="p-3">34" - 36"</td>
                      <td className="p-3">30.0"</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={() => setShowSizeGuide(false)}
              className="w-full bg-red-600 text-white hover:bg-gray-900 text-white py-3 px-4 font-medium font-bold tracking-widest text-xs uppercase rounded-xl cursor-pointer transition-colors text-center"
            >
              CLOSE SIZING DIRECTIVES
            </button>
          </div>
        </div>
      )}

      {/* Premium Flipkart/Amazon Style Lightbox / Full-Screen Image Gallery */}
      {isLightboxOpen && product && (
        <div className="fixed inset-0 bg-[#020906]/98 z-[200] flex flex-col justify-between items-center py-6 px-4 animate-fade-in select-none">
          {/* Top header Controls */}
          <div className="w-full max-w-7xl flex items-center justify-between z-30">
            <div className="font-medium text-xs text-red-600 tracking-widest font-semibold">
              PRODUCT DISPLAY ENGINE / IMAGE {filteredImages.findIndex(img => img.imageUrl === activeImage) + 1} OF {filteredImages.length}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setLightboxZoom(!lightboxZoom)}
                className="text-gray-800 hover:text-red-600 font-medium text-[10px] tracking-widest uppercase border border-red-600/20 hover:border-red-600/60 bg-white/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {lightboxZoom ? "Normal View" : "Detail Zoom"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxZoom(false);
                }}
                className="w-10 h-10 bg-white/80 hover:bg-red-600 hover:text-white text-gray-900 border border-red-600/20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95"
                aria-label="Close lookbook"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Stage viewport */}
          <div className={`w-full flex-grow flex items-center justify-center relative ${lightboxZoom ? 'overflow-auto' : 'overflow-hidden'} my-4 max-h-[75vh]`}>
            {filteredImages && filteredImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-4 z-40 w-12 h-12 bg-white/95 hover:bg-red-600 border border-red-600/20 hover:text-white text-gray-900 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div
              className={`max-w-full max-h-full transition-transform duration-300 ${lightboxZoom ? 'scale-125 cursor-zoom-out overflow-auto' : 'cursor-zoom-in'}`}
              onClick={() => setLightboxZoom(!lightboxZoom)}
            >
              <img
                src={activeImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="max-h-[66vh] md:max-h-[70vh] object-contain select-none shadow-[0_20px_50px_rgba(0,0,0,0.95)] rounded-2xl mx-auto"
              />
            </div>

            {filteredImages && filteredImages.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-4 z-40 w-12 h-12 bg-white/95 hover:bg-red-600 border border-red-600/20 hover:text-white text-gray-900 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Strip of thumbnails */}
          <div className="w-full max-w-xl z-30 space-y-3 pb-2">
            <p className="text-[10px] text-center text-gray-800 font-medium uppercase tracking-widest hidden md:block">
              Navigate silhouette via thumbnails or arrow directives
            </p>
            <div className="flex gap-3 justify-center overflow-x-auto py-1.5 px-4 bg-white/40 border border-red-600/15 rounded-2xl backdrop-blur-md">
              {filteredImages.map((img, index) => {
                const isSelected = activeImage === img.imageUrl;
                return (
                  <button
                    key={img.id}
                    onClick={() => {
                      setActiveImage(img.imageUrl);
                    }}
                    className={`w-14 h-16 bg-[#030a07] border rounded-lg overflow-hidden relative flex-shrink-0 transition-all duration-300 ${isSelected
                        ? 'border-red-600 scale-[1.05] shadow-[0_0_15px_rgba(201,169,110,0.4)]'
                        : 'border-gray-400 opacity-50 hover:opacity-100 hover:border-gray-900'
                      }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={`Index ${index + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL BOTTOM SHEET */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowShareModal(false)}>
          <div
            className="w-full sm:w-[420px] bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl transition-transform transform translate-y-0 relative flex flex-col animate-slide-up sm:animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                Share
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1.5 text-gray-700 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Preview */}
            {product && (
              <div className="flex items-center gap-4 px-5 py-3 bg-gray-50/80 border-b border-gray-100">
                <img
                  src={product.images.find(img => img.isPrimary)?.imageUrl || product.images[0]?.imageUrl}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-md border border-gray-200 bg-white"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-800 truncate mt-0.5">Buy {product.name} at DRIPEON</p>
                </div>
              </div>
            )}

            {/* Share Options Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-8 gap-x-4 p-6 pt-6">
              <div onClick={copyLink} className="flex flex-col items-center gap-3 cursor-pointer group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1877F2] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                  <LinkIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <span className="text-xs text-gray-700 font-medium tracking-wide">Copy Link</span>
              </div>

              <a href={`https://wa.me/?text=Check out this product: ${window.location.href}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => setShowShareModal(false)}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 sm:w-8 sm:h-8"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.12.552 4.118 1.528 5.867L.412 24l6.326-1.658A11.956 11.956 0 0012.031 24c6.646 0 12.031-5.385 12.031-12.031S18.677 0 12.031 0zm0 22.012c-1.8 0-3.483-.467-5.02-1.325l-.36-.21-3.731.98.998-3.639-.234-.372A10.024 10.024 0 012.01 12.03c0-5.54 4.509-10.05 10.05-10.05 5.54 0 10.05 4.509 10.05 10.05s-4.51 10.05-10.05 10.05zm5.518-7.534c-.302-.15-1.785-.88-2.062-.982-.278-.102-.48-.15-.683.15-.202.302-.782.982-.958 1.183-.177.202-.354.227-.656.077-.302-.15-1.275-.47-2.428-1.5-.898-.802-1.503-1.792-1.68-2.095-.177-.302-.019-.465.132-.615.136-.135.302-.352.453-.528.15-.175.202-.301.302-.5.1-.2.05-.375-.025-.526-.075-.15-.683-1.644-.936-2.253-.247-.591-.497-.512-.683-.522l-.582-.01c-.202 0-.528.075-.805.376-.277.301-1.058 1.033-1.058 2.518 0 1.485 1.083 2.923 1.234 3.123.152.2 2.128 3.25 5.155 4.553 2.115.912 2.898 1.042 3.97.876 1.156-.179 3.551-1.452 4.054-2.858.503-1.406.503-2.61.353-2.859-.15-.25-.554-.4-.856-.55z" /></svg>
                </div>
                <span className="text-xs text-gray-700 font-medium tracking-wide">WhatsApp</span>
              </a>

              <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => setShowShareModal(false)}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1877F2] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 sm:w-8 sm:h-8"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                </div>
                <span className="text-xs text-gray-700 font-medium tracking-wide">Facebook</span>
              </a>

              <a href={`fb-messenger://share/?link=${window.location.href}`} className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => setShowShareModal(false)}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0084FF] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 sm:w-8 sm:h-8"><path d="M12 0C5.373 0 0 5.074 0 11.334c0 3.565 1.728 6.746 4.437 8.868v4.195l4.08-2.254c1.12.312 2.296.48 3.483.48 6.627 0 12-5.074 12-11.334C24 5.074 18.627 0 12 0zm1.196 15.228l-3.085-3.29-6.02 3.29 6.61-7.027 3.176 3.29 5.93-3.29-6.61 7.027z" /></svg>
                </div>
                <span className="text-[11px] text-gray-700 font-medium text-center leading-tight tracking-wide">Messenger</span>
              </a>

              <a href={`mailto:?subject=Check out this product&body=${window.location.href}`} className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => setShowShareModal(false)}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#EA4335] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                  <Mail className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <span className="text-xs text-gray-700 font-medium tracking-wide">Gmail</span>
              </a>

              <a href={`sms:?body=${window.location.href}`} className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => setShowShareModal(false)}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#00BFA5] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                  <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <span className="text-xs text-gray-700 font-medium tracking-wide">SMS</span>
              </a>

              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => setShowShareModal(false)}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0077B5] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 sm:w-7 sm:h-7"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </div>
                <span className="text-xs text-gray-700 font-medium tracking-wide">LinkedIn</span>
              </a>

              <div
                onClick={async () => {
                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: product?.name,
                        text: `Check out ${product?.name} on DRIPEON`,
                        url: window.location.href
                      });
                    } else {
                      copyLink();
                    }
                  } catch (e) { }
                  setShowShareModal(false);
                }}
                className="flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md border border-gray-200">
                  <MoreHorizontal className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <span className="text-xs text-gray-700 font-medium tracking-wide">More Apps</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
}
