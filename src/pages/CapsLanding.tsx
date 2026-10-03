import React, { useEffect } from 'react';
import CapsHero from '../components/caps/CapsHero';
import CapCollections from '../components/caps/CapCollections';
import CapProducts from '../components/caps/CapProducts';
import CapStory from '../components/caps/CapStory';

export default function CapsLanding() {
  useEffect(() => {
    // Scroll to top instantly on mount
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 w-full overflow-x-hidden">
      <main className="flex-grow flex flex-col w-full">
        <CapsHero />
        <CapCollections />
        <CapStory />
        <CapProducts />
      </main>
    </div>
  );
}
