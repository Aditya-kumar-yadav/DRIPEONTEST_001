import React, { useEffect } from 'react';
import ClothingHero from '../components/clothing/ClothingHero';
import ClothingCollections from '../components/clothing/ClothingCollections';
import ClothingStory from '../components/clothing/ClothingStory';
import ClothingProducts from '../components/clothing/ClothingProducts';

export default function ClothingLanding() {
  useEffect(() => {
    // Scroll to top instantly on mount
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 w-full overflow-x-hidden">
      <main className="flex-grow flex flex-col w-full">
        <ClothingHero />
        <ClothingCollections />
        <ClothingStory />
        <ClothingProducts />
      </main>
    </div>
  );
}
