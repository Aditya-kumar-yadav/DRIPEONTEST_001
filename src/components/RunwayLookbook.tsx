import React, { useState } from 'react';
import { Product } from '../types';
import { Heart, Plus } from 'lucide-react';
import { useApp } from '../AppContext';

export default function RunwayLookbook({ products }: { products: Product[] }) {
  const { addToCart, addToast } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);

  if (!products || products.length === 0) return null;

  const handleModelClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleAddToCart = (prod: Product) => {
    const variant = prod.variants?.find(v => v.stockQuantity > 0) || prod.variants?.[0];
    if (variant) {
      addToCart(variant.id, 1).then(success => {
         if (success) addToast('Added to cart!', 'success');
      });
    } else {
      addToast('Out of stock', 'error');
    }
  };

  return (
    <div className="relative w-full h-[700px] md:h-[900px] bg-[#f2f4f5] overflow-hidden flex flex-col md:flex-row font-sans">
       {/* Left side: Runway */}
       <div className="flex-1 relative overflow-hidden flex flex-col justify-between p-8 md:p-14">
          
          {/* Top Left Text */}
          <div className="z-20 relative max-w-sm pt-4">
             <h2 className="text-xl md:text-2xl font-medium tracking-[0.2em] text-gray-900 uppercase mb-5">
               SS26 COLLECTION
             </h2>
             <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
               Picture-perfect and fashionably on the dot. The latest seasonal styles drop to reveal a refined blend of utilitarian design and modern tailoring.
             </p>
          </div>

          {/* Runway Models Carousel */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
             {products.map((prod, idx) => {
                const diff = idx - activeIndex;
                const absDiff = Math.abs(diff);
                
                // Only render items within a certain range for performance and visual clarity
                if (absDiff > 4) return null;
                
                const scale = 1 - absDiff * 0.12;
                // Distribute them horizontally. Active is center (0).
                const translateX = diff * 160; 
                const zIndex = 20 - absDiff;
                const blur = absDiff * 2.5; // blur increases as distance increases
                const opacity = 1 - absDiff * 0.2;

                const primaryImg = prod.images?.find(i => i.isPrimary)?.imageUrl || prod.images?.[0]?.imageUrl || prod.imageUrl;

                return (
                   <div 
                     key={prod.id} 
                     onClick={() => handleModelClick(idx)}
                     className="absolute transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-auto cursor-pointer flex items-center justify-center"
                     style={{
                        transform: `translateX(${translateX}px) scale(${scale})`,
                        zIndex,
                        filter: `blur(${blur}px)`,
                        opacity
                     }}
                   >
                     {/* We use mix-blend-multiply on product images (which are usually white bg) 
                         so they blend naturally into the light grey background without harsh boxes */}
                     <img 
                       src={primaryImg} 
                       alt={prod.name} 
                       className="h-[350px] md:h-[650px] w-auto object-contain mix-blend-multiply drop-shadow-sm transition-transform duration-700 hover:scale-105" 
                       draggable={false}
                     />
                   </div>
                );
             })}
          </div>

          {/* Bottom Left Text */}
          <div className="z-20 relative mt-auto pb-4">
             <h3 className="text-2xl md:text-4xl font-light tracking-[0.3em] text-gray-900 uppercase mb-3">
               LOOK {String(activeIndex + 1).padStart(2, '0')}
             </h3>
             <button className="text-[10px] font-medium tracking-[0.1em] text-gray-500 uppercase border-b border-gray-400 pb-0.5 hover:text-gray-900 hover:border-gray-900 transition-colors">
               SHOP THE LOOK
             </button>
          </div>
       </div>

       {/* Right side: Look Items Sidebar */}
       <div className="w-full md:w-[340px] bg-white border-l border-gray-200 flex flex-col z-20 overflow-y-auto shadow-[-20px_0_40px_rgba(0,0,0,0.03)] scrollbar-hide">
          {/* We display a few items for this "look" by taking the active product and the next two */}
          {[0, 1].map((offset) => {
             const prodIdx = (activeIndex + offset) % products.length;
             const prod = products[prodIdx];
             if (!prod) return null;
             
             const imgUrl = prod.images?.find(i => i.isPrimary)?.imageUrl || prod.images?.[0]?.imageUrl || prod.imageUrl;

             return (
               <div key={`${prod.id}-${offset}`} className="border-b border-gray-200 p-8 flex flex-col group relative min-h-[300px]">
                 <button className="absolute top-6 left-6 text-gray-400 hover:text-red-500 transition-colors z-10">
                   <Heart className="w-[18px] h-[18px] font-light" strokeWidth={1.5} />
                 </button>
                 
                 <div className="flex-1 w-full mb-6 relative flex items-center justify-center overflow-hidden">
                   <img 
                     src={imgUrl} 
                     alt={prod.name} 
                     className="h-[180px] object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out" 
                   />
                 </div>
                 
                 <div className="flex flex-col space-y-1.5 mt-auto">
                   <h4 className="text-[9px] font-bold tracking-[0.15em] text-gray-900 uppercase leading-relaxed max-w-[85%] pr-4 line-clamp-2">
                     {prod.name}
                   </h4>
                   <span className="text-[11px] text-gray-500 font-medium">₹{prod.price.toLocaleString()}</span>
                 </div>
                 
                 <button 
                    onClick={() => handleAddToCart(prod)}
                    className="absolute bottom-8 right-8 text-gray-400 hover:text-gray-900 transition-colors"
                 >
                   <Plus className="w-[22px] h-[22px]" strokeWidth={1.5} />
                 </button>
               </div>
             )
          })}
       </div>
    </div>
  );
}
