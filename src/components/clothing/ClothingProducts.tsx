import React, { useEffect, useState } from 'react';
import { useApp } from '../../AppContext';
import { Product } from '../../types';
import LookbookSection from '../LookbookSection';

export default function ClothingProducts() {
  const { globalProducts, isProductsLoaded, categories: appCategories } = useApp();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isProductsLoaded) {
      const clothingCategoryNames = appCategories.filter(c => c.type === 'CLOTHING').map(c => c.name);
      const filtered = globalProducts.filter((p: Product) => 
        p.isActive && (clothingCategoryNames.includes(p.category) || ['SHACKET', 'GURKHA_PANT', 'JAPANESE_PANT'].includes(p.category))
      );
      setProducts(filtered);
    }
  }, [globalProducts, isProductsLoaded, appCategories]);

  return (
    <section id="clothing-products" className="bg-white text-black border-t-[8px] border-[#D90416] py-12 relative overflow-hidden">
      
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {!isProductsLoaded ? (
        <div className="flex justify-center items-center h-64 py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#D90416]"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="relative z-10">
          <LookbookSection 
            initialProducts={products} 
            title="LATEST ARCHIVES" 
            subtitle="Strictly curated drops."
            isFootwear={false}
            filterCategoryType="CLOTHING"
          />
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 border-2 border-black rounded max-w-7xl mx-auto px-6 lg:px-12 my-24 relative z-10 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-black text-black uppercase tracking-widest">Vault is empty</h3>
          <p className="text-gray-500 mt-2 font-medium tracking-wide">More drops coming soon. Stay locked in.</p>
        </div>
      )}
    </section>
  );
}
