import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../AppContext';

export default function ClothingCollections() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const { globalProducts, isProductsLoaded } = useApp();

  useEffect(() => {
    if (isProductsLoaded && globalProducts) {
      const validProducts = globalProducts.filter((p: any) => p.images && p.images.length > 0);
      const shuffled = validProducts.sort(() => 0.5 - Math.random());
      setProducts(shuffled);
    }
  }, [globalProducts, isProductsLoaded]);

  if (products.length === 0) return null;

  // Helper to generate a row of products by wrapping around the array
  const generateRow = (offset: number, count: number = 5) => {
    const row = [];
    for (let i = 0; i < count; i++) {
      if (products.length > 0) {
        row.push(products[(i + offset) % products.length]);
      }
    }
    return row;
  };

  const row1 = generateRow(0, 5);
  const row2 = generateRow(5, 5);

  const renderMarqueeRow = (rowProducts: any[], reverse: boolean) => (
    <div className={`w-full overflow-hidden flex whitespace-nowrap group ${reverse ? 'dir-rtl' : ''}`} dir={reverse ? 'rtl' : 'ltr'}>
      <div className={`flex shrink-0 animate-[marquee_25s_linear_infinite] group-hover:[animation-play-state:paused] ${reverse ? 'dir-ltr' : ''}`} dir="ltr">
        {[...rowProducts, ...rowProducts, ...rowProducts].map((p, idx) => {
          if (!p) return null;
          const primaryImg = p.images?.find((img: any) => img.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl;
          
          return (
            <div 
              key={`${p.id}-${idx}`} 
              onClick={() => navigate(`/products/${p.slug}`)}
              className="w-[200px] sm:w-[280px] md:w-[350px] aspect-[4/5] p-2 sm:p-3 shrink-0 cursor-pointer"
            >
              <div className="w-full h-full relative overflow-hidden group/card bg-black/5 rounded-sm">
                <img 
                  src={primaryImg} 
                  alt={p.name} 
                  className="w-full h-full object-cover grayscale mix-blend-luminosity group-hover/card:grayscale-0 group-hover/card:mix-blend-normal group-hover/card:scale-105 transition-all duration-700" 
                />
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white font-black text-sm md:text-base uppercase tracking-widest truncate">{p.name}</h3>
                  <p className="text-white/80 font-medium text-xs">₹{p.price.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <section id="clothing-collections" className="py-24 bg-[#D90416] text-black overflow-hidden relative">
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-16 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 relative z-10">
        <div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tighter text-black uppercase">
            THE COLLECTION
          </h2>
          <p className="text-black/80 font-medium text-sm md:text-base max-w-md uppercase tracking-wider">
            Explore the latest streetwear silhouettes. Hand-picked pieces from our current editorial lookbook.
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/clothing')}
          className="bg-black text-white px-8 py-4 rounded font-black text-xs tracking-widest hover:bg-white hover:text-black hover:shadow-[6px_6px_0px_rgba(0,0,0,1)] border-2 border-transparent hover:border-black transition-all flex items-center gap-2 uppercase shrink-0"
        >
          SHOP COLLECTION →
        </button>
      </div>

      <div className="flex flex-col gap-0 sm:gap-2 relative z-10">
        {renderMarqueeRow(row1, false)}
        {renderMarqueeRow(row2, true)}
      </div>
      
    </section>
  );
}
