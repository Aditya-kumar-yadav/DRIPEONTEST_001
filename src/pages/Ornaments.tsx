import React, { useEffect, useState } from 'react';
import { useApp } from '../AppContext';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, ChevronDown, Globe, Sparkles } from 'lucide-react';
import LookbookSection from '../components/LookbookSection';

export default function Ornaments() {
  const { globalProducts, isProductsLoaded, cartCount, categories: appCategories } = useApp();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isProductsLoaded) {
      const ornamentCategoryNames = appCategories.filter(c => c.type === 'ORNAMENT').map(c => c.name);
      let filtered = globalProducts.filter((p: Product) => p.isActive && (ornamentCategoryNames.includes(p.category) || p.category === 'ORNAMENT'));
      setProducts(filtered);
    }
  }, [globalProducts, isProductsLoaded, appCategories]);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans pb-32">
      {/* Hero Section (THE SOLSTICE COLLECTION) */}
      <div className="w-full w-screen h-[85vh] md:h-screen relative overflow-hidden flex items-center justify-center bg-gray-900">

        {/* Background Image with slight zoom animation */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/ornaments-hero.jpg"
            alt="The Solstice Collection"
            className="w-full h-full object-cover origin-center animate-[subtleZoom_20s_ease-in-out_infinite_alternate]"
          />
          {/* Gradients for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent"></div>
        </div>


        {/* Central Typography overlay */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-end md:justify-center pb-24 md:pb-0 px-6 text-center pointer-events-none">
          <p className="text-[10px] md:text-sm text-red-100 font-sans tracking-[0.4em] uppercase mb-4 md:mb-6 opacity-90 drop-shadow-lg">
            FINE JEWELRY & LUXURY ACCESSORIES
          </p>
          <h1
            className="text-5xl md:text-8xl lg:text-[10rem] text-white font-serif leading-none tracking-tight select-none drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
            style={{ fontFamily: '"Playfair Display", "Times New Roman", serif' }}
          >
            FORGED <span className="text-red-500/90 italic">JEWELS</span>
          </h1>
          <p className="text-white/80 text-sm md:text-lg font-sans max-w-xl mt-6 md:mt-10 tracking-wide font-light drop-shadow-md">
            Discover our luxury jewelry collection featuring diamond-encrusted rings, 24k gold heavy-link chains, and sterling silver statement bracelets. Precision-crafted to elevate your everyday aura.
          </p>

        </div>

      </div>

      {/* Overlapping Category Divs (Like the reference image) */}
      <div className="relative z-40 w-full px-4 md:px-12 lg:px-24 -mt-24 md:-mt-32 mb-12 md:mb-24 pointer-events-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 max-w-[1400px] mx-auto">
          {/* Card 1 */}
          <div
            onClick={() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] p-8 flex flex-col items-start hover:-translate-y-2 transition-transform duration-500 cursor-pointer group border border-gray-100"
          >
            <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase mb-1">Categories</span>
            <h3 className="text-2xl font-serif text-gray-900 mb-6 group-hover:text-red-600 transition-colors">Rings</h3>
            <div className="w-full aspect-[4/3] bg-[#f8f8f8] rounded-2xl mb-8 overflow-hidden flex items-center justify-center">
              <img src="/images/aesthetic-rings.jpg" alt="Rings" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="mt-auto bg-gray-800 text-white text-[9px] font-bold tracking-widest uppercase px-4 py-2.5 rounded-lg flex items-center gap-2 group-hover:bg-red-600 transition-colors">
              Check More Product <span className="text-lg leading-none">&rarr;</span>
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] p-8 flex flex-col items-start hover:-translate-y-2 transition-transform duration-500 cursor-pointer group border border-gray-100"
          >
            <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase mb-1">Categories</span>
            <h3 className="text-2xl font-serif text-gray-900 mb-6 group-hover:text-red-600 transition-colors">Bracelets</h3>
            <div className="w-full aspect-[4/3] bg-[#f8f8f8] rounded-2xl mb-8 overflow-hidden flex items-center justify-center">
              <img src="/images/aesthetic-bracelets.jpg" alt="Bracelets" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="mt-auto bg-gray-800 text-white text-[9px] font-bold tracking-widest uppercase px-4 py-2.5 rounded-lg flex items-center gap-2 group-hover:bg-red-600 transition-colors">
              Check More Product <span className="text-lg leading-none">&rarr;</span>
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] p-8 flex flex-col items-start hover:-translate-y-2 transition-transform duration-500 cursor-pointer group border border-gray-100"
          >
            <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase mb-1">Categories</span>
            <h3 className="text-2xl font-serif text-gray-900 mb-6 group-hover:text-red-600 transition-colors">Chains</h3>
            <div className="w-full aspect-[4/3] bg-[#f8f8f8] rounded-2xl mb-8 overflow-hidden flex items-center justify-center">
              <img src="/images/aesthetic-chains.jpg" alt="Chains" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="mt-auto bg-gray-800 text-white text-[9px] font-bold tracking-widest uppercase px-4 py-2.5 rounded-lg flex items-center gap-2 group-hover:bg-red-600 transition-colors">
              Check More Product <span className="text-lg leading-none">&rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div id="shop-section" className="w-full bg-white pt-8 pb-24">
        {!isProductsLoaded ? (
          <div className="min-h-[40vh] flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600"></div>
          </div>
        ) : (
          <LookbookSection
            initialProducts={products}
            title="THE SOLSTICE ARCHIVES"
            subtitle="Frost & Fire intricate collection."
            isFootwear={false}
            filterCategoryType="ORNAMENT"
          />
        )}
      </div>
    </div>
  );
}
