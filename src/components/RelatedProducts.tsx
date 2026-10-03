import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SafeImage } from './SafeImage';
import { useApp } from '../AppContext';
import { Product } from '../types';

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  category: string;
  fabric: string;
  imageUrl: string;
  secondaryImageUrl: string;
}

interface RelatedProductsProps {
  currentProductId?: string;
  currentCategory?: string;
}



export const RelatedProducts: React.FC<RelatedProductsProps> = ({ 
  currentProductId, 
  currentCategory 
}) => {
  const navigate = useNavigate();
  const { globalProducts, isProductsLoaded, categories: appCategories } = useApp();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isProductsLoaded && globalProducts.length > 0) {
      // Filter out the current active item
      const available = globalProducts.filter((item: Product) => item.id !== currentProductId && item.slug !== currentProductId);
      
      // Shuffle and pick 5 random products from all categories
      const shuffled = [...available].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);
      
      setFilteredProducts(selected);
    }
  }, [globalProducts, isProductsLoaded, currentProductId]);

  return (
    <section className="bg-white border-t border-red-600/15 py-12 px-4 sm:px-6 md:px-8 mt-20" id="related-products-section">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading with native cursor-default */}
        <div className="mb-10 text-left cursor-default">
          <h2 className="font-sans text-2xl font-medium tracking-wide text-gray-900 uppercase cursor-default">
            You Might Also Like
          </h2>
          <p className="text-xs font-medium text-red-600/50 uppercase tracking-[0.2em] mt-1.5 cursor-default">
            Curated pairings complementing your tailored silhouetted look
          </p>
        </div>

        {/* Responsive horizontal scroll or clean 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8" id="related-grid-container">
          {filteredProducts.map((p) => {
            const imageUrl = p.images?.find((img) => img.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || '';
            const secondaryImageUrl = p.images?.find((img) => !img.isPrimary)?.imageUrl || '';
            
            return (
            <div
              key={p.id}
              onClick={() => {
                // Navigate to the product page on click
                navigate(`/products/${p.slug}`);
                // Scroll back to top smoothly so details reload elegantly
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group flex flex-col justify-between bg-white border border-gray-200 hover:border-red-600 rounded-2xl p-3 duration-500 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
              id={`related-card-${p.id}`}
            >
              <div>
                {/* Visual Cover Stage */}
                <div className="h-72 w-full overflow-hidden relative bg-gray-100 rounded-xl mb-4">
                  {/* Category Tag overlay */}
                  <span className="absolute top-3 left-3 bg-white px-2.5 py-1 text-[9px] font-bold tracking-widest text-gray-900 rounded border border-gray-200 shadow-sm uppercase z-20">
                    {p.category.replace('_', ' ')}
                  </span>

                  <div className="absolute bottom-3 left-3 bg-gray-900/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold tracking-widest text-white rounded-md z-20 flex items-center gap-1 shadow-md">
                    <span className="text-yellow-400 text-[10px]">★</span>
                    <span>{p.averageRating != null ? p.averageRating.toFixed(1) : '5.0'} ({p.reviewCount || 0})</span>
                  </div>
                  {/* Primary view */}
                  <SafeImage
                    src={imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover transition-all duration-750 group-hover:scale-[1.04]"
                    containerClassName="absolute inset-0 z-0"
                  />

                  {/* Secondary view (Swaps on hover for high luxury lookbook response) */}
                  {secondaryImageUrl && secondaryImageUrl !== imageUrl && (
                    <img
                      src={secondaryImageUrl}
                      alt={p.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover z-10 opacity-0 group-hover:opacity-100 transition-all duration-750 group-hover:scale-[1.04] pointer-events-none"
                    />
                  )}
                  
                  {/* Hover Overlay Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 duration-500 z-15" />
                </div>

                {/* Content Descriptions */}
                <div className="space-y-1 px-1.5">
                  <h3 className="font-sans text-[14px] font-bold tracking-wide text-gray-900 group-hover:text-red-600 transition-colors duration-300 line-clamp-1 uppercase cursor-pointer">
                    {p.name}
                  </h3>
                  <p className="text-[10px] font-sans font-medium text-gray-500 uppercase tracking-widest cursor-default">
                    {p.fabric}
                  </p>
                </div>
              </div>

              {/* Price Row */}
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-red-600/5 px-1.5 pb-1">
                <div className="flex items-baseline gap-2 cursor-pointer">
                  <span className="text-xs font-medium font-medium text-red-600">
                    ₹{p.price.toLocaleString('en-IN')}
                  </span>
                  {p.comparePrice && (
                    <span className="text-[10px] font-medium line-through text-neutral-600">
                      ₹{p.comparePrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                
                <span className="text-[9px] font-medium text-red-600 tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:underline">
                  VIEW FIT
                </span>
              </div>
            </div>
          )})}
        </div>
      </div>
    </section>
  );
};
