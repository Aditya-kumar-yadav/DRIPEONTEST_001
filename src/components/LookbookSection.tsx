import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../AppContext';
import { Product } from '../types';
import { SlidersHorizontal, Search, RotateCcw, ShoppingBag, Heart } from 'lucide-react';
import { SafeImage } from './SafeImage';

// Ultra-fast localized Wishlist Button to prevent full-grid re-renders
const WishlistButton = ({ productId, productName }: { productId: string, productName: string }) => {
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

export default function LookbookSection({ 
  initialProducts, 
  isFootwear, 
  filterCategoryType,
  title,
  subtitle
}: { 
  initialProducts: Product[], 
  isFootwear?: boolean,
  filterCategoryType?: 'CLOTHING' | 'FOOTWEAR' | 'CAPS' | 'ORNAMENT',
  title: string,
  subtitle?: string
}) {
  const { addToCart, addToast, categories: appCategories, wishlist, addToWishlist, removeFromWishlist } = useApp();
  const navigate = useNavigate();
  
  const [categoryFilter, setCategoryFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Infinite Scroll Pagination State
  const [visibleCount, setVisibleCount] = useState(20);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setVisibleCount(20); // Reset pagination on filter change
  }, [categoryFilter, colorFilter, sizeFilter, searchQuery, initialProducts]);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => prev + 20);
      }
    }, { rootMargin: '400px' });
    if (node) observerRef.current.observe(node);
  }, []);

  const clearAllFilters = () => {
    setCategoryFilter('');
    setColorFilter('');
    setSizeFilter('');
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (colorFilter && !p.variants.some(v => v.color.toLowerCase() === colorFilter.toLowerCase())) return false;
      if (sizeFilter && !p.variants.some(v => v.size.toLowerCase() === sizeFilter.toLowerCase())) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !(p.fabric && p.fabric.toLowerCase().includes(q))) {
          return false;
        }
      }
      return true;
    });
  }, [initialProducts, categoryFilter, colorFilter, sizeFilter, searchQuery]);

  const relevantCategories = appCategories.filter(c => {
    if (filterCategoryType) return c.type === filterCategoryType;
    return isFootwear ? c.type === 'FOOTWEAR' : c.type === 'CLOTHING';
  });
  
  const categories = [
    { label: filterCategoryType === 'ORNAMENT' ? 'All Ornaments' : 'All Silhouettes', value: '' },
    ...relevantCategories.map(c => ({ label: c.name, value: c.name }))
  ];

  const dynamicColors = useMemo(() => {
    const colorSet = new Set<string>();
    initialProducts.forEach(p => {
      p.variants?.forEach(v => {
        if (v.color) colorSet.add(v.color);
      });
    });
    return Array.from(colorSet).map(c => ({ label: c, value: c }));
  }, [initialProducts]);

  const colors = [
    { label: filterCategoryType === 'ORNAMENT' ? 'All Finishes' : 'All Colors', value: '' },
    ...dynamicColors
  ];

  const dynamicSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    initialProducts.forEach(p => {
      p.variants?.forEach(v => {
        if (v.size && v.size !== 'All Sizes' && v.size !== 'One Size') sizeSet.add(v.size);
      });
    });
    return Array.from(sizeSet).map(s => ({ label: s, value: s }));
  }, [initialProducts]);

  const sizes = [
    { label: 'All Sizes', value: '' },
    ...dynamicSizes
  ];

  return (
    <div className="font-sans px-4 sm:px-6 w-full max-w-7xl mx-auto py-10 fade-in">
      {/* Editorial Title */}
      <div className="border-b border-gray-200 pb-6 mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-xs font-medium text-red-600 tracking-[0.3em] uppercase">DRIPEON SHOP</span>
          <h1 className="font-sans text-3xl sm:text-4xl text-gray-900 uppercase mt-1">
            {categoryFilter ? `${categoryFilter.replace('_', ' ')}S` : title}
          </h1>
          <p className="text-xs text-gray-500 uppercase tracking-wider mt-1.5 max-w-xl">
            {subtitle || "A premium technical collection utilizing articulated geometries, robust technical fabrics, and tactical utility."}
          </p>
        </div>
        
        {/* Search Panel */}
        <div className="flex items-center gap-2 border border-gray-200 bg-white px-3.5 py-2.5 rounded-sm w-full md:max-w-xs focus-within:border-red-600 transition-colors">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search fabric, style..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-gray-900 placeholder-brand-muted focus:outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[10px] text-red-600 hover:underline">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-8 flex-shrink-0">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <span className="text-xs uppercase font-medium text-gray-900 tracking-widest flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-red-600" /> Filter Lookbook
            </span>
            {(categoryFilter || colorFilter || sizeFilter || searchQuery) && (
              <button 
                onClick={clearAllFilters}
                className="text-[10px] font-medium text-red-600 hover:text-gray-900 uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-xs uppercase font-medium tracking-wider text-gray-500">{filterCategoryType === 'ORNAMENT' ? 'Jewelry Collections' : 'Apparel Design'}</h4>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {categories.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCategoryFilter(c.value)}
                  className={`px-3 py-2 text-left text-xs uppercase tracking-wider rounded-sm transition-all text-gray-900 border cursor-pointer ${
                    categoryFilter === c.value 
                      ? 'bg-red-600 text-white border-red-600 font-semibold' 
                      : 'border-gray-200/50 hover:border-red-600 bg-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {colors.length > 1 && (
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-medium tracking-wider text-gray-500 font-light">{filterCategoryType === 'ORNAMENT' ? 'Metals & Finish' : 'Color Swatches'}</h4>
              <div className="flex flex-wrap gap-2">
                {colors.map(col => (
                  <button
                    key={col.value}
                    onClick={() => setColorFilter(col.value)}
                    className={`px-3 py-2 text-xs uppercase tracking-wider rounded-sm transition-all border cursor-pointer flex items-center gap-1.5 ${
                      colorFilter === col.value 
                        ? 'border-red-600 text-red-600 bg-red-600/10 font-semibold' 
                        : 'border-gray-200/50 hover:border-red-600 text-gray-500 bg-white hover:text-gray-900'
                    }`}
                  >
                    {col.value && filterCategoryType !== 'ORNAMENT' && (
                      <span 
                        className="w-1.5 h-1.5 rounded-full inline-block" 
                        style={{ 
                          backgroundColor: col.value === 'Brown' ? '#6E473B' : 
                                           col.value === 'Navy Blue' ? '#1E2A38' : 
                                           col.value === 'Beige' ? '#D9C5B2' : '#000000' 
                        }} 
                      />
                    )}
                    {col.value === '' ? 'All' : col.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 1 && (
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-medium tracking-wider text-gray-500">{filterCategoryType === 'ORNAMENT' ? 'Dimensions' : 'Proportion Fits'}</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map(sz => (
                  <button
                    key={sz.value}
                    onClick={() => setSizeFilter(sz.value)}
                    className={`px-3 py-2 min-w-10 min-h-10 flex items-center justify-center text-xs uppercase rounded-sm border cursor-pointer transition-all ${
                      sizeFilter === sz.value 
                        ? 'bg-red-600 text-white border-red-600 font-bold' 
                        : 'border-gray-200/50 hover:border-red-600 text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {sz.value === '' ? 'All' : sz.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Product Grid Area */}
        <div className="flex-grow">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-200 rounded p-8">
              <ShoppingBag className="w-10 h-10 text-brand-grey mx-auto mb-4" />
              <p className="font-sans text-lg text-gray-900 uppercase mb-2">No silhouettes found</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">None of our current products match your applied filters. Please reset options to view full tailoring releases.</p>
              <button 
                onClick={clearAllFilters}
                className="mt-6 border border-red-600 px-6 py-2 text-red-600 text-xs font-medium uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors rounded cursor-pointer"
              >
                Show All Silhouettes
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8 p-4 -m-4">
              {filteredProducts.slice(0, visibleCount).map((p, index) => {
                const primaryImg = p.images?.find(im => im.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
                const secondaryImg = p.images?.find(im => !im.isPrimary && im.imageUrl)?.imageUrl || primaryImg;
                const isLast = index === filteredProducts.slice(0, visibleCount).length - 1;
                
                return (
                  <div 
                    key={p.id}
                    ref={isLast ? lastElementRef : null}
                    onClick={() => navigate(`/products/${p.slug}`)}
                    className="group relative flex flex-col justify-between bg-white border border-gray-200/40 hover:border-red-600 rounded-2xl overflow-hidden p-3 duration-500 hover:shadow-2xl anti-gravity-card animation-stagger"
                    style={{ animationDelay: `${index * 80}ms` }}
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

                      <WishlistButton productId={p.id} productName={p.name} />

                      <SafeImage 
                        src={primaryImg} 
                        alt={p.name}
                        className="w-full h-full object-cover transition-all duration-750 group-hover:scale-[1.04]"
                        containerClassName="absolute inset-0 z-0"
                      />

                      {secondaryImg && secondaryImg !== primaryImg && (
                        <img 
                          src={secondaryImg} 
                          alt={p.name}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover z-10 opacity-0 group-hover:opacity-100 transition-all duration-750 group-hover:scale-[1.04] pointer-events-none"
                        />
                      )}

                      <div className="absolute inset-x-0 bottom-0 py-3 bg-white/90 backdrop-blur-md border-t border-gray-200/60 translate-y-full group-hover:translate-y-0 duration-300 z-20 px-3 rounded-b-xl sm:rounded-b-2xl">
                        <p className="text-[9px] font-medium tracking-wider text-red-600 text-center mb-1.5 uppercase font-medium">QUICK SEIZE SIZE</p>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {p.variants.filter(v => v.stockQuantity > 0).slice(0, 4).map(v => (
                            <button
                              key={v.id}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToCart(v.id, 1);
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
                        {p.upperMaterial || p.fabric} • {p.soleType ? p.soleType + ' Sole' : p.fit + ' Shape'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 px-2 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-red-600">
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
                          const variant = p.variants?.find((v: any) => v.stockQuantity > 0) || p.variants?.[0];
                          if (variant) {
                            addToCart(variant.id, 1).then(success => {
                               if (success) addToast(`Added to cart!`, 'success');
                            });
                          } else {
                            addToast('Out of stock', 'error');
                          }
                        }}
                        className="w-full h-8 sm:h-9 bg-gray-100/80 hover:bg-red-600 text-gray-900 hover:text-white font-sans uppercase text-[9px] sm:text-[10px] tracking-wider sm:tracking-[0.2em] font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all duration-300 rounded cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> ADD TO CART
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
