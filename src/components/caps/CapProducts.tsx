import React, { useEffect, useState } from 'react';
import { useApp } from '../../AppContext';
import { Product } from '../../types';
import LookbookSection from '../LookbookSection';

export default function CapProducts() {
  const { globalProducts, isProductsLoaded, categories: appCategories } = useApp();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isProductsLoaded) {
      const capCategoryNames = appCategories.filter(c => c.type === 'CAPS').map(c => c.name);
      const caps = globalProducts.filter((p: Product) => p.isActive && (capCategoryNames.includes(p.category) || p.category === 'CAPS'));
      setProducts(caps);
    }
  }, [globalProducts, isProductsLoaded, appCategories]);

  return (
    <section id="cap-products" className="bg-white text-gray-900 border-t border-gray-100">
      {!isProductsLoaded ? (
        <div className="flex justify-center items-center h-64 py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D90416]"></div>
        </div>
      ) : products.length > 0 ? (
        <LookbookSection 
          initialProducts={products} 
          title="THE LATEST DROP" 
          subtitle="Limited stock available."
          isFootwear={false}
        />
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-lg max-w-7xl mx-auto px-6 lg:px-12 my-24">
          <h3 className="text-xl font-medium text-gray-400 uppercase tracking-widest">More drops coming soon</h3>
        </div>
      )}
    </section>
  );
}
